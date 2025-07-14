/**
 * T5扇区级写入和校验策略实现
 * 基于Python版本的write()方法，实现高效的Flash写入和校验策略
 * 支持扇区对齐、0xFF跳过优化、写入后校验等功能
 */

class T5WriteStrategy {
    constructor(serialHandler, flashConfig, debugMode = false) {
        this.serialHandler = serialHandler;
        this.flashConfig = flashConfig;
        this.debugMode = debugMode;
        this.name = 'T5WriteStrategy';
        this.stopFlag = false;
        
        this.sectorSize = 0x1000;    // 4K扇区大小
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
     * 检查缓冲区是否全为0xFF - 对应Python is_buf_all_0xff函数
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
     * 读取扇区数据 - 对应Python read_sector方法
     * @param {number} flashAddr Flash地址
     * @returns {Promise<Uint8Array>} 扇区数据
     */
    async readSector(flashAddr) {
        const isLargeFlash = this.flashConfig.flashSize >= this.largeFlashThreshold;
        const protocol = isLargeFlash ? 
            this.serialHandler.protocols.flashRead4kExt : 
            this.serialHandler.protocols.flashRead4k;
        
        this.trace(`读取扇区: 0x${flashAddr.toString(16)} (${isLargeFlash ? '扩展模式' : '普通模式'})`);
        
        try {
            const response = await this.serialHandler.executeProtocol(
                protocol,               // FlashRead4kProtocol或FlashRead4kExtProtocol
                [flashAddr],           // 地址参数
                11 + 4096,             // 期望响应长度（头部11字节 + 4K数据）
                500,                   // 超时500ms
                [flashAddr]            // 检查参数
            );
            
            // 提取扇区数据（去掉协议头部）
            const sectorData = protocol.getReadContent(response);
            this.trace(`扇区读取成功: 0x${flashAddr.toString(16)}, 数据长度: ${sectorData.length}`);
            return sectorData;
            
        } catch (error) {
            this.trace(`扇区读取失败: 0x${flashAddr.toString(16)}, ${error.message}`);
            throw new Error(`读取扇区0x${flashAddr.toString(16)}失败: ${error.message}`);
        }
    }

    /**
     * 写入扇区数据 - 对应Python write_sector方法
     * @param {number} flashAddr Flash地址
     * @param {Uint8Array|Array} buffer 写入数据
     * @returns {Promise<boolean>} 是否成功
     */
    async writeSector(flashAddr, buffer) {
        const isLargeFlash = this.flashConfig.flashSize >= this.largeFlashThreshold;
        const protocol = isLargeFlash ? 
            this.serialHandler.protocols.flashWrite4kExt : 
            this.serialHandler.protocols.flashWrite4k;
        
        this.trace(`写入扇区: 0x${flashAddr.toString(16)} (${isLargeFlash ? '扩展模式' : '普通模式'}), 数据长度: ${buffer.length}`);
        
        try {
            const response = await this.serialHandler.executeProtocol(
                protocol,               // FlashWrite4kProtocol或FlashWrite4kExtProtocol
                [flashAddr, buffer],   // 地址和数据参数
                15,                    // 期望响应长度
                500,                   // 超时500ms
                [flashAddr]            // 检查参数
            );
            
            this.trace(`扇区写入成功: 0x${flashAddr.toString(16)}`);
            return true;
            
        } catch (error) {
            this.trace(`扇区写入失败: 0x${flashAddr.toString(16)}, ${error.message}`);
            throw new Error(`写入扇区0x${flashAddr.toString(16)}失败: ${error.message}`);
        }
    }

    /**
     * 写入并校验扇区 - 对应Python write_and_check_sector方法
     * @param {Uint8Array|Array} buffer 写入数据
     * @param {number} address 地址
     * @param {Function} stopCheck 停止检查函数
     * @returns {Promise<boolean>} 是否成功
     */
    async writeAndCheckSector(buffer, address, stopCheck = null) {
        this.trace(`写入并校验扇区: 0x${address.toString(16)}`);
        
        try {
            // 检查停止标志
            if (this.stopFlag || (stopCheck && stopCheck())) {
                this.trace('写入被用户停止');
                return false;
            }
            
            // 步骤1：写入扇区
            if (!await this.writeSector(address, buffer)) {
                return false;
            }
            
            // 写入后再次检查停止标志
            if (this.stopFlag || (stopCheck && stopCheck())) {
                this.trace('写入后被用户停止');
                return false;
            }
            
            // 步骤2：CRC校验写入结果
            if (!await this.checkSectorCRC(buffer, address)) {
                this.trace(`扇区CRC校验失败: 0x${address.toString(16)}`);
                return false;
            }
            
            this.trace(`✅ 扇区写入并校验成功: 0x${address.toString(16)}`);
            return true;
            
        } catch (error) {
            this.trace(`❌ 扇区写入校验失败: 0x${address.toString(16)}, ${error.message}`);
            return false;
        }
    }

    /**
     * CRC校验扇区数据 - 对应Python check_crc_ver2方法
     * @param {Uint8Array|Array} buffer 预期数据
     * @param {number} flashAddr Flash地址
     * @param {number} retry 重试次数
     * @returns {Promise<boolean>} 是否校验通过
     */
    async checkSectorCRC(buffer, flashAddr, retry = 5) {
        const isLargeFlash = this.flashConfig.flashSize >= this.largeFlashThreshold;
        const protocol = isLargeFlash ? 
            this.serialHandler.protocols.checkCrcExt : 
            this.serialHandler.protocols.checkCrc;
        
        // 计算软件CRC32
        const expectedCRC = this.calculateCRC32(buffer);
        this.trace(`扇区CRC校验: 0x${flashAddr.toString(16)}, 期望CRC: 0x${expectedCRC.toString(16)}`);
        
        for (let retryCount = 0; retryCount < retry; retryCount++) {
            try {
                // 使用硬件CRC检查
                const response = await this.serialHandler.executeProtocol(
                    protocol,                                    // CheckCrcProtocol或CheckCrcExtProtocol
                    [flashAddr, flashAddr + buffer.length - 1], // 起始和结束地址
                    11,                                          // 期望响应长度
                    100,                                         // 超时100ms
                    []                                           // 无检查参数
                );
                
                // 获取硬件计算的CRC值
                const hardwareCRC = protocol.getCrcValue(response);
                this.trace(`硬件CRC: 0x${hardwareCRC.toString(16)}, 期望CRC: 0x${expectedCRC.toString(16)}`);
                
                if (expectedCRC === hardwareCRC) {
                    this.trace(`✅ CRC校验通过: 0x${flashAddr.toString(16)}`);
                    return true;
                } else {
                    this.trace(`❌ CRC校验失败: 0x${flashAddr.toString(16)}, 硬件CRC: 0x${hardwareCRC.toString(16)}, 期望CRC: 0x${expectedCRC.toString(16)}`);
                    return false;
                }
                
            } catch (error) {
                this.trace(`CRC校验错误 (尝试${retryCount + 1}/${retry}): ${error.message}`);
                if (retryCount === retry - 1) {
                    throw new Error(`CRC校验失败: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        return false;
    }

    /**
     * 计算CRC32 - 对应Python crc32_ver2函数
     * @param {Uint8Array|Array} buffer 数据缓冲区
     * @returns {number} CRC32值
     */
    calculateCRC32(buffer) {
        // CRC32表（完全按照Python版本）
        const crc32Table = this.makeCRC32Table();
        
        let crc = 0xffffffff;
        for (const byte of buffer) {
            crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xFF];
        }
        
        return crc >>> 0; // 确保是无符号32位整数
    }

    /**
     * 生成CRC32表 - 对应Python make_crc32_table函数
     * @returns {Array<number>} CRC32表
     */
    makeCRC32Table() {
        const table = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let bit = 0; bit < 8; bit++) {
                if (c & 1) {
                    c = (c >>> 1) ^ 0xEDB88320;
                } else {
                    c = c >>> 1;
                }
            }
            table[i] = c >>> 0; // 确保是无符号32位整数
        }
        
        return table;
    }

    /**
     * 扇区对齐写入 - 对应Python align_sector_address_for_write方法
     * @param {number} addr 未对齐地址
     * @param {boolean} isStart 是否为起始对齐
     * @param {Uint8Array|Array} content 内容
     * @param {Function} stopCheck 停止检查函数
     * @returns {Promise<boolean>} 是否成功
     */
    async alignSectorAddressForWrite(addr, isStart, content, stopCheck = null) {
        const eraseAddr = Math.floor(addr / this.sectorSize) * this.sectorSize;
        this.trace(`扇区对齐写入: addr=0x${addr.toString(16)}, eraseAddr=0x${eraseAddr.toString(16)}, isStart=${isStart}`);
        
        try {
            // 检查停止标志
            if (this.stopFlag || (stopCheck && stopCheck())) {
                this.trace('扇区对齐写入被用户停止');
                return false;
            }
            
            // 步骤1：切换到高速波特率读取原扇区数据
            const baudrateBakcup = this.serialHandler.currentBaudrate || 115200;
            
            // TODO: 实现波特率切换逻辑
            // await this.serialHandler.setBaudrate(500000);
            
            // 步骤2：读取原扇区数据
            const originalData = await this.readSector(eraseAddr);
            if (!originalData) {
                throw new Error('读取原扇区数据失败');
            }
            
            // 读取后检查停止标志
            if (this.stopFlag || (stopCheck && stopCheck())) {
                this.trace('读取原扇区数据后被用户停止');
                return false;
            }
            
            // 步骤3：擦除扇区
            const isLargeFlash = this.flashConfig.flashSize >= this.largeFlashThreshold;
            const eraseCmd = isLargeFlash ? 0x21 : 0x20; // 4K扇区擦除命令
            
            const response = await this.serialHandler.executeProtocol(
                this.serialHandler.protocols.flashCustomErase,
                [eraseAddr, eraseCmd],
                16,
                500,
                [eraseCmd, eraseAddr]
            );
            
            // 擦除后检查停止标志
            if (this.stopFlag || (stopCheck && stopCheck())) {
                this.trace('擦除扇区后被用户停止');
                return false;
            }
            
            // 步骤4：恢复波特率
            // await this.serialHandler.setBaudrate(baudrateBakcup);
            
            // 步骤5：构造新的扇区数据
            let newSectorData;
            if (isStart) {
                // 起始对齐：保留前面的原数据 + 新数据的前面部分
                const offset = addr & 0xfff;
                const contentLength = Math.min(content.length, this.sectorSize - offset);
                newSectorData = new Uint8Array(this.sectorSize);
                newSectorData.set(originalData.slice(0, offset), 0);
                newSectorData.set(content.slice(0, contentLength), offset);
            } else {
                // 结束对齐：新数据的后面部分 + 保留后面的原数据
                const offset = addr & 0xfff;
                const contentStart = content.length - offset;
                newSectorData = new Uint8Array(this.sectorSize);
                newSectorData.set(content.slice(contentStart), 0);
                newSectorData.set(originalData.slice(offset), offset);
            }
            
            // 步骤6：写入并校验新扇区数据
            if (!await this.writeAndCheckSector(newSectorData, eraseAddr, stopCheck)) {
                throw new Error('写入对齐扇区数据失败');
            }
            
            this.trace(`✅ 扇区对齐写入成功: 0x${eraseAddr.toString(16)}`);
            return true;
            
        } catch (error) {
            this.trace(`❌ 扇区对齐写入失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 重试写入扇区 - 对应Python retry_write_sector方法
     * @param {number} flashAddr Flash地址
     * @param {Uint8Array|Array} buffer 数据
     * @param {number} retry 重试次数
     * @param {Function} stopCheck 停止检查函数
     * @returns {Promise<boolean>} 是否成功
     */
    async retryWriteSector(flashAddr, buffer, retry = 5, stopCheck = null) {
        this.trace(`重试写入扇区: 0x${flashAddr.toString(16)}, 重试次数: ${retry}`);
        
        const baudrateBakcup = this.serialHandler.currentBaudrate || 115200;
        
        for (let retryCount = 0; retryCount < retry; retryCount++) {
            try {
                // 每次重试前检查停止标志
                if (this.stopFlag || (stopCheck && stopCheck())) {
                    this.trace(`重试写入被用户停止 (第${retryCount + 1}次重试)`);
                    return false;
                }
                
                // 步骤1：重置串口连接
                // TODO: 实现串口重置和重新连接逻辑
                // await this.serialHandler.reset(115200);
                // if (!await this.serialHandler.getBusControl(stopCheck)) {
                //     throw new Error('重新获取总线控制权失败');
                // }
                
                // 步骤2：恢复波特率
                // await new Promise(resolve => setTimeout(resolve, 10));
                // await this.serialHandler.setBaudrate(baudrateBakcup);
                
                // 步骤3：擦除扇区
                const response = await this.serialHandler.executeProtocol(
                    this.serialHandler.protocols.flashErase4k,
                    [flashAddr],
                    15,
                    500,
                    [flashAddr]
                );
                
                // 擦除后检查停止标志
                if (this.stopFlag || (stopCheck && stopCheck())) {
                    this.trace(`擦除后被用户停止 (第${retryCount + 1}次重试)`);
                    return false;
                }
                
                // 步骤4：写入并校验
                if (!await this.writeAndCheckSector(buffer, flashAddr, stopCheck)) {
                    throw new Error('重试写入校验失败');
                }
                
                this.trace(`✅ 重试写入成功: 0x${flashAddr.toString(16)} (第${retryCount + 1}次重试)`);
                return true;
                
            } catch (error) {
                this.trace(`❌ 重试写入失败 (第${retryCount + 1}/${retry}次): 0x${flashAddr.toString(16)}, ${error.message}`);
                
                // 最后一次重试失败
                if (retryCount === retry - 1) {
                    this.trace(`❌ 重试写入最终失败: 0x${flashAddr.toString(16)}`);
                    return false;
                }
                
                // 重试间隔延迟
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return false;
    }

    /**
     * 执行扇区级写入策略 - 对应Python write()方法主逻辑
     * @param {number} startAddr 起始地址
     * @param {Uint8Array|Array} writeBuffer 写入数据
     * @param {Function} progressCallback 进度回调
     * @param {Function} stopCheck 停止检查函数
     * @returns {Promise<boolean>} 是否成功
     */
    async executeWrite(startAddr, writeBuffer, progressCallback = null, stopCheck = null) {
        this.trace('开始扇区级写入策略...');
        
        try {
            let currentStartAddr = startAddr;
            let currentBuffer = new Uint8Array(writeBuffer);
            let fileLength = currentBuffer.length;
            const endAddr = currentStartAddr + fileLength;
            
            this.trace(`写入范围: 0x${currentStartAddr.toString(16)} - 0x${endAddr.toString(16)} (${fileLength} 字节)`);
            
            // 计算进度总数
            const progressTotal = 2 + Math.ceil(fileLength / this.sectorSize) + 1;
            if (progressCallback) {
                progressCallback({
                    stage: 'write_start',
                    message: '开始扇区级写入',
                    progress: 0,
                    total: progressTotal
                });
            }
            
            let progressCount = 0;
            
            // 步骤1：处理起始地址对齐
            if (currentStartAddr & 0xfff) {
                this.trace(`处理起始地址对齐: 0x${currentStartAddr.toString(16)}`);
                if (!await this.alignSectorAddressForWrite(currentStartAddr, true, currentBuffer, stopCheck)) {
                    this.trace('起始地址对齐被停止');
                    return false;
                }
                
                const alignedBytes = this.sectorSize - (currentStartAddr & 0xfff);
                currentBuffer = currentBuffer.slice(alignedBytes);
                currentStartAddr = Math.floor((currentStartAddr + this.sectorSize) / this.sectorSize) * this.sectorSize;
                fileLength = currentBuffer.length;
            }
            progressCount++;
            if (progressCallback) {
                progressCallback({
                    stage: 'write_align_start',
                    message: '起始地址对齐完成',
                    progress: progressCount,
                    total: progressTotal
                });
            }
            
            // 步骤2：处理结束地址对齐
            const newEndAddr = currentStartAddr + fileLength;
            if (newEndAddr & 0xfff) {
                this.trace(`处理结束地址对齐: 0x${newEndAddr.toString(16)}`);
                if (!await this.alignSectorAddressForWrite(newEndAddr, false, currentBuffer, stopCheck)) {
                    this.trace('结束地址对齐被停止');
                    return false;
                }
                
                const trimBytes = newEndAddr & 0xfff;
                currentBuffer = currentBuffer.slice(0, currentBuffer.length - trimBytes);
                fileLength = currentBuffer.length;
            }
            progressCount++;
            if (progressCallback) {
                progressCallback({
                    stage: 'write_align_end',
                    message: '结束地址对齐完成',
                    progress: progressCount,
                    total: progressTotal
                });
            }
            
            // 步骤3：逐扇区写入
            let i = 0;
            while (i < fileLength) {
                if (this.stopFlag || (stopCheck && stopCheck())) {
                    this.trace('写入被用户停止');
                    return false;
                }
                
                const currentAddr = currentStartAddr + i;
                const sectorData = currentBuffer.slice(i, i + this.sectorSize);
                
                this.trace(`写入扇区: 0x${currentAddr.toString(16)} (4K)`);
                
                // 优化：跳过全0xFF的扇区
                if (!this.isBufferAll0xFF(sectorData)) {
                    if (!await this.writeAndCheckSector(sectorData, currentAddr, stopCheck)) {
                        this.trace(`直接写入失败，尝试重试写入: 0x${currentAddr.toString(16)}`);
                        if (!await this.retryWriteSector(currentAddr, sectorData, 5, stopCheck)) {
                            throw new Error(`写入扇区0x${currentAddr.toString(16)}失败`);
                        }
                    }
                } else {
                    this.trace(`跳过全0xFF扇区: 0x${currentAddr.toString(16)}`);
                }
                
                progressCount++;
                if (progressCallback) {
                    progressCallback({
                        stage: 'writing',
                        message: `写入扇区: 0x${currentAddr.toString(16)}`,
                        progress: progressCount,
                        total: progressTotal
                    });
                }
                
                i += this.sectorSize;
            }
            
            // 步骤4：保护Flash
            this.trace('开始保护Flash...');
            await this.flashConfig.protectFlash(this.serialHandler);
            
            progressCount++;
            if (progressCallback) {
                progressCallback({
                    stage: 'write_complete',
                    message: '扇区级写入完成',
                    progress: progressTotal,
                    total: progressTotal
                });
            }
            
            this.trace('✅ 扇区级写入策略执行成功');
            return true;
            
        } catch (error) {
            this.trace(`❌ 扇区级写入策略失败: ${error.message}`);
            if (progressCallback) {
                progressCallback({
                    stage: 'write_error',
                    message: `写入失败: ${error.message}`,
                    error: error.message
                });
            }
            throw error;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5WriteStrategy;
} else if (typeof window !== 'undefined') {
    window.T5WriteStrategy = T5WriteStrategy;
}