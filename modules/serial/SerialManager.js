/**
 * 串口管理模块
 * 负责串口连接、断开、配置管理
 */
class SerialManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // 串口调试相关状态
        this.serialPort = null;
        this.serialReader = null;
        this.serialWriter = null;
        this.isSerialConnected = false;
        
        // 固件下载相关状态
        this.flashPort = null;
        this.flashReader = null;
        this.flashWriter = null;
        this.isFlashConnected = false;
        
        // 配置
        this.deviceConfig = window.DEVICE_BAUDRATE_CONFIG || {
            'custom': { baudrate: 115200, readonly: false },
            'T5AI': { baudrate: 460800, readonly: true },
            'T3': { baudrate: 460800, readonly: true },
            'T2': { baudrate: 115200, readonly: true },
            'ESP32': { baudrate: 115200, readonly: true },
            'ESP32C3': { baudrate: 115200, readonly: true },
            'ESP32S3': { baudrate: 115200, readonly: true },
            'BK7231N': { baudrate: 115200, readonly: true },
            'LN882H': { baudrate: 921600, readonly: true }
        };
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 监听连接请求
        this.eventBus.on('serial:connect-request', (config) => {
            this.connectSerial(config);
        });
        
        this.eventBus.on('serial:disconnect-request', () => {
            this.disconnectSerial();
        });
        
        this.eventBus.on('flash:connect', (config) => {
            this.connectFlash(config);
        });
        
        this.eventBus.on('flash:disconnect', () => {
            this.disconnectFlash();
        });
        
        this.eventBus.on('flash:connect-independent-request', (config) => {
            this.connectFlashIndependent(config);
        });
        
        this.eventBus.on('flash:disconnect-independent-request', () => {
            this.disconnectFlashIndependent();
        });
        
        // 监听FlashDownloader的连接请求（新增）
        this.eventBus.on('flash:connect-request', (baudrate) => {
            this.connectFlash(baudrate);
        });
        
        this.eventBus.on('flash:disconnect-request', () => {
            this.disconnectFlash();
        });
        
        // 监听波特率重置请求（新增）
        this.eventBus.on('flash:reset-baudrate', async (baudrate) => {
            await this.resetFlashBaudrate(baudrate);
        });

        // 监听数据发送请求
        this.eventBus.on('serial:send', (data) => {
            this.sendSerialData(data);
        });
        
        // 监听设备配置变更
        this.eventBus.on('device:config-changed', (device) => {
            this.updateDeviceConfig(device);
        });
    }
    
    /**
     * 串口调试连接
     */
    async connectSerial(config = null) {
        try {
            // 请求串口访问权限
            this.serialPort = await navigator.serial.requestPort();

            // 获取串口配置
            const options = config || this.getDefaultSerialOptions();

            // 打开串口
            await this.serialPort.open(options);

            // 设置读写器
            this.serialReader = this.serialPort.readable.getReader();
            this.serialWriter = this.serialPort.writable.getWriter();

            this.isSerialConnected = true;

            // 开始读取数据
            this.startSerialReading();

            this.eventBus.emit('serial:connected', {
                config: options,
                port: this.serialPort
            });

        } catch (error) {
            this.eventBus.emit('error', {
                type: 'serial_connect_failed',
                message: `串口调试连接失败: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 串口调试断开连接
     */
    async disconnectSerial() {
        try {
            // 停止读取
            if (this.serialReader) {
                await this.serialReader.cancel();
                await this.serialReader.releaseLock();
                this.serialReader = null;
            }

            // 关闭写入器
            if (this.serialWriter) {
                await this.serialWriter.releaseLock();
                this.serialWriter = null;
            }

            // 关闭串口
            if (this.serialPort) {
                await this.serialPort.close();
                this.serialPort = null;
            }

            this.isSerialConnected = false;
            
            this.eventBus.emit('serial:disconnected');

        } catch (error) {
            this.eventBus.emit('error', {
                type: 'serial_disconnect_failed',
                message: `串口调试断开连接失败: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 固件下载连接串口
     */
    async connectFlash(baudrate = 115200) {
        try {
            // 如果没有请求过端口，则请求串口访问权限
            if (!this.flashPort) {
                this.flashPort = await navigator.serial.requestPort();
            }

            // 固件下载必须先用115200连接
            const initialOptions = {
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            };

            // 打开串口
            await this.flashPort.open(initialOptions);

            // 设置读写器
            this.flashReader = this.flashPort.readable.getReader();
            this.flashWriter = this.flashPort.writable.getWriter();

            this.isFlashConnected = true;
            
            this.eventBus.emit('flash:connected', {
                config: initialOptions,
                requestedBaudrate: baudrate,
                port: this.flashPort,
                reader: this.flashReader,
                writer: this.flashWriter
            });
            
            return { reader: this.flashReader, writer: this.flashWriter, port: this.flashPort };

        } catch (error) {
            this.eventBus.emit('error', {
                type: 'flash_connect_failed',
                message: `固件下载连接失败: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 固件下载断开连接
     */
    async disconnectFlash() {
        try {
            // 停止读取
            if (this.flashReader) {
                await this.flashReader.cancel();
                await this.flashReader.releaseLock();
                this.flashReader = null;
            }

            // 关闭写入器
            if (this.flashWriter) {
                await this.flashWriter.releaseLock();
                this.flashWriter = null;
            }

            // 关闭串口
            if (this.flashPort) {
                await this.flashPort.close();
                this.flashPort = null;
            }

            this.isFlashConnected = false;
            
            this.eventBus.emit('flash:disconnected');

        } catch (error) {
            this.eventBus.emit('error', {
                type: 'flash_disconnect_failed',
                message: `固件下载断开连接失败: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 固件下载独立连接
     */
    async connectFlashIndependent() {
        try {
            // 请求串口访问权限
            this.flashPort = await navigator.serial.requestPort();

            // 固件下载必须先用115200连接
            const initialOptions = {
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            };

            // 打开串口
            await this.flashPort.open(initialOptions);

            // 设置读写器
            this.flashReader = this.flashPort.readable.getReader();
            this.flashWriter = this.flashPort.writable.getWriter();

            this.isFlashConnected = true;
            
            this.eventBus.emit('flash:connected-independent', {
                config: initialOptions,
                port: this.flashPort,
                reader: this.flashReader,
                writer: this.flashWriter
            });
            
            return { reader: this.flashReader, writer: this.flashWriter, port: this.flashPort };

        } catch (error) {
            this.eventBus.emit('error', {
                type: 'flash_connect_independent_failed',
                message: `固件下载独立连接失败: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 固件下载独立断开连接
     */
    async disconnectFlashIndependent() {
        try {
            // 停止读取
            if (this.flashReader) {
                await this.flashReader.cancel();
                await this.flashReader.releaseLock();
                this.flashReader = null;
            }

            // 关闭写入器
            if (this.flashWriter) {
                await this.flashWriter.releaseLock();
                this.flashWriter = null;
            }

            // 关闭串口
            if (this.flashPort) {
                await this.flashPort.close();
                this.flashPort = null;
            }

            this.isFlashConnected = false;
            
            this.eventBus.emit('flash:disconnected-independent');

        } catch (error) {
            this.eventBus.emit('error', {
                type: 'flash_disconnect_failed',
                message: `固件下载断开连接失败: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 重置固件下载串口波特率（和原始版本完全一致的逻辑）
     */
    async resetFlashBaudrate(baudrate = 115200) {
        try {
            if (this.flashPort && this.isFlashConnected) {
                // 直接重新配置串口（与原始逻辑完全一致）
                if (this.flashReader) {
                    await this.flashReader.releaseLock();
                    this.flashReader = null;
                }
                if (this.flashWriter) {
                    await this.flashWriter.releaseLock();
                    this.flashWriter = null;
                }
                
                await this.flashPort.close();
                await this.flashPort.open({
                    baudRate: baudrate,
                    dataBits: 8,
                    stopBits: 1,
                    parity: 'none'
                });
                
                this.flashReader = this.flashPort.readable.getReader();
                this.flashWriter = this.flashPort.writable.getWriter();
                
                this.eventBus.emit('flash:log-add', {
                    message: i18n.t('direct_serial_reset_success'),
                    type: 'info',
                    isMainProcess: true
                });
            }
        } catch (resetError) {
            this.eventBus.emit('flash:log-add', {
                message: i18n.t('baudrate_reset_failed') + ': ' + resetError.message,
                type: 'warning',
                isMainProcess: true
            });
            throw resetError;
        }
    }
    
    /**
     * 开始串口读取
     */
    async startSerialReading() {
        try {
            while (this.serialPort && this.serialPort.readable && this.serialReader) {
                const { value, done } = await this.serialReader.read();
                
                if (done) {
                    break;
                }

                if (value) {
                    this.eventBus.emit('serial:data-received', value);
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.eventBus.emit('error', {
                    type: 'serial_read_error',
                    message: `读取数据错误: ${error.message}`,
                    error
                });
            }
        }
    }
    
    /**
     * 发送串口数据
     */
    async sendSerialData(data) {
        if (!this.isSerialConnected || !this.serialWriter) {
            throw new Error('串口未连接');
        }

        try {
            await this.serialWriter.write(data);
            this.eventBus.emit('serial:data-sent', data);
        } catch (error) {
            this.eventBus.emit('error', {
                type: 'serial_send_error',
                message: `发送数据错误: ${error.message}`,
                error
            });
            throw error;
        }
    }
    
    /**
     * 获取默认串口配置
     */
    getDefaultSerialOptions() {
        return {
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        };
    }
    
    /**
     * 更新设备配置
     */
    updateDeviceConfig(deviceName) {
        const config = this.deviceConfig[deviceName];
        if (config) {
            this.eventBus.emit('device:config-updated', {
                device: deviceName,
                config: config
            });
        }
    }
    
    /**
     * 获取连接状态
     */
    getStatus() {
        return {
            serial: {
                connected: this.isSerialConnected,
                port: !!this.serialPort,
                reader: !!this.serialReader,
                writer: !!this.serialWriter
            },
            flash: {
                connected: this.isFlashConnected,
                port: !!this.flashPort,
                reader: !!this.flashReader,
                writer: !!this.flashWriter
            }
        };
    }
    
    /**
     * 销毁模块
     */
    async destroy() {
        try {
            await this.disconnectSerial();
            await this.disconnectFlash();
        } catch (error) {
            console.error('串口模块销毁时发生错误:', error);
        }
        
        this.eventBus = null;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.SerialManager = SerialManager;
} 