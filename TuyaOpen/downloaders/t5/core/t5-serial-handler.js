/**
 * T5串口处理器
 * 负责T5芯片的串口通信底层功能
 * 从t5ai-downloader.js中拆分出来
 */

class T5SerialHandler {
    constructor(port, debugCallback) {
        this.port = port;
        this.debugCallback = debugCallback;
        this.stopFlag = false;
    }

    /**
     * 调试日志输出
     */
    debug(level, message, data = null) {
        if (this.debugCallback) {
            this.debugCallback(level, message, data);
        }
    }

    /**
     * 清空接收缓冲区 - 修复版本，确保完全清理
     * 参考Python版本的drain()方法：ser.reset_input_buffer()
     */
    async clearBuffer() {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            let totalCleared = 0;
            let consecutiveEmptyReads = 0;
            
            // 增强的缓冲区清理逻辑
            for (let i = 0; i < 100; i++) { // 增加到100次尝试
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 5)) // 减少到5ms，提高响应性
                ]);
                
                if (done || !value || value.length === 0) {
                    consecutiveEmptyReads++;
                    // 连续5次没有数据才认为清理完成（从3次增加到5次）
                    if (consecutiveEmptyReads >= 5) {
                        break;
                    }
                    continue;
                }
                
                // 有数据时重置计数器
                consecutiveEmptyReads = 0;
                totalCleared += value.length;
                
                // 只在调试模式下显示详细的缓冲区清理信息
                if (totalCleared % 100 === 0 || value.length > 50) {
                    this.debug('debug', `清理缓冲区: ${value.length}字节 (累计${totalCleared}字节)`);
                }
            }
            
            if (totalCleared > 0) {
                this.debug('debug', `✅ 缓冲区清理完成: 总共清理${totalCleared}字节`);
            } else {
                this.debug('debug', '✅ 缓冲区已经为空');
            }
        } catch (error) {
            // 检查是否为串口异常断开
            if (this.isPortDisconnectionError(error)) {
                throw new Error('设备连接已断开，请检查USB连接后重试');
            }
            // 其他错误记录但继续
            this.debug('debug', `缓冲区清理遇到错误: ${error.message} (继续执行)`);
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 发送命令 - 增强版本，添加错误处理和重试机制
     */
    async sendCommand(command, commandName) {
        this.debug('comm', `执行协议: ${commandName}`);
        this.debug('comm', `发送${commandName}`);
        this.debug('debug', `发送${commandName}: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
        let writer = null;
        const maxRetries = 3;
        
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                writer = this.port.writable.getWriter();
                await writer.write(new Uint8Array(command));
                
                // 发送成功，稍微等待让数据发送完成
                await new Promise(resolve => setTimeout(resolve, 1));
                return; // 成功发送，退出
                
            } catch (error) {
                this.debug('debug', `发送${commandName}失败（第${retry + 1}次尝试）: ${error.message}`);
                
                if (this.isPortDisconnectionError(error)) {
                    throw new Error('设备连接已断开，请检查USB连接后重试');
                }
                
                if (retry === maxRetries - 1) {
                    throw new Error(`发送${commandName}失败: ${error.message}`);
                }
                
                // 重试前等待一下
                await new Promise(resolve => setTimeout(resolve, 10));
                
            } finally {
                if (writer) {
                    try { writer.releaseLock(); } catch (e) {}
                    writer = null;
                }
            }
        }
    }

    /**
     * 接收响应 - 修复版本，增强错误处理和超时机制
     * 参考Python的wait_for_cmd_response机制，但适应Web Serial API的特性
     */
    async receiveResponse(expectedLength, timeout = 100) {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const responseBuffer = [];
            const startTime = Date.now();
            
            this.debug('debug', `开始接收响应，期望长度: ${expectedLength}字节，超时: ${timeout}ms`);
            
            // 增强的读取循环，处理Web Serial API的异步特性
            while (responseBuffer.length < expectedLength) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = timeout - elapsedTime;
                
                if (remainingTime <= 0) {
                    this.debug('debug', `接收超时: 已用时${elapsedTime}ms，接收${responseBuffer.length}/${expectedLength}字节`);
                    break;
                }
                
                if (this.stopFlag) {
                    throw new Error('操作被用户停止');
                }
                
                try {
                    // 使用动态超时，但不超过剩余时间
                    const readTimeout = Math.min(remainingTime, 20); // 最多20ms一次读取
                    const readPromise = reader.read();
                    const timeoutPromise = new Promise(resolve => 
                        setTimeout(() => resolve({ done: true, timedOut: true }), readTimeout)
                    );
                    
                    const result = await Promise.race([readPromise, timeoutPromise]);
                    
                    if (result.timedOut) {
                        // 单次读取超时，继续下一次尝试
                        continue;
                    }
                    
                    if (result.done) {
                        // 流结束，短暂等待后继续尝试
                        await new Promise(resolve => setTimeout(resolve, 1));
                        continue;
                    }
                    
                    if (result.value && result.value.length > 0) {
                        responseBuffer.push(...result.value);
                        this.debug('debug', `接收数据: ${Array.from(result.value).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')} (累计${responseBuffer.length}/${expectedLength}字节)`);
                        
                        // Python逻辑：收到期望长度立即返回
                        if (responseBuffer.length >= expectedLength) {
                            this.debug('debug', `接收响应完成: ${responseBuffer.length}字节`);
                            break;
                        }
                    } else {
                        // 没有数据，短暂等待
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                } catch (error) {
                    // 检查是否为串口异常断开
                    if (this.isPortDisconnectionError(error)) {
                        throw new Error('设备连接已断开，请检查USB连接后重试');
                    }
                    this.debug('debug', `读取错误: ${error.message}`);
                    // 遇到错误时短暂等待后继续尝试
                    await new Promise(resolve => setTimeout(resolve, 2));
                }
            }
            
            if (responseBuffer.length === 0) {
                this.debug('debug', '接收到响应: ');
            }
            
            return responseBuffer;
        } catch (error) {
            this.debug('debug', `接收响应异常: ${error.message}`);
            throw new Error(`接收响应失败: ${error.message}`);
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 检查是否为串口断开错误
     */
    isPortDisconnectionError(error) {
        if (!error || typeof error.message !== 'string') return false;
        
        const disconnectKeywords = [
            'device has been lost',
            'NetworkError',
            'NotFoundError',
            'device disconnected',
            'I/O error',
            'lost connection'
        ];
        
        return disconnectKeywords.some(keyword => 
            error.message.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * 执行协议命令 - 使用新的协议层框架
     */
    async executeProtocol(protocol, cmdArgs = [], expectedLength = null, timeout = 100, checkArgs = []) {
        try {
            // 生成协议命令
            const command = protocol.cmd(...cmdArgs);
            const protocolName = protocol.getName();
            
            this.debug('comm', `执行协议: ${protocolName}`);
            protocol.trace(`生成命令: [${command.map(x => '0x' + x.toString(16).padStart(2, '0')).join(', ')}]`);
            
            // 发送命令
            await this.sendCommand(command, protocolName);
            
            // 接收响应
            const response = await this.receiveResponse(expectedLength, timeout);
            protocol.trace(`收到响应: ${response.length} 字节`);
            
            // 检查响应
            const isValid = protocol.responseCheck(response, ...checkArgs);
            if (!isValid) {
                throw new Error(`${protocolName} 响应检查失败`);
            }
            
            protocol.trace(`${protocolName} 执行成功`);
            return response;
            
        } catch (error) {
            protocol.trace(`${protocol.getName()} 执行失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 简化的协议执行方法
     */
    async executeSimpleProtocol(protocols, protocolName, cmdArgs = [], expectedLength = null, timeout = 100) {
        const protocol = protocols[protocolName];
        if (!protocol) {
            throw new Error(`协议不存在: ${protocolName}`);
        }
        
        return await this.executeProtocol(protocol, cmdArgs, expectedLength, timeout, cmdArgs);
    }

    /**
     * 直接执行协议命令 - 按照参考版本的精确方式
     * 绕过协议抽象层，直接构造和执行命令
     */
    async executeDirectProtocol(commandName, command, expectedLength, timeout = 100) {
        this.debug('comm', `执行直接协议: ${commandName}`);
        
        // 清空缓冲区
        await this.clearBuffer();
        
        // 发送命令
        await this.sendCommand(command, commandName);
        
        // 接收响应
        const response = await this.receiveResponse(expectedLength, timeout);
        
        this.debug('debug', `${commandName}响应分析: 长度=${response.length}, 期望=${expectedLength}`);
        this.debug('debug', `${commandName}响应内容: ${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
        return response;
    }

    /**
     * 链路检查 - 修复版本，完全基于参考实现的成功逻辑
     */
    async doLinkCheck() {
        try {
            // 完全清空缓冲区 - 增强版本
            await this.clearBuffer();
            
            // 发送LinkCheck命令
            const command = [0x01, 0xE0, 0xFC, 0x01, 0x00];
            await this.sendCommand(command, 'LinkCheck');
            
            // 参考实现使用50ms超时，这里保持一致
            const response = await this.receiveResponse(8, 50);
            
            this.debug('debug', `链路检查响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
            
            if (response.length >= 8) {
                const r = response.slice(0, 8);
                
                // 完全按照参考实现doLinkCheckEx的验证逻辑
                // 验证响应格式：04 0E 05 01 E0 FC 01 00
                if (r[0] === 0x04 && r[1] === 0x0E && r[2] === 0x05 && 
                    r[3] === 0x01 && r[4] === 0xE0 && r[5] === 0xFC && 
                    r[6] === 0x01 && r[7] === 0x00) {
                    this.debug('debug', '✅ 链路检查成功');
                    return true;
                } else {
                    this.debug('debug', `链路检查失败: 响应格式错误 - 期望[04 0E 05 01 E0 FC 01 00], 实际[${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                }
            } else {
                this.debug('debug', `链路检查失败: 响应长度不足 - 期望8字节, 实际${response.length}字节`);
            }
            
            return false;
        } catch (error) {
            this.debug('debug', `链路检查异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 增强版链路检查 - 基于参考实现doLinkCheckEx的完整逻辑
     */
    async doLinkCheckEx(maxTryCount = 60) {
        this.debug('debug', `开始增强链路检查，最多尝试${maxTryCount}次`);
        
        for (let cnt = 0; cnt < maxTryCount && !this.stopFlag; cnt++) {
            try {
                // 每次都完全清理缓冲区
                await this.clearBuffer();
                
                // 发送LinkCheck命令
                await this.sendCommand([0x01, 0xE0, 0xFC, 0x01, 0x00], 'LinkCheckProtocol');
                
                // Web Serial环境下需要更长的超时时间，从1ms增加到50ms
                const response = await this.receiveResponse(8, 50);
                
                this.debug('debug', `链路检查第${cnt + 1}次，接收到${response.length}字节`);
                
                if (response.length >= 8) {
                    const r = response.slice(0, 8);
                    this.debug('debug', `响应数据: ${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    // 验证响应格式：04 0E 05 01 E0 FC 01 00
                    if (r[0] === 0x04 && r[1] === 0x0E && r[2] === 0x05 && 
                        r[3] === 0x01 && r[4] === 0xE0 && r[5] === 0xFC && 
                        r[6] === 0x01 && r[7] === 0x00) {
                        this.debug('debug', `✅ 链路检查成功，第${cnt + 1}次尝试`);
                        return true;
                    } else {
                        this.debug('debug', `链路检查失败，重试 ${cnt + 1}/${maxTryCount}: LinkCheckProtocol 响应检查失败`);
                    }
                } else {
                    this.debug('debug', `链路检查失败，重试 ${cnt + 1}/${maxTryCount}: 接收到响应长度不足`);
                }
                
                // 参考版本中的微小延迟，让设备有时间响应
                await new Promise(resolve => setTimeout(resolve, 1));
                
            } catch (error) {
                this.debug('debug', `链路检查第${cnt + 1}次异常: ${error.message}`);
                // 即使有异常也继续尝试
            }
        }
        
        this.debug('debug', `链路检查失败，已重试${maxTryCount}次`);
        return false;
    }

    /**
     * 停止操作
     */
    stop() {
        this.stopFlag = true;
    }

    /**
     * 重置停止标志
     */
    reset() {
        this.stopFlag = false;
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.T5SerialHandler = T5SerialHandler;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5SerialHandler;
}