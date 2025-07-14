/**
 * T5 Flash操作管理器
 * 负责T5芯片的擦除、写入、读取、校验等Flash操作
 * 从t5ai-downloader.js中拆分出来
 */

class T5FlashOperations {
    constructor(serialHandler, protocols, flashConfig, debugCallback) {
        this.serialHandler = serialHandler;
        this.protocols = protocols;
        this.flashConfig = flashConfig;
        this.debugCallback = debugCallback;
        
        // 进度回调
        this.onProgress = null;
        
        // 策略实例
        this.eraseStrategy = null;
        this.writeStrategy = null;
        this.crcChecker = null;
    }

    /**
     * 初始化策略实例
     */
    initialize() {
        // 初始化策略实例
        this.eraseStrategy = new T5EraseStrategy(this.serialHandler, this.protocols, this.debugCallback);
        this.writeStrategy = new T5WriteStrategy(this.serialHandler, this.protocols, this.debugCallback);
        this.crcChecker = new T5CRCChecker(this.serialHandler, this.protocols, this.debugCallback);
        
        // 设置进度回调
        if (this.onProgress) {
            this.eraseStrategy.setProgressCallback(this.onProgress);
            this.writeStrategy.setProgressCallback(this.onProgress);
            this.crcChecker.setProgressCallback(this.onProgress);
        }
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
     * 设置进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
        if (this.eraseStrategy) this.eraseStrategy.setProgressCallback(callback);
        if (this.writeStrategy) this.writeStrategy.setProgressCallback(callback);
        if (this.crcChecker) this.crcChecker.setProgressCallback(callback);
    }

