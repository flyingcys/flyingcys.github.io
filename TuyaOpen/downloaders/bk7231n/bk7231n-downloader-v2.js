/**
 * BK7231N下载器 v2.0 - 基于T5重构框架实现
 * 使用新的协议层、配置管理、核心功能模块架构
 * 完全按照Python版本实现，同时采用T5重构的最佳实践
 */

class BK7231NDownloaderV2 extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        this.chipName = 'BK7231N';
        this.baudrate = 115200;
        this.retry = 4;
        this.startAddr = 0x00;
        
        // 初始化协议工厂
        this.protocolFactory = new BKProtocolFactory();
        
        // 初始化Flash配置
        this.flashConfig = new BKFlashConfig();
        this.flashConfig.setDebugMode(true);
        
        // 当前Flash信息
        this.currentFlashInfo = null;
        this.flashMid = null;
        
        // SLIP协议相关
        this.slipReader = null;
        
        // 错误统计
        this.errorStats = {
            communicationErrors: 0,
            protocolErrors: 0,
            flashErrors: 0,
            retryCount: 0
        };
        
        // 进度管理
        this.progressManager = {
            currentStage: '',
            stageProgress: 0,
            totalStages: 5,
            currentStageIndex: 0
        };
        
        // CRC32表
        this.crc32Table = this.makeCrc32Table();
        
        this.debug('info', `BK7231N下载器 v2.0 初始化完成`);
    }

    /**
     * 创建CRC32表
     */
    makeCrc32Table() {
        const table = new Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }
        return table;
    }

    /**
     * 计算CRC32 - 与Python版本完全一致
     */
    crc32(crc, data) {
        crc = crc ^ 0xffffffff;
        for (let i = 0; i < data.length; i++) {
            crc = (crc >>> 8) ^ this.crc32Table[(crc ^ data[i]) & 0xff];
        }
        return (crc ^ 0xffffffff) >>> 0;
    }

    /**
     * SLIP协议读取器 - 完全按照Python实现
     */
    async slipReader(rxlen, timeout) {
        let waitingHead = true;
        const startTime = Date.now();
        let readBuf = new Uint8Array(0);
        
        this.debug('debug', `SLIP读取器: 期望长度=${rxlen}, 超时=${timeout}ms`);
        
        while (Date.now() - startTime < timeout) {
            if (this.stopFlag) {
                this.debug('debug', 'SLIP读取器: 停止标志已设置');
                return new Uint8Array(0);
            }
            
            const data = await this.readData(1024, 10);
            if (data.length > 0) {
                const newBuf = new Uint8Array(readBuf.length + data.length);
                newBuf.set(readBuf);
                newBuf.set(data, readBuf.length);
                readBuf = newBuf;
                this.debug('debug', `SLIP读取器: 接收数据 ${data.length} 字节，总计 ${readBuf.length} 字节`);
            }
            
            if (waitingHead) {
                // 查找SLIP头部 0x04
                let head = -1;
                for (let i = 0; i < readBuf.length - 6; i++) {
                    if (readBuf[i] === 0x04) {
                        head = i;
                        break;
                    }
                }
                
                if (head >= 0) {
                    readBuf = readBuf.slice(head);
                    if (readBuf.length >= 7 &&
                        readBuf[0] === 0x04 && readBuf[1] === 0x0e &&
                        readBuf[3] === 0x01 && readBuf[4] === 0xe0 && readBuf[5] === 0xfc) {
                        waitingHead = false;
                        this.debug('debug', 'SLIP读取器: 找到有效头部，等待数据体');
                        continue;
                    }
                    readBuf = readBuf.slice(1);
                }
            }
            
            if (!waitingHead && readBuf.length >= rxlen) {
                this.debug('debug', `SLIP读取器: 接收完成，返回 ${rxlen} 字节`);
                return readBuf.slice(0, rxlen);
            }
        }
        
        this.debug('debug', `SLIP读取器: 超时，返回 ${readBuf.length} 字节`);
        return readBuf.length >= rxlen ? readBuf.slice(0, rxlen) : new Uint8Array(0);
    }

    /**
     * 发送数据 - 支持Mac平台分包发送
     */
    async sendData(data) {
        this.debug('debug', `发送数据: ${data.length} 字节`);
        
        let writer = null;
        try {
            writer = this.port.writable.getWriter();
            
            // Mac平台分包发送
            const size = 256;
            const total = data.length;
            const count = Math.floor(total / size);
            const rem = total % size;
            
            for (let i = 0; i < count; i++) {
                await writer.write(data.slice(i * size, (i + 1) * size));
                await this.sleep(10);
            }
            
            if (rem > 0) {
                await writer.write(data.slice(-rem));
                await this.sleep(10);
            }
            
        } finally {
            if (writer) {
                try { writer.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 带发送的接收 - SLIP协议专用
     */
    async rxWithTx(txbuf, rxlen, processTimeout = 500, serTimeout = 50) {
        this.debug('debug', `RxWithTx: 发送 ${txbuf.length} 字节，期望接收 ${rxlen} 字节`);
        await this.sendData(txbuf);
        return await this.slipReader(rxlen, processTimeout);
    }

    /**
     * 执行协议命令 - 统一的协议执行接口
     */
    async executeProtocol(protocol, cmdArgs = [], rxlen = 0, timeout = 500, maxRetries = 3) {
        this.debug('debug', `执行协议: ${protocol.getName()}`);
        
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                // 生成命令
                const command = protocol.cmd(...cmdArgs);
                const commandData = new Uint8Array(command);
                
                // 发送命令并接收响应
                const response = await this.rxWithTx(commandData, rxlen, timeout);
                
                // 检查响应
                if (protocol.responseCheck(response, ...cmdArgs)) {
                    this.debug('debug', `协议执行成功: ${protocol.getName()}`);
                    return response;
                } else {
                    this.debug('debug', `协议响应检查失败: ${protocol.getName()}, 重试 ${retry + 1}/${maxRetries}`);
                    this.errorStats.protocolErrors++;
                }
                
            } catch (error) {
                this.debug('error', `协议执行异常: ${protocol.getName()}, ${error.message}, 重试 ${retry + 1}/${maxRetries}`);
                this.errorStats.communicationErrors++;
            }
            
            if (retry < maxRetries - 1) {
                await this.sleep(100 * (retry + 1)); // 递增延迟
                this.errorStats.retryCount++;
            }
        }
        
        throw new Error(`协议执行失败: ${protocol.getName()}`);
    }

    /**
     * 更新进度
     */
    updateProgress(stage, current, total, message) {
        this.progressManager.currentStage = stage;
        this.progressManager.stageProgress = total > 0 ? Math.round((current / total) * 100) : 0;
        
        const overallProgress = Math.round(
            (this.progressManager.currentStageIndex / this.progressManager.totalStages + 
             this.progressManager.stageProgress / 100 / this.progressManager.totalStages) * 100
        );
        
        if (this.onProgress) {
            this.onProgress(overallProgress, 100, `${stage}: ${message || ''}`);
        }
        
        this.debug('info', `进度 [${stage}]: ${this.progressManager.stageProgress}% - ${message || ''}`);
    }

    /**
     * 准备二进制文件
     */
    prepareBinFile(fileData) {
        let binData = new Uint8Array(fileData);
        const fileLen = binData.length;
        this.debug('debug', `原始文件大小: ${fileLen} 字节`);
        
        // 按256字节对齐
        const paddingLen = 0x100 - (fileLen & 0xff);
        if (paddingLen > 0 && paddingLen < 0x100) {
            const paddedData = new Uint8Array(fileLen + paddingLen);
            paddedData.set(binData);
            paddedData.fill(0xff, fileLen);
            binData = paddedData;
            this.debug('debug', `对齐后文件大小: ${binData.length} 字节`);
        }
        
        this.binfil = {
            bin: binData,
            len: binData.length
        };
    }

    /**
     * 发送重启命令
     */
    async rebootCmdTx() {
        this.debug('debug', '发送重启命令');
        
        const rebootProtocol = this.protocolFactory.createProtocol('BKRegDoReboot');
        const command = rebootProtocol.cmd();
        const commandData = new Uint8Array(command);
        
        for (let i = 0; i < 3; i++) {
            await this.sendData(commandData);
            await this.sleep(150);
        }
        
        // 设置DTR和RTS信号
        await this.port.setSignals({ dataTerminalReady: false, requestToSend: true });
        await this.sleep(200);
        await this.port.setSignals({ requestToSend: false });
        await this.sendData(commandData);
    }

    /**
     * 握手流程 - 完全按照Python实现
     */
    async shake() {
        this.debug('info', '开始握手流程');
        this.updateProgress('握手', 0, 100, '发送重启命令');
        
        // 尝试自动重启
        await this.rebootCmdTx();
        this.updateProgress('握手', 20, 100, '等待设备响应');
        
        // 链路检查
        let countSec = 0;
        let count = 0;
        const linkCheckProtocol = this.protocolFactory.createProtocol('LinkCheck');
        
        this.debug('info', '等待设备复位...');
        
        while (true) {
            if (this.stopFlag) return false;
            
            try {
                const response = await this.executeProtocol(linkCheckProtocol, [], 7, 1, 1);
                if (response.length > 0) {
                    this.debug('info', '链路检查成功');
                    break;
                }
            } catch (error) {
                // 继续尝试
            }
            
            if (countSec > 100) {
                this.debug('debug', '链路检查重试...');
                await this.rebootCmdTx();
                countSec = 0;
                count++;
                
                if (count > 15) {
                    this.debug('error', '握手超时!');
                    return false;
                }
                
                // 尝试不同波特率
                if (this.port.baudRate === 115200) {
                    await this.port.close();
                    await this.sleep(100);
                    await this.port.open({ baudRate: 921600 });
                } else {
                    await this.port.close();
                    await this.sleep(100);
                    await this.port.open({ baudRate: 115200 });
                }
                
                // 发送重启命令
                await this.sendData(new TextEncoder().encode("reboot\r\n"));
                
                // 重置到bootrom波特率
                if (this.port.baudRate !== 115200) {
                    await this.port.close();
                    await this.sleep(100);
                    await this.port.open({ baudRate: 115200 });
                }
            }
            countSec++;
            
            this.updateProgress('握手', 20 + Math.min(countSec * 0.6, 60), 100, `重试第${count}次`);
        }
        
        this.updateProgress('握手', 80, 100, '同步波特率');
        await this.sleep(10);
        await this.clearBuffer();
        
        if (this.stopFlag) return false;
        
        // 同步波特率
        if (this.baudrate !== 115200) {
            const setBaudrateProtocol = this.protocolFactory.createProtocol('SetBaudrate');
            const dlyMs = 100;
            
            try {
                const command = setBaudrateProtocol.cmd(this.baudrate, dlyMs);
                const commandData = new Uint8Array(command);
                
                await this.sendData(commandData);
                await this.sleep(10);
                
                await this.port.close();
                await this.sleep(100);
                await this.port.open({ baudRate: this.baudrate });
                
                const response = await this.slipReader(7, 500);
                if (response.length > 0) {
                    this.debug('info', `设置波特率 ${this.baudrate} 成功`);
                } else {
                    this.debug('error', `设置波特率 ${this.baudrate} 失败`);
                    return false;
                }
            } catch (error) {
                this.debug('error', `波特率设置异常: ${error.message}`);
                return false;
            }
        }
        
        this.updateProgress('握手', 100, 100, '握手完成');
        this.debug('info', `同步波特率 ${this.baudrate} 成功`);
        return true;
    }

    /**
     * Flash保护/去保护
     */
    async doBootProtectFlash(mid, unprotect) {
        this.debug('debug', `Flash保护操作: MID=0x${mid.toString(16)}, 去保护=${unprotect}`);
        
        const flashInfo = this.flashConfig.getFlashInfo(mid);
        if (!flashInfo) {
            this.debug('error', `未知Flash芯片: 0x${mid.toString(16)}`);
            return false;
        }
        
        this.debug('debug', `Flash信息: ${flashInfo.icNam} (${flashInfo.manName})`);
        
        const timeout = 50;
        const cw = unprotect ? flashInfo.cwUnp : flashInfo.cwEnp;
        let loopCnt = 0;
        
        const readSRProtocol = this.protocolFactory.createProtocol('FlashReadSR');
        const writeSRProtocol = this.protocolFactory.createProtocol('FlashWriteSR');
        
        while (true) {
            if (this.stopFlag) return false;
            
            let sr = 0;
            loopCnt++;
            
            // 读取SR寄存器
            for (let i = 0; i < flashInfo.szSR; i++) {
                try {
                    const response = await this.executeProtocol(
                        readSRProtocol, 
                        [flashInfo.cwdRd[i]], 
                        13, 
                        500
                    );
                    const value = readSRProtocol.getStatusValue(response);
                    if (value !== null) {
                        sr |= value << (8 * i);
                    }
                } catch (error) {
                    this.debug('debug', `读取SR寄存器失败: ${error.message}`);
                }
            }
            
            // 检查是否已设置
            const expectedValue = this.calcBFD(cw, flashInfo.sb, flashInfo.lb);
            if ((sr & flashInfo.cwMsk) === expectedValue) {
                this.debug('debug', `Flash保护状态已正确: 0x${sr.toString(16)}`);
                return true;
            }
            
            if (loopCnt > timeout) {
                this.debug('error', `Flash保护操作超时`);
                return false;
            }
            
            // 设置保护字
            let srt = sr & (flashInfo.cwMsk ^ 0xffffffff);
            srt |= expectedValue;
            
            try {
                await this.executeProtocol(
                    writeSRProtocol,
                    [flashInfo.cwdWr[0], srt & 0xffff],
                    13,
                    500
                );
            } catch (error) {
                this.debug('debug', `写入SR寄存器失败: ${error.message}`);
            }
            
            await this.sleep(10);
        }
    }

    /**
     * 计算位域值
     */
    calcBFD(v, bs, bl) {
        return (v & ((1 << bl) - 1)) << bs;
    }

    /**
     * 读取扇区
     */
    async readSector(addr) {
        this.debug('debug', `读取扇区: 0x${addr.toString(16)}`);
        
        const readProtocol = this.protocolFactory.createProtocol('FlashRead4K');
        
        try {
            const response = await this.executeProtocol(readProtocol, [addr], 7 + 4096, 5000);
            const data = readProtocol.getData(response);
            
            if (data && data.length === 4096) {
                this.debug('debug', `读取扇区成功: 0x${addr.toString(16)}`);
                return data;
            } else {
                this.debug('error', `读取扇区数据不足: ${data ? data.length : 0} 字节`);
                return new Uint8Array(0);
            }
        } catch (error) {
            this.debug('error', `读取扇区失败: 0x${addr.toString(16)}, ${error.message}`);
            return new Uint8Array(0);
        }
    }

    /**
     * 擦除块
     */
    async eraseBlock(addr, val) {
        this.debug('debug', `擦除块: 0x${addr.toString(16)}, 类型=0x${val.toString(16)}`);
        
        const eraseProtocol = this.protocolFactory.createProtocol('FlashErase');
        
        try {
            await this.executeProtocol(eraseProtocol, [addr, val], 16, 1000);
            this.debug('debug', `擦除块成功: 0x${addr.toString(16)}`);
            return true;
        } catch (error) {
            this.debug('error', `擦除块失败: 0x${addr.toString(16)}, ${error.message}`);
            return false;
        }
    }

    /**
     * 写入扇区
     */
    async writeSector(addr, buf) {
        this.debug('debug', `写入扇区: 0x${addr.toString(16)}, ${buf.length} 字节`);
        
        const writeProtocol = this.protocolFactory.createProtocol('FlashWrite4K');
        
        try {
            await this.executeProtocol(writeProtocol, [addr, buf], 15, 5000);
            this.debug('debug', `写入扇区成功: 0x${addr.toString(16)}`);
            return true;
        } catch (error) {
            this.debug('error', `写入扇区失败: 0x${addr.toString(16)}, ${error.message}`);
            return false;
        }
    }

    /**
     * 写入扇区（带重试）
     */
    async writeSectorLoops(addr, buf, loop) {
        for (let i = 0; i < loop; i++) {
            if (await this.writeSector(addr, buf)) {
                return true;
            }
            await this.sleep(50);
        }
        return false;
    }

    /**
     * 读取CRC
     */
    async readCRC(start, end, timeout = 5000) {
        this.debug('debug', `读取CRC: 0x${start.toString(16)}-0x${end.toString(16)}`);
        
        const crcProtocol = this.protocolFactory.createProtocol('CheckCRC');
        
        try {
            const response = await this.executeProtocol(crcProtocol, [start, end], 11, timeout);
            const crc = crcProtocol.getCRC(response);
            
            if (crc !== null) {
                this.debug('debug', `读取CRC成功: 0x${crc.toString(16)}`);
                return [true, crc];
            } else {
                this.debug('error', 'CRC解析失败');
                return [false, 0];
            }
        } catch (error) {
            this.debug('error', `读取CRC失败: ${error.message}`);
            return [false, 0];
        }
    }

    /**
     * 获取Flash MID
     */
    async getFlashMID() {
        this.debug('debug', '获取Flash MID');
        
        const midProtocol = this.protocolFactory.createProtocol('FlashGetMID');
        
        try {
            const response = await this.executeProtocol(midProtocol, [0x9f], 15, 1000);
            const mid = midProtocol.getMID(response);
            
            if (mid) {
                this.debug('debug', `获取Flash MID成功: 0x${mid.toString(16)}`);
                return mid;
            } else {
                this.debug('error', 'Flash MID解析失败');
                return 0;
            }
        } catch (error) {
            this.debug('error', `获取Flash MID失败: ${error.message}`);
            return 0;
        }
    }

    /**
     * 擦除流程 - 基于Python版本的智能擦除策略
     */
    async erase(fileData) {
        if (this.stopFlag) return false;
        
        this.progressManager.currentStageIndex = 1;
        this.updateProgress('擦除', 0, 100, '准备擦除Flash');
        
        this.prepareBinFile(fileData);
        const binfileLen = this.binfil.len;
        const binfileData = this.binfil.bin;
        let binfileSubLen = binfileLen;
        
        // 获取Flash MID
        for (let i = 0; i < this.retry; i++) {
            const flashMid = await this.getFlashMID();
            if (flashMid) {
                this.flashMid = flashMid;
                this.currentFlashInfo = this.flashConfig.getFlashInfo(flashMid);
                this.debug('info', `检测到Flash: ${this.currentFlashInfo ? this.currentFlashInfo.icNam : 'Unknown'}`);
                break;
            }
        }
        
        if (!this.flashMid) {
            throw new Error('获取Flash MID失败');
        }
        
        this.updateProgress('擦除', 20, 100, '去保护Flash');
        
        // 去保护Flash
        for (let i = 0; i < this.retry; i++) {
            if (await this.doBootProtectFlash(this.flashMid, true)) {
                this.debug('info', '去保护Flash成功');
                break;
            }
            await this.sleep(1);
        }
        
        this.updateProgress('擦除', 40, 100, '擦除首个4K块');
        
        // 擦除首个4K块（地址对齐处理）
        if (this.stopFlag) return false;
        
        const eraseAddr = this.startAddr;
        let alignedAddr = eraseAddr & 0xfffff000;
        const alignedOutLen = eraseAddr - alignedAddr;
        
        if (alignedOutLen) {
            this.debug('debug', `擦除首个4K块 [0x${alignedAddr.toString(16)}:0x${alignedOutLen.toString(16)}]`);
            const buf4K = await this.readSector(alignedAddr);
            
            if (buf4K.length < 4096) {
                throw new Error(`读取扇区数据不足4K: [${buf4K.length}]`);
            }
            
            const coverLen = 0x1000 - alignedOutLen;
            const coverLenMin = Math.min(coverLen, binfileLen);
            
            // 覆盖数据
            for (let i = 0; i < coverLenMin; i++) {
                buf4K[alignedOutLen + i] = binfileData[i];
            }
            
            if (!await this.eraseBlock(alignedAddr, 0x20)) {
                throw new Error('擦除首个4K块失败');
            }
            
            if (!await this.writeSector(alignedAddr, buf4K)) {
                throw new Error('写入首个4K块失败');
            }
            
            binfileSubLen -= coverLenMin;
            if (binfileSubLen <= 0) {
                this.updateProgress('擦除', 100, 100, '擦除完成');
                return true;
            }
            
            this.binfil.bin = binfileData.slice(coverLenMin);
            alignedAddr += 0x1000;
        }
        
        this.updateProgress('擦除', 60, 100, '擦除中间区域');
        
        // 擦除其他区域 - 智能选择64K/4K擦除
        const eraseEndAddr = eraseAddr + binfileLen;
        let currentAddr = alignedAddr;
        let progress = 60;
        
        while (currentAddr < eraseEndAddr) {
            if (this.stopFlag) return false;
            
            const subLen = eraseEndAddr - currentAddr;
            if (subLen > 0x10000 && (currentAddr & 0xffff) === 0) {
                // 64K对齐且剩余超过64K，使用64K擦除
                this.debug('debug', `擦除64K块 [0x${currentAddr.toString(16)}]`);
                await this.eraseBlock(currentAddr, 0xd8);
                currentAddr += 0x10000;
            } else {
                // 使用4K擦除
                this.debug('debug', `擦除4K块 [0x${currentAddr.toString(16)}]`);
                await this.eraseBlock(currentAddr, 0x20);
                currentAddr += 0x1000;
            }
            
            progress = Math.min(60 + (currentAddr - alignedAddr) / (eraseEndAddr - alignedAddr) * 35, 95);
            this.updateProgress('擦除', progress, 100, `擦除地址: 0x${currentAddr.toString(16)}`);
        }
        
        this.binfil.startAddr = alignedAddr;
        this.updateProgress('擦除', 100, 100, '擦除完成');
        this.debug('info', '擦除Flash成功');
        return true;
    }

    /**
     * 写入流程
     */
    async write() {
        if (this.stopFlag) return false;
        
        this.progressManager.currentStageIndex = 2;
        this.updateProgress('写入', 0, 100, '开始写入Flash');
        
        const binData = this.binfil.bin;
        const writeStartAddr = this.binfil.startAddr || this.startAddr;
        const binfileSubLen = binData.length;
        const totalWrite = Math.ceil(binfileSubLen / 0x1000);
        const writeEndAddr = writeStartAddr + binfileSubLen;
        
        this.debug('debug', `写入参数: 起始=0x${writeStartAddr.toString(16)}, 结束=0x${writeEndAddr.toString(16)}, 总扇区=${totalWrite}`);
        
        let writeNowAddr = writeStartAddr;
        let binDataPtr = 0;
        let currentStep = 0;
        
        while (writeNowAddr < writeEndAddr) {
            if (this.stopFlag) return false;
            
            this.debug('debug', `写入Flash [0x${writeNowAddr.toString(16)}]`);
            const sectorData = binData.slice(binDataPtr, binDataPtr + 0x1000);
            
            if (!await this.writeSectorLoops(writeNowAddr, sectorData, this.retry)) {
                throw new Error(`写入Flash失败: 地址 0x${writeNowAddr.toString(16)}`);
            }
            
            currentStep++;
            this.updateProgress('写入', (currentStep / totalWrite) * 100, 100, 
                `写入进度 ${currentStep}/${totalWrite}`);
            
            writeNowAddr += 0x1000;
            binDataPtr += 0x1000;
        }
        
        // 保护Flash
        await this.doBootProtectFlash(this.flashMid, false);
        
        this.debug('info', '写入Flash成功');
        return true;
    }

    /**
     * CRC检查
     */
    async crcCheck() {
        if (this.stopFlag) return false;
        
        this.progressManager.currentStageIndex = 3;
        this.updateProgress('校验', 0, 100, '开始CRC检查');
        
        const binData = this.binfil.bin;
        const binLen = this.binfil.len;
        const startAddr = this.startAddr;
        
        // 计算本地CRC
        const binCrc = this.crc32(0xffffffff, binData);
        this.debug('debug', `本地CRC: 0x${binCrc.toString(16)}`);
        this.updateProgress('校验', 30, 100, '计算Flash CRC');
        
        // 计算对齐长度
        let alignedLen = binLen;
        if (binLen & 0xff) {
            alignedLen = (binLen & ~0xff) + 0x100;
        }
        
        const timeout = Math.max(15000, binLen * 15 / 1024 / 1024 * 1000);
        
        this.updateProgress('校验', 60, 100, '读取Flash CRC');
        
        const [success, rxCrc] = await this.readCRC(startAddr, startAddr + alignedLen - 1, timeout);
        this.debug('debug', `Flash CRC: 0x${rxCrc.toString(16)}`);
        
        if (!success) {
            throw new Error('读取CRC失败');
        }
        
        if (rxCrc !== binCrc) {
            throw new Error(`CRC检查失败: 本地=0x${binCrc.toString(16)}, Flash=0x${rxCrc.toString(16)}`);
        }
        
        this.updateProgress('校验', 100, 100, 'CRC检查完成');
        this.debug('info', 'CRC检查成功');
        return true;
    }

    /**
     * 重启
     */
    async reboot() {
        this.progressManager.currentStageIndex = 4;
        this.updateProgress('重启', 0, 100, '发送重启命令');
        
        const rebootProtocol = this.protocolFactory.createProtocol('Reboot');
        const command = rebootProtocol.cmd();
        const commandData = new Uint8Array(command);
        
        for (let i = 0; i < 3; i++) {
            await this.sendData(commandData);
            await this.sleep(100);
        }
        
        this.updateProgress('重启', 100, 100, '重启完成');
        this.debug('info', '重启完成');
        return true;
    }

    /**
     * 主下载流程
     */
    async downloadFirmware(fileData) {
        this.debug('info', `开始下载固件到 ${this.chipName}，文件大小: ${fileData.length} 字节`);
        
        this.progressManager.currentStageIndex = 0;
        this.progressManager.totalStages = 5;
        
        try {
            // 1. 握手
            this.progressManager.currentStageIndex = 0;
            this.updateProgress('握手', 0, 100, '开始握手流程');
            if (!await this.shake()) {
                throw new Error('握手失败');
            }
            
            // 2. 擦除
            if (!await this.erase(fileData)) {
                throw new Error('擦除失败');
            }
            
            // 3. 写入
            if (!await this.write()) {
                throw new Error('写入失败');
            }
            
            // 4. CRC检查
            if (!await this.crcCheck()) {
                throw new Error('CRC检查失败');
            }
            
            // 5. 重启
            if (!await this.reboot()) {
                throw new Error('重启失败');
            }
            
            this.debug('info', '固件下载完成!');
            this.debug('info', `错误统计: 通信=${this.errorStats.communicationErrors}, 协议=${this.errorStats.protocolErrors}, Flash=${this.errorStats.flashErrors}, 重试=${this.errorStats.retryCount}`);
            
            return { success: true };
            
        } catch (error) {
            this.debug('error', `下载失败: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * 连接设备
     */
    async connect() {
        this.debug('info', `正在连接 ${this.chipName}...`);
        this.stopFlag = false;
        
        // 重置错误统计
        this.errorStats = {
            communicationErrors: 0,
            protocolErrors: 0,
            flashErrors: 0,
            retryCount: 0
        };
        
        return { success: true };
    }

    /**
     * 断开连接
     */
    async disconnect() {
        this.debug('info', `断开 ${this.chipName} 连接`);
        this.stopFlag = true;
    }

    /**
     * 设置进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * 停止操作
     */
    stop() {
        this.stopFlag = true;
    }

    /**
     * 获取设备状态
     */
    getDeviceStatus() {
        return {
            chipName: this.chipName,
            connected: !this.stopFlag,
            flashInfo: this.currentFlashInfo,
            errorStats: this.errorStats,
            baudrate: this.baudrate
        };
    }

    /**
     * 是否已连接
     */
    isConnected() {
        return !this.stopFlag;
    }

    /**
     * 辅助函数
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
            // 忽略错误
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    async readData(length, timeout = 1000) {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const buffer = [];
            const startTime = Date.now();
            
            while (buffer.length < length && Date.now() - startTime < timeout) {
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 10))
                ]);
                if (done) break;
                if (value) {
                    buffer.push(...value);
                }
            }
            
            return new Uint8Array(buffer.slice(0, length));
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }
}

// 确保类在全局范围内可用
if (typeof window !== 'undefined') {
    window.BK7231NDownloaderV2 = BK7231NDownloaderV2;
}