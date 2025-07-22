/**
 * T5AI串口管理器 - 负责所有串口通信操作
 * 从 t5ai-downloader.js 中提取的串口管理逻辑
 */

class T5SerialManager {
    constructor(serialPort, debugCallback) {
        this.port = serialPort;
        this.debug = debugCallback || (() => {});
        this.stopFlag = false;
        this.debugMode = false;
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 停止操作
     */
    stop() {
        this.stopFlag = true;
    }

    /**
     * 主流程日志输出（总是显示）- 用于关键进度和状态信息
     */
    mainLog(message) {
        this.debug('main', message);
    }

    /**
     * 信息日志输出（总是显示）- 用于重要的操作信息
     */
    infoLog(message) {
        this.debug('info', message);
    }

    /**
     * 调试日志输出（仅在调试模式下显示）- 用于详细的技术信息
     */
    debugLog(message, data = null) {
        if (this.debugMode) {
            this.debug('debug', message, data);
        }
    }

    /**
     * 警告日志输出（总是显示）
     */
    warningLog(message) {
        this.debug('warning', message);
    }

    /**
     * 错误日志输出（总是显示）
     */
    errorLog(message) {
        this.debug('error', message);
    }

    /**
     * 通信日志输出（总是显示）- 用于基本的通信状态信息
     */
    commLog(message) {
        this.debug('comm', message);
    }

    /**
     * 检查是否为串口断开错误
     */
    isPortDisconnectionError(error) {
        const errorMessage = error.message.toLowerCase();
        return errorMessage.includes('device lost') || 
               errorMessage.includes('disconnected') || 
               errorMessage.includes('not open') ||
               errorMessage.includes('network error') ||
               errorMessage.includes('device not configured');
    }

    /**
     * 清空接收缓冲区 - 完全按照测试版本的逻辑
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
     * 发送命令 - 完全按照测试版本的逻辑
     */
    async sendCommand(command, commandName) {
        this.commLog(`发送${commandName}`);
        this.debugLog(`发送${commandName}: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
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
     * Python逻辑：
     * def wait_for_cmd_response(self, expect_length, timeout_sec=0.1):
     *     timeout = serial.Timeout(timeout_sec)
     *     read_buf = b''
     *     while not timeout.expired():
     *         buf = self.ser.read(expect_length-len(read_buf))  # 阻塞读取
     *         read_buf += buf
     *         if len(read_buf) == expect_length:
     *             break
     *     return read_buf
     */
    async receiveResponse(expectedLength, timeout = 100) {  // Python默认0.1秒即100ms
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const responseBuffer = [];
            const startTime = Date.now();
            
            // Python式的阻塞读取循环
            while (responseBuffer.length < expectedLength && Date.now() - startTime < timeout) {
                const remainingBytes = expectedLength - responseBuffer.length;
                const remainingTime = timeout - (Date.now() - startTime);
                
                if (remainingTime <= 0) break;
                
                try {
                    // 模拟Python的阻塞读取：期望读取remainingBytes，但可能读到更少
                    const readPromise = reader.read();
                    const timeoutPromise = new Promise(resolve => 
                        setTimeout(() => resolve({ done: true, timedOut: true }), remainingTime)
                    );
                    
                    const result = await Promise.race([readPromise, timeoutPromise]);
                    
                    if (result.timedOut || result.done) {
                        // 超时或流结束，但Python会继续尝试直到总超时
                        if (result.timedOut) {
                            break; // 总超时，退出
                        }
                        // 如果是done但不是超时，短暂等待后继续尝试
                        await new Promise(resolve => setTimeout(resolve, 1));
                        continue;
                    }
                    
                    if (result.value && result.value.length > 0) {
                        responseBuffer.push(...result.value);
                        this.debugLog(`接收: ${Array.from(result.value).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')} (累计${responseBuffer.length}字节)`);
                        
                        // Python逻辑：收到期望长度立即返回
                        if (responseBuffer.length >= expectedLength) {
                            this.commLog(`接收响应完成: ${responseBuffer.length}字节`);
                            break;
                        }
                    }
                } catch (error) {
                    // 检查是否为串口异常断开
                    if (this.isPortDisconnectionError(error)) {
                        throw new Error('设备连接已断开，请检查USB连接后重试');
                    }
                    this.debugLog(`读取错误: ${error.message}`);
                    // Python在读取错误时会继续尝试，直到超时
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            
            return responseBuffer;
        } catch (error) {
            throw new Error(`接收响应失败: ${error.message}`);
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 设置串口信号
     */
    async setSignals(signals) {
        await this.port.setSignals(signals);
    }

    /**
     * 重置串口连接
     */
    async reset() {
        this.mainLog('重置串口连接...');
        
        try {
            // 关闭串口
            if (this.port && this.port.readable) {
                await this.port.close();
            }
            
            // 等待一段时间
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 重新打开串口
            await this.port.open({ baudRate: 115200 });
            
            this.mainLog('串口连接已重置');
        } catch (error) {
            throw new Error(`重置串口连接失败: ${error.message}`);
        }
    }

    /**
     * 检查设备连接状态
     */
    isConnected() {
        return this.port && this.port.readable && this.port.writable;
    }

    /**
     * 获取串口信息
     */
    getPortInfo() {
        if (!this.port) return null;
        
        return {
            connected: this.isConnected(),
            readable: !!this.port.readable,
            writable: !!this.port.writable
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5SerialManager;
} else if (typeof window !== 'undefined') {
    window.T5SerialManager = T5SerialManager;
}