    /**
     * 擦除Flash - 使用智能擦除策略
     */
    async eraseFlash(startAddr, length) {
        this.debug('main', `🗑️ 开始擦除Flash: 地址=0x${startAddr.toString(16)}, 长度=${length}字节`);
        
        if (!this.eraseStrategy) {
            this.initialize();
        }
        
        try {
            const result = await this.eraseStrategy.erase(startAddr, length);
            this.debug('main', '✅ Flash擦除完成');
            return result;
            
        } catch (error) {
            this.debug('error', `Flash擦除失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 写入Flash - 使用扇区级写入策略
     */
    async writeFlash(startAddr, fileData) {
        this.debug('main', `💾 开始写入Flash: 地址=0x${startAddr.toString(16)}, 大小=${fileData.length}字节`);
        
        if (!this.writeStrategy) {
            this.initialize();
        }
        
        try {
            const result = await this.writeStrategy.write(startAddr, fileData);
            this.debug('main', '✅ Flash写入完成');
            return result;
            
        } catch (error) {
            this.debug('error', `Flash写入失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 读取Flash
     */
    async readFlash(startAddr, length) {
        this.debug('main', `📖 开始读取Flash: 地址=0x${startAddr.toString(16)}, 长度=${length}字节`);
        
        try {
            // 检查Flash大小
            const flashInfo = this.flashConfig.getCurrentFlashInfo();
            if (!flashInfo) {
                throw new Error('Flash信息未初始化');
            }
            
            if (startAddr + length > flashInfo.size) {
                throw new Error(`读取范围超出Flash大小 (${flashInfo.size}字节)`);
            }
            
            // 计算需要读取的扇区数
            const SECTOR_SIZE = 4096;
            const startSector = Math.floor(startAddr / SECTOR_SIZE);
            const endSector = Math.floor((startAddr + length - 1) / SECTOR_SIZE);
            const totalSectors = endSector - startSector + 1;
            
            this.debug('info', `需要读取 ${totalSectors} 个扇区 (${startSector} - ${endSector})`);
            
            const fileBuffer = new Uint8Array(length);
            let bufferOffset = 0;
            
            // 报告进度
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'reading', 
                    message: '正在读取Flash...',
                    progress: 0,
                    total: totalSectors
                });
            }
            
            // 逐扇区读取
            for (let sector = startSector; sector <= endSector; sector++) {
                if (this.serialHandler.stopFlag) {
                    throw new Error('读取操作被用户停止');
                }
                
                const sectorAddr = sector * SECTOR_SIZE;
                const readAddr = Math.max(sectorAddr, startAddr);
                const readEndAddr = Math.min(sectorAddr + SECTOR_SIZE, startAddr + length);
                const readLength = readEndAddr - readAddr;
                
                this.debug('debug', `读取扇区 ${sector}: 地址=0x${readAddr.toString(16)}, 长度=${readLength}`);
                
                // 选择合适的读取协议
                let readProtocol;
                let expectedLength;
                
                if (flashInfo.size >= 256 * 1024 * 1024) {
                    // 大容量Flash使用扩展协议
                    readProtocol = this.protocols.flashRead4kExt;
                    expectedLength = 15 + readLength;
                } else {
                    // 普通Flash使用标准协议
                    readProtocol = this.protocols.flashRead4k;
                    expectedLength = 15 + readLength;
                }
                
                const response = await this.serialHandler.executeProtocol(
                    readProtocol, 
                    [readAddr, readLength], 
                    expectedLength, 
                    1000
                );
                
                // 提取数据部分
                const sectorData = response.slice(15);
                
                // 复制到输出缓冲区
                const copyLength = Math.min(sectorData.length, readLength);
                fileBuffer.set(sectorData.slice(0, copyLength), bufferOffset);
                bufferOffset += copyLength;
                
                // 报告进度
                if (this.onProgress) {
                    this.onProgress({ 
                        stage: 'reading', 
                        message: `读取扇区 ${sector + 1}/${totalSectors}`,
                        progress: sector - startSector + 1,
                        total: totalSectors
                    });
                }
            }
            
            // 完成读取
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'completed', 
                    message: 'Flash读取完成',
                    progress: totalSectors,
                    total: totalSectors
                });
            }
            
            this.debug('main', '✅ Flash读取完成');
            return fileBuffer.slice(0, length);
            
        } catch (error) {
            this.debug('error', `Flash读取失败: ${error.message}`);
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'error', 
                    message: `读取失败: ${error.message}` 
                });
            }
            throw error;
        }
    }

    /**
     * CRC校验 - 使用CRC检查器
     */
    async crcCheck(startAddr, fileData) {
        this.debug('main', `🔍 开始CRC校验: 地址=0x${startAddr.toString(16)}, 大小=${fileData.length}字节`);
        
        if (!this.crcChecker) {
            this.initialize();
        }
        
        try {
            const flashInfo = this.flashConfig.getCurrentFlashInfo();
            const result = await this.crcChecker.check(startAddr, fileData, flashInfo);
            
            if (result.success) {
                this.debug('main', '✅ CRC校验成功');
            } else {
                this.debug('error', `❌ CRC校验失败: 期望=${result.expected}, 实际=${result.actual}`);
            }
            
            return result;
            
        } catch (error) {
            this.debug('error', `CRC校验失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 全片擦除
     */
    async eraseAll() {
        this.debug('main', '🗑️ 开始全片擦除Flash...');
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.flashEraseAll, 
                [], 
                15, 
                30000  // 全片擦除需要更长时间
            );
            
            this.debug('main', '✅ 全片擦除完成');
            return response;
            
        } catch (error) {
            this.debug('error', `全片擦除失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 读取状态寄存器
     */
    async readStatusRegister() {
        this.debug('debug', '读取Flash状态寄存器...');
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.flashReadSR, 
                [], 
                15, 
                500
            );
            
            const status = this.protocols.flashReadSR.getStatusRegister(response);
            this.debug('debug', `状态寄存器: 0x${status.toString(16)}`);
            
            return status;
            
        } catch (error) {
            throw new Error(`读取状态寄存器失败: ${error.message}`);
        }
    }

    /**
     * 写入状态寄存器
     */
    async writeStatusRegister(value) {
        this.debug('debug', `写入Flash状态寄存器: 0x${value.toString(16)}`);
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.flashWriteSR, 
                [value], 
                15, 
                500
            );
            
            this.debug('debug', '状态寄存器写入成功');
            return response;
            
        } catch (error) {
            throw new Error(`写入状态寄存器失败: ${error.message}`);
        }
    }

    /**
     * 获取Flash信息
     */
    getFlashInfo() {
        return this.flashConfig.getCurrentFlashInfo();
    }

    /**
     * 获取操作统计
     */
    getOperationStats() {
        const stats = {
            eraseStrategy: this.eraseStrategy ? this.eraseStrategy.getStats() : null,
            writeStrategy: this.writeStrategy ? this.writeStrategy.getStats() : null,
            crcChecker: this.crcChecker ? this.crcChecker.getStats() : null
        };
        
        return stats;
    }

    /**
     * 重置操作状态
     */
    reset() {
        if (this.eraseStrategy) this.eraseStrategy.reset();
        if (this.writeStrategy) this.writeStrategy.reset();
        if (this.crcChecker) this.crcChecker.reset();
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.T5FlashOperations = T5FlashOperations;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5FlashOperations;
}