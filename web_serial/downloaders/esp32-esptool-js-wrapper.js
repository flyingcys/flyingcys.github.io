/**
 * ESP32 esptool-js 包装器
 * 架构设计：
 * - 串口管理：使用我们自己的（支持多芯片切换：T5AI ↔ ESP32 ↔ BK7231N）  
 * - 协议逻辑：100%使用esptool-js原生（完全按照官方示例，不重复造轮子）
 * - 最小适配：仅适配底层串口读写，其他全部使用esptool-js标准流程
 */
class ESP32EsptoolJSWrapper {
    constructor(device, logger) {
        this.device = device;  // 我们自己的串口
        this.logger = logger;
        this.espLoader = null;
        this.terminal = null;
        this.transport = null;
        this.chip = null;  // 添加chip引用，按照官方示例
        this.logPrefix = '[WRAPPER]';
        this.debugCallback = {
            log: (message) => {
                if (this.logger) {
                    this.logger(message, 'debug', this.logPrefix);
                }
            }
        };
    }

    // 创建最小串口适配器 - 让esptool-js的Transport以为在使用标准Web Serial API
    createMinimalSerialAdapter() {
        return {
            // 最小化的Web Serial API接口
            readable: this.device.readable,
            writable: this.device.writable,

            // 设备信息方法
            getInfo: () => {
                if (this.device.getInfo) {
                    return this.device.getInfo();
                }
                return {
                    usbVendorId: 4292,  // 0x10c4 (Silicon Labs)
                    usbProductId: 60000  // 0xea60 (CP210x)
                };
            },

            // DTR/RTS控制方法 - 适配我们的串口接口
            setSignals: async (signals) => {
                try {
                    if (signals.hasOwnProperty('dataTerminalReady')) {
                        if (this.device.setDTR) {
                            await this.device.setDTR(signals.dataTerminalReady);
                        } else if (this.device.setSignals) {
                            await this.device.setSignals({ dataTerminalReady: signals.dataTerminalReady });
                        }
                    }
                    
                    if (signals.hasOwnProperty('requestToSend')) {
                        if (this.device.setRTS) {
                            await this.device.setRTS(signals.requestToSend);
                        } else if (this.device.setSignals) {
                            await this.device.setSignals({ requestToSend: signals.requestToSend });
                        }
                    }
                } catch (error) {
                    this.debugCallback.log(`串口信号设置失败: ${error.message}`);
                    // 不抛出异常，某些串口可能不支持信号控制
                }
            },

            // ✅ 串口开关方法 - 按照esptool-js Transport的期望实现
            open: async (options) => {
                if (this.device.open && !this.device.readable) {
                    return await this.device.open(options);
                }
                return Promise.resolve();
            },

            close: async () => {
                if (this.device.close) {
                    return await this.device.close();
                }
                return Promise.resolve();
            },

            // 传递原设备的其他方法和属性
            ...this.device
        };
    }

    // 创建标准的esptool-js终端对象
    createTerminal() {
        return {
            clean: () => {
                this.debugCallback.log('📺 [TERMINAL] clean() 调用');
            },
            writeLine: (data) => {
                this.debugCallback.log(`📺 [TERMINAL] writeLine: ${data}`);
                if (this.logger) {
                    this.logger(data, 'info', this.logPrefix);
                }
            },
            write: (data) => {
                this.debugCallback.log(`📺 [TERMINAL] write: ${data}`);
                if (this.logger) {
                    this.logger(data, 'info', this.logPrefix);
                }
            }
        };
    }

    // 初始化：100%按照esptool-js官方示例
    async initialize() {
        try {
            this.debugCallback.log('🔍 [WRAPPER] 开始初始化...');
            
            // 检查esptool-js包
            if (typeof window.esptooljs === 'undefined') {
                throw new Error('esptool-js包未加载');
            }
            
            const { ESPLoader, Transport } = window.esptooljs;
            if (!ESPLoader || !Transport) {
                throw new Error('ESPLoader或Transport不可用');
            }
            
            this.debugCallback.log('✅ [WRAPPER] esptool-js组件验证通过');
            
            // 创建标准终端
            this.terminal = this.createTerminal();
            this.debugCallback.log('✅ [WRAPPER] Terminal对象创建成功');
            
            // 验证我们的串口设备
            if (!this.device) {
                throw new Error('串口设备未提供');
            }
            
            this.debugCallback.log('✅ [WRAPPER] 串口设备验证通过');
            
            // ✅ 创建最小适配器，让我们的串口看起来像Web Serial API
            const serialAdapter = this.createMinimalSerialAdapter();
            this.debugCallback.log('✅ [WRAPPER] 最小串口适配器创建成功');
            
            // ✅ 100%按照官方示例：创建Transport
            this.transport = new Transport(serialAdapter, true);
            this.debugCallback.log('✅ [WRAPPER] 使用esptool-js原生Transport成功');
            
            // ✅ 100%按照官方示例：创建ESPLoader
            const flashOptions = {
                transport: this.transport,
                baudrate: 115200,
                terminal: this.terminal,
                debugLogging: true,
            };
            
            this.debugCallback.log('🔍 [WRAPPER] 创建ESPLoader实例...');
            this.espLoader = new ESPLoader(flashOptions);
            
            this.debugCallback.log('✅ [WRAPPER] ESPLoader实例创建成功');
            this.debugCallback.log('✅ [WRAPPER] 初始化完成 - 100%按照esptool-js官方示例');
            return true;
            
        } catch (error) {
            this.debugCallback.log(`❌ [WRAPPER] 初始化失败: ${error.message}`);
            throw error;
        }
    }

    // ========== BaseDownloader接口实现 ==========
    
