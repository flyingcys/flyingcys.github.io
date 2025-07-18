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
        // 初始化策略实例（使用共享的策略类）
        this.eraseStrategy = new EraseStrategy(this.serialHandler, this.protocols, this.debugCallback);
        this.writeStrategy = new WriteStrategy(this.serialHandler, this.protocols, this.debugCallback);
        this.crcChecker = new CRCChecker(this.serialHandler, this.protocols, this.debugCallback);
        
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

    /**
     * Flash解保护操作 - 完全按照参考版本实现
     */
    async unprotectFlash() {
        this.debug('info', 'Flash解保护操作...');
        
        // 波特率切换后，先测试通信是否正常
        this.debug('debug', '波特率切换后测试通信...');
        await this.serialHandler.clearBuffer();
        
        // 发送LinkCheck确认通信正常
        if (await this.serialHandler.doLinkCheck()) {
            this.debug('info', '✅ 高速通信正常');
        } else {
            this.debug('warning', '高速通信测试失败，继续尝试Flash操作...');
        }
        
        // 参考版本逻辑: unprotect_flash()
        // unprotect_reg_val = [0, 0]
        // mask = [124, 64]  # 0x7c, 0x40
        const unprotectRegVal = [0, 0];
        const mask = [124, 64]; // 0x7c, 0x40
        
        this.debug('debug', `解保护目标值: [${unprotectRegVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        this.debug('debug', `解保护掩码: [${mask.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // 参考版本: reg_val = self._read_flash_status_reg_val()
        const regVal = await this.readFlashStatusRegVal();
        this.debug('debug', `读取到状态寄存器值: [${regVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // 参考版本: if self.compare_register_value(reg_val, unprotect_reg_val, mask):
        if (this.compareRegisterValue(regVal, unprotectRegVal, mask)) {
            this.debug('info', '✅ Flash已经解保护');
            return true;
        } else {
            this.debug('info', 'Flash需要解保护，计算写入值...');
            
            // 详细显示比较过程
            for (let i = 0; i < regVal.length && i < unprotectRegVal.length && i < mask.length; i++) {
                const srcMasked = regVal[i] & mask[i];
                const destMasked = unprotectRegVal[i] & mask[i];
                this.debug('debug', `寄存器${i}: 读取值=0x${regVal[i].toString(16).padStart(2, '0')}, 掩码=0x${mask[i].toString(16).padStart(2, '0')}, 读取值&掩码=0x${srcMasked.toString(16).padStart(2, '0')}, 目标值&掩码=0x${destMasked.toString(16).padStart(2, '0')}, 匹配=${srcMasked === destMasked ? '是' : '否'}`);
            }
            
            // 参考版本: write_val = unprotect_reg_val
            // for _ in range(len(write_val)):
            //     write_val[_] = write_val[_] | (reg_val[_] & (mask[_] ^ 0xff))
            const writeVal = [...unprotectRegVal];
            for (let i = 0; i < writeVal.length; i++) {
                const invertedMask = mask[i] ^ 0xff;
                const preserved = regVal[i] & invertedMask;
                writeVal[i] = writeVal[i] | preserved;
                this.debug('debug', `计算写入值${i}: 目标=0x${unprotectRegVal[i].toString(16).padStart(2, '0')}, 反掩码=0x${invertedMask.toString(16).padStart(2, '0')}, 保留位=0x${preserved.toString(16).padStart(2, '0')}, 最终写入=0x${writeVal[i].toString(16).padStart(2, '0')}`);
            }
            
            this.debug('info', `写入解保护值: [${writeVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
            
            // 参考版本: ret = self._write_flash_status_reg_val(write_val)
            const result = await this.writeFlashStatusRegVal(writeVal);
            if (result) {
                this.debug('info', '✅ Flash解保护成功');
                return true;
            } else {
                throw new Error('Flash解保护失败');
            }
        }
    }

    /**
     * Flash保护操作 - 完全按照参考版本实现
     */
    async protectFlash() {
        this.debug('info', 'Flash保护操作...');
        
        // 参考版本逻辑: protect_flash()
        // protect_reg_val = [124, 64]  # 0x7c, 0x40
        // mask = [124, 64]  # 0x7c, 0x40
        const protectRegVal = [124, 64]; // 0x7c, 0x40
        const mask = [124, 64]; // 0x7c, 0x40
        
        this.debug('debug', `保护目标值: [${protectRegVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        this.debug('debug', `保护掩码: [${mask.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // 参考版本: reg_val = self._read_flash_status_reg_val()
        const regVal = await this.readFlashStatusRegVal();
        this.debug('debug', `读取到状态寄存器值: [${regVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // 参考版本: if self.compare_register_value(reg_val, protect_reg_val, mask):
        if (this.compareRegisterValue(regVal, protectRegVal, mask)) {
            this.debug('info', '✅ Flash已经保护');
            return true;
        } else {
            this.debug('info', 'Flash需要保护，计算写入值...');
            
            // 详细显示比较过程
            for (let i = 0; i < regVal.length && i < protectRegVal.length && i < mask.length; i++) {
                const srcMasked = regVal[i] & mask[i];
                const destMasked = protectRegVal[i] & mask[i];
                this.debug('debug', `寄存器${i}: 读取值=0x${regVal[i].toString(16).padStart(2, '0')}, 掩码=0x${mask[i].toString(16).padStart(2, '0')}, 读取值&掩码=0x${srcMasked.toString(16).padStart(2, '0')}, 目标值&掩码=0x${destMasked.toString(16).padStart(2, '0')}, 匹配=${srcMasked === destMasked ? '是' : '否'}`);
            }
            
            // 参考版本: write_val = protect_reg_val
            // for _ in range(len(write_val)):
            //     write_val[_] = write_val[_] | (reg_val[_] & (mask[_] ^ 0xff))
            const writeVal = [...protectRegVal];
            for (let i = 0; i < writeVal.length; i++) {
                const invertedMask = mask[i] ^ 0xff;
                const preserved = regVal[i] & invertedMask;
                writeVal[i] = writeVal[i] | preserved;
                this.debug('debug', `计算写入值${i}: 目标=0x${protectRegVal[i].toString(16).padStart(2, '0')}, 反掩码=0x${invertedMask.toString(16).padStart(2, '0')}, 保留位=0x${preserved.toString(16).padStart(2, '0')}, 最终写入=0x${writeVal[i].toString(16).padStart(2, '0')}`);
            }
            
            this.debug('info', `写入保护值: [${writeVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
            
            // 参考版本: ret = self._write_flash_status_reg_val(write_val)
            const result = await this.writeFlashStatusRegVal(writeVal);
            if (result) {
                this.debug('info', '✅ Flash保护成功');
                return true;
            } else {
                throw new Error('Flash保护失败');
            }
        }
    }

    /**
     * 比较寄存器值 - 辅助方法
     */
    compareRegisterValue(srcVal, destVal, mask) {
        if (srcVal.length !== destVal.length || srcVal.length !== mask.length) {
            return false;
        }
        
        for (let i = 0; i < srcVal.length; i++) {
            const srcMasked = srcVal[i] & mask[i];
            const destMasked = destVal[i] & mask[i];
            if (srcMasked !== destMasked) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 读取Flash状态寄存器值 - 完全按照参考版本实现
     */
    async readFlashStatusRegVal(retry = 5) {
        // 参考版本: read_reg_code = [5, 53]
        const readRegCode = [5, 53];
        const srVal = [];
        
        this.debug('debug', `开始读取Flash状态寄存器，寄存器代码: [${readRegCode.join(', ')}]`);
        
        for (let regIndex = 0; regIndex < readRegCode.length; regIndex++) {
            const tmpReg = readRegCode[regIndex];
            let tmpVal = null;
            
            this.debug('debug', `读取寄存器${tmpReg}...`);
            
            for (let retryCount = 0; retryCount < retry; retryCount++) {
                try {
                    // 参考版本: frsp.cmd(tmp_reg) - FlashReadSRProtocol
                    // cmd格式: command_generate(0x0c, [reg_addr])
                    const payload = [tmpReg];
                    const payloadLength = 1 + payload.length;
                    const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, 0x0c, ...payload];
                    
                    this.debug('debug', `发送读取寄存器${tmpReg}命令: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    const response = await this.serialHandler.executeDirectProtocol(
                        `ReadFlashSR-${tmpReg}`,
                        command,
                        13,
                        100
                    );
                    
                    this.debug('debug', `读取寄存器${tmpReg}响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    if (response.length >= 13) {
                        // 参考版本: frsp.response_check(content, tmp_reg) and frsp.get_status_regist_val(content)
                        const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
                        const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
                        
                        if (headerMatch) {
                            this.debug('debug', `✅ 寄存器${tmpReg}响应头部正确`);
                            
                            // 检查状态码 (位置10)
                            if (response[10] === 0x00) {
                                this.debug('debug', `✅ 寄存器${tmpReg}状态码正确`);
                                
                                // 检查寄存器地址回显 (位置11)
                                if (response[11] === tmpReg) {
                                    // 参考版本: get_status_regist_val(response_content): return response_content[12]
                                    tmpVal = response[12];
                                    this.debug('debug', `✅ 读取寄存器${tmpReg}成功: 0x${tmpVal.toString(16).padStart(2, '0')}`);
                                    break;
                                } else {
                                    this.debug('warning', `寄存器${tmpReg}地址回显错误: 期望0x${tmpReg.toString(16).padStart(2, '0')}, 实际0x${response[11].toString(16).padStart(2, '0')}，重试...`);
                                }
                            } else {
                                this.debug('warning', `寄存器${tmpReg}状态码错误: 0x${response[10].toString(16).padStart(2, '0')}，重试...`);
                            }
                        } else {
                            this.debug('warning', `寄存器${tmpReg}响应头部错误: 期望[${expectedHeader.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}], 实际[${response.slice(0, 7).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]，重试...`);
                        }
                    } else {
                        this.debug('warning', `读取寄存器${tmpReg}响应长度不足: ${response.length} < 13，重试...`);
                    }
                } catch (error) {
                    this.debug('warning', `读取寄存器${tmpReg}失败: ${error.message}，重试...`);
                }
            }
            
            if (tmpVal === null) {
                throw new Error(`读取Flash状态寄存器${tmpReg}失败`);
            } else {
                srVal.push(tmpVal);
            }
        }
        
        this.debug('debug', `Flash状态寄存器读取完成: [${srVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        return srVal;
    }

    /**
     * 写入Flash状态寄存器值 - 完全按照参考版本实现
     */
    async writeFlashStatusRegVal(writeVal, retry = 5) {
        // 参考版本: write_reg_code = [1, 49]
        const writeRegCode = [1, 49];
        
        this.debug('debug', `开始写入Flash状态寄存器，寄存器代码: [${writeRegCode.join(', ')}], 写入值: [${writeVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        if (writeRegCode.length === 1) {
            // 单寄存器写入
            let tmpRes = false;
            const regAddr = writeRegCode[0];
            
            this.debug('debug', `单寄存器写入模式: 寄存器${regAddr}`);
            
            for (let retryCount = 0; retryCount < retry; retryCount++) {
                try {
                    // 参考版本: fwsp.cmd(write_reg_code[0], write_val) - FlashWriteSRProtocol
                    // cmd格式: command_generate(0x0d, [reg_addr] + val)
                    const payload = [regAddr, ...writeVal];
                    const payloadLength = 1 + payload.length;
                    const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, 0x0d, ...payload];
                    
                    this.debug('debug', `发送写入寄存器${regAddr}命令: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    const expectedLength = 7 + 2 + 1 + 1 + (1 + writeVal.length);
                    const response = await this.serialHandler.executeDirectProtocol(
                        `WriteFlashSR-${regAddr}`,
                        command,
                        expectedLength,
                        100
                    );
                    
                    this.debug('debug', `写入寄存器${regAddr}响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    if (response.length >= expectedLength) {
                        // 参考版本: fwsp.response_check(content)
                        const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
                        const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
                        
                        if (headerMatch && response[10] === 0x00) { // 检查状态码
                            this.debug('debug', `✅ 写入寄存器${regAddr}成功`);
                            tmpRes = true;
                            break;
                        } else {
                            this.debug('warning', `写入寄存器${regAddr}响应检查失败，重试...`);
                        }
                    } else {
                        this.debug('warning', `写入寄存器${regAddr}响应长度不足: ${response.length} < ${expectedLength}，重试...`);
                    }
                } catch (error) {
                    this.debug('warning', `写入寄存器${regAddr}失败: ${error.message}，重试...`);
                }
            }
            
            return tmpRes;
        } else {
            // 多寄存器写入（如果需要）
            throw new Error('多寄存器写入模式暂未实现');
        }
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.T5FlashOperations = T5FlashOperations;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5FlashOperations;
}