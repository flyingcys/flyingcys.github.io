/**
 * T5AI Downloader - Modular Version
 * T5芯片固件下载器 - 模块化版本
 * 
 * 这是重构后的模块化版本，保持与原版本完全相同的API和功能
 */

import { T5SerialHandler } from './t5ai/core/t5-serial-handler.js';
import { T5ConnectionManager } from './t5ai/core/t5-connection-manager.js';
import { T5FlashOperations } from './t5ai/core/t5-flash-operations.js';
import { T5FlashConfig } from './t5ai/configs/t5-flash-config.js';
import { T5ProtocolFactory } from './t5ai/protocols/t5-protocols.js';
import { DataProcessor, Logger, ErrorHandler } from './t5ai/utils/t5-utils.js';

/**
 * T5AI下载器主类
 */
class T5AIDownloader {
    constructor() {
        this.port = null;
        this.serialHandler = null;
        this.connectionManager = null;
        this.flashOperations = null;
        this.flashConfig = null;
        
        // 状态信息
        this.isConnected = false;
        this.chipId = null;
        this.flashId = null;
        this.flashSize = 0;
        
        // 配置
        this.config = {
            defaultBaudrate: 115200,
            downloadBaudrate: 2000000,
            maxRetries: 3,
            timeouts: {
                connect: 5000,
                download: 30000,
                erase: 10000
            }
        };
        
        Logger.info('T5AI下载器初始化完成');
    }

    /**
     * 连接设备
     */
    async connect(port) {
        try {
            Logger.info('开始连接T5设备...');
            
            this.port = port;
            
            // 初始化各个模块
            this.serialHandler = new T5SerialHandler(port);
            this.connectionManager = new T5ConnectionManager(this.serialHandler);
            this.flashConfig = new T5FlashConfig(this.serialHandler);
            this.flashOperations = new T5FlashOperations(this.serialHandler, this.flashConfig);
            
            // 连接设备
            const connectResult = await this.connectionManager.connect();
            
            // 更新状态
            this.isConnected = true;
            this.chipId = connectResult.chipId;
            this.flashId = connectResult.flashId;
            
            // 获取Flash大小
            const flashConfig = this.flashConfig.getFlashConfig(this.flashId);
            this.flashSize = flashConfig ? flashConfig.size : 0;
            
            Logger.info(`设备连接成功: 芯片ID=0x${this.chipId.toString(16)}, Flash ID=0x${this.flashId.toString(16)}, Flash大小=${DataProcessor.formatBytes(this.flashSize)}`);
            
            return {
                success: true,
                chipId: this.chipId,
                flashId: this.flashId,
                flashSize: this.flashSize,
                message: '设备连接成功'
            };
        } catch (error) {
            Logger.error('设备连接失败:', error.message);
            await this.disconnect();
            throw ErrorHandler.createDetailedError('设备连接', error);
        }
    }

    /**
     * 断开连接
     */
    async disconnect() {
        try {
            if (this.connectionManager) {
                await this.connectionManager.disconnect();
            }
            
            this.isConnected = false;
            this.chipId = null;
            this.flashId = null;
            this.flashSize = 0;
            
            // 清理模块引用
            this.serialHandler = null;
            this.connectionManager = null;
            this.flashOperations = null;
            this.flashConfig = null;
            this.port = null;
            
            Logger.info('设备连接已断开');
        } catch (error) {
            Logger.warn('断开连接时出现警告:', error.message);
        }
    }

    /**
     * 下载固件
     */
    async downloadFirmware(firmwareData, options = {}) {
        if (!this.isConnected) {
            throw new Error('设备未连接');
        }
        
        const {
            startAddress = 0x0,
            baudrate = this.config.downloadBaudrate,
            eraseBeforeWrite = true,
            verifyAfterWrite = true,
            protectAfterWrite = true,
            rebootAfterWrite = true,
            progressCallback = null
        } = options;
        
        Logger.info(`开始下载固件: 大小=${DataProcessor.formatBytes(firmwareData.length)}, 起始地址=0x${startAddress.toString(16)}`);
        
        let originalBaudrate = this.serialHandler.getCurrentBaudrate();
        
        try {
            // 设置下载波特率
            if (baudrate !== originalBaudrate) {
                await this.setBaudrate(baudrate);
            }
            
            // 擦除Flash
            if (eraseBeforeWrite) {
                await this.flashOperations.eraseFlash(
                    startAddress,
                    firmwareData.length,
                    progressCallback
                );
            }
            
            // 写入固件
            await this.flashOperations.writeFlash(
                startAddress,
                firmwareData,
                progressCallback
            );
            
            // 校验固件
            if (verifyAfterWrite) {
                const expectedCrc = this.flashOperations.crcCalculator.calculateCRC(firmwareData);
                await this.flashOperations.checkCrcVer2(
                    startAddress,
                    firmwareData.length,
                    expectedCrc
                );
            }
            
            // Flash保护
            if (protectAfterWrite) {
                await this.flashOperations.protectFlash(this.flashId);
            }
            
            // 重启设备
            if (rebootAfterWrite) {
                await this.reboot();
            }
            
            Logger.info('固件下载完成');
            
            return {
                success: true,
                downloadedSize: firmwareData.length,
                message: '固件下载成功'
            };
        } catch (error) {
            Logger.error('固件下载失败:', error.message);
            throw ErrorHandler.createDetailedError('固件下载', error, {
                firmwareSize: firmwareData.length,
                startAddress,
                options
            });
        } finally {
            // 恢复原始波特率
            try {
                if (this.serialHandler && this.serialHandler.getCurrentBaudrate() !== originalBaudrate) {
                    await this.setBaudrate(originalBaudrate);
                }
            } catch (resetError) {
                Logger.warn('恢复波特率失败:', resetError.message);
            }
        }
    }

