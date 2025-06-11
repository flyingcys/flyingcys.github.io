/**
 * ESP32 esptool-js 原生包装器
 * 直接使用esptool-js所有原生功能，不重复实现任何功能
 * 这是真正"不重新造轮子"的实现
 */
class ESP32EsptoolJSWrapper extends (typeof BaseDownloader !== 'undefined' ? BaseDownloader : class {}) {
    constructor(serialPort, debugCallback) {
        if (!serialPort) {
            throw new Error('serialPort is required');
        }
        
        super();
        
        this.serialPort = serialPort;
        this.debugCallback = debugCallback || { log: console.log };
        this.chipName = 'ESP32-Series';
        
        // esptool-js实例
        this.espLoader = null;
        this.transport = null;
        
        // 状态管理
        this.isInitialized = false;
        this.detectedChip = null;
    }
    
    /**
     * 创建Web Serial Transport适配器
     * 这是唯一的自定义代码 - Web Serial到esptool-js Transport的适配
     */
    createWebSerialTransport() {
        const self = this;
        return {
            device: this.serialPort,
            baudrate: 115200,
            tracing: false,
            leftOver: new Uint8Array(0),
            slipReaderEnabled: false,
            
            // === 基础串口操作 ===
            async connect(baud = 115200) {
                if (!this.device.readable || !this.device.writable) {
                    await this.device.open({ baudRate: baud, bufferSize: 255 });
                }
                this.baudrate = baud;
                this.leftOver = new Uint8Array(0);
            },
            
            async disconnect() {
                if (this.device.readable && this.device.readable.locked) {
                    await this.device.readable.cancel();
                }
                if (this.device.writable && this.device.writable.locked) {
                    await this.device.writable.abort();
                }
                if (this.device.readable || this.device.writable) {
                    await this.device.close();
                }
            },
            
            async write(data) {
                const writer = this.device.writable.getWriter();
                await writer.write(data);
                writer.releaseLock();
            },
            
            async *read(timeout = 3000) {
                const startTime = Date.now();
                const reader = this.device.readable.getReader();
                
                try {
                    while (Date.now() - startTime < timeout) {
                        const { value, done } = await Promise.race([
                            reader.read(),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('timeout')), timeout)
                            )
                        ]);
                        
                        if (done) break;
                        if (value && value.length > 0) {
                            yield value;
                        }
                    }
                } catch (error) {
                    if (error.message !== 'timeout') {
                        throw error;
                    }
                } finally {
                    reader.releaseLock();
                }
            },
            
            // === 控制信号 ===
            async setRTS(state) {
                await this.device.setSignals({ requestToSend: state });
            },
            
            async setDTR(state) {
                await this.device.setSignals({ dataTerminalReady: state });
            },
            
            // === esptool-js需要的其他方法 ===
            getInfo() {
                return `WebSerial ESP32 Transport`;
            },
            
            getPid() {
                return this.device.getInfo?.()?.usbProductId || 0;
            },
            
            trace(message) {
                if (this.tracing) {
                    self.debugCallback.log(`[TRACE] ${message}`);
                }
            },
            
            hexConvert(uint8Array) {
                return Array.from(uint8Array)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
            }
        };
    }
    
    /**
     * 初始化 - 使用esptool-js原生初始化
     */
    async initialize() {
        if (this.isInitialized) return true;
        
        try {
            // 动态导入esptool-js
            const { ESPLoader, Transport } = await import('../third_party/esptool-js/bundle.js');
            
            // 创建Transport适配器
            this.transport = this.createWebSerialTransport();
            
            // 创建ESPLoader实例 - 使用原生构造函数
            this.espLoader = new ESPLoader({
                transport: this.transport,
                baudrate: 115200,
                terminal: {
                    clean: () => {},
                    writeLine: (data) => this.debugCallback.log(data),
                    write: (data) => this.debugCallback.log(data)
                },
                debugLogging: true
            });
            
            this.isInitialized = true;
            this.debugCallback.log('✅ esptool-js原生包装器初始化完成');
            return true;
            
        } catch (error) {
            this.debugCallback.log(`❌ 初始化失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 连接设备 - 使用esptool-js原生连接
     */
    async connect() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            // 使用esptool-js原生连接方法
            await this.espLoader.main();
            
            this.detectedChip = {
                name: this.espLoader.chip.CHIP_NAME,
                features: await this.espLoader.chip.getChipFeatures(this.espLoader),
                mac: await this.espLoader.chip.readMac(this.espLoader)
            };
            
            this.debugCallback.log(`✅ 已连接到 ${this.detectedChip.name}`);
            return true;
            
        } catch (error) {
            this.debugCallback.log(`❌ 连接失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 下载固件 - 使用esptool-js原生writeFlash
     */
    async downloadFirmware(fileData, startAddr = 0x10000) {
        if (!this.espLoader) {
            throw new Error('未初始化或未连接');
        }
        
        try {
            // 使用esptool-js原生writeFlash方法
            const flashOptions = {
                fileArray: [{
                    data: fileData,
                    address: startAddr
                }],
                flashSize: "detect",
                flashMode: "dio", 
                flashFreq: "40m",
                eraseAll: false,
                compress: true,
                reportProgress: (fileIndex, written, total) => {
                    const progress = Math.round((written / total) * 100);
                    if (this.onProgress) {
                        this.onProgress(progress, 100, `下载进度: ${progress}%`);
                    }
                }
            };
            
            await this.espLoader.writeFlash(flashOptions);
            
            this.debugCallback.log('✅ 固件下载完成');
            return { success: true, message: '固件下载成功' };
            
        } catch (error) {
            this.debugCallback.log(`❌ 下载失败: ${error.message}`);
            throw new Error(`固件下载失败: ${error.message}`);
        }
    }
    
    /**
     * 擦除Flash - 使用esptool-js原生eraseFlash
     */
    async eraseFlash() {
        if (!this.espLoader) {
            throw new Error('未初始化或未连接');
        }
        
        try {
            await this.espLoader.eraseFlash();
            this.debugCallback.log('✅ Flash擦除完成');
            return { success: true, message: 'Flash擦除成功' };
            
        } catch (error) {
            this.debugCallback.log(`❌ 擦除失败: ${error.message}`);
            throw new Error(`Flash擦除失败: ${error.message}`);
        }
    }
    
    /**
     * 断开连接 - 使用esptool-js原生disconnect
     */
    async disconnect() {
        try {
            if (this.transport) {
                await this.transport.disconnect();
            }
            
            this.isInitialized = false;
            this.detectedChip = null;
            this.espLoader = null;
            this.transport = null;
            
            this.debugCallback.log('✅ 已断开连接');
            
        } catch (error) {
            this.debugCallback.log(`⚠️ 断开连接时出错: ${error.message}`);
        }
    }
    
    // === 信息获取 - 所有方法都委托给esptool-js ===
    
    async getChipId() {
        if (!this.espLoader) return null;
        
        try {
            return await this.espLoader.readReg(this.espLoader.CHIP_DETECT_MAGIC_REG_ADDR);
        } catch (error) {
            return null;
        }
    }
    
    async getFlashId() {
        if (!this.espLoader) return null;
        
        try {
            return await this.espLoader.readFlashId();
        } catch (error) {
            return null;
        }
    }
    
    getChipInfo() {
        return this.detectedChip;
    }
    
    isConnected() {
        return this.isInitialized && this.detectedChip !== null;
    }
    
    getDeviceStatus() {
        return {
            isConnected: this.isConnected(),
            chipInfo: this.detectedChip,
            espLoaderReady: this.espLoader !== null
        };
    }
    
    // === 高级功能 - 直接委托给esptool-js ===
    
    async setBaudrate(baudrate) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.changeBaud(baudrate);
    }
    
    async readReg(addr, timeout) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.readReg(addr, timeout);
    }
    
    async writeReg(addr, value, mask, delayUs, delayAfterUs) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.writeReg(addr, value, mask, delayUs, delayAfterUs);
    }
    
    async sync() {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.sync();
    }
    
    async flashMd5sum(addr, size) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashMd5sum(addr, size);
    }
    
    async runStub() {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.runStub();
    }
    
    // === 所有Flash操作都委托给esptool-js ===
    
    async flashBegin(size, offset) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashBegin(size, offset);
    }
    
    async flashBlock(data, seq, timeout) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashBlock(data, seq, timeout);
    }
    
    async flashFinish(reboot = false) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashFinish(reboot);
    }
    
    async flashDeflBegin(size, compsize, offset) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashDeflBegin(size, compsize, offset);
    }
    
    async flashDeflBlock(data, seq, timeout) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashDeflBlock(data, seq, timeout);
    }
    
    async flashDeflFinish(reboot = false) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.flashDeflFinish(reboot);
    }
    
    // === 内存操作都委托给esptool-js ===
    
    async memBegin(size, blocks, blocksize, offset) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.memBegin(size, blocks, blocksize, offset);
    }
    
    async memBlock(buffer, seq) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.memBlock(buffer, seq);
    }
    
    async memFinish(entrypoint) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.memFinish(entrypoint);
    }
    
    // === 所有常量都来自esptool-js ===
    
    get ESP_FLASH_BEGIN() { return this.espLoader?.ESP_FLASH_BEGIN; }
    get ESP_FLASH_DATA() { return this.espLoader?.ESP_FLASH_DATA; }
    get ESP_FLASH_END() { return this.espLoader?.ESP_FLASH_END; }
    get ESP_MEM_BEGIN() { return this.espLoader?.ESP_MEM_BEGIN; }
    get ESP_MEM_DATA() { return this.espLoader?.ESP_MEM_DATA; }
    get ESP_MEM_END() { return this.espLoader?.ESP_MEM_END; }
    get CHIP_DETECT_MAGIC_REG_ADDR() { return this.espLoader?.CHIP_DETECT_MAGIC_REG_ADDR; }
    
    // === 所有工具方法都来自esptool-js ===
    
    _intToByteArray(i) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader._intToByteArray(i);
    }
    
    _appendArray(arr1, arr2) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader._appendArray(arr1, arr2);
    }
    
    checksum(data, state) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader.checksum(data, state);
    }
    
    toHex(buffer) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader.toHex(buffer);
    }
    
    async checkCommand(opDescription, op, data, chk, timeout) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.checkCommand(opDescription, op, data, chk, timeout);
    }
    
    async command(op, data, chk, waitResponse, timeout) {
        if (!this.espLoader) throw new Error('未初始化');
        return await this.espLoader.command(op, data, chk, waitResponse, timeout);
    }
    
    // === 重置策略 - 使用esptool-js原生reset类 ===
    
    createClassicReset() {
        if (!this.espLoader) throw new Error('未初始化');
        const { ClassicReset } = this.espLoader;
        return new ClassicReset(this.transport);
    }
    
    createHardReset() {
        if (!this.espLoader) throw new Error('未初始化');
        const { HardReset } = this.espLoader;
        return new HardReset(this.transport);
    }
    
    createUsbJtagSerialReset() {
        if (!this.espLoader) throw new Error('未初始化');
        const { UsbJtagSerialReset } = this.espLoader;
        return new UsbJtagSerialReset(this.transport);
    }
    
    createCustomReset(sequenceString) {
        if (!this.espLoader) throw new Error('未初始化');
        const { CustomReset } = this.espLoader;
        return new CustomReset(this.transport, sequenceString);
    }
    
    validateCustomResetStringSequence(seqStr) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader.validateCustomResetStringSequence(seqStr);
    }
    
    // === 工具方法 ===
    
    decodeBase64Data(base64Data) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader.decodeBase64Data(base64Data);
    }
    
    getStubJsonByChipName(chipName) {
        if (!this.espLoader) throw new Error('未初始化');
        return this.espLoader.getStubJsonByChipName(chipName);
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.ESP32EsptoolJSWrapper = ESP32EsptoolJSWrapper;
} 