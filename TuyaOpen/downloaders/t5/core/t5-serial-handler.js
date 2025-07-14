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
     * 清空接收缓冲区
     */
    async clearBuffer() {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            while (true) {
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 5))
                ]);
                if (done || !value || value.length === 0) break;
            }
        } catch (error) {
            // 检查是否为串口异常断开
            if (this.isPortDisconnectionError(error)) {
                throw new Error('设备连接已断开，请检查USB连接后重试');
            }
            // 其他错误忽略
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 发送命令
     */
    async sendCommand(command, commandName) {
        this.debug('comm', `发送${commandName}`);
        this.debug('debug', `发送${commandName}: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
        let writer = null;
        try {
            writer = this.port.writable.getWriter();
            await writer.write(new Uint8Array(command));
        } catch (error) {
            throw new Error(`发送${commandName}失败: ${error.message}`);
        } finally {
            if (writer) {
                try { writer.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 接收响应 - 完全按照Python的wait_for_cmd_response机制实现
     */
    async receiveResponse(expectedLength, timeout = 100) {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const responseBuffer = [];
            const startTime = Date.now();
            
            // Python逻辑：阻塞读取直到获得指定长度或超时
            while (responseBuffer.length < expectedLength && Date.now() - startTime < timeout) {
                if (this.stopFlag) {
                    throw new Error('操作被用户停止');
                }
                
                // 计算还需要读取的字节数
                const needLength = expectedLength - responseBuffer.length;
                
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 10))
                ]);
                
                if (done) break;
                if (value && value.length > 0) {
                    // 取所需的字节数
                    const takeLength = Math.min(value.length, needLength);
                    responseBuffer.push(...Array.from(value.slice(0, takeLength)));
                }
            }
            
            const response = new Uint8Array(responseBuffer.slice(0, expectedLength));
            this.debug('debug', `接收到响应: ${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
            
            return response;
            
        } catch (error) {
            if (this.isPortDisconnectionError(error)) {
                throw new Error('设备连接已断开，请检查USB连接后重试');
            }
            throw error;
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