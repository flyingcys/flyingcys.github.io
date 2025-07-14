/**
 * T5 CRC校验功能实现
 * 基于Python版本的CRC校验逻辑，提供硬件CRC与软件CRC对比校验
 * 支持全Flash区域CRC校验和分段校验
 */

class T5CRCChecker {
    constructor(serialHandler, flashConfig, debugMode = false) {
        this.serialHandler = serialHandler;
        this.flashConfig = flashConfig;
        this.debugMode = debugMode;
        this.name = 'T5CRCChecker';
        
        this.largeFlashThreshold = 256 * 1024 * 1024; // 256MB阈值
        this.sectorSize = 0x1000; // 4K扇区大小
        
        // CRC32表缓存
        this.crc32Table = null;
        
        // 错误恢复统计
        this.errorStats = {
            communicationErrors: 0,
            crcMismatchErrors: 0,
            timeoutErrors: 0,
            hardwareErrors: 0,
            totalRetries: 0,
            successfulRecoveries: 0
        };
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
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
     * 错误分类器 - 识别不同类型的错误
     * @param {Error} error 错误对象
     * @returns {string} 错误类型
     */
    classifyError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('timeout') || message.includes('超时')) {
            return 'timeout';
        } else if (message.includes('crc') || message.includes('校验')) {
            return 'crc_mismatch';
        } else if (message.includes('communication') || message.includes('通信') || 
                   message.includes('serial') || message.includes('串口')) {
            return 'communication';
        } else if (message.includes('hardware') || message.includes('硬件') ||
                   message.includes('device') || message.includes('设备')) {
            return 'hardware';
        } else {
            return 'unknown';
        }
    }

    /**
     * 获取智能重试策略 - 根据错误类型返回不同的重试参数
     * @param {string} errorType 错误类型
     * @param {number} currentRetry 当前重试次数
     * @returns {Object} 重试策略
     */
    getRetryStrategy(errorType, currentRetry) {
        const strategies = {
            'timeout': {
                maxRetries: 3,
                baseDelay: 100,
                backoffMultiplier: 2,
                description: '超时错误，使用指数退避'
            },
            'crc_mismatch': {
                maxRetries: 2,
                baseDelay: 50,
                backoffMultiplier: 1.5,
                description: 'CRC不匹配，较少重试'
            },
            'communication': {
                maxRetries: 5,
                baseDelay: 200,
                backoffMultiplier: 1.8,
                description: '通信错误，多次重试'
            },
            'hardware': {
                maxRetries: 1,
                baseDelay: 500,
                backoffMultiplier: 1,
                description: '硬件错误，最少重试'
            },
            'unknown': {
                maxRetries: 3,
                baseDelay: 100,
                backoffMultiplier: 1.5,
                description: '未知错误，标准重试'
            }
        };

        const strategy = strategies[errorType] || strategies['unknown'];
        const delay = Math.min(strategy.baseDelay * Math.pow(strategy.backoffMultiplier, currentRetry), 2000);
        
        return {
            ...strategy,
            delay: delay,
            shouldRetry: currentRetry < strategy.maxRetries
        };
    }

    /**
     * 更新错误统计
     * @param {string} errorType 错误类型
     * @param {boolean} recovered 是否恢复成功
     */
    updateErrorStats(errorType, recovered = false) {
        this.errorStats.totalRetries++;
        
        switch (errorType) {
            case 'timeout':
                this.errorStats.timeoutErrors++;
                break;
            case 'crc_mismatch':
                this.errorStats.crcMismatchErrors++;
                break;
            case 'communication':
                this.errorStats.communicationErrors++;
                break;
            case 'hardware':
                this.errorStats.hardwareErrors++;
                break;
        }
        
        if (recovered) {
            this.errorStats.successfulRecoveries++;
        }
    }

    /**
     * 生成CRC32表 - 对应Python make_crc32_table函数
     * @returns {Array<number>} CRC32表
     */
    makeCRC32Table() {
        if (this.crc32Table) {
            return this.crc32Table;
        }
        
        this.crc32Table = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let bit = 0; bit < 8; bit++) {
                if (c & 1) {
                    c = (c >>> 1) ^ 0xEDB88320;
                } else {
                    c = c >>> 1;
                }
            }
            this.crc32Table[i] = c >>> 0; // 确保是无符号32位整数
        }
        
        this.trace('CRC32表生成完成');
        return this.crc32Table;
    }

    /**
     * 计算软件CRC32 - 对应Python crc32_ver2函数
     * @param {Uint8Array|Array} buffer 数据缓冲区
     * @param {number} initialCRC 初始CRC值，默认为0xffffffff
     * @returns {number} CRC32值
     */
    calculateSoftwareCRC32(buffer, initialCRC = 0xffffffff) {
        const crc32Table = this.makeCRC32Table();
        
        let crc = initialCRC;
        for (const byte of buffer) {
            crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xFF];
        }
        
        return crc >>> 0; // 确保是无符号32位整数
    }

    /**
     * 获取硬件CRC32 - 对应Python check_crc_ver2方法的硬件CRC部分（增强错误恢复）
     * @param {number} startAddr 起始地址
     * @param {number} endAddr 结束地址
     * @param {number} maxRetries 最大重试次数（可选，使用智能策略）
     * @returns {Promise<number>} 硬件CRC32值
     */
    async getHardwareCRC32(startAddr, endAddr, maxRetries = null) {
        const isLargeFlash = this.flashConfig.flashSize >= this.largeFlashThreshold;
        const protocol = isLargeFlash ? 
            this.serialHandler.protocols.checkCrcExt : 
            this.serialHandler.protocols.checkCrc;
        
        this.trace(`获取硬件CRC32: 0x${startAddr.toString(16)} - 0x${endAddr.toString(16)} (${isLargeFlash ? '扩展模式' : '普通模式'})`);
        
        let retryCount = 0;
        let lastError = null;
        
        while (true) {
            try {
                const response = await this.serialHandler.executeProtocol(
                    protocol,                        // CheckCrcProtocol或CheckCrcExtProtocol
                    [startAddr, endAddr],           // 起始和结束地址
                    11,                             // 期望响应长度
                    100,                            // 超时100ms
                    []                              // 无检查参数
                );
                
                const hardwareCRC = protocol.getCrcValue(response);
                this.trace(`硬件CRC32获取成功: 0x${hardwareCRC.toString(16)} (重试${retryCount}次)`);
                
                // 成功时更新统计
                if (retryCount > 0) {
                    this.updateErrorStats('communication', true);
                }
                
                return hardwareCRC;
                
            } catch (error) {
                lastError = error;
                const errorType = this.classifyError(error);
                this.trace(`硬件CRC32获取失败 (尝试${retryCount + 1}): ${error.message} (错误类型: ${errorType})`);
                
                // 获取智能重试策略
                const strategy = this.getRetryStrategy(errorType, retryCount);
                
                // 检查是否应该继续重试
                if (maxRetries !== null) {
                    // 使用传统的固定重试次数
                    if (retryCount >= maxRetries - 1) {
                        this.updateErrorStats(errorType, false);
                        throw new Error(`获取硬件CRC32失败: ${error.message}`);
                    }
                } else {
                    // 使用智能重试策略
                    if (!strategy.shouldRetry) {
                        this.updateErrorStats(errorType, false);
                        throw new Error(`获取硬件CRC32失败 (${strategy.description}): ${error.message}`);
                    }
                }
                
                retryCount++;
                this.trace(`等待${strategy.delay}ms后重试 (${strategy.description})`);
                await new Promise(resolve => setTimeout(resolve, strategy.delay));
            }
        }
    }

    /**
     * 校验单个区域的CRC - 对应Python check_crc_ver2方法
     * @param {Uint8Array|Array} expectedData 期望的数据
     * @param {number} flashAddr Flash地址
     * @param {number} length 数据长度
     * @param {number} retry 重试次数
     * @returns {Promise<boolean>} 校验是否通过
     */
    async checkRegionCRC(expectedData, flashAddr, length, retry = 5) {
        this.trace(`CRC校验区域: 0x${flashAddr.toString(16)}, 长度: ${length}`);
        
        try {
            // 步骤1：计算期望的软件CRC32
            const expectedCRC = this.calculateSoftwareCRC32(expectedData);
            this.trace(`期望CRC32: 0x${expectedCRC.toString(16)}`);
            
            // 步骤2：获取硬件CRC32
            const hardwareCRC = await this.getHardwareCRC32(flashAddr, flashAddr + length - 1, retry);
            this.trace(`硬件CRC32: 0x${hardwareCRC.toString(16)}`);
            
            // 步骤3：比较CRC值
            const isMatch = expectedCRC === hardwareCRC;
            if (isMatch) {
                this.trace(`✅ CRC校验通过: 0x${flashAddr.toString(16)}`);
            } else {
                this.trace(`❌ CRC校验失败: 0x${flashAddr.toString(16)}, 期望: 0x${expectedCRC.toString(16)}, 实际: 0x${hardwareCRC.toString(16)}`);
            }
            
            return isMatch;
            
        } catch (error) {
            this.trace(`❌ CRC校验错误: 0x${flashAddr.toString(16)}, ${error.message}`);
            throw error;
        }
    }

    /**
     * 校验完整固件的CRC - 分段校验策略（增强错误恢复）
     * @param {Uint8Array|Array} firmwareData 固件数据
     * @param {number} startAddr 起始地址
     * @param {Function} progressCallback 进度回调
     * @param {Object} options 选项：{allowPartialFailure: false, maxFailures: 0}
     * @returns {Promise<Object>} 校验结果：{success: boolean, failedSectors: Array, errorStats: Object}
     */
    async checkFirmwareCRC(firmwareData, startAddr, progressCallback = null, options = {}) {
        this.trace('开始完整固件CRC校验...');
        
        const opts = {
            allowPartialFailure: false,  // 是否允许部分失败
            maxFailures: 0,              // 最大允许失败扇区数
            ...options
        };
        
        const totalLength = firmwareData.length;
        const totalSectors = Math.ceil(totalLength / this.sectorSize);
        const failedSectors = [];
        
        if (progressCallback) {
            progressCallback({
                stage: 'crc_start',
                message: '开始CRC校验',
                progress: 0,
                total: totalSectors
            });
        }
        
        try {
            let currentAddr = startAddr;
            let currentOffset = 0;
            let sectorCount = 0;
            let successfulSectors = 0;
            
            // 逐扇区校验
            while (currentOffset < totalLength) {
                const sectorLength = Math.min(this.sectorSize, totalLength - currentOffset);
                const sectorData = firmwareData.slice(currentOffset, currentOffset + sectorLength);
                
                this.trace(`校验扇区: 0x${currentAddr.toString(16)}, 偏移: ${currentOffset}, 长度: ${sectorLength}`);
                
                // 跳过全0xFF的扇区（可能未写入）
                if (!this.isBufferAll0xFF(sectorData)) {
                    try {
                        const checkResult = await this.checkRegionCRC(sectorData, currentAddr, sectorLength);
                        if (checkResult) {
                            successfulSectors++;
                            this.trace(`✅ 扇区CRC校验通过: 0x${currentAddr.toString(16)}`);
                        } else {
                            const failureInfo = {
                                address: currentAddr,
                                offset: currentOffset,
                                length: sectorLength,
                                reason: 'CRC不匹配'
                            };
                            failedSectors.push(failureInfo);
                            this.trace(`❌ 扇区CRC校验失败: 0x${currentAddr.toString(16)}`);
                            
                            // 检查是否允许部分失败
                            if (!opts.allowPartialFailure || failedSectors.length > opts.maxFailures) {
                                const error = `扇区CRC校验失败: 0x${currentAddr.toString(16)}`;
                                if (progressCallback) {
                                    progressCallback({
                                        stage: 'crc_error',
                                        message: error,
                                        error: error,
                                        failedSectors: failedSectors
                                    });
                                }
                                return {
                                    success: false,
                                    failedSectors: failedSectors,
                                    successfulSectors: successfulSectors,
                                    errorStats: this.errorStats
                                };
                            }
                        }
                    } catch (error) {
                        const failureInfo = {
                            address: currentAddr,
                            offset: currentOffset,
                            length: sectorLength,
                            reason: error.message
                        };
                        failedSectors.push(failureInfo);
                        this.trace(`❌ 扇区CRC校验异常: 0x${currentAddr.toString(16)}, ${error.message}`);
                        
                        // 检查是否允许部分失败
                        if (!opts.allowPartialFailure || failedSectors.length > opts.maxFailures) {
                            if (progressCallback) {
                                progressCallback({
                                    stage: 'crc_error',
                                    message: `CRC校验异常: ${error.message}`,
                                    error: error.message,
                                    failedSectors: failedSectors
                                });
                            }
                            return {
                                success: false,
                                failedSectors: failedSectors,
                                successfulSectors: successfulSectors,
                                errorStats: this.errorStats
                            };
                        }
                    }
                } else {
                    this.trace(`跳过全0xFF扇区: 0x${currentAddr.toString(16)}`);
                    successfulSectors++;
                }
                
                currentAddr += sectorLength;
                currentOffset += sectorLength;
                sectorCount++;
                
                if (progressCallback) {
                    progressCallback({
                        stage: 'crc_progress',
                        message: `CRC校验进度: ${sectorCount}/${totalSectors} (成功: ${successfulSectors}, 失败: ${failedSectors.length})`,
                        progress: sectorCount,
                        total: totalSectors,
                        successfulSectors: successfulSectors,
                        failedSectors: failedSectors.length
                    });
                }
            }
            
            const finalSuccess = failedSectors.length === 0 || 
                                (opts.allowPartialFailure && failedSectors.length <= opts.maxFailures);
            
            if (progressCallback) {
                progressCallback({
                    stage: finalSuccess ? 'crc_complete' : 'crc_partial',
                    message: finalSuccess ? 
                        'CRC校验完成' : 
                        `CRC校验部分完成 (${failedSectors.length}个扇区失败)`,
                    progress: totalSectors,
                    total: totalSectors,
                    successfulSectors: successfulSectors,
                    failedSectors: failedSectors.length
                });
            }
            
            this.trace(finalSuccess ? 
                '✅ 完整固件CRC校验通过' : 
                `⚠️ 部分固件CRC校验失败 (${failedSectors.length}个扇区)`);
            
            return {
                success: finalSuccess,
                failedSectors: failedSectors,
                successfulSectors: successfulSectors,
                errorStats: this.errorStats
            };
            
        } catch (error) {
            this.trace(`❌ 完整固件CRC校验失败: ${error.message}`);
            if (progressCallback) {
                progressCallback({
                    stage: 'crc_error',
                    message: `CRC校验失败: ${error.message}`,
                    error: error.message,
                    failedSectors: failedSectors
                });
            }
            
            return {
                success: false,
                failedSectors: failedSectors,
                successfulSectors: 0,
                errorStats: this.errorStats,
                criticalError: error.message
            };
        }
    }

    /**
     * 检查缓冲区是否全为0xFF
     * @param {Uint8Array|Array} buffer 缓冲区
     * @returns {boolean} 是否全为0xFF
     */
    isBufferAll0xFF(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] !== 0xff) {
                return false;
            }
        }
        return true;
    }

    /**
     * 快速CRC校验 - 对整个区域进行一次性校验
     * @param {Uint8Array|Array} expectedData 期望数据
     * @param {number} startAddr 起始地址
     * @returns {Promise<boolean>} 校验是否通过
     */
    async quickCRCCheck(expectedData, startAddr) {
        this.trace(`快速CRC校验: 0x${startAddr.toString(16)}, 长度: ${expectedData.length}`);
        
        try {
            return await this.checkRegionCRC(expectedData, startAddr, expectedData.length);
        } catch (error) {
            this.trace(`快速CRC校验失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取CRC校验统计信息（增强版）
     * @param {number} dataLength 数据长度
     * @returns {Object} 统计信息
     */
    getCRCStatistics(dataLength) {
        const totalSectors = Math.ceil(dataLength / this.sectorSize);
        const estimatedTime = totalSectors * 0.05; // 每扇区约50ms
        
        return {
            totalLength: dataLength,
            totalSectors: totalSectors,
            sectorSize: this.sectorSize,
            estimatedTime: estimatedTime,
            errorStats: { ...this.errorStats },
            successRate: this.errorStats.totalRetries > 0 ? 
                (this.errorStats.successfulRecoveries / this.errorStats.totalRetries * 100).toFixed(1) + '%' : 
                'N/A',
            mostCommonError: this.getMostCommonErrorType()
        };
    }

    /**
     * 获取最常见的错误类型
     * @returns {string} 最常见的错误类型
     */
    getMostCommonErrorType() {
        const errors = this.errorStats;
        const counts = {
            '通信错误': errors.communicationErrors,
            'CRC不匹配': errors.crcMismatchErrors,
            '超时错误': errors.timeoutErrors,
            '硬件错误': errors.hardwareErrors
        };
        
        let maxCount = 0;
        let mostCommon = '无';
        
        for (const [type, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = type;
            }
        }
        
        return maxCount > 0 ? `${mostCommon} (${maxCount}次)` : '无';
    }

    /**
     * 重置错误统计
     */
    resetErrorStats() {
        this.errorStats = {
            communicationErrors: 0,
            crcMismatchErrors: 0,
            timeoutErrors: 0,
            hardwareErrors: 0,
            totalRetries: 0,
            successfulRecoveries: 0
        };
        this.trace('错误统计已重置');
    }

    /**
     * 生成错误恢复报告
     * @returns {string} 错误恢复报告
     */
    generateErrorReport() {
        const stats = this.errorStats;
        const successRate = stats.totalRetries > 0 ? 
            (stats.successfulRecoveries / stats.totalRetries * 100).toFixed(1) : 
            0;
        
        return `
CRC校验错误恢复报告:
==================
总重试次数: ${stats.totalRetries}
成功恢复次数: ${stats.successfulRecoveries}
恢复成功率: ${successRate}%

错误类型分布:
- 通信错误: ${stats.communicationErrors}次
- CRC不匹配: ${stats.crcMismatchErrors}次  
- 超时错误: ${stats.timeoutErrors}次
- 硬件错误: ${stats.hardwareErrors}次

建议:
${this.generateRecommendations()}
        `.trim();
    }

    /**
     * 生成改进建议
     * @returns {string} 改进建议
     */
    generateRecommendations() {
        const stats = this.errorStats;
        const recommendations = [];
        
        if (stats.communicationErrors > stats.totalRetries * 0.3) {
            recommendations.push('- 检查串口连接质量，考虑降低波特率');
        }
        
        if (stats.timeoutErrors > stats.totalRetries * 0.2) {
            recommendations.push('- 增加操作超时时间，检查设备响应速度');
        }
        
        if (stats.crcMismatchErrors > stats.totalRetries * 0.1) {
            recommendations.push('- 检查Flash读写稳定性，可能存在硬件问题');
        }
        
        if (stats.hardwareErrors > 0) {
            recommendations.push('- 检查设备硬件状态，考虑更换设备');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('- 系统运行良好，无特殊建议');
        }
        
        return recommendations.join('\n');
    }

    /**
     * 验证CRC32表的正确性 - 测试用途
     * @returns {boolean} CRC32表是否正确
     */
    validateCRC32Table() {
        // 使用已知的测试向量验证CRC32实现
        const testData = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39]); // "123456789"
        const expectedCRC = 0xCBF43926; // 已知的CRC32值
        
        const calculatedCRC = this.calculateSoftwareCRC32(testData);
        const isValid = calculatedCRC === expectedCRC;
        
        this.trace(`CRC32表验证: 期望=0x${expectedCRC.toString(16)}, 计算=0x${calculatedCRC.toString(16)}, 结果=${isValid ? '通过' : '失败'}`);
        return isValid;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5CRCChecker;
} else if (typeof window !== 'undefined') {
    window.T5CRCChecker = T5CRCChecker;
}