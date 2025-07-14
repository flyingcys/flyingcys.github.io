/**
 * T5AI芯片下载器 - 重构版本V2
 * 基于模块化架构的简化实现
 * 将原2322行的单文件拆分为多个专用模块
 */

class T5DownloaderV2 extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        this.chipName = 'T5AI';
        this.version = 'v2.0';
        
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
    }

    /**
     * 初始化下载器组件
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        this.debug('main', '初始化T5下载器组件...');

        // 1. 初始化协议实例
        this.protocols = {
            linkCheck: new LinkCheckProtocol(),
            getChipId: new GetChipIdProtocol(),
            getFlashMid: new GetFlashMidProtocol(),
            setBaudrate: new SetBaudrateProtocol(),
            flashReadSR: new FlashReadSRProtocol(),
            flashWriteSR: new FlashWriteSRProtocol(),
            flashErase4k: new FlashErase4kProtocol(),
            flashErase4kExt: new FlashErase4kExtProtocol(),
            flashCustomErase: new FlashCustomEraseProtocol(),
            flashRead4k: new FlashRead4kProtocol(),
            flashRead4kExt: new FlashRead4kExtProtocol(),
            flashWrite4k: new FlashWrite4kProtocol(),
            flashWrite4kExt: new FlashWrite4kExtProtocol(),
            checkCrc: new CheckCrcProtocol(),
            checkCrcExt: new CheckCrcExtProtocol(),
            reboot: new RebootProtocol(),
            stayRom: new StayRomProtocol(),
            flashEraseAll: new FlashEraseAllProtocol(),
            getBootVersion: new GetBootVersionProtocol(),
            reset: new ResetProtocol(),
            writeReg: new WriteRegProtocol()
        };
        
        // 启用协议调试模式
        Object.values(this.protocols).forEach(protocol => {
            protocol.setDebugMode(true);
        });

        // 2. 初始化Flash配置系统
        this.flashConfig = new T5FlashConfig();
        this.flashConfig.setDebugMode(true);
        
        // 3. 初始化串口处理器
        this.serialHandler = new T5SerialHandler(this.port, this.debug.bind(this));
        
        // 4. 初始化连接管理器
        this.connectionManager = new T5ConnectionManager(
            this.serialHandler, 
            this.protocols, 
            this.flashConfig, 
            this.debug.bind(this)
        );
        
        // 5. 初始化Flash操作管理器
        this.flashOperations = new T5FlashOperations(
            this.serialHandler, 
            this.protocols, 
            this.flashConfig, 
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
     * 下载固件主流程
     */
    async downloadFirmware(fileData, startAddr = 0x10000) {
        this.debug('main', `开始下载固件到 ${this.chipName}，文件大小: ${fileData.length} 字节`);
        
        try {
            // 确保已初始化
            await this.initialize();
            
            // 1. 连接设备（如果未连接）
            if (!this.connectionManager.getConnectionStatus().isConnected) {
                await this.connect();
            }
            
            // 2. 擦除Flash
            this.debug('main', '开始擦除Flash...');
            await this.flashOperations.eraseFlash(startAddr, fileData.length);
            
            // 3. 写入固件
            this.debug('main', '开始写入固件...');
            await this.flashOperations.writeFlash(startAddr, fileData);
            
            // 4. CRC校验
            this.debug('main', '开始CRC校验...');
            const crcResult = await this.flashOperations.crcCheck(startAddr, fileData);
            if (!crcResult.success) {
                throw new Error(`CRC校验失败: ${crcResult.error}`);
            }
            
            // 5. 重启设备
            this.debug('main', '重启设备...');
            await this.connectionManager.reboot();
            
            this.debug('main', '✅ 固件下载完成!');
            return { success: true };
            
        } catch (error) {
            this.debug('error', `下载失败: ${error.message}`);
            return { success: false, error: error.message };
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
     * 获取配置信息（用于调试）
     */
    getConfig() {
        return this.flashConfig ? this.flashConfig.getFullConfig() : null;
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