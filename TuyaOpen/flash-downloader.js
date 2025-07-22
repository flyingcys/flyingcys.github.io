/**
 * 通用固件下载器
 * 基于Web Serial API实现的多芯片固件烧录工具
 * 使用下载器管理器来支持不同的芯片类型
 */

// 导入T5下载器 (如果在模块环境中)
if (typeof T5Downloader === 'undefined' && typeof require !== 'undefined') {
    try {
        window.T5Downloader = require('./t5ai/t5ai-downloader.js');
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
        
        // 完全释放SerialTerminal的reader/writer，并等待锁定完全解除
        await this.completelyReleaseStreams();
        
        // 等待一段时间确保流锁定完全解除
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 验证流状态
        const streamStatus = this.verifyStreamAvailability();
        if (!streamStatus.available) {
            throw new Error(`无法获取串口流控制权: ${streamStatus.reason}`);
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
            
            // 增强ESP32设备特殊处理
            let connectionResult = false;
            try {
                connectionResult = await this.chipDownloader.connect();
            } catch (connectError) {
                // 检查是否是ESP32设备
                if (device.includes('ESP32')) {
                    this.debugLog('ESP32设备连接失败，提供额外指导...', connectError.message, 'warning');
                    
                    // 检查是否是流锁定问题
                    if (connectError.message.includes('ReadableStreamDefaultReader') || 
                        connectError.message.includes('locked')) {
                        this.mainLog(`
ESP32设备流锁定冲突，尝试自动修复:
- 正在重新初始化串口连接...
- 如果仍然失败，请刷新页面重新连接
                        `.trim(), 'warning');
                        
                        // 尝试完全重新初始化串口连接
                        await this.attemptStreamRecovery();
                        
                        // 再次尝试连接
                        connectionResult = await this.chipDownloader.connect();
                    } else {
                        this.mainLog(`
ESP32设备连接提示: 
- 确保设备处于下载模式（按住BOOT键并按一下RST键）
- 检查USB连接是否牢固
- 确认设备驱动已正确安装（CP210x/CH340/FTDI）
- 确保其他应用程序未占用串口
                        `.trim(), 'warning');
                        
                        // 重新尝试一次连接
                        this.mainLog('正在重新尝试连接ESP32设备...', 'info');
                        connectionResult = await this.chipDownloader.connect();
                    }
                } else {
                    // 其他设备直接抛出错误
                    throw connectError;
                }
            }
            
            // 检查连接结果
            if (!connectionResult) {
                throw new Error(i18n.t('cannot_connect_device', device));
            }

            // 开始固件下载
            this.mainLog(i18n.t('downloading_firmware_to_device', device));
            try {
            await this.chipDownloader.downloadFirmware(fileData, startAddr);
            
            this.mainLog(i18n.t('device_firmware_download_completed', device));
            
            if (this.onProgress) {
                this.onProgress({
                    type: 'completed',
                    message: i18n.t('download_complete')
                });
                }
            } catch (downloadError) {
                // 处理ESP32特定的下载错误
                if (device.includes('ESP32')) {
                    const errorMsg = downloadError.message || '';
                    
                    // 更友好的错误消息翻译
                    if (errorMsg.includes('Cannot read properties of undefined')) {
                        throw new Error('ESP32设备通信失败: 设备可能未处于下载模式或未正确连接');
                    } else if (errorMsg.includes('timeout')) {
                        throw new Error('ESP32设备通信超时: 请检查连接或重启设备');
                    } else {
                        throw downloadError; // 其他错误直接抛出
                    }
                } else {
                    throw downloadError; // 非ESP32设备直接抛出错误
                }
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
            
            // 下载完成后，智能恢复SerialTerminal的reader/writer
            await this.intelligentRestore();
        }
    }

    /**
     * 完全释放串口流
     */
    async completelyReleaseStreams() {
        this.debugLog('正在完全释放串口流...', null, 'info');
        
        try {
            // 释放现有的reader
            if (this.terminal.flashReader) {
                await this.terminal.flashReader.releaseLock();
                this.terminal.flashReader = null;
                this.debugLog('已释放 flashReader', null, 'debug');
            }
            
            // 释放现有的writer
            if (this.terminal.flashWriter) {
                await this.terminal.flashWriter.releaseLock();
                this.terminal.flashWriter = null;
                this.debugLog('已释放 flashWriter', null, 'debug');
            }
            
            // 等待锁定完全解除
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.debugLog('串口流释放完成', null, 'info');
        } catch (error) {
            this.debugLog(`释放串口流时出错: ${error.message}`, null, 'warning');
            // 继续执行，不抛出错误
        }
    }

    /**
     * 验证流可用性
     */
    verifyStreamAvailability() {
        try {
            if (!this.terminal.flashPort) {
                return { available: false, reason: '串口未连接' };
            }
            
            if (!this.terminal.flashPort.readable) {
                return { available: false, reason: '可读流不可用' };
            }
            
            if (!this.terminal.flashPort.writable) {
                return { available: false, reason: '可写流不可用' };
            }
            
            if (this.terminal.flashPort.readable.locked) {
                return { available: false, reason: '可读流被锁定' };
            }
            
            if (this.terminal.flashPort.writable.locked) {
                return { available: false, reason: '可写流被锁定' };
            }
            
            return { available: true, reason: '流状态正常' };
        } catch (error) {
            return { available: false, reason: `检查失败: ${error.message}` };
        }
    }

    /**
     * 尝试流恢复
     */
    async attemptStreamRecovery() {
        this.debugLog('尝试进行流恢复...', null, 'info');
        
        try {
            // 强制等待更长时间
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 如果仍然锁定，尝试重新连接串口
            const streamStatus = this.verifyStreamAvailability();
            if (!streamStatus.available) {
                this.debugLog(`流仍不可用: ${streamStatus.reason}，尝试重新连接...`, null, 'warning');
                
                // 重新打开串口连接
                if (this.terminal.flashPort) {
                    await this.terminal.flashPort.close();
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await this.terminal.flashPort.open({
                        baudRate: 115200,
                        dataBits: 8,
                        stopBits: 1,
                        parity: 'none'
                    });
                    this.debugLog('串口重新连接完成', null, 'info');
                }
            }
        } catch (error) {
            this.debugLog(`流恢复失败: ${error.message}`, null, 'error');
            throw new Error(`无法恢复串口流状态，请刷新页面重新连接: ${error.message}`);
        }
    }

    /**
     * 智能恢复SerialTerminal的reader/writer
     */
    async intelligentRestore() {
        this.debugLog('开始智能恢复串口读写器...', null, 'info');
        
        if (this.terminal.flashPort && this.terminal.isFlashConnected) {
            try {
                // 等待芯片下载器完全释放资源
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // 多次尝试恢复
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        const streamStatus = this.verifyStreamAvailability();
                        if (!streamStatus.available) {
                            this.debugLog(`第${attempt}次尝试 - 流不可用: ${streamStatus.reason}`, null, 'debug');
                            if (attempt < 3) {
                                await new Promise(resolve => setTimeout(resolve, 300));
                                continue;
                            } else {
                                throw new Error(streamStatus.reason);
                            }
                        }
                        
                        // 恢复reader
                        if (!this.terminal.flashReader && this.terminal.flashPort.readable) {
                            this.terminal.flashReader = this.terminal.flashPort.readable.getReader();
                            this.debugLog('成功恢复 flashReader', null, 'debug');
                        }
                        
                        // 恢复writer
                        if (!this.terminal.flashWriter && this.terminal.flashPort.writable) {
                            this.terminal.flashWriter = this.terminal.flashPort.writable.getWriter();
                            this.debugLog('成功恢复 flashWriter', null, 'debug');
                        }
                        
                        this.debugLog(`第${attempt}次尝试成功 - 串口读写器恢复完成`, null, 'info');
                        break;
                        
                    } catch (error) {
                        this.debugLog(`第${attempt}次恢复尝试失败: ${error.message}`, null, 'warning');
                        if (attempt === 3) {
                            // 最后一次尝试失败，记录警告但不阻止程序继续
                            this.debugLog('⚠️ 所有恢复尝试都失败，串口可能需要手动重新连接', null, 'warning');
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 400));
                        }
                    }
                }
            } catch (error) {
                this.debugLog('智能恢复过程发生错误: ' + error.message, null, 'warning');
            }
        }
    }

    /**
     * 停止下载
     */
    stop() {
        this.shouldStop = true;
        this.mainLog('用户取消下载', 'warning');
        
        // 停止芯片下载器
        if (this.chipDownloader) {
            try {
                this.chipDownloader.stop();
                this.debugLog('已通知芯片下载器停止', null, 'info');
            } catch (error) {
                this.debugLog('停止芯片下载器时发生错误: ' + error.message, null, 'warning');
            }
        }
        
        // 注意：不在这里调用cleanup，因为cleanup会在finally块或stopFlashDownload中调用
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
        this.debugLog('开始清理下载器资源...', null, 'info');
        
        // 设置停止标志
        this.shouldStop = true;
        
        try {
            // 首先尝试通过芯片下载器重置波特率（在清理之前）
            let baudrateResetSuccess = false;
            if (this.chipDownloader && typeof this.chipDownloader.setBaudrate === 'function') {
                try {
                    this.debugLog('通过芯片下载器重置波特率到115200...', null, 'info');
                    await this.chipDownloader.setBaudrate(115200);
                    this.debugLog('芯片下载器波特率重置成功', null, 'info');
                    baudrateResetSuccess = true;
                } catch (resetError) {
                    this.debugLog('芯片下载器波特率重置失败: ' + resetError.message, null, 'warning');
                }
            }
            
            // 清理芯片下载器
            if (this.chipDownloader) {
                try {
                    this.debugLog('正在清理芯片下载器...', null, 'info');
                    
                    // 调用芯片下载器的断开方法
                    if (typeof this.chipDownloader.disconnect === 'function') {
                        await this.chipDownloader.disconnect();
                        this.debugLog('芯片下载器已断开', null, 'info');
                    }
                } catch (error) {
                    this.debugLog('清理芯片下载器时出错: ' + error.message, null, 'warning');
                }
                
                // 清理完成后设为null
                this.chipDownloader = null;
            }
            
            // 如果芯片下载器波特率重置失败，尝试其他方式
            if (!baudrateResetSuccess && this.terminal.isFlashConnected && this.terminal.flashPort) {
                try {
                    this.debugLog('正在通过其他方式重置串口波特率...', null, 'info');
                    
                    // 通过串口管理器重置波特率（如果可用）
                    if (this.terminal.eventBus) {
                        this.terminal.eventBus.emit('flash:reset-baudrate', 115200);
                        this.debugLog('已请求串口管理器重置波特率', null, 'info');
                    } else {
                        this.debugLog('注意：无法重置波特率，串口保持当前状态', null, 'warning');
                    }
                } catch (resetError) {
                    this.debugLog('重置波特率时发生错误: ' + resetError.message, null, 'warning');
                }
            }
            
            // 确保reader和writer可用 - 添加流状态检查
            if (this.terminal.isFlashConnected && this.terminal.flashPort) {
                try {
                    // 等待一段时间确保所有异步操作完成
                    await new Promise(resolve => setTimeout(resolve, 150));
                    
                    // 检查流状态
                    const readableAvailable = this.terminal.flashPort.readable && !this.terminal.flashPort.readable.locked;
                    const writableAvailable = this.terminal.flashPort.writable && !this.terminal.flashPort.writable.locked;
                    
                    this.debugLog(`流状态检查: readable=${readableAvailable}, writable=${writableAvailable}`, null, 'debug');
                    
                    // 重新获取reader（如果需要且可用）
                    if (!this.terminal.flashReader && readableAvailable) {
                        this.terminal.flashReader = this.terminal.flashPort.readable.getReader();
                        this.debugLog('重新获取串口读取器成功', null, 'info');
                    }
                    
                    // 重新获取writer（如果需要且可用）
                    if (!this.terminal.flashWriter && writableAvailable) {
                        this.terminal.flashWriter = this.terminal.flashPort.writable.getWriter();
                        this.debugLog('重新获取串口写入器成功', null, 'info');
                    }
                    
                    if (this.terminal.flashReader && this.terminal.flashWriter) {
                        this.debugLog('串口连接状态已完全恢复', null, 'info');
                    } else {
                        this.debugLog('⚠️ 串口连接状态部分恢复，某些流可能仍被锁定', null, 'warning');
                    }
                    
                } catch (readerWriterError) {
                    this.debugLog('重新获取读写器时发生错误: ' + readerWriterError.message, null, 'warning');
                    
                    // 如果是流被锁定的错误，提供更具体的指导
                    if (readerWriterError.message.includes('locked') || 
                        readerWriterError.message.includes('ReadableStreamDefaultReader')) {
                        this.debugLog('⚠️ 检测到流锁定问题，建议刷新页面重新连接', null, 'warning');
                    }
                }
            }
            
        } catch (error) {
            this.debugLog('清理资源时发生未预期的错误: ' + error.message, null, 'error');
        }
        
        // 重置状态
        this.isDownloading = false;
        this.shouldStop = false;
        this.currentChip = null;
        
        this.debugLog('下载器资源清理完成，串口连接已保持', null, 'info');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashDownloader;
}