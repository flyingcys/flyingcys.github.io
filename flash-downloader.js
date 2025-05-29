/**
 * 通用固件下载器
 * 基于Web Serial API实现的多芯片固件烧录工具
 * 使用下载器管理器来支持不同的芯片类型
 */

// 导入T5下载器 (如果在模块环境中)
if (typeof T5Downloader === 'undefined' && typeof require !== 'undefined') {
    try {
        window.T5Downloader = require('./t5ai-downloader.js');
    } catch (e) {
        // T5下载器不可用，将只支持BK7231N
        console.warn('T5Downloader not available, only BK7231N support enabled');
    }
}

class FlashDownloader {
    constructor(serialTerminal, options = {}) {
        this.terminal = serialTerminal;
        this.debugEnabled = options.debug !== false;
        this.onProgress = options.onProgress || null;
        
        // 下载状态
        this.isDownloading = false;
        this.shouldStop = false;
        
        // 当前使用的芯片下载器实例
        this.chipDownloader = null;
        this.currentChip = null;
    }

    /**
     * 启用调试输出
     */
    enableDebug() {
        this.debugEnabled = true;
    }

    /**
     * 禁用调试输出
     */
    disableDebug() {
        this.debugEnabled = false;
    }

    /**
     * 主流程日志输出（总是显示）
     */
    mainLog(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
        
        // 发送主流程信息
        if (this.onProgress) {
            this.onProgress({
                type: 'log',
                level: level,
                message: message,
                timestamp: timestamp,
                isMainProcess: true
            });
        }
    }

