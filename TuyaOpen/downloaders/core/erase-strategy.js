/**
 * T5智能擦除策略实现
 * 基于Python版本的erase()方法，实现高效的Flash擦除策略
 * 支持64K块擦除、4K扇区擦除和自定义擦除大小
 */

class T5EraseStrategy {
    constructor(serialHandler, flashConfig, debugMode = false) {
        this.serialHandler = serialHandler;
        this.flashConfig = flashConfig;
        this.debugMode = debugMode;
        this.name = 'T5EraseStrategy';
        this.stopFlag = false;
        
        // 擦除命令配置（完全按照Python版本）
        this.eraseCommands = {
            // 普通Flash命令
            sector4K: 0x20,      // 4K扇区擦除
            block32K: 0x52,      // 32K块擦除  
            block64K: 0xd8,      // 64K块擦除
            
            // 大容量Flash命令（>=256MB）
            sector4KExt: 0x21,   // 4K扇区擦除（扩展）
            block32KExt: 0x5c,   // 32K块擦除（扩展）
            block64KExt: 0xdc    // 64K块擦除（扩展）
        };
        
        this.sectorSize = 0x1000;    // 4K扇区大小
        this.block64Size = 0x10000;  // 64K块大小
        this.largeFlashThreshold = 256 * 1024 * 1024; // 256MB阈值
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 设置停止标志
     */
    setStopFlag(flag) {
        this.stopFlag = flag;
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
     * 计算擦除地址范围 - 完全按照Python逻辑
     * @param {number} startAddr 起始地址
     * @param {number} dataLength 数据长度
     * @returns {Object} {startAddr, endAddr, eraseSize}
     */
    calculateEraseRange(startAddr, dataLength) {
        let eraseStartAddr = startAddr;
        let eraseEndAddr = startAddr + dataLength;
        
        this.trace(`原始地址范围: 0x${startAddr.toString(16)} - 0x${eraseEndAddr.toString(16)}`);
        
        // Python逻辑：起始地址向上对齐到扇区边界
        if (eraseStartAddr & 0xfff) {
            eraseStartAddr = Math.floor((eraseStartAddr + 0x1000) / 0x1000) * 0x1000;
        }
        
        // Python逻辑：结束地址向下对齐到扇区边界
        if (eraseEndAddr & 0xfff) {
            eraseEndAddr = Math.floor(eraseEndAddr / 0x1000) * 0x1000;
        }
        
        const eraseSize = eraseEndAddr - eraseStartAddr;
        
        this.trace(`擦除地址范围: 0x${eraseStartAddr.toString(16)} - 0x${eraseEndAddr.toString(16)}`);
        this.trace(`擦除大小: 0x${eraseSize.toString(16)} (${eraseSize} 字节)`);
        
        return {
            startAddr: eraseStartAddr,
            endAddr: eraseEndAddr,
            eraseSize: eraseSize
        };
    }

    /**
     * 计算擦除进度总数 - 按照Python的进度计算逻辑（精确版）
     * @param {number} startAddr 起始地址
     * @param {number} eraseSize 擦除大小
     * @returns {Object} 进度详情：{total, blocks64K, sectors4K, breakdown}
     */
    calculateProgressTotal(startAddr, eraseSize) {
        // 精确计算实际的擦除操作数
        let currentAddr = startAddr;
        let remainingSize = eraseSize;
        let blocks64K = 0;
        let sectors4K = 0;
        
        const breakdown = [];
        
        while (remainingSize > 0) {
            if (remainingSize > this.block64Size) {
                // 剩余空间大于64K
                if (currentAddr & 0xffff) {
                    // 地址未对齐到64K边界，擦除4K扇区
                    sectors4K++;
                    breakdown.push(`4K扇区: 0x${currentAddr.toString(16)}`);
                    currentAddr += this.sectorSize;
                    remainingSize -= this.sectorSize;
                } else {
                    // 地址已对齐到64K边界，擦除64K块
                    blocks64K++;
                    breakdown.push(`64K块: 0x${currentAddr.toString(16)}`);
                    currentAddr += this.block64Size;
                    remainingSize -= this.block64Size;
                }
            } else {
                // 剩余空间小于等于64K，擦除4K扇区
                sectors4K++;
                breakdown.push(`4K扇区: 0x${currentAddr.toString(16)}`);
                currentAddr += this.sectorSize;
                remainingSize -= this.sectorSize;
            }
        }
        
        const total = blocks64K + sectors4K;
        
        this.trace(`精确进度计算: ${total} (${blocks64K} 个64K块 + ${sectors4K} 个4K扇区)`);
        if (this.debugMode) {
            this.trace(`擦除计划: ${breakdown.slice(0, 5).join(', ')}${breakdown.length > 5 ? '...' : ''}`);
        }
        
        return {
            total: total,
            blocks64K: blocks64K,
            sectors4K: sectors4K,
            breakdown: breakdown
        };
    }

    /**
     * 获取擦除命令 - 根据Flash大小和擦除类型选择命令
     * @param {string} eraseType 擦除类型：'sector4K', 'block64K'
     * @returns {number} 擦除命令
     */
    getEraseCommand(eraseType) {
        const isLargeFlash = this.flashConfig.flashSize >= this.largeFlashThreshold;
        
        switch (eraseType) {
            case 'sector4K':
                return isLargeFlash ? this.eraseCommands.sector4KExt : this.eraseCommands.sector4K;
            case 'block64K':
                return isLargeFlash ? this.eraseCommands.block64KExt : this.eraseCommands.block64K;
            default:
                throw new Error(`未知的擦除类型: ${eraseType}`);
        }
    }

    /**
     * 擦除单个自定义大小区域 - 使用FlashCustomErase协议
     * @param {number} address 擦除地址
     * @param {string} eraseType 擦除类型
     * @param {number} retry 重试次数
     * @returns {Promise<boolean>} 是否成功
     */
    async eraseCustomSize(address, eraseType, retry = 5) {
        const eraseCmd = this.getEraseCommand(eraseType);
        this.trace(`擦除 0x${address.toString(16)} 使用命令 0x${eraseCmd.toString(16)} (${eraseType})`);
        
        for (let retryCount = 0; retryCount < retry; retryCount++) {
            try {
                // 使用T5协议擦除自定义大小
                const response = await this.serialHandler.executeProtocol(
                    this.serialHandler.protocols.flashCustomErase,  // FlashCustomEraseProtocol实例
                    [address, eraseCmd],                            // 地址和擦除命令
                    16,                                             // 期望响应长度
                    500,                                            // 超时500ms
                    [eraseCmd, address]                             // 检查参数
                );
                
                this.trace(`擦除成功: 0x${address.toString(16)} (${eraseType})`);
                return true;
                
            } catch (error) {
                this.trace(`擦除失败 (尝试${retryCount + 1}/${retry}): ${error.message}`);
                if (retryCount === retry - 1) {
                    throw new Error(`擦除 0x${address.toString(16)} 失败: ${error.message}`);
                }
                // 短暂延迟后重试
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        return false;
    }

    /**
     * 智能擦除策略主逻辑 - 完全按照Python的erase()方法实现（精确进度版）
     * @param {number} startAddr 起始地址
     * @param {number} dataLength 数据长度
     * @param {Function} progressCallback 进度回调函数
     * @param {Function} stopCheck 停止检查函数
     * @returns {Promise<boolean>} 是否成功
     */
    async executeIntelligentErase(startAddr, dataLength, progressCallback = null, stopCheck = null) {
        this.trace('开始智能擦除策略...');
        
        try {
            // 步骤1：计算擦除范围
            const eraseRange = this.calculateEraseRange(startAddr, dataLength);
            if (eraseRange.eraseSize <= 0) {
                this.trace('无需擦除，数据已对齐');
                if (progressCallback) {
                    progressCallback({
                        stage: 'erase_complete',
                        message: '无需擦除',
                        progress: 1,
                        total: 1
                    });
                }
                return true;
            }
            
            // 步骤2：精确计算进度
            const progressDetail = this.calculateProgressTotal(eraseRange.startAddr, eraseRange.eraseSize);
            if (progressCallback) {
                progressCallback({
                    stage: 'erase_start',
                    message: '开始智能擦除',
                    progress: 0,
                    total: progressDetail.total,
                    blocks64K: progressDetail.blocks64K,
                    sectors4K: progressDetail.sectors4K
                });
            }
            
            // 步骤3：执行智能擦除循环（精确进度跟踪）
            let currentAddr = eraseRange.startAddr;
            let remainingSize = eraseRange.eraseSize;
            let progressCount = 0;
            let blocks64KCompleted = 0;
            let sectors4KCompleted = 0;
            
            while (remainingSize > 0) {
                // 检查停止标志
                if (this.stopFlag || (stopCheck && stopCheck())) {
                    this.trace('擦除被用户停止');
                    if (progressCallback) {
                        progressCallback({
                            stage: 'erase_stopped',
                            message: '擦除被用户停止',
                            progress: progressCount,
                            total: progressDetail.total
                        });
                    }
                    return false;
                }
                
                const addrStr = `0x${currentAddr.toString(16).padStart(8, '0')}`;
                
                // Python逻辑：选择最优擦除策略
                if (remainingSize > this.block64Size) {
                    // 剩余空间大于64K
                    if (currentAddr & 0xffff) {
                        // 地址未对齐到64K边界，擦除4K扇区
                        this.trace(`地址${addrStr}未对齐64K边界，擦除4K扇区`);
                        await this.eraseCustomSize(currentAddr, 'sector4K');
                        
                        currentAddr += this.sectorSize;
                        remainingSize -= this.sectorSize;
                        progressCount++;
                        sectors4KCompleted++;
                        
                        // 更新进度（4K扇区擦除）
                        if (progressCallback) {
                            progressCallback({
                                stage: 'erasing',
                                message: `擦除4K扇区: ${addrStr} (对齐)`,
                                progress: progressCount,
                                total: progressDetail.total,
                                currentOperation: '4K扇区擦除',
                                blocks64KCompleted: blocks64KCompleted,
                                sectors4KCompleted: sectors4KCompleted
                            });
                        }
                    } else {
                        // 地址已对齐到64K边界，擦除64K块
                        this.trace(`地址${addrStr}已对齐64K边界，擦除64K块`);
                        await this.eraseCustomSize(currentAddr, 'block64K');
                        
                        currentAddr += this.block64Size;
                        remainingSize -= this.block64Size;
                        progressCount++;
                        blocks64KCompleted++;
                        
                        // 更新进度（64K块擦除）
                        if (progressCallback) {
                            progressCallback({
                                stage: 'erasing',
                                message: `擦除64K块: ${addrStr}`,
                                progress: progressCount,
                                total: progressDetail.total,
                                currentOperation: '64K块擦除',
                                blocks64KCompleted: blocks64KCompleted,
                                sectors4KCompleted: sectors4KCompleted
                            });
                        }
                    }
                } else {
                    // 剩余空间小于等于64K，擦除4K扇区
                    this.trace(`剩余空间${remainingSize}字节，擦除4K扇区: ${addrStr}`);
                    await this.eraseCustomSize(currentAddr, 'sector4K');
                    
                    currentAddr += this.sectorSize;
                    remainingSize -= this.sectorSize;
                    progressCount++;
                    sectors4KCompleted++;
                    
                    // 更新进度（4K扇区擦除）
                    if (progressCallback) {
                        progressCallback({
                            stage: 'erasing',
                            message: `擦除4K扇区: ${addrStr} (尾部)`,
                            progress: progressCount,
                            total: progressDetail.total,
                            currentOperation: '4K扇区擦除',
                            blocks64KCompleted: blocks64KCompleted,
                            sectors4KCompleted: sectors4KCompleted
                        });
                    }
                }
            }
            
            // 完成擦除（验证进度计算准确性）
            const finalCheck = progressCount === progressDetail.total &&
                              blocks64KCompleted === progressDetail.blocks64K &&
                              sectors4KCompleted === progressDetail.sectors4K;
            
            if (!finalCheck) {
                this.trace(`⚠️ 进度计算偏差: 预期${progressDetail.total}，实际${progressCount}`);
            }
            
            if (progressCallback) {
                progressCallback({
                    stage: 'erase_complete',
                    message: '智能擦除完成',
                    progress: progressDetail.total,
                    total: progressDetail.total,
                    blocks64KCompleted: blocks64KCompleted,
                    sectors4KCompleted: sectors4KCompleted,
                    progressAccurate: finalCheck
                });
            }
            
            this.trace(`✅ 智能擦除策略执行成功 (64K块: ${blocks64KCompleted}, 4K扇区: ${sectors4KCompleted})`);
            return true;
            
        } catch (error) {
            this.trace(`❌ 智能擦除策略失败: ${error.message}`);
            if (progressCallback) {
                progressCallback({
                    stage: 'erase_error',
                    message: `擦除失败: ${error.message}`,
                    error: error.message
                });
            }
            throw error;
        }
    }

    /**
     * 获取擦除统计信息
     * @param {number} eraseSize 擦除大小
     * @returns {Object} 统计信息
     */
    getEraseStatistics(eraseSize) {
        const num64KBlocks = Math.floor(eraseSize / this.block64Size);
        const remainder = eraseSize % this.block64Size;
        const num4KSectors = Math.floor(remainder / this.sectorSize);
        
        return {
            totalSize: eraseSize,
            num64KBlocks: num64KBlocks,
            num4KSectors: num4KSectors,
            estimatedTime: (num64KBlocks * 0.5 + num4KSectors * 0.1), // 估算时间（秒）
            efficiency: (num64KBlocks * this.block64Size) / eraseSize * 100 // 64K块擦除效率
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5EraseStrategy;
} else if (typeof window !== 'undefined') {
    window.T5EraseStrategy = T5EraseStrategy;
}