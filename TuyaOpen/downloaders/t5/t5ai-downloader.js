/**
 * T5AI芯片下载器 - 重构版本V2 (修复版)
 * 基于参考版本third_party/web_serial/downloaders/t5ai-downloader.js的成功逻辑
 * 修复关键缺失方法和下载流程，确保串口下载正常工作
 */

class T5DownloaderV2 extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        this.chipName = 'T5AI';
        this.version = 'v2.1-fixed';
        
        // 核心组件
        this.serialHandler = null;
        this.connectionManager = null;
        this.flashOperations = null;
        this.protocols = null;
        this.flashConfig = null;
        
        // 状态管理
        this.isInitialized = false;
        this.stopFlag = false;
        this.onProgress = null;
        this.currentBaudrate = 115200;
        
        // 内置Flash数据库 - 从参考版本移植
        this.flashDatabase = {
            // GD系列
            0x00134051: { name: 'MD25D40D', manufacturer: 'GD', size: 4 * 1024 * 1024 },
            0x001340c8: { name: 'GD25Q41B', manufacturer: 'GD', size: 4 * 1024 * 1024 },
            0x00144051: { name: 'MD25D80D', manufacturer: 'GD', size: 8 * 1024 * 1024 },
            0x001464c8: { name: 'GD25WD80E', manufacturer: 'GD', size: 8 * 1024 * 1024 },
            0x001440c8: { name: 'GD25Q80C', manufacturer: 'GD', size: 8 * 1024 * 1024 },
            0x001540c8: { name: 'GD25Q16C', manufacturer: 'GD', size: 16 * 1024 * 1024 },
            0x001565c8: { name: 'GD25WQ16E', manufacturer: 'GD', size: 16 * 1024 * 1024 },
            0x001640c8: { name: 'GD25Q32C', manufacturer: 'GD', size: 32 * 1024 * 1024 },
            0x001665c8: { name: 'GD25WQ32E', manufacturer: 'GD', size: 32 * 1024 * 1024 },
            0x001740c8: { name: 'GD25Q64C', manufacturer: 'GD', size: 64 * 1024 * 1024 },
            0x001765c8: { name: 'GD25WQ64E', manufacturer: 'GD', size: 64 * 1024 * 1024 },
            0x001840c8: { name: 'GD25Q128C', manufacturer: 'GD', size: 128 * 1024 * 1024 },
            // TH系列
            0x001260eb: { name: 'TH25D20HA', manufacturer: 'TH', size: 2 * 1024 * 1024 },
            0x001360cd: { name: 'TH25Q40HB', manufacturer: 'TH', size: 4 * 1024 * 1024 },
            0x001460cd: { name: 'TH25Q80HB', manufacturer: 'TH', size: 8 * 1024 * 1024 },
            0x001560eb: { name: 'TH25Q16HB', manufacturer: 'TH', size: 16 * 1024 * 1024 },
            0x001760eb: { name: 'TH25Q64HA', manufacturer: 'TH', size: 64 * 1024 * 1024 },
            // XTX系列
            0x0015400b: { name: 'XT25F16B', manufacturer: 'XTX', size: 16 * 1024 * 1024 },
            0x0016400b: { name: 'XT25F32B', manufacturer: 'XTX', size: 32 * 1024 * 1024 },
            // BY系列
            0x001440e0: { name: 'BY25Q80A', manufacturer: 'BY', size: 8 * 1024 * 1024 },
            0x001340e0: { name: 'BY25Q40A', manufacturer: 'BY', size: 4 * 1024 * 1024 },
            // PY系列
            0x00124485: { name: 'PY25D22U', manufacturer: 'PY', size: 2 * 1024 * 1024 },
            0x00124585: { name: 'PY25D24U', manufacturer: 'PY', size: 2 * 1024 * 1024 },
            0x00136085: { name: 'PY25Q40H', manufacturer: 'PY', size: 4 * 1024 * 1024 },
            0x00146085: { name: 'PY25Q80H', manufacturer: 'PY', size: 8 * 1024 * 1024 },
            0x00156085: { name: 'PY25Q16H', manufacturer: 'PY', size: 16 * 1024 * 1024 },
            0x00154285: { name: 'PY25Q16SH', manufacturer: 'PY', size: 16 * 1024 * 1024 },
            0x00166085: { name: 'PY25Q32H', manufacturer: 'PY', size: 32 * 1024 * 1024 },
            // UC系列
            0x001260b3: { name: 'UC25HQ20', manufacturer: 'UC', size: 2 * 1024 * 1024 },
            0x001360b3: { name: 'UC25HQ40', manufacturer: 'UC', size: 4 * 1024 * 1024 },
            // GT系列
            0x001240c4: { name: 'GT25Q20D', manufacturer: 'GT', size: 2 * 1024 * 1024 },
            0x001340c4: { name: 'GT25Q40D', manufacturer: 'GT', size: 4 * 1024 * 1024 }
        };
        
        // 设备信息
        this.chipId = null;
        this.flashId = null;
        this.internalFlashConfig = null;
    }

    /**
     * 初始化下载器组件
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        this.debug('main', '初始化T5下载器组件...');

        // 1. 初始化协议实例映射（延迟创建）
        this.protocolClasses = {
            linkCheck: 'LinkCheckProtocol',
            getChipId: 'GetChipIdProtocol',
            getFlashMid: 'GetFlashMidProtocol',
            setBaudrate: 'SetBaudrateProtocol',
            flashReadSR: 'FlashReadSRProtocol',
            flashWriteSR: 'FlashWriteSRProtocol',
            flashErase4k: 'FlashErase4kProtocol',
            flashErase4kExt: 'FlashErase4kExtProtocol',
            flashCustomErase: 'FlashCustomEraseProtocol',
            flashRead4k: 'FlashRead4kProtocol',
            flashRead4kExt: 'FlashRead4kExtProtocol',
            flashWrite4k: 'FlashWrite4kProtocol',
            flashWrite4kExt: 'FlashWrite4kExtProtocol',
            checkCrc: 'CheckCrcProtocol',
            checkCrcExt: 'CheckCrcExtProtocol',
            reboot: 'RebootProtocol',
            stayRom: 'StayRomProtocol',
            flashEraseAll: 'FlashEraseAllProtocol',
            getBootVersion: 'GetBootVersionProtocol',
            reset: 'ResetProtocol',
            writeReg: 'WriteRegProtocol'
        };
        
        // 协议实例缓存
        this.protocolInstances = {};

        // 2. 初始化Flash配置系统（延迟创建）
        this.flashConfigClass = 'T5FlashConfig';
        this.flashConfig = null;
        
        // 3. 初始化串口处理器
        this.serialHandler = new T5SerialHandler(this.port, this.debug.bind(this));
        
        // 4. 初始化连接管理器
        this.connectionManager = new T5ConnectionManager(
            this.serialHandler, 
            this.getProtocols(), 
            this.getFlashConfig(), 
            this.debug.bind(this)
        );
        
        // 5. 初始化Flash操作管理器
        this.flashOperations = new T5FlashOperations(
            this.serialHandler, 
            this.getProtocols(), 
            this.getFlashConfig(), 
            this.debug.bind(this)
        );
        
        // 设置进度回调
        if (this.onProgress) {
            this.flashOperations.setProgressCallback(this.onProgress);
        }
        
        this.isInitialized = true;
        this.debug('main', 'T5下载器组件初始化完成');
    }

    /**
     * 获取协议实例（延迟创建）
     */
    getProtocol(protocolName) {
        // 如果已经创建过，直接返回缓存的实例
        if (this.protocolInstances[protocolName]) {
            return this.protocolInstances[protocolName];
        }
        
        // 获取协议类名
        const className = this.protocolClasses[protocolName];
        if (!className) {
            throw new Error(`未知的协议名: ${protocolName}`);
        }
        
        // 检查协议类是否已加载
        const ProtocolClass = window[className];
        if (!ProtocolClass || typeof ProtocolClass !== 'function') {
            throw new Error(`协议类未加载: ${className}`);
        }
        
        // 创建协议实例
        const protocolInstance = new ProtocolClass();
        protocolInstance.setDebugMode(true);
        
        // 缓存实例
        this.protocolInstances[protocolName] = protocolInstance;
        
        return protocolInstance;
    }

    /**
     * 获取所有协议实例对象（用于传递给其他组件）
     */
    getProtocols() {
        const protocols = {};
        
        // 为每个协议名创建getter，实现延迟加载
        Object.keys(this.protocolClasses).forEach(protocolName => {
            Object.defineProperty(protocols, protocolName, {
                get: () => this.getProtocol(protocolName),
                enumerable: true
            });
        });
        
        return protocols;
    }

    /**
     * 获取Flash配置实例（延迟创建）
     */
    getFlashConfig() {
        // 如果已经创建过，直接返回缓存的实例
        if (this.flashConfig) {
            return this.flashConfig;
        }
        
        // 检查Flash配置类是否已加载
        const FlashConfigClass = window[this.flashConfigClass];
        if (!FlashConfigClass || typeof FlashConfigClass !== 'function') {
            throw new Error(`Flash配置类未加载: ${this.flashConfigClass}`);
        }
        
        // 创建Flash配置实例
        this.flashConfig = new FlashConfigClass();
        this.flashConfig.setDebugMode(true);
        
        return this.flashConfig;
    }

    /**
     * 设置进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
        if (this.flashOperations) {
            this.flashOperations.setProgressCallback(callback);
        }
    }

    /**
     * 停止操作
     */
    stop() {
        this.stopFlag = true;
        if (this.serialHandler) {
            this.serialHandler.stop();
        }
    }

    /**
     * 连接设备
     */
    async connect() {
        this.debug('main', `正在连接 ${this.chipName}...`);
        
        try {
            await this.initialize();
            this.stopFlag = false;
            
            const result = await this.connectionManager.connect();
            this.debug('main', `✅ ${this.chipName} 连接成功`);
            
            return result;
            
        } catch (error) {
            this.debug('error', `连接失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 断开连接
     */
    async disconnect() {
        this.debug('main', `断开 ${this.chipName} 连接`);
        
        if (this.connectionManager) {
            await this.connectionManager.disconnect();
        }
        
        this.stopFlag = true;
    }

    /**
     * 下载固件主流程 - 完全按照参考版本逻辑修复
     */
    async downloadFirmware(fileData, startAddr = 0x00) {
        if (!this.chipId || !this.flashId) {
            throw new Error('设备未连接，请先调用connect()');
        }
        
        try {
            this.debug('info', '开始T5AI固件下载流程...');
            this.debug('info', `文件大小: ${fileData.length} 字节`);
            this.debug('info', `起始地址: 0x${startAddr.toString(16).padStart(8, '0')}`);
            this.debug('info', `目标Flash: ${this.internalFlashConfig ? this.internalFlashConfig.manufacturer + ' ' + this.internalFlashConfig.name : '未知型号'}`);
            
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: '开始下载固件...',
                    progress: 0,
                    total: fileData.length
                });
            }
            
            // 步骤1: 设置高速波特率 - 从用户串口配置获取波特率
            this.debug('main', '=== 步骤1: 设置高速波特率 ===');
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: '设置高速波特率...',
                    progress: Math.round(fileData.length * 0.1),
                    total: fileData.length
                });
            }
            
            // 获取用户配置的波特率（与参考版本逻辑一致）
            const userBaudrate = this.getUserConfiguredBaudrate();
            this.debug('info', `用户配置的波特率: ${userBaudrate} bps`);
            
            await this.setBaudrate(userBaudrate);
            this.debug('info', `✅ 高速波特率设置完成: ${userBaudrate} bps`);
            
            // 步骤2: 擦除Flash - 完全按照参考版本erase()方法实现
            this.debug('main', '=== 步骤2: 擦除Flash ===');
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: '擦除Flash...',
                    progress: Math.round(fileData.length * 0.2),
                    total: fileData.length
                });
            }
            
            // 参考版本: erase()方法开始 - 先调用unprotect_flash()
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: 'Flash解保护...',
                    progress: Math.round(fileData.length * 0.25),
                    total: fileData.length
                });
            }
            
            await this.unprotectFlash();
            this.debug('info', '✅ Flash解保护完成');
            
            // 解保护后验证通信状态
            this.debug('debug', '验证Flash解保护后通信状态...');
            if (await this.doLinkCheck()) {
                this.debug('info', '✅ Flash解保护后通信正常');
            } else {
                throw new Error('Flash解保护后通信异常');
            }
            
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: '开始擦除...',
                    progress: Math.round(fileData.length * 0.3),
                    total: fileData.length
                });
            }
            
            // 参考版本智能擦除逻辑: 地址对齐 + 64K块擦除优先
            await this.executeSmartErase(startAddr, fileData.length);
            this.debug('info', '✅ Flash擦除完成');
            
            // 步骤3: 写入固件 - 完全按照参考版本write()方法实现
            this.debug('main', '=== 步骤3: 写入固件 ===');
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: '写入固件...',
                    progress: Math.round(fileData.length * 0.7),
                    total: fileData.length
                });
            }
            
            await this.executeSmartWrite(startAddr, fileData);
            this.debug('info', '✅ 固件写入完成');
            
            // 步骤4: Flash保护 - 完全按照参考版本逻辑实现
            this.debug('main', '=== 步骤4: Flash保护 ===');
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: 'Flash保护...',
                    progress: Math.round(fileData.length * 0.95),
                    total: fileData.length
                });
            }
            
            await this.protectFlash();
            this.debug('info', '✅ Flash保护完成');
            
            // 步骤5: 自动重启设备 - 与参考版本保持一致
            this.debug('main', '=== 步骤5: 重启设备 ===');
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: '重启设备...',
                    progress: Math.round(fileData.length * 0.98),
                    total: fileData.length
                });
            }
            
            await this.reboot();
            this.debug('info', '✅ 设备重启完成');
            
            this.debug('info', '✅ T5AI固件下载完成');
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'completed', 
                    message: '固件下载完成，设备已重启',
                    progress: fileData.length,
                    total: fileData.length
                });
            }
            
            return { success: true };
            
        } catch (error) {
            this.debug('error', `固件下载失败: ${error.message}`);
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'error', 
                    message: `下载失败: ${error.message}` 
                });
            }
            throw error;
        } finally {
            // 关键修复：无论下载成功还是失败，都将串口重置回115200
            // 这样下次下载时就能正常从115200开始连接
            try {
                this.debug('info', '重置串口波特率到115200...');
                await this.setBaudrate(115200);
                this.debug('info', '✅ 串口波特率已重置到115200');
            } catch (resetError) {
                this.debug('warning', `重置串口波特率失败: ${resetError.message}`);
                // 即使重置失败，也尝试直接重新配置串口
                try {
                    await this.port.close();
                    await this.port.open({
                        baudRate: 115200,
                        dataBits: 8,
                        stopBits: 1,
                        parity: 'none',
                        flowControl: 'none'
                    });
                    this.debug('info', '✅ 串口已重新打开为115200');
                } catch (reopenError) {
                    this.debug('warning', `重新打开串口失败: ${reopenError.message}`);
                }
            }
        }
    }

    /**
     * 读取Flash
     */
    async readFlash(startAddr, length) {
        this.debug('main', `开始读取Flash: 地址=0x${startAddr.toString(16)}, 长度=${length}字节`);
        
        try {
            await this.initialize();
            
            // 确保已连接
            if (!this.connectionManager.getConnectionStatus().isConnected) {
                await this.connect();
            }
            
            const data = await this.flashOperations.readFlash(startAddr, length);
            this.debug('main', '✅ Flash读取完成');
            
            return { success: true, data: data };
            
        } catch (error) {
            this.debug('error', `读取失败: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * 擦除Flash
     */
    async eraseFlash(startAddr, length) {
        this.debug('main', `开始擦除Flash: 地址=0x${startAddr.toString(16)}, 长度=${length}字节`);
        
        try {
            await this.initialize();
            
            // 确保已连接
            if (!this.connectionManager.getConnectionStatus().isConnected) {
                await this.connect();
            }
            
            await this.flashOperations.eraseFlash(startAddr, length);
            this.debug('main', '✅ Flash擦除完成');
            
            return { success: true };
            
        } catch (error) {
            this.debug('error', `擦除失败: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取设备信息
     */
    async getDeviceInfo() {
        try {
            await this.initialize();
            
            // 确保已连接
            if (!this.connectionManager.getConnectionStatus().isConnected) {
                await this.connect();
            }
            
            const connectionStatus = this.connectionManager.getConnectionStatus();
            const flashInfo = this.flashOperations.getFlashInfo();
            
            return {
                success: true,
                chipName: this.chipName,
                version: this.version,
                chipId: connectionStatus.chipId,
                flashId: connectionStatus.flashId,
                flashInfo: flashInfo,
                currentBaudrate: connectionStatus.currentBaudrate
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取设备状态
     */
    getDeviceStatus() {
        if (!this.isInitialized) {
            return {
                chipName: this.chipName,
                version: this.version,
                connected: false,
                initialized: false
            };
        }
        
        const connectionStatus = this.connectionManager.getConnectionStatus();
        const operationStats = this.flashOperations.getOperationStats();
        
        return {
            chipName: this.chipName,
            version: this.version,
            connected: connectionStatus.isConnected,
            initialized: this.isInitialized,
            chipId: connectionStatus.chipId,
            flashId: connectionStatus.flashId,
            flashInfo: connectionStatus.flashInfo,
            currentBaudrate: connectionStatus.currentBaudrate,
            operationStats: operationStats
        };
    }

    /**
     * 检查是否连接
     */
    isConnected() {
        return this.isInitialized && 
               this.connectionManager && 
               this.connectionManager.getConnectionStatus().isConnected;
    }

    /**
     * 重置下载器状态
     */
    reset() {
        this.stopFlag = false;
        
        if (this.serialHandler) {
            this.serialHandler.reset();
        }
        
        if (this.connectionManager) {
            this.connectionManager.reset();
        }
        
        if (this.flashOperations) {
            this.flashOperations.reset();
        }
    }

    /**
     * 获取用户配置的波特率 - 从参考版本移植
     */
    getUserConfiguredBaudrate() {
        // 从全局串口终端获取固件下载独立配置的波特率
        if (window.serialTerminal && window.serialTerminal.flashBaudRateSelect) {
            const configuredBaudrate = parseInt(window.serialTerminal.flashBaudRateSelect.value);
            this.debug('debug', `从固件下载配置获取波特率: ${configuredBaudrate}`);
            
            // 验证波特率是否在有效范围内
            const validBaudrates = [115200, 230400, 460800, 921600, 1152000, 1500000, 2000000, 3000000];
            if (validBaudrates.includes(configuredBaudrate)) {
                return configuredBaudrate;
            } else {
                this.debug('warning', `无效的波特率配置: ${configuredBaudrate}，使用默认值921600`);
                return 921600;
            }
        }
        
        // 如果无法获取用户配置，使用默认的921600（与参考版本配置一致）
        this.debug('warning', '无法获取固件下载串口配置，使用默认波特率921600');
        return 921600;
    }

    
    /**
     * 获取配置信息（用于调试）
     */
    getConfig() {
        try {
            return this.getFlashConfig().getFullConfig();
        } catch (error) {
            return null;
        }
    }

    // ==================== 参考版本关键方法移植 ====================
    // 以下方法从参考版本third_party/web_serial/downloaders/t5ai-downloader.js移植

    /**
     * 检查缓冲区是否全为0xFF - 从参考版本移植
     */
    isBufferAllFF(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] !== 0xff) {
                return false;
            }
        }
        return true;
    }

    /**
     * 写入并检查扇区 - 从参考版本移植
     */
    async writeAndCheckSector(sectorData, addr, flashSize) {
        const length = sectorData.length;
        
        // 写入扇区
        if (!await this.writeSector(addr, sectorData, flashSize)) {
            return false;
        }
        
        // CRC校验
        if (!await this.checkCrcVer2(sectorData, addr, length, flashSize)) {
            return false;
        }
        
        return true;
    }

    /**
     * 写入扇区 - 从工作版本直接移植
     */
    async writeSector(flashAddr, buf, flashSize) {
        // Python: FlashWrite4kProtocol or FlashWrite4kExtProtocol
        const isExt = flashSize >= 256 * 1024 * 1024;
        
        // Python: 0x07 for normal, 0x0e7 for ext
        // 重要：Python中0x0e7被转换为0xE7 (231 & 0xFF)
        const cmd = isExt ? 0xE7 : 0x07;
        
        this.debug('debug', `使用协议: ${isExt ? 'FlashWrite4kExtProtocol' : 'FlashWrite4kProtocol'}`);
        this.debug('debug', `命令码: 0x${cmd.toString(16).padStart(2, '0')}`);
        
        // Python协议生成逻辑:
        const addrBytes = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        
        // payload = 地址(4字节) + 数据(buf.length字节)
        const payload = [...addrBytes, ...buf];
        
        // 关键修正：Python的长度计算是 1 + len(payload)，表示cmd(1字节) + payload
        const totalCmdLength = 1 + payload.length;
        
        // Python的command格式：[base_tx_header] + [length_low, length_high] + [cmd] + [payload]
        const command = [
            0x01, 0xE0, 0xFC, 0xFF, 0xF4,                    // base_tx_header
            totalCmdLength & 0xFF,                            // length_low
            (totalCmdLength >> 8) & 0xFF,                     // length_high  
            cmd,                                              // cmd
            ...payload                                        // payload
        ];
        
        this.debug('debug', `命令长度: ${totalCmdLength}, payload长度: ${payload.length}`);
        this.debug('debug', `发送写入命令长度: ${command.length}字节`);
        
        await this.clearBuffer();
        await this.sendCommand(command, `WriteSector`);
        
        // Python: expect_length = rx_expect_length(4) = 7 + 2 + 1 + 1 + 4 = 15
        const expectedLength = 15;
        
        // Python使用0.5秒超时
        const response = await this.receiveResponse(expectedLength, 500);
        
        this.debug('debug', `写入响应分析: 长度=${response.length}, 期望=${expectedLength}`);
        this.debug('debug', `响应内容: ${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
        if (response.length >= expectedLength) {
            // 1. check_response_base_header: 检查[0x04, 0x0e, 0xff, 0x01, 0xe0, 0xfc, 0xf4]
            const expectedBaseHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
            const headerMatch = expectedBaseHeader.every((byte, index) => response[index] === byte);
            
            if (!headerMatch) {
                this.debug('error', `响应头部不匹配: 期望[${expectedBaseHeader.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                this.debug('error', `实际收到[${response.slice(0, 7).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                throw new Error('写入响应头部格式错误');
            }
            
            // 2. check_response_length_seg: 检查长度字段
            const responseLength = response[7] | (response[8] << 8);
            const expectedResponseLength = response.length - 9;
            if (responseLength !== expectedResponseLength) {
                this.debug('error', `响应长度字段不匹配: 期望${expectedResponseLength}, 实际${responseLength}`);
                throw new Error('写入响应长度字段错误');
            }
            
            // 3. check_response_status: 检查状态码 (位置10)
            const statusCode = response[10];
            if (statusCode !== 0x00) {
                // 根据Python STATUS_INFO解析错误
                const statusInfo = [
                    { code: 0x0, desc: 'normal' },
                    { code: 0x1, desc: 'FLASH_STATUS_BUSY' },
                    { code: 0x2, desc: 'spi timeout' },
                    { code: 0x3, desc: 'flash operate timeout' },
                    { code: 0x4, desc: 'package payload length error' },
                    { code: 0x5, desc: 'package length error' },
                    { code: 0x6, desc: 'flash operate PARAM_ERROR' },
                    { code: 0x7, desc: 'unknown cmd' },
                ];
                
                const errorInfo = statusInfo.find(info => info.code === statusCode);
                const errorDesc = errorInfo ? errorInfo.desc : `未知错误码 0x${statusCode.toString(16).padStart(2, '0')}`;
                throw new Error(`Flash写入失败: ${errorDesc} (状态码: 0x${statusCode.toString(16).padStart(2, '0')})`);
            }
            
            // 4. 协议特定检查
            if (isExt) {
                // Python FlashWrite4kExtProtocol.response_check: 返回True
                // 扩展协议不需要额外检查，只要基础检查通过即可
                this.debug('debug', `✅ 写入成功 (扩展协议): 0x${flashAddr.toString(16).padStart(8, '0')}`);
                return true;
            } else {
                // Python FlashWrite4kProtocol.response_check: 需要检查地址匹配
                // response_content[11:15] == bytes([flash_addr & 0xff, ...])
                const responseAddr = response.slice(11, 15);
                if (responseAddr.every((byte, index) => byte === addrBytes[index])) {
                    this.debug('debug', `✅ 写入成功 (普通协议): 0x${flashAddr.toString(16).padStart(8, '0')}`);
                    return true;
                } else {
                    this.debug('error', `响应地址不匹配: 期望[${addrBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                    this.debug('error', `实际收到[${responseAddr.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                    throw new Error(`写入响应地址不匹配`);
                }
            }
        } else if (response.length >= 7) {
            // 短响应错误分析
            this.debug('warning', `收到短响应，分析错误原因...`);
            
            // 检查是否是Flash协议的错误响应
            if (response[0] === 0x04 && response[1] === 0x0E) {
                // 可能的Flash协议错误响应
                if (response.length >= 11 && response[2] === 0xFF && 
                    response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4) {
                    // 这是Flash协议响应，检查状态码
                    if (response.length >= 11) {
                        const statusCode = response[10];
                        const statusInfo = [
                            { code: 0x0, desc: 'normal' },
                            { code: 0x1, desc: 'FLASH_STATUS_BUSY' },
                            { code: 0x2, desc: 'spi timeout' },
                            { code: 0x3, desc: 'flash operate timeout' },
                            { code: 0x4, desc: 'package payload length error' },
                            { code: 0x5, desc: 'package length error' },
                            { code: 0x6, desc: 'flash operate PARAM_ERROR' },
                            { code: 0x7, desc: 'unknown cmd' },
                        ];
                        
                        const errorInfo = statusInfo.find(info => info.code === statusCode);
                        const errorDesc = errorInfo ? errorInfo.desc : `未知错误码 0x${statusCode.toString(16).padStart(2, '0')}`;
                        throw new Error(`Flash写入失败: ${errorDesc} (状态码: 0x${statusCode.toString(16).padStart(2, '0')})`);
                    }
                } else if (response.length >= 7) {
                    // 可能是BaseBootRom协议的错误响应: [04 0E length 01 E0 FC status]
                    if (response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC) {
                        const statusCode = response[6];
                        const statusInfo = [
                            { code: 0x0, desc: 'normal' },
                            { code: 0x1, desc: 'FLASH_STATUS_BUSY' },
                            { code: 0x2, desc: 'spi timeout' },
                            { code: 0x3, desc: 'flash operate timeout' },
                            { code: 0x4, desc: 'package payload length error' },
                            { code: 0x5, desc: 'package length error' },
                            { code: 0x6, desc: 'flash operate PARAM_ERROR' },
                            { code: 0x7, desc: 'unknown cmd' },
                        ];
                        
                        const errorInfo = statusInfo.find(info => info.code === statusCode);
                        const errorDesc = errorInfo ? errorInfo.desc : `未知错误码 0x${statusCode.toString(16).padStart(2, '0')}`;
                        throw new Error(`Flash写入失败: ${errorDesc} (状态码: 0x${statusCode.toString(16).padStart(2, '0')})`);
                    }
                }
            }
            
            throw new Error(`写入响应长度不足且格式未知: ${response.length} < ${expectedLength}`);
        } else {
            throw new Error(`写入响应长度不足: ${response.length} < ${expectedLength}`);
        }
    }

    /**
     * CRC校验v2 - 从工作版本直接移植
     */
    async checkCrcVer2(buf, flashAddr, bufLen, flashSize, timeout = 0.1, recnt = 5) {
        // Python: CheckCrcProtocol or CheckCrcExtProtocol
        const isExt = flashSize >= 256 * 1024 * 1024;
        const cmd = isExt ? 0x13 : 0x10;
        
        // Python: crc_me = crc32_ver2(0xffffffff, buf)
        const crcMe = this.crc32Ver2(0xffffffff, buf);
        
        for (let i = 0; i < recnt; i++) {
            // Python: crc_protocol.cmd(flash_addr, flash_addr+buf_len-1)
            const startAddr = flashAddr;
            const endAddr = flashAddr + bufLen - 1;
            
            const payload = [
                startAddr & 0xff,
                (startAddr >> 8) & 0xff,
                (startAddr >> 16) & 0xff,
                (startAddr >> 24) & 0xff,
                endAddr & 0xff,
                (endAddr >> 8) & 0xff,
                (endAddr >> 16) & 0xff,
                (endAddr >> 24) & 0xff
            ];
            
            // 关键修正：CRC协议使用BaseBootRomProtocol格式，不是Flash协议！
            // Python: CheckCrcProtocol(BaseBootRomProtocol)
            // command_generate格式: [0x01, 0xe0, 0xfc, len, cmd, payload...]
            const command = [0x01, 0xE0, 0xFC, 1 + payload.length, cmd, ...payload];
            
            await this.clearBuffer();
            await this.sendCommand(command, 'CheckCrc');
            
            // Python: expect_length = rx_expect_length(4) = 2 + 1 + 3 + 1 + 4 = 11
            const expectedLength = 11;
            const response = await this.receiveResponse(expectedLength, timeout * 1000);
            
            if (response.length >= expectedLength) {
                // Python: response_check for BaseBootRomProtocol
                if (response[0] === 0x04 && response[1] === 0x0E &&
                    response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC) {
                    
                    // Python CheckCrcExtProtocol关键差异：
                    // CheckCrcExtProtocol.response_check(self, response_content): 返回True
                    // 扩展协议不做额外检查！
                    if (isExt) {
                        // 扩展协议直接提取CRC值
                        const crcRead = response[7] | (response[8] << 8) | (response[9] << 16) | (response[10] << 24);
                        
                        if (crcMe === crcRead) {
                            this.debug('debug', `✅ CRC校验成功 (扩展协议): 计算值=0x${crcMe.toString(16)}, 读取值=0x${crcRead.toString(16)}`);
                            return true;
                        } else {
                            this.debug('warning', `CRC不匹配 (扩展协议): 计算值0x${crcMe.toString(16)}, 读取值0x${crcRead.toString(16)}`);
                        }
                    } else {
                        // 普通协议需要完整的响应检查
                        // Python: super().response_check(response_content)
                        if (response[6] === cmd) { // 检查命令码
                            const crcRead = response[7] | (response[8] << 8) | (response[9] << 16) | (response[10] << 24);
                            
                            if (crcMe === crcRead) {
                                this.debug('debug', `✅ CRC校验成功 (普通协议): 计算值=0x${crcMe.toString(16)}, 读取值=0x${crcRead.toString(16)}`);
                                return true;
                            } else {
                                this.debug('warning', `CRC不匹配 (普通协议): 计算值0x${crcMe.toString(16)}, 读取值0x${crcRead.toString(16)}`);
                            }
                        } else {
                            this.debug('warning', `CRC响应命令码错误: 期望0x${cmd.toString(16)}, 实际0x${response[6]?.toString(16) || 'unknown'}`);
                        }
                    }
                } else {
                    this.debug('warning', `CRC响应格式错误`);
                }
            } else {
                this.debug('warning', `CRC响应长度不足: ${response.length} < ${expectedLength}`);
            }
        }
        
        return false;
    }

    /**
     * CRC32计算 - 从工作版本移植
     */
    crc32Ver2(crc, buf) {
        // Python CRC32表
        const crcTable = this.makeCrc32Table();
        
        for (let i = 0; i < buf.length; i++) {
            crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
        }
        
        return crc;
    }

    /**
     * 生成CRC32表 - 从工作版本移植
     */
    makeCrc32Table() {
        if (this._crcTable) return this._crcTable;
        
        const table = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            let crc = i;
            for (let j = 0; j < 8; j++) {
                if (crc & 1) {
                    crc = 0xedb88320 ^ (crc >>> 1);
                } else {
                    crc = crc >>> 1;
                }
            }
            table[i] = crc;
        }
        
        this._crcTable = table;
        return table;
    }

    /**
     * 扇区地址对齐写入 - 从参考版本移植
     */
    async alignSectorAddressForWrite(addr, startOrEnd, content, flashSize) {
        const eraseAddr = Math.floor(addr / 0x1000) * 0x1000;
        const baudrateBackup = this.currentBaudrate || this.getUserConfiguredBaudrate();
        
        try {
            // 临时降低波特率到500000
            if (!await this.setBaudrate(500000)) {
                return false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 读取当前扇区数据
            const ret = await this.readSector(eraseAddr, flashSize);
            if (ret === null) {
                return false;
            }
            
            // 擦除扇区
            const eraseCmd = flashSize >= 256 * 1024 * 1024 ? 0x21 : 0x20;
            try {
                await this.eraseCustomSize(eraseAddr, eraseCmd);
            } catch (error) {
                return false;
            }
            
            // 恢复波特率
            if (!await this.setBaudrate(baudrateBackup)) {
                return false;
            }
            
            // 合并数据
            const newData = new Uint8Array(ret);
            if (startOrEnd) {
                // 起始地址对齐 - 保留前面数据，替换后面数据
                const offset = addr & 0xfff;
                for (let i = offset; i < 0x1000 && (i - offset) < content.length; i++) {
                    newData[i] = content[i - offset];
                }
            } else {
                // 结束地址对齐 - 保留后面数据，替换前面数据
                const endOffset = addr & 0xfff;
                for (let i = 0; i < endOffset && i < content.length; i++) {
                    newData[i] = content[content.length - endOffset + i];
                }
            }
            
            // 写入合并后的数据
            if (!await this.writeAndCheckSector(newData, eraseAddr, flashSize)) {
                return false;
            }
            
            return true;
        } catch (error) {
            this.debug('error', `地址对齐写入失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 重试写入扇区 - 从参考版本移植
     */
    async retryWriteSector(flashAddr, buf, flashSize, recnt = 5) {
        const baudrateBackup = this.currentBaudrate || this.getUserConfiguredBaudrate();
        
        try {
            // 重置到115200波特率
            this.debug('debug', '重试: 重置到115200波特率');
            await this.setBaudrate(115200);
            
            // 重新获取总线控制
            this.debug('debug', '重试: 重新获取总线控制');
            if (!await this.getBusControl()) {
                return false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // 恢复波特率
            this.debug('debug', `重试: 恢复波特率${baudrateBackup}`);
            if (!await this.setBaudrate(baudrateBackup)) {
                return false;
            }
            
            // 擦除扇区
            this.debug('debug', '重试: 擦除扇区');
            if (!await this.eraseSector(flashAddr, flashSize)) {
                return false;
            }
            
            // 写入并检查
            if (!await this.writeAndCheckSector(buf, flashAddr, flashSize)) {
                return false;
            }
            
            return true;
        } catch (error) {
            this.debug('error', `重试写入扇区失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 读取扇区 - 从工作版本直接移植
     */
    async readSector(flashAddr, flashSize) {
        // Python: read_flash_protocol = FlashRead4kProtocol() or FlashRead4kExtProtocol()
        const isExt = flashSize >= 256 * 1024 * 1024;
        // 重大修正：Python FlashRead4kProtocol使用0x09，FlashRead4kExtProtocol使用0xe9
        const cmd = isExt ? 0xe9 : 0x09;
        
        // Python: read_flash_protocol.cmd(flash_addr)
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        
        // 使用BaseBootRomFlashProtocol格式
        const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, (1 + payload.length) & 0xFF, ((1 + payload.length) >> 8) & 0xFF, cmd, ...payload];
        
        await this.clearBuffer();
        await this.sendCommand(command, 'ReadSector');
        
        // Python: expect_length = rx_expect_length(4 + 4096) = 7 + 2 + 1 + 1 + (4 + 4096) = 4111
        const expectedLength = 7 + 2 + 1 + 1 + 4 + 4096;
        const response = await this.receiveResponse(expectedLength, 500);
        
        if (response.length >= expectedLength) {
            // Python: response_check and get_read_content
            const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
            const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
            
            if (headerMatch && response[10] === 0x00) { // 检查状态码
                if (isExt) {
                    // Python FlashRead4kExtProtocol.response_check(): 返回True
                    // Python get_read_content(): 与普通协议相同，但没有地址检查
                    // Python get_read_content(response_content): 返回response_content[15:]
                    return response.slice(15, 15 + 0x1000);
                } else {
                    // Python FlashRead4kProtocol需要检查地址匹配
                    // Python: response_content[11:15] == bytes([flash_addr & 0xff, ...])
                    const responseAddr = response.slice(11, 15);
                    const expectedAddr = [
                        flashAddr & 0xff,
                        (flashAddr >> 8) & 0xff,
                        (flashAddr >> 16) & 0xff,
                        (flashAddr >> 24) & 0xff
                    ];
                    
                    if (responseAddr.every((byte, index) => byte === expectedAddr[index])) {
                        // Python get_read_content(response_content): 返回response_content[15:]
                        return response.slice(15, 15 + 0x1000);
                    } else {
                        this.debug('error', `读取扇区地址不匹配: 期望[${expectedAddr.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}], 实际[${responseAddr.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                    }
                }
            } else {
                this.debug('error', `读取扇区响应格式错误: 头部匹配=${headerMatch}, 状态码=0x${response[10]?.toString(16).padStart(2, '0') || 'unknown'}`);
            }
        } else {
            this.debug('error', `读取扇区响应长度不足: ${response.length} < ${expectedLength}`);
        }
        
        return null;
    }

    /**
     * 擦除扇区 - 从参考版本移植
     */
    async eraseSector(flashAddr, flashSize) {
        const isExt = flashSize >= 256 * 1024 * 1024;
        const eraseCmd = isExt ? 0x21 : 0x20;
        
        try {
            return await this.eraseCustomSize(flashAddr, eraseCmd);
        } catch (error) {
            this.debug('error', `擦除扇区失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 自定义大小擦除 - 从工作版本直接移植
     */
    async eraseCustomSize(addr, eraseCmd) {
        // Python: FlashCustomEraseProtocol使用0x0f命令，格式：[size, addr_bytes...]
        // cmd参数：normal,4k/32k/64k->0x20/0x52/0xd8；ext,4k/32k/64k->0x21/0x5c/0xdc
        
        const payload = [
            eraseCmd,  // size命令 (0x20/0x21/0x52/0x5c/0xd8/0xdc)
            addr & 0xff,
            (addr >> 8) & 0xff,
            (addr >> 16) & 0xff,
            (addr >> 24) & 0xff
        ];
        
        // 使用BaseBootRomFlashProtocol格式：[0x01, 0xe0, 0xfc, 0xff, 0xf4, len_low, len_high, cmd, payload...]
        const payloadLength = 1 + payload.length; // cmd(0x0f) + payload(5字节)
        const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, 0x0f, ...payload];
        
        this.debug('debug', `擦除命令详情: 地址=0x${addr.toString(16).padStart(8, '0')}, 命令=0x${eraseCmd.toString(16).padStart(2, '0')}`);
        
        await this.clearBuffer();
        await this.sendCommand(command, 'EraseCustomSize');
        
        // Python: expect_length = rx_expect_length(5) = 7 + 2 + 1 + 1 + 5 = 16
        const expectedLength = 16;
        
        // Python使用0.5秒超时，这是关键！恢复Python的原始超时设置
        const timeout = 500; // Python使用0.5秒超时，不是5秒
        
        this.debug('debug', `等待擦除响应，期望长度: ${expectedLength}, 超时: ${timeout}ms`);
        const response = await this.receiveResponse(expectedLength, timeout);
        
        this.debug('debug', `擦除响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
        if (response.length >= expectedLength) {
            // Python: response_check(response_content, size_cmd, flash_addr)检查
            // 1. check_response_base_header: response_content.startswith([0x04, 0x0e, 0xff, 0x01, 0xe0, 0xfc, 0xf4])
            const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
            const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
            
            if (headerMatch) {
                this.debug('debug', '✅ 响应头部正确');
                
                // 2. check_response_length_seg: response_content[7:9] == [(len(response_content) - 9) & 0xff, ((len(response_content) - 9) >> 8) & 0xff]
                const responsePayloadLength = response.length - 9;
                const expectedLengthBytes = [responsePayloadLength & 0xFF, (responsePayloadLength >> 8) & 0xFF];
                
                if (response[7] === expectedLengthBytes[0] && response[8] === expectedLengthBytes[1]) {
                    this.debug('debug', '✅ 响应长度字段正确');
                    
                    // 3. check_response_status: response_content[10] == 0x0
                    if (response[10] === 0x00) {
                        this.debug('debug', '✅ 响应状态码正确');
                        
                        // 4. 检查命令码和参数 - Python: response_content[11:12] == bytes([size_cmd]) and response_content[12:] == bytes([flash_addr & 0xff, ...])
                        if (response[9] === 0x0f && response[11] === eraseCmd) {
                            this.debug('debug', '✅ 响应命令码正确');
                            
                            const addrBytes = [
                                addr & 0xff,
                                (addr >> 8) & 0xff,
                                (addr >> 16) & 0xff,
                                (addr >> 24) & 0xff
                            ];
                            
                            if (response.slice(12, 16).every((byte, index) => byte === addrBytes[index])) {
                                this.debug('comm', `✅ 擦除成功: 0x${addr.toString(16).padStart(8, '0')}`);
                                return;
                            } else {
                                throw new Error(`擦除响应地址不匹配: 期望[${addrBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}], 实际[${response.slice(12, 16).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);
                            }
                        } else {
                            throw new Error(`擦除响应命令码错误: 期望0x0f和0x${eraseCmd.toString(16)}, 实际0x${response[9].toString(16)}和0x${response[11].toString(16)}`);
                        }
                    } else {
                        throw new Error(`擦除操作失败，状态码: 0x${response[10].toString(16).padStart(2, '0')}`);
                    }
                } else {
                    throw new Error(`擦除响应长度字段错误: 期望[${expectedLengthBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}], 实际[0x${response[7].toString(16).padStart(2, '0')}, 0x${response[8].toString(16).padStart(2, '0')}]`);
                }
            } else {
                throw new Error(`擦除响应头部格式错误: 期望[${expectedHeader.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}], 实际[${response.slice(0, 7).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);
            }
        } else {
            // 如果响应长度为0，可能是通信问题，尝试再次检查通信状态
            if (response.length === 0) {
                this.debug('warning', '擦除命令无响应，检查通信状态...');
                if (await this.doLinkCheck()) {
                    this.debug('comm', '通信正常，可能是擦除操作超时');
                } else {
                    throw new Error('擦除后通信异常');
                }
            }
            throw new Error(`擦除响应长度不足: ${response.length} < ${expectedLength}`);
        }
    }

    /**
     * 智能擦除实现 - 完全按照参考版本逻辑
     */
    async executeSmartErase(startAddr, dataLength) {
        const eraseStartAddr = startAddr;
        const eraseEndAddr = eraseStartAddr + dataLength;
        
        this.debug('info', `擦除起始地址: 0x${eraseStartAddr.toString(16).padStart(8, '0')}`);
        this.debug('info', `擦除结束地址: 0x${eraseEndAddr.toString(16).padStart(8, '0')}`);
        
        // 地址按4K对齐
        let alignedStartAddr = eraseStartAddr;
        if (eraseStartAddr & 0xfff) {
            alignedStartAddr = Math.floor((eraseStartAddr + 0x1000) / 0x1000) * 0x1000;
        }
        
        let alignedEndAddr = eraseEndAddr;
        if (eraseEndAddr & 0xfff) {
            alignedEndAddr = Math.floor(eraseEndAddr / 0x1000) * 0x1000;
        }
        
        const eraseSize = alignedEndAddr - alignedStartAddr;
        this.debug('info', `实际擦除大小: 0x${eraseSize.toString(16)} 字节`);
        
        // 参考版本擦除逻辑: 优先使用64K块擦除，剩余部分使用4K扇区擦除
        const retry = 5;
        let eraseI = 0;
        while (eraseI < eraseSize) {
            if (this.stopFlag) break;
            
            const currentAddr = alignedStartAddr + eraseI;
            const remaining = eraseSize - eraseI;
            this.debug('debug', `擦除地址: 0x${currentAddr.toString(16).padStart(8, '0')}`);
            
            if (remaining > 0x10000) {
                // 64K块擦除
                const eraseCmd = this.internalFlashConfig && this.internalFlashConfig.size >= 256 * 1024 * 1024 ? 0xdc : 0xd8;
                
                let cnt = retry;
                let ret = false;
                while (cnt > 0 && !ret) {
                    try {
                        await this.eraseCustomSize(currentAddr, eraseCmd);
                        ret = true;
                    } catch (error) {
                        this.debug('warning', `擦除失败，剩余重试次数: ${cnt-1}, 错误: ${error.message}`);
                        cnt--;
                        if (cnt === 0) {
                            throw new Error(`擦除64K块失败: 0x${currentAddr.toString(16).padStart(8, '0')}`);
                        }
                    }
                }
                eraseI += 0x10000;
            } else {
                // 4K扇区擦除
                const eraseCmd = this.internalFlashConfig && this.internalFlashConfig.size >= 256 * 1024 * 1024 ? 0x21 : 0x20;
                
                let cnt = retry;
                let ret = false;
                while (cnt > 0 && !ret) {
                    try {
                        await this.eraseCustomSize(currentAddr, eraseCmd);
                        ret = true;
                    } catch (error) {
                        this.debug('warning', `擦除失败，剩余重试次数: ${cnt-1}, 错误: ${error.message}`);
                        cnt--;
                        if (cnt === 0) {
                            throw new Error(`擦除4K扇区失败: 0x${currentAddr.toString(16).padStart(8, '0')}`);
                        }
                    }
                }
                eraseI += 0x1000;
            }
            
            // 更新进度
            const eraseProgress = (eraseI / eraseSize) * 0.4;
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: `擦除Flash... ${Math.round(eraseProgress * 100)}%`,
                    progress: Math.round(dataLength * (0.3 + eraseProgress)),
                    total: dataLength
                });
            }
        }
    }

    /**
     * 智能写入实现 - 完全按照参考版本逻辑
     */
    async executeSmartWrite(startAddr, fileData) {
        let writeStartAddr = startAddr;
        let wbuf = new Uint8Array(fileData);
        let file_len = wbuf.length;
        
        // 256字节对齐
        if (file_len % 0x100) {
            const paddingSize = 0x100 - (file_len % 0x100);
            const paddedBuffer = new Uint8Array(file_len + paddingSize);
            paddedBuffer.set(wbuf);
            paddedBuffer.fill(0xff, file_len);
            wbuf = paddedBuffer;
            file_len = wbuf.length;
            this.debug('debug', `数据256字节对齐: ${fileData.length} -> ${file_len}`);
        }
        
        const end_addr = writeStartAddr + file_len;
        const flash_size = this.internalFlashConfig ? this.internalFlashConfig.size : 4 * 1024 * 1024;
        
        this.debug('debug', `write flash ${writeStartAddr.toString(16).padStart(8, '0')}(${file_len})`);
        
        // 起始地址对齐检查和处理
        if (writeStartAddr & 0xfff) {
            this.debug('debug', "write align start ...");
            if (!await this.alignSectorAddressForWrite(writeStartAddr, true, wbuf, flash_size)) {
                throw new Error(`Align start address ${writeStartAddr.toString(16).padStart(8, '0')} fail.`);
            }
            const skipBytes = (0x1000 - writeStartAddr & 0xfff);
            wbuf = wbuf.slice(skipBytes);
            writeStartAddr = Math.floor((writeStartAddr + 0x1000) / 0x1000) * 0x1000;
            file_len = wbuf.length;
        }
        
        // 结束地址对齐检查和处理
        if (end_addr & 0xfff) {
            this.debug('debug', "write align end ...");
            if (!await this.alignSectorAddressForWrite(end_addr, false, wbuf, flash_size)) {
                throw new Error(`Align end address ${end_addr.toString(16).padStart(8, '0')} fail.`);
            }
            const trimBytes = end_addr & 0xfff;
            wbuf = wbuf.slice(0, wbuf.length - trimBytes);
            file_len = wbuf.length;
        }
        
        this.debug('info', `最终写入起始地址: 0x${writeStartAddr.toString(16).padStart(8, '0')}`);
        this.debug('info', `最终写入数据长度: ${file_len} 字节`);
        
        // 写入主循环
        let writeI = 0;
        while (writeI < file_len) {
            if (this.stopFlag) break;
            
            const currentAddr = writeI + writeStartAddr;
            this.debug('debug', `write at ${currentAddr.toString(16).padStart(8, '0')} ...`);
            
            const sectorData = wbuf.slice(writeI, writeI + 0x1000);
            if (!this.isBufferAllFF(sectorData)) {
                if (!await this.writeAndCheckSector(sectorData, currentAddr, flash_size)) {
                    this.debug('warning', `Retry write at ${currentAddr.toString(16).padStart(8, '0')}`);
                    
                    if (!await this.retryWriteSector(currentAddr, sectorData, flash_size, 5)) {
                        throw new Error(`Error write at ${currentAddr.toString(16).padStart(8, '0')}`);
                    }
                }
            }
            
            writeI += 0x1000;
            
            // 更新进度
            const writeProgress = (writeI / file_len) * 0.2;
            if (this.onProgress) {
                this.onProgress({ 
                    stage: 'downloading', 
                    message: `写入固件... ${Math.round(writeProgress * 100)}%`,
                    progress: Math.round(fileData.length * (0.7 + writeProgress)),
                    total: fileData.length
                });
            }
        }
    }

    // ==================== 关键方法直接实现 ====================
    // 从工作版本third_party/web_serial/downloaders/t5ai-downloader.js精确移植

    /**
     * 清空接收缓冲区 - 从工作版本移植
     */
    async clearBuffer() {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            let totalCleared = 0;
            
            // 增加清理时间和循环次数，确保缓冲区完全清空
            for (let i = 0; i < 50; i++) { // 最多尝试50次
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 10)) // 增加到10ms
                ]);
                
                if (done || !value || value.length === 0) {
                    // 连续3次没有数据才认为清理完成
                    if (i >= 3) break;
                    continue;
                }
                
                totalCleared += value.length;
                this.debug('debug', `清理缓冲区: ${value.length}字节 (累计${totalCleared}字节)`);
            }
            
            if (totalCleared > 0) {
                this.debug('debug', `缓冲区清理完成: 总共清理${totalCleared}字节`);
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
     * 发送命令 - 从工作版本移植
     */
    async sendCommand(command, commandName) {
        this.debug('comm', `执行协议: ${commandName}`);
        this.debug('comm', `发送${commandName}`);
        this.debug('debug', `发送${commandName}: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
        
        let writer = null;
        const maxRetries = 3;
        
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                writer = this.port.writable.getWriter();
                await writer.write(new Uint8Array(command));
                
                // 发送成功，稍微等待让数据发送完成
                await new Promise(resolve => setTimeout(resolve, 1));
                return; // 成功发送，退出
                
            } catch (error) {
                this.debug('debug', `发送${commandName}失败（第${retry + 1}次尝试）: ${error.message}`);
                
                if (this.isPortDisconnectionError(error)) {
                    throw new Error('设备连接已断开，请检查USB连接后重试');
                }
                
                if (retry === maxRetries - 1) {
                    throw new Error(`发送${commandName}失败: ${error.message}`);
                }
                
                // 重试前等待一下
                await new Promise(resolve => setTimeout(resolve, 10));
                
            } finally {
                if (writer) {
                    try { writer.releaseLock(); } catch (e) {}
                    writer = null;
                }
            }
        }
    }

    /**
     * 接收响应 - 从工作版本移植
     */
    async receiveResponse(expectedLength, timeout = 100) {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const responseBuffer = [];
            const startTime = Date.now();
            
            this.debug('debug', `开始接收响应，期望长度: ${expectedLength}字节，超时: ${timeout}ms`);
            
            // 增强的读取循环，处理Web Serial API的异步特性
            while (responseBuffer.length < expectedLength) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = timeout - elapsedTime;
                
                if (remainingTime <= 0) {
                    this.debug('debug', `接收超时: 已用时${elapsedTime}ms，接收${responseBuffer.length}/${expectedLength}字节`);
                    break;
                }
                
                try {
                    // 使用动态超时，但不超过剩余时间
                    const readTimeout = Math.min(remainingTime, 20); // 最多20ms一次读取
                    const readPromise = reader.read();
                    const timeoutPromise = new Promise(resolve => 
                        setTimeout(() => resolve({ done: true, timedOut: true }), readTimeout)
                    );
                    
                    const result = await Promise.race([readPromise, timeoutPromise]);
                    
                    if (result.timedOut) {
                        // 单次读取超时，继续下一次尝试
                        continue;
                    }
                    
                    if (result.done) {
                        // 流结束，短暂等待后继续尝试
                        await new Promise(resolve => setTimeout(resolve, 1));
                        continue;
                    }
                    
                    if (result.value && result.value.length > 0) {
                        responseBuffer.push(...result.value);
                        this.debug('debug', `接收数据: ${Array.from(result.value).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')} (累计${responseBuffer.length}/${expectedLength}字节)`);
                        
                        // Python逻辑：收到期望长度立即返回
                        if (responseBuffer.length >= expectedLength) {
                            this.debug('debug', `接收响应完成: ${responseBuffer.length}字节`);
                            break;
                        }
                    } else {
                        // 没有数据，短暂等待
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                } catch (error) {
                    // 检查是否为串口异常断开
                    if (this.isPortDisconnectionError(error)) {
                        throw new Error('设备连接已断开，请检查USB连接后重试');
                    }
                    this.debug('debug', `读取错误: ${error.message}`);
                    // 遇到错误时短暂等待后继续尝试
                    await new Promise(resolve => setTimeout(resolve, 2));
                }
            }
            
            if (responseBuffer.length === 0) {
                this.debug('debug', '接收到响应: ');
            }
            
            return responseBuffer;
        } catch (error) {
            this.debug('debug', `接收响应异常: ${error.message}`);
            throw new Error(`接收响应失败: ${error.message}`);
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 检查是否为串口断开错误 - 从工作版本移植
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
     * 获取总线控制权 - 从工作版本移植
     */
    async getBusControl() {
        this.debug('main', '=== 步骤1: 获取总线控制权 ===');
        this.debug('info', '📡 执行链路检查...');
        
        const maxTryCount = 100; // 与工作版本保持一致
        for (let attempt = 1; attempt <= maxTryCount && !this.stopFlag; attempt++) {
            this.debug('comm', `🔄 总线控制权尝试 ${attempt}/${maxTryCount}`);
            
            // 复位设备 - 与工作版本do_reset一致，增强时序控制
            try {
                await this.port.setSignals({ dataTerminalReady: false, requestToSend: true });
                await new Promise(resolve => setTimeout(resolve, 300)); // Python: time.sleep(0.3)
                await this.port.setSignals({ dataTerminalReady: false, requestToSend: false });
                await new Promise(resolve => setTimeout(resolve, 10)); // 增加等待时间到10ms，确保复位完成
                
                this.debug('debug', `复位设备完成，第${attempt}次尝试`);
            } catch (error) {
                this.debug('debug', `复位设备失败: ${error.message}`);
                continue; // 复位失败继续下一次尝试
            }
            
            // do_link_check_ex - 与工作版本一致，最多60次
            const linkCheckSuccess = await this.doLinkCheckEx(60);
            if (linkCheckSuccess) {
                this.debug('main', `✅ 第${attempt}次尝试成功获取总线控制权`);
                return true;
            }
            
            // 添加失败后的短暂延迟，避免过快重试
            if (attempt < maxTryCount) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        this.debug('error', '连接失败: 链路检查失败，已重试100次。请检查设备连接和波特率设置。');
        return false;
    }

    /**
     * do_link_check_ex - 从工作版本移植
     */
    async doLinkCheckEx(maxTryCount = 60) {
        this.debug('debug', `开始链路检查，最多尝试${maxTryCount}次`);
        
        for (let cnt = 0; cnt < maxTryCount && !this.stopFlag; cnt++) {
            try {
                // 每次都完全清理缓冲区
                await this.clearBuffer();
                
                // 发送LinkCheck命令
                await this.sendCommand([0x01, 0xE0, 0xFC, 0x01, 0x00], 'LinkCheckProtocol');
                
                // Web Serial环境下需要更长的超时时间，从1ms增加到50ms
                const response = await this.receiveResponse(8, 50);
                
                this.debug('debug', `链路检查第${cnt + 1}次，接收到${response.length}字节`);
                
                if (response.length >= 8) {
                    const r = response.slice(0, 8);
                    this.debug('debug', `响应数据: ${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    // 验证响应格式：04 0E 05 01 E0 FC 01 00
                    if (r[0] === 0x04 && r[1] === 0x0E && r[2] === 0x05 && 
                        r[3] === 0x01 && r[4] === 0xE0 && r[5] === 0xFC && 
                        r[6] === 0x01 && r[7] === 0x00) {
                        this.debug('debug', `✅ 链路检查成功，第${cnt + 1}次尝试`);
                        return true;
                    } else {
                        this.debug('debug', `链路检查失败，重试 ${cnt + 1}/${maxTryCount}: LinkCheckProtocol 响应检查失败`);
                    }
                } else {
                    this.debug('debug', `链路检查失败，重试 ${cnt + 1}/${maxTryCount}: 接收到响应长度不足`);
                }
                
                // Python版本中的微小延迟，让设备有时间响应
                await new Promise(resolve => setTimeout(resolve, 1));
                
            } catch (error) {
                this.debug('debug', `链路检查第${cnt + 1}次异常: ${error.message}`);
                // 即使有异常也继续尝试
            }
        }
        
        this.debug('debug', `链路检查失败，已重试${maxTryCount}次`);
        return false;
    }

    /**
     * 链路检查 - 从工作版本移植
     */
    async doLinkCheck() {
        try {
            // 清空缓冲区
            await this.clearBuffer();
            
            // 发送LinkCheck命令
            const command = [0x01, 0xE0, 0xFC, 0x01, 0x00];
            await this.sendCommand(command, 'LinkCheck');
            
            // 接收响应
            const response = await this.receiveResponse(8, 100);
            
            if (response.length >= 8) {
                if (response[0] === 0x04 && response[1] === 0x0E &&
                    response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC &&
                    response[6] === 0x01 && response[7] === 0x00) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * 设置波特率 - 从工作版本移植
     */
    async setBaudrate(baudrate, delayMs = 20) {
        this.debug('info', `设置波特率为: ${baudrate} bps`);
        this.debug('comm', `正在设置波特率: ${baudrate} bps`);
        
        // 使用BaseBootRomProtocol格式生成SetBaudrate命令
        const payload = [
            baudrate & 0xFF,
            (baudrate >> 8) & 0xFF,
            (baudrate >> 16) & 0xFF,
            (baudrate >> 24) & 0xFF,
            delayMs & 0xFF
        ];
        const command = [0x01, 0xE0, 0xFC, 1 + payload.length, 0x0F, ...payload];
        
        await this.clearBuffer();
        await this.sendCommand(command, 'SetBaudrate');
        
        // Python逻辑: time.sleep(delay_ms/2000)
        await new Promise(resolve => setTimeout(resolve, delayMs / 2));
        
        // 重新配置串口波特率
        this.debug('debug', '重新配置串口波特率...');
        await this.port.close();
        await this.port.open({
            baudRate: baudrate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        });
        
        // 期望响应长度: rx_expect_length(5) = len([0x04, 0x0e]) + 1 + len([0x01, 0xe0, 0xfc]) + 1 + 5 = 2 + 1 + 3 + 1 + 5 = 12
        const response = await this.receiveResponse(12, delayMs + 500);
        
        if (response.length >= 12) {
            this.debug('debug', `波特率设置响应: ${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
            
            if (response[0] === 0x04 && response[1] === 0x0E) {
                this.debug('debug', '✅ 响应头部正确');
                
                // 检查长度字段
                const expectedLength = response.length - 3;
                if (response[2] === expectedLength) {
                    this.debug('debug', '✅ 响应长度正确');
                    
                    // 检查TX头部
                    if (response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC) {
                        this.debug('debug', '✅ TX头部正确');
                        
                        // 检查命令码 (位置6应该是0x0F)
                        if (response[6] === 0x0F) {
                            this.debug('debug', '✅ 命令码正确');
                            
                            // 检查返回的波特率 (位置7-10)
                            const returnedBaudrate = response[7] | (response[8] << 8) | (response[9] << 16) | (response[10] << 24);
                            
                            if (returnedBaudrate === baudrate) {
                                this.debug('info', `✅ 波特率设置成功: ${baudrate} bps`);
                                this.currentBaudrate = baudrate; // 记录当前波特率
                                return true;
                            } else {
                                this.debug('warning', `波特率不匹配: 期望${baudrate}, 实际${returnedBaudrate}`);
                            }
                        } else {
                            this.debug('error', `命令码错误: 期望0x0F, 实际0x${response[6].toString(16).padStart(2, '0')}`);
                        }
                    } else {
                        this.debug('error', `TX头部错误: 期望[01 E0 FC], 实际[${response.slice(3, 6).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
                    }
                } else {
                    this.debug('error', `响应长度错误: 期望${expectedLength}, 实际${response[2]}`);
                }
            } else {
                this.debug('error', `响应头部错误: 期望[04 0E], 实际[${response.slice(0, 2).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]`);
            }
        }
        
        // 如果响应检查失败，尝试LinkCheck验证连接
        this.debug('debug', '波特率响应不完整，尝试LinkCheck验证...');
        if (await this.doLinkCheck()) {
            this.debug('info', `✅ 波特率设置成功: ${baudrate} bps (通过LinkCheck验证)`);
            this.currentBaudrate = baudrate; // 记录当前波特率
            return true;
        }
        
        throw new Error('设置波特率失败');
    }

    /**
     * Flash解保护 - 从工作版本移植
     */
    async unprotectFlash() {
        this.debug('info', 'Flash解保护操作...');
        
        // 波特率切换后，先测试通信是否正常
        this.debug('debug', '波特率切换后测试通信...');
        await this.clearBuffer();
        
        // 发送LinkCheck确认通信正常
        if (await this.doLinkCheck()) {
            this.debug('info', '✅ 高速通信正常');
        } else {
            this.debug('warning', '高速通信测试失败，继续尝试Flash操作...');
        }
        
        // Python逻辑: unprotect_flash()
        const unprotectRegVal = [0, 0];
        const mask = [124, 64]; // 0x7c, 0x40
        
        this.debug('debug', `解保护目标值: [${unprotectRegVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        this.debug('debug', `解保护掩码: [${mask.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // Python: reg_val = self._read_flash_status_reg_val()
        const regVal = await this.readFlashStatusRegVal();
        this.debug('debug', `读取到状态寄存器值: [${regVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // Python: if self.compare_register_value(reg_val, unprotect_reg_val, mask):
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
            
            // Python: write_val = unprotect_reg_val
            const writeVal = [...unprotectRegVal];
            for (let i = 0; i < writeVal.length; i++) {
                const invertedMask = mask[i] ^ 0xff;
                const preserved = regVal[i] & invertedMask;
                writeVal[i] = writeVal[i] | preserved;
                this.debug('debug', `计算写入值${i}: 目标=0x${unprotectRegVal[i].toString(16).padStart(2, '0')}, 反掩码=0x${invertedMask.toString(16).padStart(2, '0')}, 保留位=0x${preserved.toString(16).padStart(2, '0')}, 最终写入=0x${writeVal[i].toString(16).padStart(2, '0')}`);
            }
            this.debug('debug', `计算写入值: [${writeVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
            
            // Python: self._write_flash_status_reg_val(write_val)
            await this.writeFlashStatusRegVal(writeVal);
            
            // Python: reg_val = self._read_flash_status_reg_val()
            const newRegVal = await this.readFlashStatusRegVal();
            this.debug('debug', `写入后状态寄存器值: [${newRegVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
            
            // Python: if self.compare_register_value(reg_val, unprotect_reg_val, mask):
            if (this.compareRegisterValue(newRegVal, unprotectRegVal, mask)) {
                this.debug('info', '✅ Flash解保护成功');
                return true;
            } else {
                // 详细显示验证失败的原因
                for (let i = 0; i < newRegVal.length && i < unprotectRegVal.length && i < mask.length; i++) {
                    const srcMasked = newRegVal[i] & mask[i];
                    const destMasked = unprotectRegVal[i] & mask[i];
                    this.debug('error', `验证失败 - 寄存器${i}: 写入后值=0x${newRegVal[i].toString(16).padStart(2, '0')}, 掩码=0x${mask[i].toString(16).padStart(2, '0')}, 实际&掩码=0x${srcMasked.toString(16).padStart(2, '0')}, 期望&掩码=0x${destMasked.toString(16).padStart(2, '0')}`);
                }
                throw new Error('Flash解保护失败：写入后验证不通过');
            }
        }
    }

    /**
     * Flash保护 - 从工作版本移植
     */
    async protectFlash() {
        this.debug('info', 'Flash保护操作...');
        
        // Python逻辑: protect_flash()
        const protectRegVal = [124, 64]; // 0x7c, 0x40
        const mask = [124, 64]; // 0x7c, 0x40
        
        this.debug('debug', `保护目标值: [${protectRegVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        this.debug('debug', `保护掩码: [${mask.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // 读取当前状态
        const regVal = await this.readFlashStatusRegVal();
        this.debug('debug', `读取到状态寄存器值: [${regVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        // 检查是否已经保护
        if (this.compareRegisterValue(regVal, protectRegVal, mask)) {
            this.debug('info', '✅ Flash已经保护');
            return true;
        } else {
            this.debug('info', 'Flash需要保护，计算写入值...');
            
            // 计算写入值
            const writeVal = [...protectRegVal];
            for (let i = 0; i < writeVal.length; i++) {
                const invertedMask = mask[i] ^ 0xff;
                const preserved = regVal[i] & invertedMask;
                writeVal[i] = writeVal[i] | preserved;
                this.debug('debug', `计算写入值${i}: 目标=0x${protectRegVal[i].toString(16).padStart(2, '0')}, 反掩码=0x${invertedMask.toString(16).padStart(2, '0')}, 保留位=0x${preserved.toString(16).padStart(2, '0')}, 最终写入=0x${writeVal[i].toString(16).padStart(2, '0')}`);
            }
            
            // 写入状态寄存器
            await this.writeFlashStatusRegVal(writeVal);
            
            // 验证写入结果
            const newRegVal = await this.readFlashStatusRegVal();
            this.debug('debug', `写入后状态寄存器值: [${newRegVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
            
            if (this.compareRegisterValue(newRegVal, protectRegVal, mask)) {
                this.debug('info', '✅ Flash保护成功');
                return true;
            } else {
                throw new Error('Flash保护失败：写入后验证不通过');
            }
        }
    }

    /**
     * 读取Flash状态寄存器值 - 从工作版本移植
     */
    async readFlashStatusRegVal(retry = 5) {
        // Python: read_reg_code = [5, 53]
        const readRegCode = [5, 53];
        const srVal = [];
        
        this.debug('debug', `开始读取Flash状态寄存器，寄存器代码: [${readRegCode.join(', ')}]`);
        
        for (let regIndex = 0; regIndex < readRegCode.length; regIndex++) {
            const tmpReg = readRegCode[regIndex];
            let tmpVal = null;
            
            this.debug('debug', `读取寄存器${tmpReg}...`);
            
            for (let retryCount = 0; retryCount < retry; retryCount++) {
                try {
                    // Python: frsp.cmd(tmp_reg) - FlashReadSRProtocol
                    // cmd格式: command_generate(0x0c, [reg_addr])
                    const payload = [tmpReg];
                    const payloadLength = 1 + payload.length;
                    const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, 0x0c, ...payload];
                    
                    this.debug('debug', `发送读取寄存器${tmpReg}命令: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    await this.clearBuffer();
                    await this.sendCommand(command, `ReadFlashSR-${tmpReg}`);
                    
                    // Python: frsp.expect_length = rx_expect_length(2) = 7 + 2 + 1 + 1 + 2 = 13
                    const expectedLength = 13;
                    const response = await this.receiveResponse(expectedLength, 100);
                    
                    this.debug('debug', `读取寄存器${tmpReg}响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    if (response.length >= expectedLength) {
                        // Python: frsp.response_check(content, tmp_reg) and frsp.get_status_regist_val(content)
                        const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
                        const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
                        
                        if (headerMatch) {
                            this.debug('debug', `✅ 寄存器${tmpReg}响应头部正确`);
                            
                            // 检查状态码 (位置10)
                            if (response[10] === 0x00) {
                                this.debug('debug', `✅ 寄存器${tmpReg}状态码正确`);
                                
                                // 检查寄存器地址回显 (位置11)
                                if (response[11] === tmpReg) {
                                    // Python: get_status_regist_val(response_content): return response_content[12]
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
                        this.debug('warning', `读取寄存器${tmpReg}响应长度不足: ${response.length} < ${expectedLength}，重试...`);
                    }
                } catch (error) {
                    // 检查是否为串口异常断开
                    if (this.isPortDisconnectionError(error)) {
                        throw new Error('设备连接已断开，请检查USB连接后重试');
                    }
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
     * 写入Flash状态寄存器值 - 从工作版本移植
     */
    async writeFlashStatusRegVal(writeVal, retry = 5) {
        // Python: write_reg_code = [1, 49]
        const writeRegCode = [1, 49];
        
        this.debug('debug', `开始写入Flash状态寄存器，寄存器代码: [${writeRegCode.join(', ')}], 写入值: [${writeVal.map(v => '0x' + v.toString(16).padStart(2, '0')).join(', ')}]`);
        
        if (writeRegCode.length === 1) {
            // 单寄存器写入
            let tmpRes = false;
            const regAddr = writeRegCode[0];
            
            this.debug('debug', `单寄存器写入模式: 寄存器${regAddr}`);
            
            for (let retryCount = 0; retryCount < retry; retryCount++) {
                try {
                    // Python: fwsp.cmd(write_reg_code[0], write_val) - FlashWriteSRProtocol
                    // cmd格式: command_generate(0x0d, [reg_addr] + val)
                    const payload = [regAddr, ...writeVal];
                    const payloadLength = 1 + payload.length;
                    const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, 0x0d, ...payload];
                    
                    this.debug('debug', `发送写入寄存器${regAddr}命令: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    await this.clearBuffer();
                    await this.sendCommand(command, `WriteFlashSR-${regAddr}`);
                    
                    // Python: fwsp.expect_length(len(write_val)) = rx_expect_length(1 + len(write_val))
                    const expectedLength = 7 + 2 + 1 + 1 + (1 + writeVal.length);
                    const response = await this.receiveResponse(expectedLength, 100);
                    
                    this.debug('debug', `写入寄存器${regAddr}响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                    
                    if (response.length >= expectedLength) {
                        // Python: fwsp.response_check(content, write_reg_code[0])
                        const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
                        const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
                        
                        if (headerMatch && response[10] === 0x00 && response[11] === regAddr) {
                            tmpRes = true;
                            this.debug('debug', `✅ 写入寄存器${regAddr}成功`);
                            break;
                        } else {
                            this.debug('warning', `写入寄存器${regAddr}响应格式错误，重试...`);
                        }
                    } else {
                        this.debug('warning', `写入寄存器${regAddr}响应长度不足: ${response.length} < ${expectedLength}，重试...`);
                    }
                } catch (error) {
                    // 检查是否为串口异常断开
                    if (this.isPortDisconnectionError(error)) {
                        throw new Error('设备连接已断开，请检查USB连接后重试');
                    }
                    this.debug('warning', `写入寄存器${regAddr}失败: ${error.message}，重试...`);
                }
                
                if (!tmpRes) {
                    await new Promise(resolve => setTimeout(resolve, 10)); // Python: time.sleep(0.01)
                }
            }
            
            if (!tmpRes) {
                throw new Error('写入Flash状态寄存器失败');
            }
        } else {
            // 多寄存器分别写入
            this.debug('debug', `多寄存器写入模式: ${writeRegCode.length}个寄存器`);
            
            for (let idx = 0; idx < writeRegCode.length; idx++) {
                let tmpRes = false;
                const regAddr = writeRegCode[idx];
                const regVal = [writeVal[idx]];
                
                this.debug('debug', `写入寄存器${regAddr}: 0x${regVal[0].toString(16).padStart(2, '0')}`);
                
                for (let retryCount = 0; retryCount < retry; retryCount++) {
                    try {
                        // Python: fwsp.cmd(write_reg_code[idx], [write_val[idx]])
                        const payload = [regAddr, ...regVal];
                        const payloadLength = 1 + payload.length;
                        const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, 0x0d, ...payload];
                        
                        this.debug('debug', `发送写入寄存器${regAddr}命令: ${command.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                        
                        await this.clearBuffer();
                        await this.sendCommand(command, `WriteFlashSR-${regAddr}`);
                        
                        // Python: fwsp.expect_length(1) = rx_expect_length(1 + 1)
                        const expectedLength = 7 + 2 + 1 + 1 + 2;
                        const response = await this.receiveResponse(expectedLength, 100);
                        
                        this.debug('debug', `写入寄存器${regAddr}响应: 长度=${response.length}, 数据=${response.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                        
                        if (response.length >= expectedLength) {
                            const expectedHeader = [0x04, 0x0E, 0xFF, 0x01, 0xE0, 0xFC, 0xF4];
                            const headerMatch = expectedHeader.every((byte, index) => response[index] === byte);
                            
                            if (headerMatch && response[10] === 0x00 && response[11] === regAddr) {
                                tmpRes = true;
                                this.debug('debug', `✅ 写入寄存器${regAddr}成功: 0x${regVal[0].toString(16).padStart(2, '0')}`);
                                break;
                            } else {
                                this.debug('warning', `写入寄存器${regAddr}响应格式错误，重试...`);
                            }
                        } else {
                            this.debug('warning', `写入寄存器${regAddr}响应长度不足: ${response.length} < ${expectedLength}，重试...`);
                        }
                    } catch (error) {
                        // 检查是否为串口异常断开
                        if (this.isPortDisconnectionError(error)) {
                            throw new Error('设备连接已断开，请检查USB连接后重试');
                        }
                        this.debug('warning', `写入寄存器${regAddr}失败: ${error.message}，重试...`);
                    }
                    
                    if (!tmpRes) {
                        await new Promise(resolve => setTimeout(resolve, 10)); // Python: time.sleep(0.01)
                    }
                }
                
                if (!tmpRes) {
                    throw new Error(`写入Flash状态寄存器${regAddr}失败`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 10)); // Python: time.sleep(0.01)
            }
        }
        
        this.debug('debug', `Flash状态寄存器写入完成`);
    }

    /**
     * 比较寄存器值 - 从工作版本移植
     */
    compareRegisterValue(src, dest, mask) {
        // Python逻辑：检查src[i] & mask[i] == dest[i] & mask[i]
        for (let i = 0; i < src.length && i < dest.length && i < mask.length; i++) {
            if ((src[i] & mask[i]) !== (dest[i] & mask[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * 重启设备 - 从工作版本移植
     */
    async reboot() {
        this.debug('info', '重启设备...');
        
        try {
            // Python: RebootProtocol使用BaseBootRomProtocol格式
            // command_generate(0x05) = [0x01, 0xe0, 0xfc, 0x01, 0x05]
            const command = [0x01, 0xE0, 0xFC, 0x01, 0x05];
            
            await this.clearBuffer();
            await this.sendCommand(command, 'Reboot');
            
            // 重启命令通常不会有响应，短暂等待让设备重启
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.debug('info', '✅ 设备重启命令已发送');
            return true;
        } catch (error) {
            this.debug('warning', `重启设备失败: ${error.message}`);
            // 重启失败不抛出错误，因为设备可能已经重启
            return false;
        }
    }

    /**
     * 连接设备 - 直接使用内部方法，不依赖外部组件
     */
    async connect() {
        this.debug('main', `正在连接 ${this.chipName}...`);
        
        try {
            this.stopFlag = false;
            
            // 1. 获取总线控制权（包含复位和链路检查）
            const busControlResult = await this.getBusControl();
            if (!busControlResult) {
                throw new Error('链路检查失败，已重试100次。请检查设备连接和波特率设置。');
            }
            
            // 2. 获取芯片ID
            await this.getChipId();
            
            // 3. 获取Flash ID
            await this.getFlashId();
            
            // 4. 从内置数据库查找Flash配置
            if (this.flashId && this.flashDatabase[this.flashId]) {
                this.internalFlashConfig = this.flashDatabase[this.flashId];
                this.debug('info', `Flash型号: ${this.internalFlashConfig.manufacturer} ${this.internalFlashConfig.name} (${this.internalFlashConfig.size / 1048576}MB)`);
            } else {
                this.debug('warning', `未知Flash ID: 0x${this.flashId ? this.flashId.toString(16).toUpperCase().padStart(6, '0') : 'NULL'}`);
                // 使用默认配置
                this.internalFlashConfig = { 
                    name: 'Unknown', 
                    manufacturer: 'Unknown', 
                    size: 4 * 1024 * 1024 
                };
            }
            
            this.debug('main', `✅ ${this.chipName} 连接成功`);
            this.debug('info', `芯片ID: 0x${this.chipId ? this.chipId.toString(16).toUpperCase().padStart(8, '0') : 'NULL'}`);
            this.debug('info', `Flash ID: 0x${this.flashId ? this.flashId.toString(16).toUpperCase().padStart(6, '0') : 'NULL'}`);
            
            return {
                success: true,
                chipId: this.chipId,
                flashId: this.flashId,
                flashInfo: this.internalFlashConfig,
                baudrate: this.currentBaudrate
            };
            
        } catch (error) {
            this.debug('error', `连接失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取芯片ID - 从工作版本移植
     */
    async getChipId() {
        this.debug('main', '=== 步骤2: 获取芯片ID ===');
        this.debug('comm', '正在获取芯片ID...');
        
        const command = [0x01, 0xE0, 0xFC, 0x05, 0x03, 0x04, 0x00, 0x01, 0x44];
        
        await this.clearBuffer();
        await this.sendCommand(command, 'GetChipId');
        
        const response = await this.receiveResponse(15, 500); // Python使用0.5秒超时
        if (response.length >= 15) {
            const r = response.slice(0, 15);
            this.debug('debug', `完整响应: ${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
            
            if (r[0] === 0x04 && r[1] === 0x0E && r[3] === 0x01 && 
                r[4] === 0xE0 && r[5] === 0xFC && r[6] === 0x03) {
                
                const chipIdBytes = r.slice(-4);
                const chipId = chipIdBytes[0] | (chipIdBytes[1] << 8) | (chipIdBytes[2] << 16) | (chipIdBytes[3] << 24);
                
                this.debug('main', `✅ 芯片ID: 0x${chipId.toString(16).toUpperCase().padStart(8, '0')}`);
                this.chipId = chipId;
                return chipId;
            }
        }
        
        throw new Error('获取芯片ID失败');
    }

    /**
     * 获取Flash ID - 从工作版本移植
     */
    async getFlashId() {
        this.debug('main', '=== 步骤3: 获取Flash ID ===');
        this.debug('comm', '正在获取Flash ID...');
        
        // 使用正确的Flash协议格式：[0x01, 0xE0, 0xFC, 0xFF, 0xF4, payload_length_low, payload_length_high, cmd, reg_addr, 0, 0, 0]
        // 其中: payload_length = 5 (cmd + 4字节地址), cmd = 0x0e, reg_addr = 0x9f
        const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, 0x05, 0x00, 0x0e, 0x9f, 0x00, 0x00, 0x00];
        
        await this.clearBuffer();
        await this.sendCommand(command, 'FlashGetMID');
        
        // 期望响应格式：[0x04, 0x0e, 0xff, 0x01, 0xe0, 0xfc, 0xf4, len_low, len_high, cmd, status, flash_id_bytes...]
        // 最少响应长度：11字节（基础头部） + 4字节（Flash ID数据）= 15字节
        const response = await this.receiveResponse(15); // 使用默认超时时间100ms
        if (response.length >= 11) {
            const r = response;
            this.debug('debug', `完整响应: ${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
            
            // 检查基本Flash协议格式：04 0E FF 01 E0 FC F4
            if (r[0] === 0x04 && r[1] === 0x0E && r[2] === 0xFF && 
                r[3] === 0x01 && r[4] === 0xE0 && r[5] === 0xFC && r[6] === 0xF4) {
                
                // 检查命令响应 (位置9应该是0x0e)
                if (r[9] === 0x0e) {
                    // 检查状态码 (位置10)
                    const status = r[10];
                    this.debug('debug', `状态码: 0x${status.toString(16).padStart(2, '0').toUpperCase()}`);
                    
                    if (status === 0x00) {
                        // 状态正常，提取Flash ID - 完全按照Python逻辑
                        if (response.length >= 15) {
                            // Python代码: struct.unpack("<I", response_content[11:])[0] >> 8
                            // 从位置11开始取4字节，小端序解析为32位整数，然后右移8位
                            const flashIdData = response.slice(11, 15);
                            this.debug('debug', `Flash ID原始数据: ${flashIdData.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                            
                            // 小端序解析为32位整数
                            const flashId32 = flashIdData[0] | (flashIdData[1] << 8) | (flashIdData[2] << 16) | (flashIdData[3] << 24);
                            this.debug('debug', `32位整数 (小端序): 0x${flashId32.toString(16).toUpperCase().padStart(8, '0')}`);
                            
                            // 右移8位得到最终Flash ID
                            const flashId = flashId32 >>> 8;
                            this.debug('debug', `Flash ID (右移8位): 0x${flashId.toString(16).toUpperCase().padStart(6, '0')}`);
                            
                            // 查找数据库中的配置
                            const config = this.flashDatabase[flashId];
                            
                            this.flashId = flashId;
                            this.internalFlashConfig = config;
                            
                            if (config) {
                                this.debug('info', `✅ 识别Flash: ${config.manufacturer} ${config.name} (${config.size / 1048576}MB)`);
                                return { flashId, config };
                            } else {
                                this.debug('warning', `⚠️ 未知Flash ID: 0x${flashId.toString(16).toUpperCase().padStart(6, '0')}`);
                                return { flashId, config: null };
                            }
                        } else {
                            throw new Error(`响应长度不足，期望15字节，实际${response.length}字节`);
                        }
                    } else {
                        // 状态码错误，查找错误信息
                        const statusInfo = [
                            { code: 0x0, desc: 'normal' },
                            { code: 0x1, desc: 'FLASH_STATUS_BUSY' },
                            { code: 0x2, desc: 'spi timeout' },
                            { code: 0x3, desc: 'flash operate timeout' },
                            { code: 0x4, desc: 'package payload length error' },
                            { code: 0x5, desc: 'package length error' },
                            { code: 0x6, desc: 'flash operate PARAM_ERROR' },
                            { code: 0x7, desc: 'unknown cmd' },
                        ];
                        
                        const errorInfo = statusInfo.find(info => info.code === status);
                        const errorDesc = errorInfo ? errorInfo.desc : `未知错误码 0x${status.toString(16)}`;
                        throw new Error(`Flash操作失败: ${errorDesc} (状态码: 0x${status.toString(16).padStart(2, '0').toUpperCase()})`);
                    }
                } else {
                    throw new Error(`命令响应码错误，期望0x0e，实际0x${r[9].toString(16).padStart(2, '0').toUpperCase()}`);
                }
            } else {
                throw new Error(`Flash协议头部格式错误`);
            }
        } else {
            throw new Error(`响应长度不足，期望至少11字节，实际${response.length}字节`);
        }
    }
}

// 确保类在全局范围内可用
if (typeof window !== 'undefined') {
    window.T5DownloaderV2 = T5DownloaderV2;
}

// Node.js导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5DownloaderV2;
}