    /**
     * 设置波特率
     */
    async setBaudrate(baudrate) {
        if (!this.isConnected) {
            throw new Error('设备未连接');
        }
        
        try {
            await this.connectionManager.setBaudrate(baudrate);
            Logger.debug(`波特率设置为: ${baudrate}`);
        } catch (error) {
            throw ErrorHandler.createDetailedError('设置波特率', error, { baudrate });
        }
    }

    /**
     * 读取Flash
     */
    async readFlash(startAddress, size, progressCallback = null) {
        if (!this.isConnected) {
            throw new Error('设备未连接');
        }
        
        try {
            return await this.flashOperations.readFlash(startAddress, size, progressCallback);
        } catch (error) {
            throw ErrorHandler.createDetailedError('读取Flash', error, {
                startAddress,
                size
            });
        }
    }

    /**
     * 擦除Flash
     */
    async eraseFlash(startAddress, size, progressCallback = null) {
        if (!this.isConnected) {
            throw new Error('设备未连接');
        }
        
        try {
            return await this.flashOperations.eraseFlash(startAddress, size, progressCallback);
        } catch (error) {
            throw ErrorHandler.createDetailedError('擦除Flash', error, {
                startAddress,
                size
            });
        }
    }

    /**
     * CRC校验
     */
    async crcCheck(startAddress, size, expectedCrc = null) {
        if (!this.isConnected) {
            throw new Error('设备未连接');
        }
        
        try {
            return await this.flashOperations.checkCrcVer2(startAddress, size, expectedCrc);
        } catch (error) {
            throw ErrorHandler.createDetailedError('CRC校验', error, {
                startAddress,
                size,
                expectedCrc
            });
        }
    }

    /**
     * 重启设备
     */
    async reboot() {
        if (!this.isConnected) {
            throw new Error('设备未连接');
        }
        
        try {
            const protocol = T5ProtocolFactory.createProtocol('reboot');
            const cmd = protocol.cmd();
            
            await this.serialHandler.sendCommand(cmd);
            
            // 等待设备重启
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            Logger.info('设备重启命令已发送');
        } catch (error) {
            throw ErrorHandler.createDetailedError('设备重启', error);
        }
    }

    /**
     * 获取设备状态
     */
    getDeviceStatus() {
        return {
            isConnected: this.isConnected,
            chipId: this.chipId,
            flashId: this.flashId,
            flashSize: this.flashSize,
            currentBaudrate: this.serialHandler ? this.serialHandler.getCurrentBaudrate() : null,
            connectionInfo: this.connectionManager ? this.connectionManager.getConnectionStatus() : null
        };
    }

    /**
     * 获取Flash信息
     */
    getFlashInfo() {
        if (!this.flashId) {
            return null;
        }
        
        const config = this.flashConfig.getFlashConfig(this.flashId);
        return config ? {
            id: this.flashId,
            name: config.name,
            size: config.size,
            sizeFormatted: DataProcessor.formatBytes(config.size)
        } : null;
    }

    /**
     * 获取支持的Flash芯片列表
     */
    getSupportedFlashChips() {
        return this.flashConfig ? this.flashConfig.getSupportedFlashChips() : [];
    }

    /**
     * 检查连接状态
     */
    async checkConnection() {
        if (!this.isConnected || !this.connectionManager) {
            return false;
        }
        
        try {
            return await this.connectionManager.checkConnection();
        } catch (error) {
            return false;
        }
    }

    /**
     * 重置连接
     */
    async reset() {
        try {
            if (this.serialHandler) {
                await this.serialHandler.reset();
            }
            
            Logger.info('连接已重置');
        } catch (error) {
            throw ErrorHandler.createDetailedError('重置连接', error);
        }
    }

    /**
     * 获取用户配置的波特率
     */
    getUserConfiguredBaudrate() {
        return this.config.downloadBaudrate;
    }

    /**
     * 设置用户配置的波特率
     */
    setUserConfiguredBaudrate(baudrate) {
        this.config.downloadBaudrate = baudrate;
    }

    /**
     * 获取版本信息
     */
    getVersion() {
        return {
            version: '2.0.0-modular',
            description: 'T5AI Downloader - Modular Version',
            author: 'T5AI Team',
            buildDate: new Date().toISOString()
        };
    }
}

// 为了保持向后兼容性，导出原始类名
class T5aiDownloader extends T5AIDownloader {
    constructor() {
        super();
        Logger.warn('T5aiDownloader类名已弃用，请使用T5AIDownloader');
    }
}

// 导出类
export { T5AIDownloader, T5aiDownloader };

// 默认导出
export default T5AIDownloader;