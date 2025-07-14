/**
 * 重试工具类 - 基于T5重构计划第4周的设计
 * 提供完善的重试机制和错误恢复策略
 * 用于处理串口通信、Flash操作和设备连接的重试逻辑
 */

class RetryUtils {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.name = 'RetryUtils';
    }

    /**
     * 调试输出
     */
    trace(message) {
        if (this.debugMode) {
            console.log(`[${this.name}] ${message}`);
        }
    }

    /**
     * 通用重试机制 - 对应Python版本的重试策略
     * @param {Function} operation 要执行的操作函数
     * @param {number} maxRetries 最大重试次数，默认3次
     * @param {number} baseDelay 基础延迟时间(ms)，默认1000ms
     * @param {boolean} exponentialBackoff 是否使用指数退避，默认true
     * @param {Function} shouldRetry 判断是否应该重试的函数，可选
     * @returns {Promise<any>} 操作结果
     */
    static async withRetry(operation, maxRetries = 3, baseDelay = 1000, exponentialBackoff = true, shouldRetry = null) {
        let lastError = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                if (attempt > 0) {
                    console.log(`[RetryUtils] 操作在第${attempt + 1}次尝试后成功`);
                }
                return result;
            } catch (error) {
                lastError = error;
                
                // 如果是最后一次尝试，直接抛出错误
                if (attempt === maxRetries) {
                    console.log(`[RetryUtils] 操作失败，已达到最大重试次数 ${maxRetries + 1}`);
                    throw error;
                }
                
                // 检查是否应该重试
                if (shouldRetry && !shouldRetry(error, attempt)) {
                    console.log(`[RetryUtils] 根据shouldRetry函数判断，不再重试: ${error.message}`);
                    throw error;
                }
                
                // 计算延迟时间
                const delay = exponentialBackoff ? 
                    baseDelay * Math.pow(2, attempt) : 
                    baseDelay;
                
                console.log(`[RetryUtils] 操作失败 (尝试${attempt + 1}/${maxRetries + 1}): ${error.message}, ${delay}ms后重试`);
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    /**
     * 串口通信重试 - 专门用于串口通信的重试逻辑
     * @param {Function} operation 串口操作函数
     * @param {number} maxRetries 最大重试次数
     * @param {number} baseDelay 基础延迟时间
     * @returns {Promise<any>} 操作结果
     */
    static async withSerialRetry(operation, maxRetries = 5, baseDelay = 10) {
        const isSerialError = (error) => {
            // 检查是否为串口相关错误
            const serialErrorPatterns = [
                /NetworkError/i,
                /SerialPort/i,
                /connection/i,
                /timeout/i,
                /disconnected/i
            ];
            
            return serialErrorPatterns.some(pattern => 
                pattern.test(error.message) || pattern.test(error.name)
            );
        };

        const shouldRetry = (error, attempt) => {
            // 串口断开不重试
            if (error.message.includes('设备连接已断开')) {
                return false;
            }
            // 其他串口错误可以重试
            return isSerialError(error);
        };

        return await this.withRetry(operation, maxRetries, baseDelay, false, shouldRetry);
    }

    /**
     * Flash操作重试 - 专门用于Flash读写操作的重试逻辑
     * @param {Function} operation Flash操作函数
     * @param {number} maxRetries 最大重试次数
     * @param {number} baseDelay 基础延迟时间
     * @returns {Promise<any>} 操作结果
     */
    static async withFlashRetry(operation, maxRetries = 3, baseDelay = 100) {
        const isFlashError = (error) => {
            const flashErrorPatterns = [
                /flash/i,
                /erase/i,
                /write/i,
                /read/i,
                /crc/i,
                /verify/i
            ];
            
            return flashErrorPatterns.some(pattern => 
                pattern.test(error.message)
            );
        };

        const shouldRetry = (error, attempt) => {
            // Flash操作相关错误可以重试
            if (isFlashError(error)) {
                return true;
            }
            // 协议响应错误可以重试
            if (error.message.includes('响应检查失败')) {
                return true;
            }
            // 超时错误可以重试
            if (error.message.includes('timeout') || error.message.includes('超时')) {
                return true;
            }
            return false;
        };

        return await this.withRetry(operation, maxRetries, baseDelay, true, shouldRetry);
    }

    /**
     * 写入扇区失败的恢复流程 - 对应Python版本的写入重试策略
     * @param {Object} serialHandler 串口处理器
     * @param {number} flashAddr Flash地址
     * @param {Uint8Array} sectorData 扇区数据
     * @param {number} maxRetries 最大重试次数
     * @returns {Promise<boolean>} 重试是否成功
     */
    static async retryWriteSector(serialHandler, flashAddr, sectorData, maxRetries = 2) {
        console.log(`[RetryUtils] 开始写入扇区重试: 0x${flashAddr.toString(16)}`);
        
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                console.log(`[RetryUtils] 扇区写入重试 ${retry + 1}/${maxRetries}`);
                
                // 步骤1: 重置连接（模拟重新建立总线控制）
                await this.resetConnection(serialHandler);
                
                // 步骤2: 重新擦除扇区
                console.log(`[RetryUtils] 重新擦除扇区: 0x${flashAddr.toString(16)}`);
                await this.retryEraseSector(serialHandler, flashAddr);
                
                // 步骤3: 重新写入扇区
                console.log(`[RetryUtils] 重新写入扇区: 0x${flashAddr.toString(16)}`);
                const writeSuccess = await this.retryWriteSectorData(serialHandler, flashAddr, sectorData);
                
                if (writeSuccess) {
                    console.log(`[RetryUtils] ✅ 扇区写入重试成功: 0x${flashAddr.toString(16)}`);
                    return true;
                }
                
            } catch (error) {
                console.log(`[RetryUtils] 扇区写入重试失败 ${retry + 1}/${maxRetries}: ${error.message}`);
                if (retry === maxRetries - 1) {
                    throw error;
                }
                await this.sleep(100); // 重试间隔
            }
        }
        
        console.log(`[RetryUtils] ❌ 扇区写入重试最终失败: 0x${flashAddr.toString(16)}`);
        return false;
    }

    /**
     * 重置连接 - 模拟重新建立总线控制
     * @param {Object} serialHandler 串口处理器
     */
    static async resetConnection(serialHandler) {
        try {
            // 清空缓冲区
            await serialHandler.clearBuffer();
            
            // 执行简单的链路检查以确保连接正常
            await serialHandler.executeSimpleProtocol('linkCheck', [], 8, 10);
            
            console.log(`[RetryUtils] ✅ 连接重置成功`);
        } catch (error) {
            console.log(`[RetryUtils] ⚠️ 连接重置失败: ${error.message}`);
            // 连接重置失败不抛出错误，继续尝试后续操作
        }
    }

    /**
     * 重试擦除扇区
     * @param {Object} serialHandler 串口处理器
     * @param {number} flashAddr Flash地址
     */
    static async retryEraseSector(serialHandler, flashAddr) {
        const eraseOperation = async () => {
            // 判断是否使用扩展协议
            const isLargeFlash = serialHandler.flashConfig && 
                serialHandler.flashConfig.flashSize >= 256 * 1024 * 1024;
            
            const protocolName = isLargeFlash ? 'flashErase4kExt' : 'flashErase4k';
            
            await serialHandler.executeSimpleProtocol(
                protocolName,
                [flashAddr],
                15,
                3000  // 擦除操作需要更长超时
            );
        };

        return await this.withFlashRetry(eraseOperation, 2, 50);
    }

    /**
     * 重试写入扇区数据
     * @param {Object} serialHandler 串口处理器
     * @param {number} flashAddr Flash地址
     * @param {Uint8Array} sectorData 扇区数据
     */
    static async retryWriteSectorData(serialHandler, flashAddr, sectorData) {
        const writeOperation = async () => {
            // 判断是否使用扩展协议
            const isLargeFlash = serialHandler.flashConfig && 
                serialHandler.flashConfig.flashSize >= 256 * 1024 * 1024;
            
            const protocolName = isLargeFlash ? 'flashWrite4kExt' : 'flashWrite4k';
            
            // 确保数据长度为4K
            let writeData = sectorData;
            if (sectorData.length !== 4096) {
                writeData = new Uint8Array(4096);
                writeData.set(sectorData);
                writeData.fill(0xff, sectorData.length);
            }

            await serialHandler.executeProtocol(
                serialHandler.protocols[protocolName],
                [flashAddr, Array.from(writeData)],
                15,
                5000,  // 写入操作需要更长超时
                [flashAddr]
            );
            
            return true;
        };

        try {
            await this.withFlashRetry(writeOperation, 2, 100);
            return true;
        } catch (error) {
            console.log(`[RetryUtils] 写入扇区数据失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 连接重试 - 专门用于设备连接的重试逻辑
     * @param {Function} connectOperation 连接操作函数
     * @param {number} maxRetries 最大重试次数
     * @param {number} baseDelay 基础延迟时间
     * @returns {Promise<any>} 连接结果
     */
    static async withConnectionRetry(connectOperation, maxRetries = 3, baseDelay = 2000) {
        const shouldRetry = (error, attempt) => {
            // 连接相关错误都可以重试
            const connectionErrorPatterns = [
                /总线控制权/,
                /获取芯片ID/,
                /获取Flash ID/,
                /连接失败/,
                /设备连接/
            ];
            
            return connectionErrorPatterns.some(pattern => 
                pattern.test(error.message)
            );
        };

        return await this.withRetry(connectOperation, maxRetries, baseDelay, true, shouldRetry);
    }

    /**
     * 智能重试 - 根据错误类型自动选择重试策略
     * @param {Function} operation 操作函数
     * @param {string} operationType 操作类型：'serial', 'flash', 'connection'
     * @param {Object} options 重试选项
     * @returns {Promise<any>} 操作结果
     */
    static async smartRetry(operation, operationType = 'general', options = {}) {
        const defaultOptions = {
            maxRetries: 3,
            baseDelay: 1000,
            exponentialBackoff: true
        };
        
        const finalOptions = { ...defaultOptions, ...options };

        switch (operationType) {
            case 'serial':
                return await this.withSerialRetry(
                    operation, 
                    finalOptions.maxRetries, 
                    finalOptions.baseDelay
                );
            case 'flash':
                return await this.withFlashRetry(
                    operation, 
                    finalOptions.maxRetries, 
                    finalOptions.baseDelay
                );
            case 'connection':
                return await this.withConnectionRetry(
                    operation, 
                    finalOptions.maxRetries, 
                    finalOptions.baseDelay
                );
            default:
                return await this.withRetry(
                    operation, 
                    finalOptions.maxRetries, 
                    finalOptions.baseDelay, 
                    finalOptions.exponentialBackoff
                );
        }
    }

    /**
     * 睡眠函数
     * @param {number} ms 毫秒数
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 超时包装器 - 为操作添加超时限制
     * @param {Function} operation 操作函数
     * @param {number} timeoutMs 超时时间(ms)
     * @param {string} timeoutMessage 超时错误消息
     * @returns {Promise<any>} 操作结果
     */
    static async withTimeout(operation, timeoutMs, timeoutMessage = '操作超时') {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`${timeoutMessage} (${timeoutMs}ms)`));
            }, timeoutMs);

            try {
                const result = await operation();
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * 批量重试 - 对多个操作进行重试
     * @param {Array<Function>} operations 操作函数数组
     * @param {Object} options 重试选项
     * @returns {Promise<Array>} 所有操作的结果
     */
    static async batchRetry(operations, options = {}) {
        const results = [];
        
        for (let i = 0; i < operations.length; i++) {
            try {
                const result = await this.smartRetry(operations[i], 'general', options);
                results.push({ success: true, result, index: i });
            } catch (error) {
                results.push({ success: false, error, index: i });
            }
        }
        
        return results;
    }

    /**
     * 获取重试统计信息
     * @param {number} totalAttempts 总尝试次数
     * @param {number} successfulAttempts 成功次数
     * @param {number} totalTime 总耗时(ms)
     * @returns {Object} 统计信息
     */
    static getRetryStats(totalAttempts, successfulAttempts, totalTime) {
        return {
            totalAttempts,
            successfulAttempts,
            failedAttempts: totalAttempts - successfulAttempts,
            successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts * 100).toFixed(2) + '%' : '0%',
            averageTime: totalAttempts > 0 ? (totalTime / totalAttempts).toFixed(2) + 'ms' : '0ms',
            totalTime: totalTime + 'ms'
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RetryUtils;
} else if (typeof window !== 'undefined') {
    window.RetryUtils = RetryUtils;
}