    /**
     * 调试日志输出（仅在调试模式下显示）
     */
    debugLog(message, data = null, level = 'debug') {
        if (!this.debugEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`, data || '');
        
        // 发送调试信息
        if (this.onProgress) {
            this.onProgress({
                type: 'log',
                level: level,
                message: message,
                data: data,
                timestamp: timestamp,
                isMainProcess: false
            });
        }
    }

    /**
     * 设置进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * 开始固件下载
     */
    async downloadBinary(fileData, device = 'T5AI', startAddr = 0x00) {
        // 检查下载器管理器是否可用
        if (typeof window.downloaderManager === 'undefined') {
            throw new Error(i18n.t('downloader_manager_not_initialized'));
        }

        // 检查设备是否支持
        if (!window.downloaderManager.isChipSupported(device)) {
            throw new Error(i18n.t('unsupported_device_type', device));
        }

        this.isDownloading = true;
        this.shouldStop = false;
        this.currentChip = device;
        
        try {
            const startTime = Date.now();
            this.mainLog(i18n.t('starting_device_download', device, fileData.length));
            
            await this.downloadChipFirmware(fileData, device, startAddr, startTime);
            
            const duration = Date.now() - startTime;
            this.mainLog(i18n.t('firmware_download_completed_time', (duration / 1000).toFixed(2)));
                
        } catch (error) {
            this.mainLog(i18n.t('download_failed', error.message), 'error');
            throw error;
        } finally {
            this.isDownloading = false;
        }
    }

    /**
     * 芯片固件下载实现
     */
    async downloadChipFirmware(fileData, device, startAddr, startTime) {
        this.mainLog(i18n.t('initializing_downloader', device));
        
        // 检查串口连接状态
        if (!this.terminal.flashPort || !this.terminal.isFlashConnected) {
            throw new Error(i18n.t('serial_not_connected_connect_first'));
        }
        
        // 临时释放SerialTerminal的reader/writer，让芯片下载器获取独占访问权
        if (this.terminal.flashReader) {
            await this.terminal.flashReader.releaseLock();
            this.terminal.flashReader = null;
        }
        if (this.terminal.flashWriter) {
            await this.terminal.flashWriter.releaseLock();
            this.terminal.flashWriter = null;
        }
        
        // 使用下载器管理器创建芯片下载器实例
        this.chipDownloader = await window.downloaderManager.createDownloader(
            device, 
            this.terminal.flashPort, 
            (level, message, data) => {
                if (level === 'main') {
                    this.mainLog(message, 'info');
                } else {
                    this.debugLog(message, data, level);
                }
            }
        );
        
        // 设置芯片下载器的调试状态
        this.chipDownloader.setDebugMode(this.debugEnabled);
        
        // 设置进度回调
        this.chipDownloader.setProgressCallback((progress) => {
            if (this.onProgress) {
                this.onProgress({
                    type: 'progress',
                    ...progress
                });
            }
        });
            
        try {
            // 芯片下载器内部会处理连接
            this.mainLog(i18n.t('connecting_device', device));
            if (!await this.chipDownloader.connect()) {
                throw new Error(i18n.t('cannot_connect_device', device));
            }

            // 开始固件下载
            this.mainLog(i18n.t('downloading_firmware_to_device', device));
            await this.chipDownloader.downloadFirmware(fileData, startAddr);
            
            this.mainLog(i18n.t('device_firmware_download_completed', device));
            
            if (this.onProgress) {
                this.onProgress({
                    type: 'completed',
                    message: i18n.t('download_complete')
                });
            }
        } finally {
            // 关键修复：确保无论下载成功还是失败，都重置波特率到115200
            try {
                if (this.chipDownloader && this.chipDownloader.setBaudrate) {
                    this.debugLog(i18n.t('flashdownloader_reset_baudrate'), null, 'info');
                    await this.chipDownloader.setBaudrate(115200);
                    this.debugLog(i18n.t('flashdownloader_baudrate_reset_success'), null, 'info');
                }
            } catch (resetError) {
                this.debugLog(i18n.t('flashdownloader_reset_failed'), resetError.message, 'warning');
                // 尝试直接重新配置串口
                try {
                    if (this.terminal.flashPort && this.terminal.isFlashConnected) {
                        await this.terminal.flashPort.close();
                        await this.terminal.flashPort.open({
                            baudRate: 115200,
                            dataBits: 8,
                            stopBits: 1,
                            parity: 'none'
                        });
                        this.debugLog(i18n.t('flashdownloader_direct_reset_success'), null, 'info');
                    }
                } catch (directResetError) {
                    this.debugLog(i18n.t('flashdownloader_direct_reset_failed'), directResetError.message, 'warning');
                }
            }
            
            // 下载完成后，恢复SerialTerminal的reader/writer
            if (this.terminal.flashPort && this.terminal.isFlashConnected) {
                try {
                    this.terminal.flashReader = this.terminal.flashPort.readable.getReader();
                    this.terminal.flashWriter = this.terminal.flashPort.writable.getWriter();
                } catch (error) {
                    this.debugLog(i18n.t('restoring_serial_reader_writer_failed'), error.message, 'warning');
                }
            }
        }
    }

    /**
     * 停止下载
     */
    stop() {
        this.shouldStop = true;
        if (this.chipDownloader) {
            this.chipDownloader.stop();
        }
        this.mainLog('下载已停止', 'warning');
    }

    /**
     * 获取下载状态
     */
    isActive() {
        return this.isDownloading;
    }

    /**
     * 清理资源
     */
    async cleanup() {
        // 关键修复：清理时也重置波特率到115200
        try {
            if (this.chipDownloader && this.chipDownloader.setBaudrate) {
                this.debugLog(i18n.t('cleanup_reset_baudrate'), null, 'info');
                await this.chipDownloader.setBaudrate(115200);
                this.debugLog(i18n.t('cleanup_baudrate_reset_success'), null, 'info');
            }
        } catch (resetError) {
            this.debugLog(i18n.t('cleanup_reset_failed'), resetError.message, 'warning');
        }
        
        if (this.chipDownloader) {
            await this.chipDownloader.disconnect();
            this.chipDownloader = null;
        }
        this.isDownloading = false;
        this.shouldStop = false;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashDownloader;
}