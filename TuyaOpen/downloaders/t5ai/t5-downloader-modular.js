/**
 * T5AI模块化下载器 - 主控制器
 * 协调所有模块，实现与 t5ai-downloader.js 完全一致的功能
 */

// 导入所有必要的模块
class T5DownloaderModular extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        this.chipName = 'T5AI';
        
        // 初始化模块
        this.serialManager = new T5SerialManager(serialPort, debugCallback);
        this.flashConfig = new T5FlashConfig();
        this.flashDatabase = new T5FlashDatabase();
        this.crcUtils = new T5CrcUtils();
        this.debugUtils = new T5DebugUtils();
        
        // 初始化协议
        this.protocols = {
            linkCheck: new LinkCheckProtocol(),
            getChipId: new GetChipIdProtocol(),
            getFlashMid: new GetFlashMidProtocol(),
            setBaudrate: new SetBaudrateProtocol(),
            flashReadSR: new FlashReadSRProtocol(),
            flashWriteSR: new FlashWriteSRProtocol(),
            flashErase4k: new FlashErase4kProtocol(),
            flashErase4kExt: new FlashErase4kExtProtocol(),
            flashErase64k: new FlashErase64kProtocol(),
            flashErase64kExt: new FlashErase64kExtProtocol(),
            flashRead4k: new FlashRead4kProtocol(),
            flashRead4kExt: new FlashRead4kExtProtocol(),
            flashWrite256: new FlashWrite256Protocol(),
            flashWrite256Ext: new FlashWrite256ExtProtocol()
        };
        
        // 设备信息
        this.chipId = null;
        this.flashId = null;
        this.currentFlashConfig = null;
        this.stopFlag = false;
    }

    /**
     * 设置进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.serialManager.setDebugMode(enabled);
        this.debugUtils.setDebugMode(enabled);
    }

    /**
     * 停止操作
     */
    stop() {
        this.stopFlag = true;
        this.serialManager.stop();
    }

    /**
     * 日志输出方法 - 委托给 debugUtils
     */
    mainLog(message) {
        this.debugUtils.mainLog(message);
    }

    infoLog(message) {
        this.debugUtils.infoLog(message);
    }

    debugLog(message, data = null) {
        this.debugUtils.debugLog(message, data);
    }

    warningLog(message) {
        this.debugUtils.warningLog(message);
    }

    errorLog(message) {
        this.debugUtils.errorLog(message);
    }

    commLog(message) {
        this.debugUtils.commLog(message);
    }

    /**
     * 检查是否为串口断开错误
     */
    isPortDisconnectionError(error) {
        return this.debugUtils.isPortDisconnectionError(error);
    }

    /**
     * 步骤1：获取总线控制权 - 完全按照Python的get_bus逻辑
     */
    async getBusControl() {
        this.mainLog('=== 步骤1: 获取总线控制权 ===');
        
        const maxTryCount = 100; // 与Python保持一致
        for (let attempt = 1; attempt <= maxTryCount && !this.stopFlag; attempt++) {
            if (attempt % 10 === 1) {  // 每10次尝试输出一次日志
                this.commLog(`尝试 ${attempt}/${maxTryCount}`);
            }
            
            // 复位设备 - 与Python do_reset一致
            await this.serialManager.setSignals({ dataTerminalReady: false, requestToSend: true });
            await new Promise(resolve => setTimeout(resolve, 300)); // Python: time.sleep(0.3)
            await this.serialManager.setSignals({ requestToSend: false });
            await new Promise(resolve => setTimeout(resolve, 4)); // Python: time.sleep(0.004)
            
            // do_link_check_ex - 与Python一致，最多60次
            const linkCheckSuccess = await this.doLinkCheckEx(60);
            if (linkCheckSuccess) {
                this.mainLog(`✅ 第${attempt}次尝试成功获取总线控制权`);
                return true;
            }
        }
        
        return false;
    }

    /**
     * do_link_check_ex - 完全按照Python版本实现
     */
    async doLinkCheckEx(maxTryCount = 60) {
        for (let cnt = 0; cnt < maxTryCount && !this.stopFlag; cnt++) {
            await this.serialManager.clearBuffer();
            
            const command = this.protocols.linkCheck.cmd();
            await this.serialManager.sendCommand(command, 'LinkCheck');
            
            // Python使用0.001秒超时，即1毫秒
            const response = await this.serialManager.receiveResponse(8, 1);
            
            if (this.protocols.linkCheck.checkResponse(response)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 步骤2：获取芯片ID
     */
    async getChipId() {
        this.mainLog('=== 步骤2: 获取芯片ID ===');
        this.commLog('正在获取芯片ID...');
        
        await this.serialManager.clearBuffer();
        
        const command = this.protocols.getChipId.cmd();
        await this.serialManager.sendCommand(command, 'GetChipId');
        
        const expectedLength = this.protocols.getChipId.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength, 500);
        
        if (this.protocols.getChipId.checkResponse(response)) {
            const chipId = this.protocols.getChipId.extractChipId(response);
            this.mainLog(`✅ 芯片ID: 0x${chipId.toString(16).toUpperCase().padStart(8, '0')}`);
            this.chipId = chipId;
            return chipId;
        }
        
        throw new Error('获取芯片ID失败');
    }

    /**
     * 步骤3：获取Flash ID
     */
    async getFlashId() {
        this.mainLog('=== 步骤3: 获取Flash ID ===');
        this.commLog('正在获取Flash ID...');
        
        await this.serialManager.clearBuffer();
        
        const command = this.protocols.getFlashMid.cmd();
        await this.serialManager.sendCommand(command, 'FlashGetMID');
        
        const expectedLength = this.protocols.getFlashMid.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength);
        
        if (this.protocols.getFlashMid.checkResponse(response)) {
            const flashId = this.protocols.getFlashMid.extractFlashId(response);
            const config = this.flashDatabase.getFlashConfig(flashId);
            
            this.flashId = flashId;
            this.currentFlashConfig = config;
            this.flashConfig.setCurrentFlash(flashId, config);
            
            if (config) {
                this.infoLog(`✅ 识别Flash: ${config.manufacturer} ${config.name} (${config.size / 1048576}MB)`);
                return { flashId, config };
            } else {
                this.warningLog(`⚠️ 未知Flash ID: 0x${flashId.toString(16).toUpperCase().padStart(6, '0')}`);
                return { flashId, config: null };
            }
        }
        
        throw new Error('获取Flash ID失败');
    }

    /**
     * 连接设备
     */
    async connect() {
        this.mainLog('开始连接T5AI设备...');
        
        try {
            // 步骤1: 获取总线控制权
            const busControlSuccess = await this.getBusControl();
            if (!busControlSuccess) {
                throw new Error('无法获取总线控制权，请检查设备连接');
            }
            
            // 步骤2: 获取芯片ID
            await this.getChipId();
            
            // 步骤3: 获取Flash ID
            await this.getFlashId();
            
            this.mainLog('✅ 设备连接成功');
            return true;
        } catch (error) {
            this.errorLog(`连接失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 下载固件 - 完全按照原始逻辑实现
     */
    async downloadFirmware(firmwareData, startAddress = 0x08000000) {
        if (!this.currentFlashConfig) {
            throw new Error('请先连接设备');
        }
        
        this.mainLog('=== 开始下载固件 ===');
        this.infoLog(`固件大小: ${this.debugUtils.formatFileSize(firmwareData.length)}`);
        this.infoLog(`起始地址: 0x${startAddress.toString(16).toUpperCase().padStart(8, '0')}`);
        
        try {
            // 设置高速波特率
            await this.setBaudrate(921600);
            
            // Flash擦除
            await this.eraseFlashForFirmware(firmwareData.length, startAddress);
            
            // 写入固件
            await this.writeFirmwareData(firmwareData, startAddress);
            
            // Flash保护
            await this.protectFlash();
            
            // 重启设备
            await this.reboot();
            
            this.mainLog('✅ 固件下载完成');
            return true;
        } catch (error) {
            this.errorLog(`固件下载失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 设置波特率
     */
    async setBaudrate(baudrate) {
        this.commLog(`设置波特率: ${baudrate}`);
        
        await this.serialManager.clearBuffer();
        
        const command = this.protocols.setBaudrate.cmd(baudrate);
        await this.serialManager.sendCommand(command, 'SetBaudrate');
        
        const expectedLength = this.protocols.setBaudrate.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength);
        
        if (this.protocols.setBaudrate.checkResponse(response)) {
            this.debugLog(`波特率设置成功: ${baudrate}`);
            return true;
        }
        
        throw new Error('设置波特率失败');
    }

    /**
     * Flash擦除（为固件下载准备）
     */
    async eraseFlashForFirmware(firmwareSize, startAddress) {
        this.mainLog('=== Flash擦除 ===');
        
        const flashSize = this.currentFlashConfig.size;
        const endAddress = startAddress + firmwareSize;
        
        this.infoLog(`擦除范围: 0x${startAddress.toString(16).toUpperCase().padStart(8, '0')} - 0x${endAddress.toString(16).toUpperCase().padStart(8, '0')}`);
        
        // 解保护Flash
        await this.unprotectFlash();
        
        // 根据Flash大小选择擦除策略
        if (flashSize >= 16 * 1024 * 1024) { // 16MB及以上使用64K块擦除
            await this.eraseFlash64k(startAddress, firmwareSize);
        } else {
            await this.eraseFlash4k(startAddress, firmwareSize);
        }
        
        this.mainLog('✅ Flash擦除完成');
    }

    /**
     * 64K块擦除
     */
    async eraseFlash64k(startAddress, size) {
        const blockSize = 64 * 1024;
        const startBlock = Math.floor(startAddress / blockSize);
        const endBlock = Math.floor((startAddress + size - 1) / blockSize);
        const totalBlocks = endBlock - startBlock + 1;
        
        this.infoLog(`64K块擦除: ${totalBlocks}个块`);
        
        for (let block = startBlock; block <= endBlock && !this.stopFlag; block++) {
            const blockAddr = block * blockSize;
            const progress = ((block - startBlock + 1) / totalBlocks * 100).toFixed(1);
            
            this.commLog(`擦除64K块 ${block}: 0x${blockAddr.toString(16).toUpperCase().padStart(8, '0')} (${progress}%)`);
            
            const maxRetries = 3;
            let success = false;
            
            for (let retry = 0; retry < maxRetries && !success; retry++) {
                try {
                    await this.eraseSector64k(blockAddr);
                    success = true;
                } catch (error) {
                    if (retry === maxRetries - 1) throw error;
                    this.warningLog(`擦除重试 ${retry + 1}/${maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            if (this.onProgress) {
                this.onProgress({
                    phase: 'erase',
                    progress: (block - startBlock + 1) / totalBlocks,
                    message: `擦除进度: ${progress}%`
                });
            }
        }
    }

    /**
     * 4K扇区擦除
     */
    async eraseFlash4k(startAddress, size) {
        const sectorSize = 4 * 1024;
        const startSector = Math.floor(startAddress / sectorSize);
        const endSector = Math.floor((startAddress + size - 1) / sectorSize);
        const totalSectors = endSector - startSector + 1;
        
        this.infoLog(`4K扇区擦除: ${totalSectors}个扇区`);
        
        for (let sector = startSector; sector <= endSector && !this.stopFlag; sector++) {
            const sectorAddr = sector * sectorSize;
            const progress = ((sector - startSector + 1) / totalSectors * 100).toFixed(1);
            
            this.commLog(`擦除4K扇区 ${sector}: 0x${sectorAddr.toString(16).toUpperCase().padStart(8, '0')} (${progress}%)`);
            
            const maxRetries = 3;
            let success = false;
            
            for (let retry = 0; retry < maxRetries && !success; retry++) {
                try {
                    await this.eraseSector4k(sectorAddr);
                    success = true;
                } catch (error) {
                    if (retry === maxRetries - 1) throw error;
                    this.warningLog(`擦除重试 ${retry + 1}/${maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            if (this.onProgress) {
                this.onProgress({
                    phase: 'erase',
                    progress: (sector - startSector + 1) / totalSectors,
                    message: `擦除进度: ${progress}%`
                });
            }
        }
    }

    /**
     * 擦除64K扇区
     */
    async eraseSector64k(address) {
        const useExtProtocol = this.flashConfig.needsExtendedProtocol();
        const protocol = useExtProtocol ? this.protocols.flashErase64kExt : this.protocols.flashErase64k;
        
        await this.serialManager.clearBuffer();
        
        const command = protocol.cmd(address);
        await this.serialManager.sendCommand(command, '64K擦除');
        
        const expectedLength = protocol.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength, 5000); // 64K擦除需要更长时间
        
        if (useExtProtocol) {
            if (!protocol.checkResponse(response)) {
                throw new Error('64K擦除失败');
            }
        } else {
            if (!protocol.checkResponse(response, address)) {
                throw new Error('64K擦除失败');
            }
        }
    }

    /**
     * 擦除4K扇区
     */
    async eraseSector4k(address) {
        const useExtProtocol = this.flashConfig.needsExtendedProtocol();
        const protocol = useExtProtocol ? this.protocols.flashErase4kExt : this.protocols.flashErase4k;
        
        await this.serialManager.clearBuffer();
        
        const command = protocol.cmd(address);
        await this.serialManager.sendCommand(command, '4K擦除');
        
        const expectedLength = protocol.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength, 1000);
        
        if (useExtProtocol) {
            if (!protocol.checkResponse(response)) {
                throw new Error('4K擦除失败');
            }
        } else {
            if (!protocol.checkResponse(response, address)) {
                throw new Error('4K擦除失败');
            }
        }
    }

    /**
     * 写入固件数据
     */
    async writeFirmwareData(firmwareData, startAddress) {
        this.mainLog('=== 写入固件 ===');
        
        // 数据256字节对齐
        const pageSize = 256;
        const alignedData = new Uint8Array(Math.ceil(firmwareData.length / pageSize) * pageSize);
        alignedData.set(firmwareData);
        alignedData.fill(0xFF, firmwareData.length); // 填充0xFF
        
        const totalPages = alignedData.length / pageSize;
        this.infoLog(`写入数据: ${this.debugUtils.formatFileSize(alignedData.length)} (${totalPages}页)`);
        
        // 处理起始地址的4K扇区对齐
        const sectorSize = 4 * 1024;
        const startSectorAddr = Math.floor(startAddress / sectorSize) * sectorSize;
        const endSectorAddr = Math.floor((startAddress + alignedData.length - 1) / sectorSize) * sectorSize;
        
        if (startAddress !== startSectorAddr) {
            await this.alignSectorAddressForWrite(startSectorAddr, startAddress, alignedData.slice(0, sectorSize - (startAddress - startSectorAddr)));
        }
        
        // 写入主要数据
        const mainDataStart = startAddress !== startSectorAddr ? sectorSize - (startAddress - startSectorAddr) : 0;
        const mainDataEnd = alignedData.length;
        
        for (let offset = mainDataStart; offset < mainDataEnd && !this.stopFlag; offset += sectorSize) {
            const sectorAddr = startAddress + offset;
            const sectorData = alignedData.slice(offset, Math.min(offset + sectorSize, alignedData.length));
            
            // 检查是否为全FF扇区
            if (sectorData.every(byte => byte === 0xFF)) {
                this.debugLog(`跳过全FF扇区: 0x${sectorAddr.toString(16).toUpperCase().padStart(8, '0')}`);
                continue;
            }
            
            await this.writeAndCheckSector(sectorAddr, sectorData);
            
            const progress = ((offset - mainDataStart + sectorSize) / (mainDataEnd - mainDataStart) * 100).toFixed(1);
            if (this.onProgress) {
                this.onProgress({
                    phase: 'write',
                    progress: (offset - mainDataStart + sectorSize) / (mainDataEnd - mainDataStart),
                    message: `写入进度: ${progress}%`
                });
            }
        }
        
        this.mainLog('✅ 固件写入完成');
    }

    /**
     * 写入并检查扇区
     */
    async writeAndCheckSector(address, data) {
        const maxRetries = 3;
        
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                // 写入扇区
                await this.writeSector(address, data);
                
                // 读取并检查
                const readData = await this.readSector(address);
                
                // 比较数据
                const writeData = new Uint8Array(4096);
                writeData.set(data);
                writeData.fill(0xFF, data.length);
                
                let match = true;
                for (let i = 0; i < 4096; i++) {
                    if (readData[i] !== writeData[i]) {
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    this.debugLog(`扇区写入验证成功: 0x${address.toString(16).toUpperCase().padStart(8, '0')}`);
                    return;
                } else {
                    throw new Error('数据验证失败');
                }
            } catch (error) {
                if (retry === maxRetries - 1) {
                    throw new Error(`扇区写入失败 (0x${address.toString(16).toUpperCase().padStart(8, '0')}): ${error.message}`);
                }
                this.warningLog(`写入重试 ${retry + 1}/${maxRetries}: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    /**
     * 写入扇区
     */
    async writeSector(address, data) {
        const pageSize = 256;
        const pages = Math.ceil(data.length / pageSize);
        
        for (let page = 0; page < pages; page++) {
            const pageAddr = address + page * pageSize;
            const pageData = new Uint8Array(pageSize);
            const startIdx = page * pageSize;
            const endIdx = Math.min(startIdx + pageSize, data.length);
            
            pageData.set(data.slice(startIdx, endIdx));
            pageData.fill(0xFF, endIdx - startIdx);
            
            await this.writePage(pageAddr, pageData);
        }
    }

    /**
     * 写入页
     */
    async writePage(address, data) {
        const useExtProtocol = this.flashConfig.needsExtendedProtocol();
        const protocol = useExtProtocol ? this.protocols.flashWrite256Ext : this.protocols.flashWrite256;
        
        await this.serialManager.clearBuffer();
        
        const command = protocol.cmd(address, data);
        await this.serialManager.sendCommand(command, '256字节写入');
        
        const expectedLength = protocol.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength, 1000);
        
        if (useExtProtocol) {
            if (!protocol.checkResponse(response)) {
                throw new Error('页写入失败');
            }
        } else {
            if (!protocol.checkResponse(response, address)) {
                throw new Error('页写入失败');
            }
        }
    }

    /**
     * 读取扇区
     */
    async readSector(address) {
        const useExtProtocol = this.flashConfig.needsExtendedProtocol();
        const protocol = useExtProtocol ? this.protocols.flashRead4kExt : this.protocols.flashRead4k;
        
        await this.serialManager.clearBuffer();
        
        const command = protocol.cmd(address);
        await this.serialManager.sendCommand(command, '4K读取');
        
        const expectedLength = protocol.getExpectedLength();
        const response = await this.serialManager.receiveResponse(expectedLength, 2000);
        
        if (useExtProtocol) {
            if (!protocol.checkResponse(response)) {
                throw new Error('扇区读取失败');
            }
        } else {
            if (!protocol.checkResponse(response, address)) {
                throw new Error('扇区读取失败');
            }
        }
        
        return protocol.getReadContent(response);
    }

    /**
     * 地址对齐写入
     */
    async alignSectorAddressForWrite(sectorAddr, writeAddr, writeData) {
        this.debugLog(`地址对齐写入: 扇区=0x${sectorAddr.toString(16).toUpperCase().padStart(8, '0')}, 写入=0x${writeAddr.toString(16).toUpperCase().padStart(8, '0')}`);
        
        // 备份当前波特率并设置高速
        const originalBaudrate = 115200; // 假设默认波特率
        await this.setBaudrate(921600);
        
        try {
            // 读取原始扇区数据
            const originalData = await this.readSector(sectorAddr);
            
            // 擦除扇区
            await this.eraseSector4k(sectorAddr);
            
            // 合并数据
            const mergedData = new Uint8Array(originalData);
            const offset = writeAddr - sectorAddr;
            mergedData.set(writeData, offset);
            
            // 写入合并后的数据
            await this.writeAndCheckSector(sectorAddr, mergedData);
        } finally {
            // 恢复原始波特率
            await this.setBaudrate(originalBaudrate);
        }
    }

    /**
     * Flash解保护
     */
    async unprotectFlash() {
        this.commLog('Flash解保护...');
        
        const unprotectConfig = this.flashConfig.getUnprotectConfig();
        if (!unprotectConfig) {
            this.debugLog('无需解保护');
            return;
        }
        
        const { writeValue } = unprotectConfig;
        
        // 写入状态寄存器
        await this.writeFlashStatusRegVal(writeValue);
        
        // 读取并验证
        const readValue = await this.readFlashStatusRegVal();
        
        this.debugLog(`解保护验证: 写入=0x${writeValue.toString(16).toUpperCase().padStart(4, '0')}, 读取=0x${readValue.toString(16).toUpperCase().padStart(4, '0')}`);
        
        if (readValue === writeValue) {
            this.infoLog('✅ Flash解保护成功');
        } else {
            throw new Error('Flash解保护失败');
        }
    }

    /**
     * Flash保护
     */
    async protectFlash() {
        this.commLog('Flash保护...');
        
        const protectConfig = this.flashConfig.getProtectConfig();
        if (!protectConfig) {
            this.debugLog('无需保护');
            return;
        }
        
        const { writeValue } = protectConfig;
        
        // 写入状态寄存器
        await this.writeFlashStatusRegVal(writeValue);
        
        // 读取并验证
        const readValue = await this.readFlashStatusRegVal();
        
        this.debugLog(`保护验证: 写入=0x${writeValue.toString(16).toUpperCase().padStart(4, '0')}, 读取=0x${readValue.toString(16).toUpperCase().padStart(4, '0')}`);
        
        if (readValue === writeValue) {
            this.infoLog('✅ Flash保护成功');
        } else {
            this.warningLog('⚠️ Flash保护可能失败');
        }
    }

    /**
     * 读取Flash状态寄存器值
     */
    async readFlashStatusRegVal() {
        const regCodes = [5, 53]; // 与Python一致
        
        for (const regCode of regCodes) {
            try {
                await this.serialManager.clearBuffer();
                
                const command = this.protocols.flashReadSR.cmd(regCode);
                await this.serialManager.sendCommand(command, `读取状态寄存器${regCode}`);
                
                const expectedLength = this.protocols.flashReadSR.getExpectedLength();
                const response = await this.serialManager.receiveResponse(expectedLength);
                
                if (this.protocols.flashReadSR.checkResponse(response)) {
                    const value = this.protocols.flashReadSR.extractValue(response);
                    this.debugLog(`状态寄存器${regCode}值: 0x${value.toString(16).toUpperCase().padStart(4, '0')}`);
                    return value;
                }
            } catch (error) {
                this.debugLog(`读取状态寄存器${regCode}失败: ${error.message}`);
            }
        }
        
        throw new Error('读取Flash状态寄存器失败');
    }

    /**
     * 写入Flash状态寄存器值
     */
    async writeFlashStatusRegVal(value) {
        const regCodes = [1, 49]; // 与Python一致
        
        for (const regCode of regCodes) {
            try {
                await this.serialManager.clearBuffer();
                
                const command = this.protocols.flashWriteSR.cmd(regCode, value);
                await this.serialManager.sendCommand(command, `写入状态寄存器${regCode}`);
                
                const expectedLength = this.protocols.flashWriteSR.getExpectedLength();
                const response = await this.serialManager.receiveResponse(expectedLength);
                
                if (this.protocols.flashWriteSR.checkResponse(response)) {
                    this.debugLog(`状态寄存器${regCode}写入成功`);
                    return;
                }
            } catch (error) {
                this.debugLog(`写入状态寄存器${regCode}失败: ${error.message}`);
            }
        }
        
        throw new Error('写入Flash状态寄存器失败');
    }

    /**
     * 重启设备
     */
    async reboot() {
        this.mainLog('重启设备...');
        
        try {
            await this.serialManager.setSignals({ dataTerminalReady: false, requestToSend: true });
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.serialManager.setSignals({ requestToSend: false });
            
            this.infoLog('✅ 设备重启完成');
        } catch (error) {
            this.warningLog(`设备重启可能失败: ${error.message}`);
        }
    }

    /**
     * 读取Flash数据
     */
    async readFlash(startAddress, size) {
        this.mainLog('=== 读取Flash ===');
        this.infoLog(`读取范围: 0x${startAddress.toString(16).toUpperCase().padStart(8, '0')} - 0x${(startAddress + size).toString(16).toUpperCase().padStart(8, '0')}`);
        
        const sectorSize = 4 * 1024;
        const startSector = Math.floor(startAddress / sectorSize);
        const endSector = Math.floor((startAddress + size - 1) / sectorSize);
        const totalSectors = endSector - startSector + 1;
        
        const result = new Uint8Array(size);
        let resultOffset = 0;
        
        for (let sector = startSector; sector <= endSector && !this.stopFlag; sector++) {
            const sectorAddr = sector * sectorSize;
            const sectorData = await this.readSector(sectorAddr);
            
            // 计算在当前扇区中的有效数据范围
            const sectorStart = Math.max(0, startAddress - sectorAddr);
            const sectorEnd = Math.min(sectorSize, startAddress + size - sectorAddr);
            const copySize = sectorEnd - sectorStart;
            
            if (copySize > 0) {
                result.set(sectorData.slice(sectorStart, sectorEnd), resultOffset);
                resultOffset += copySize;
            }
            
            const progress = ((sector - startSector + 1) / totalSectors * 100).toFixed(1);
            if (this.onProgress) {
                this.onProgress({
                    phase: 'read',
                    progress: (sector - startSector + 1) / totalSectors,
                    message: `读取进度: ${progress}%`
                });
            }
        }
        
        this.mainLog('✅ Flash读取完成');
        return result;
    }

    /**
     * CRC校验（空实现，与Python一致）
     */
    async crcCheck() {
        // CRC校验已集成在写入和检查扇区的逻辑中
        return true;
    }

    /**
     * 重置连接
     */
    async reset() {
        await this.serialManager.reset();
    }

    /**
     * 获取Flash信息
     */
    getFlashInfo() {
        return this.flashConfig.getFlashInfo();
    }

    /**
     * 检查设备连接状态
     */
    isConnected() {
        return this.serialManager.isConnected() && this.chipId && this.flashId;
    }

    /**
     * 获取设备状态
     */
    getDeviceStatus() {
        return {
            connected: this.isConnected(),
            chipId: this.chipId,
            flashId: this.flashId,
            flashConfig: this.currentFlashConfig,
            serialInfo: this.serialManager.getPortInfo()
        };
    }

    /**
     * 获取支持的Flash芯片列表
     */
    getSupportedFlashChips() {
        return this.flashDatabase.getAllFlashChips();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5DownloaderModular;
} else if (typeof window !== 'undefined') {
    window.T5DownloaderModular = T5DownloaderModular;
}