    // 连接设备 - 100%按照esptool-js官方示例流程
    async connect() {
        try {
            this.debugCallback.log('🔍 [WRAPPER] connect() 开始...');
            
            if (!this.espLoader) {
                throw new Error('ESPLoader not initialized');
            }
            
            // ✅ 100%按照官方示例：esploader.main()
            this.debugCallback.log('🔍 [WRAPPER] 调用 espLoader.main()...');
            this.chip = await this.espLoader.main();
            
            this.debugCallback.log(`✅ [WRAPPER] ESP32设备连接成功: ${this.chip}`);
            return true;
        } catch (error) {
            this.debugCallback.log(`❌ [WRAPPER] 连接失败: ${error.message}`);
            throw error;
        }
    }

    // 获取设备信息 - 100%使用main()方法已经获取的信息，不重复造轮子
    async getDeviceInfo() {
        try {
            if (!this.espLoader || !this.espLoader.chip) {
                throw new Error('设备未连接');
            }

            // ✅ 100%按照官方示例：main()方法已经获取了所有芯片信息
            // 不重复调用getChipDescription, getChipFeatures, readMac等方法
            // 这些信息在main()中已经获取并显示在terminal中
            
            // 直接从已连接的芯片获取基本信息
            const chipName = this.chip || 'Unknown ESP32 Chip';
            
            // 从espLoader获取运行时信息
            const isStub = this.espLoader.IS_STUB;
            const flashWriteSize = this.espLoader.FLASH_WRITE_SIZE;
            
            // 如果需要详细信息，可以直接访问芯片对象的属性
            // 但不重复调用方法，避免重复造轮子
            const chipType = this.espLoader.chip.CHIP_NAME || 'ESP32';
            
            return {
                chipName: chipName,
                chipType: chipType,
                isStub: isStub,
                flashWriteSize: flashWriteSize,
                // 注意：MAC地址等详细信息已经在main()中通过terminal显示给用户
                // 不需要重复获取，遵循esptool-js的标准流程
                note: 'Detailed chip info (MAC, features, crystal freq) displayed in terminal during connection'
            };
        } catch (error) {
            this.debugCallback.log(`❌ [WRAPPER] 获取设备信息失败: ${error.message}`);
            throw error;
        }
    }

    // 下载固件 - 100%按照esptool-js官方示例流程
    async downloadFirmware(firmwareData, startAddress = 0x10000, progressCallback = null) {
        try {
            if (!this.espLoader) {
                throw new Error('ESPLoader not initialized');
            }

            this.debugCallback.log('🔍 [WRAPPER] 开始固件下载...');
            this.debugCallback.log(`文件大小: ${firmwareData.length} 字节`);
            this.debugCallback.log(`起始地址: 0x${startAddress.toString(16)}`);

            // ✅ 100%使用esptool-js原生数据转换函数
            let binaryData;
            if (firmwareData instanceof Uint8Array) {
                binaryData = this.espLoader.ui8ToBstr(firmwareData);
            } else if (typeof firmwareData === 'string') {
                binaryData = firmwareData;
            } else if (firmwareData instanceof ArrayBuffer) {
                binaryData = this.espLoader.ui8ToBstr(new Uint8Array(firmwareData));
            } else {
                throw new Error('不支持的固件数据格式');
            }

            // ✅ 100%按照官方示例：FlashOptions格式
            const flashOptions = {
                fileArray: [{
                    data: binaryData,
                    address: startAddress
                }],
                flashSize: "keep",
                eraseAll: false,
                compress: true,
                reportProgress: progressCallback ? (fileIndex, written, total) => {
                    progressCallback(written, total);
                } : undefined,
                calculateMD5Hash: (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image))
            };

            // ✅ 100%按照官方示例：writeFlash + after
            await this.espLoader.writeFlash(flashOptions);
            await this.espLoader.after();  // 按照官方示例添加after调用
            
            this.debugCallback.log('✅ [WRAPPER] 固件下载完成');
            return true;

        } catch (error) {
            this.debugCallback.log(`❌ [WRAPPER] 固件下载失败: ${error.message}`);
            throw error;
        }
    }

    // 断开连接 - 100%按照esptool-js官方示例流程
    async disconnect() {
        try {
            this.debugCallback.log('🔍 [WRAPPER] 断开连接...');
            
            // ✅ 100%按照官方示例：transport.disconnect()
            if (this.transport) {
                await this.transport.disconnect();
                this.debugCallback.log('✅ [WRAPPER] Transport已断开');
            }

            // ✅ 按照官方示例：清理变量引用
            this.chip = null;
            this.espLoader = null;
            this.transport = null;
            this.terminal = null;
            
            this.debugCallback.log('✅ [WRAPPER] 已断开连接，串口保持可用供其他芯片使用');
        } catch (error) {
            this.debugCallback.log(`❌ [WRAPPER] 断开连接失败: ${error.message}`);
        }
    }

    // ========== 直接访问esptool-js原生对象，完全不重复造轮子 ==========
    
    // 获取100%原生ESPLoader实例
    getESPLoader() {
        return this.espLoader;
    }

    // 获取100%原生芯片实例
    getChip() {
        return this.espLoader ? this.espLoader.chip : null;
    }

    // 获取100%原生Transport实例
    getTransport() {
        return this.transport;
    }

    // 获取我们自己的串口设备（供多芯片管理使用）
    getSerialDevice() {
        return this.device;
    }

    // 获取芯片描述（按照官方示例）
    getChipDescription() {
        return this.chip;
    }

    // 检查是否使用Stub
    isStub() {
        return this.espLoader ? this.espLoader.IS_STUB : false;
    }
}

// 确保类可以全局访问
if (typeof window !== 'undefined') {
    window.ESP32EsptoolJSWrapper = ESP32EsptoolJSWrapper;
}