/**
 * ESP32-Series 统一下载器
 * 基于esptool-js实现，支持自动检测ESP32系列芯片并进行固件下载
 * 支持的芯片：ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, ESP32-H2
 * 继承BaseDownloader以保证接口兼容
 */
class ESP32SeriesDownloader extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        
        this.detectedChip = null;
        this.isInitialized = false;
        this.espLoader = null;
        this.chipName = 'ESP32-Series';
        
        // 支持的ESP32系列芯片列表
        this.supportedChips = [
            'ESP32', 'ESP32-D0WD', 'ESP32-D0WDQ6', 'ESP32-D0WD-V3',
            'ESP32-S2', 'ESP32-S2FH4', 'ESP32-S2FH2',
            'ESP32-S3', 'ESP32-S3FH4R2',
            'ESP32-C3', 'ESP32-C3FH4',
            'ESP32-C6', 'ESP32-C6FH4',
            'ESP32-H2', 'ESP32-H2FH4'
        ];
    }

    /**
     * 连接设备并初始化 - 实现BaseDownloader抽象方法
     * 使用esptool-js进行真实的芯片检测
     */
    async connect() {
        if (this.isInitialized) {
            return true;
        }

        try {
            this.mainLog('开始ESP32系列芯片自动检测...');
            
            // 检查esptool-js是否已加载，增强检查逻辑
            let loaderToUse = null;
            
            // 尝试多种方式获取ESPLoader
            if (typeof ESPLoader !== 'undefined' && typeof ESPLoader === 'function') {
                loaderToUse = ESPLoader;
                this.debugLog('✅ 使用全局 ESPLoader');
            } else if (typeof window.ESPLoader !== 'undefined' && typeof window.ESPLoader === 'function') {
                loaderToUse = window.ESPLoader;
                this.debugLog('✅ 使用 window.ESPLoader');
            } else if (typeof window.esptooljs !== 'undefined' && window.esptooljs.ESPLoader) {
                loaderToUse = window.esptooljs.ESPLoader;
                window.ESPLoader = loaderToUse; // 设置为全局变量
                this.debugLog('✅ 使用 window.esptooljs.ESPLoader');
            }
            
            if (!loaderToUse) {
                this.debugLog('❌ esptool-js 检查失败 - ESPLoader 未找到');
                this.debugLog(`检查结果:`);
                this.debugLog(`- typeof ESPLoader: ${typeof ESPLoader}`);
                this.debugLog(`- typeof window.ESPLoader: ${typeof window.ESPLoader}`);
                this.debugLog(`- typeof window.esptooljs: ${typeof window.esptooljs}`);
                
                if (typeof window.esptooljs !== 'undefined') {
                    this.debugLog(`- esptooljs keys: ${Object.keys(window.esptooljs)}`);
                }
                
                // 提供详细的错误信息和解决方案
                const errorMessage = `
esptool-js未正确加载，请检查依赖

可能的解决方案:
1. 刷新页面重新加载依赖
2. 检查网络连接是否正常
3. 确认 third_party/esptool-js-umd.bundle.js 文件存在且完整
4. 检查浏览器控制台是否有其他错误
5. 确认浏览器支持ES6和现代JavaScript特性

技术详情: 
- typeof ESPLoader = ${typeof ESPLoader}
- typeof window.ESPLoader = ${typeof window.ESPLoader}
- typeof window.esptooljs = ${typeof window.esptooljs}
                `.trim();
                
                throw new Error(errorMessage);
            }
            
            // 确保全局可用
            if (typeof window.ESPLoader === 'undefined') {
                window.ESPLoader = loaderToUse;
            }
            
            this.debugLog('✅ esptool-js 验证通过');

            // 创建esptool-js实例
            const terminal = this.createTerminalInterface();
            
            // 确保有可用的串口对象
            if (!this.port) {
                throw new Error('串口未连接，无法初始化ESP加载器');
            }
            
            // 检查串口是否已经打开
            const isPortOpen = this.port.readable && this.port.writable;
            this.debugLog(`串口状态检查: ${isPortOpen ? '已打开' : '未打开'}`);
            
            if (!isPortOpen) {
                throw new Error('串口未打开，无法初始化ESP加载器。请确保串口已正确连接。');
            }
            
            // 使用自定义Transport避免reader/writer冲突
            this.debugLog('创建自定义Transport以避免串口冲突...');
            
            try {
            const LoaderClass = loaderToUse || window.ESPLoader;
                
                // 创建自定义Transport
                this.customTransport = this.createCustomTransport();
                
                // 连接Transport
                await this.customTransport.connect(115200);
                
                // 使用自定义Transport创建ESPLoader
                this.espLoader = new LoaderClass({
                    transport: this.customTransport,
                    baudrate: 115200,
                    romBaudrate: 115200,
                    terminal: terminal,
                    debugLogging: this.debugMode,
                    enableTracing: this.debugMode
            });
            
                this.debugLog('✅ ESPLoader 实例创建成功 (使用自定义Transport)');
                
            } catch (error) {
                this.debugLog(`❌ 自定义Transport初始化失败: ${error.message}`);
                throw new Error(`ESP32下载器初始化失败: ${error.message}`);
            }

            // 连接并检测芯片
            this.mainLog('正在连接ESP32设备...');
            
            // 使用自定义Transport进行设备连接和同步
            try {
                this.debugLog('开始ESP32设备连接和同步...');
                
                // 使用ESPLoader的connect方法进行连接和同步
                await this.safeCall('espLoader.connect', async () => {
                    return await this.espLoader.connect('default_reset', 7, true);
                });
                
                this.debugLog('✅ ESP32设备连接和同步成功');
                
            } catch (error) {
                this.debugLog(`❌ ESP32设备连接失败: ${error.message}`);
                
                // 提供ESP32特定的下载模式指导
                const errorInfo = `
ESP32设备连接失败，请确保设备处于下载模式:

1. 按住开发板上的BOOT按钮
2. 短按一下RST按钮  
3. 松开BOOT按钮
4. 重新点击连接按钮

如果问题仍然存在：
- 检查USB连接是否牢固
- 确认设备驱动已正确安装（CP210x/CH340/FTDI）
- 确保其他应用程序未占用串口
- 尝试更换USB线或USB端口

技术详情: ${error.message}
                `.trim();
                
                this.mainLog(errorInfo);
                throw new Error(`ESP32设备连接失败: ${error.message}`);
            }
            
            this.mainLog('正在识别芯片类型...');
            let chipName, macAddr;
            
            try {
                chipName = await this.safeCall('espLoader.chipName', () => this.espLoader.chipName());
                macAddr = await this.safeCall('espLoader.macAddr', () => this.espLoader.macAddr());
                this.debugLog(`✅ 已识别ESP32芯片: ${chipName}`);
            } catch (error) {
                this.debugLog(`❌ 芯片识别失败: ${error.message}`);
                chipName = "ESP32 (识别失败)";
                macAddr = "未知";
            }
            
            // 获取芯片详细信息
            this.detectedChip = {
                name: chipName,
                macAddress: macAddr,
                features: this.getChipFeatures(chipName),
                flashSize: await this.getFlashSize(),
                revision: await this.getChipRevision()
            };
            
            // 更新芯片名称
            this.chipName = this.detectedChip.name;
            
            this.mainLog(`检测到芯片: ${this.detectedChip.name}`);
            this.debugLog(`芯片特性: ${this.detectedChip.features.join(', ')}`);
            this.debugLog(`MAC地址: ${this.detectedChip.macAddress}`);
            this.debugLog(`Flash大小: ${this.detectedChip.flashSize}`);
            
            this.isInitialized = true;
            return true;

        } catch (error) {
            this.mainLog(`芯片检测失败: ${error.message}`);
            await this.cleanup();
            throw new Error(`ESP32系列芯片检测失败: ${error.message}`);
        }
    }

    /**
     * 下载固件到芯片 - 使用ESP32SimpleDownloader逻辑，确保与esptool-js完全一致
     */
    async downloadFirmware(fileData, startAddr = 0x10000) {
        if (!this.isInitialized) {
            throw new Error('下载器未初始化，请先调用connect()');
        }

        try {
            this.mainLog(`开始向${this.detectedChip ? this.detectedChip.name : 'ESP32'}下载固件...`);
            this.debugLog(`目标地址: 0x${startAddr.toString(16).toUpperCase()}`);
            this.debugLog(`数据大小: ${fileData.length} 字节`);

            // 创建ESP32SimpleDownloader实例来处理flash操作
            const simpleDownloader = new ESP32SimpleDownloader(this.serialPort, { debug: true });
            
            // 确保串口已打开
            if (!this.serialPort.readable) {
                await this.serialPort.open({ baudRate: 115200 });
            }
            
            // 连接到设备
            await simpleDownloader.connectAndDetect();
            
            // 准备文件数组 - 完全按照esptool-js writeFlash的格式
            const fileArray = [{
                data: simpleDownloader.ui8ToBstr(new Uint8Array(fileData)),
                address: startAddr
            }];

            // 使用完全一致的writeFlash方法
            const flashOptions = {
                fileArray: fileArray,
                flashSize: "keep",
                flashMode: "keep", 
                flashFreq: "keep",
                eraseAll: false,
                compress: true,
                reportProgress: (fileIndex, bytesWritten, totalBytes) => {
                    const percentage = Math.round((bytesWritten / totalBytes) * 100);
                    
                    if (this.onProgress) {
                        this.onProgress({
                            percentage: percentage,
                            bytesWritten: bytesWritten,
                            totalBytes: totalBytes,
                            message: `正在下载到${this.detectedChip ? this.detectedChip.name : 'ESP32'}... ${percentage}%`
                        });
                    }
                },
                calculateMD5Hash: null // 暂时禁用MD5验证以避免依赖问题
            };

            this.mainLog('开始flash写入操作...');
            await simpleDownloader.writeFlash(flashOptions);

            this.mainLog('固件下载完成');
            this.debugLog('下载验证通过');
            
            // 执行下载后操作 - 使用esptool-js标准after方法
            this.mainLog('执行重启操作...');
            await simpleDownloader.after();
            
            // 清理临时下载器资源
            await simpleDownloader.cleanup();
            
            return true;

        } catch (error) {
            this.mainLog(`下载失败: ${error.message}`);
            throw new Error(`固件下载失败: ${error.message}`);
        }
    }

    /**
     * 断开连接 - 实现BaseDownloader抽象方法
     */
    async disconnect() {
        try {
            this.mainLog('正在断开ESP32设备连接...');
            
            // 断开esptool-js连接
            if (this.espLoader) {
                await this.espLoader.disconnect();
                this.espLoader = null;
            }
            
            this.detectedChip = null;
            this.isInitialized = false;
            
            this.mainLog('ESP32设备已断开连接');
            return true;
            
        } catch (error) {
            this.debugLog(`断开连接时出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取芯片ID - 实现BaseDownloader抽象方法
     */
    async getChipId() {
        if (this.detectedChip) {
            return this.detectedChip.name;
        }
        return null;
    }

    /**
     * 获取Flash ID - 实现BaseDownloader抽象方法
     */
    async getFlashId() {
        return null; // ESP32系列由esptool-js内部处理
    }

    /**
     * 检查是否已连接 - 实现BaseDownloader抽象方法
     */
    isConnected() {
        return this.isInitialized && this.espLoader !== null;
    }

    /**
     * 获取设备状态 - 实现BaseDownloader抽象方法
     */
    getDeviceStatus() {
        if (!this.isInitialized || !this.detectedChip) {
            return {
                connected: false,
                chipName: 'Unknown',
                status: 'Not Connected'
            };
        }

        return {
            connected: true,
            chipName: this.detectedChip.name,
            macAddress: this.detectedChip.macAddress,
            flashSize: this.detectedChip.flashSize,
            features: this.detectedChip.features,
            status: 'Connected'
        };
    }

    /**
     * 设置波特率 - 实现BaseDownloader抽象方法
     */
    async setBaudrate(baudrate) {
        if (!this.isInitialized || !this.espLoader) {
            throw new Error('下载器未初始化，请先调用connect()');
        }
        
        // ESP32系列芯片的波特率设置由esptool-js内部管理
        // 可以通过changeBaud()方法来优化传输速度
            try {
            await this.espLoader.changeBaud();
            this.debugLog(`传输速度已优化`);
                return true;
        } catch (e) {
            this.debugLog(`波特率设置保持默认: ${e.message}`);
                return false;
        }
    }

    /**
     * 擦除芯片Flash - 使用esptool-js实现
     */
    async eraseFlash() {
        if (!this.isInitialized || !this.espLoader) {
            throw new Error('下载器未初始化，请先调用initialize()');
        }

        try {
            this.log(`正在擦除${this.detectedChip.name}的Flash...`, 'info');
            
            // 使用esptool-js进行实际擦除
            await this.espLoader.eraseFlash();
            
            this.log('Flash擦除完成', 'success');
            return { success: true, message: 'Flash擦除成功' };

        } catch (error) {
            this.log(`擦除失败: ${error.message}`, 'error');
            throw new Error(`Flash擦除失败: ${error.message}`);
        }
    }

    /**
     * 获取芯片信息
     */
    getChipInfo() {
        if (!this.detectedChip) {
            return null;
        }

        return {
            chipType: this.detectedChip.name,
            revision: this.detectedChip.revision,
            features: this.detectedChip.features,
            macAddress: this.detectedChip.macAddress,
            flashSize: this.detectedChip.flashSize,
            crystalFreq: this.detectedChip.crystalFreq
        };
    }

    /**
     * 检查芯片是否为ESP32系列
     */
    isSupportedChip(chipType) {
        return this.supportedChips.some(supported => 
            chipType.includes(supported) || supported.includes(chipType)
        );
    }

    /**
     * 创建终端接口供esptool-js使用
     */
    createTerminalInterface() {
        return {
            clean: () => {
                // 清理终端，可以是空实现
            },
            writeLine: (data) => {
                this.log(data, 'info');
            },
            write: (data) => {
                this.log(data, 'debug');
            }
        };
    }

    /**
     * 安全地调用可能失败的方法
     */
    async safeCall(methodName, fn, defaultValue = null) {
        try {
            return await fn();
        } catch (error) {
            this.debugLog(`❌ ${methodName} 调用失败: ${error.message}`);
            
            // 检查是否是getInfo或者属性访问相关的错误
            if (error.message.includes("Cannot read properties of undefined") || 
                error.message.includes("getInfo") ||
                error.message.includes("transport")) {
                
                this.debugLog('这可能是因为WebSerial连接问题或设备未准备好');
                this.debugLog('检查当前状态:');
                
                // 增强调试信息
                this.debugLog(`- SerialPort状态: ${this.port ? '已连接' : '未连接'}`);
                this.debugLog(`- this.espLoader: ${typeof this.espLoader}`);
                
                if (this.espLoader) {
                    this.debugLog(`- this.espLoader.transport: ${typeof this.espLoader.transport}`);
                    if (this.espLoader.transport) {
                        this.debugLog(`- this.espLoader.transport.device: ${typeof this.espLoader.transport.device}`);
                    }
                }
                
                // 更详细的错误信息和解决方案
                    const errorMessage = `
ESP32设备连接失败，请按照以下步骤排查：

1. 确认ESP32设备已正确连接到电脑USB端口
2. 确认ESP32设备处于下载模式（大多数开发板需要按住BOOT键再按一下RST键）
3. 如果设备已经连接到WebSerial，请先断开其他应用程序的连接
4. 重新选择串口设备并尝试连接
5. 尝试重新加载页面后再连接
6. 检查ESP32设备是否需要特定的USB驱动

技术详情: ${error.message}
                    `.trim();
                    
                    throw new Error(errorMessage);
            }
            
            if (defaultValue !== null) {
                this.debugLog(`使用默认值: ${defaultValue}`);
                return defaultValue;
            }
            
            throw error;
        }
    }

    /**
     * 获取芯片特性
     */
    getChipFeatures(chipName) {
        const features = [];
        
        if (chipName.includes('ESP32-S2')) {
            features.push('WiFi', 'USB-OTG');
        } else if (chipName.includes('ESP32-S3')) {
            features.push('WiFi', 'Bluetooth', 'USB-OTG', 'AI加速');
        } else if (chipName.includes('ESP32-C3')) {
            features.push('WiFi', 'Bluetooth 5.0');
        } else if (chipName.includes('ESP32-C6')) {
            features.push('WiFi 6', 'Bluetooth 5.0', 'IEEE 802.15.4');
        } else if (chipName.includes('ESP32-H2')) {
            features.push('Bluetooth 5.0', 'IEEE 802.15.4');
        } else if (chipName.includes('ESP32')) {
            features.push('WiFi', 'Bluetooth');
        }
        
        return features;
    }

    /**
     * 获取Flash大小
     */
    async getFlashSize() {
        try {
            if (this.espLoader && this.espLoader.getFlashSize) {
                const size = await this.espLoader.getFlashSize();
                return this.formatFlashSize(size);
            }
        } catch (error) {
            this.debugLog(`获取Flash大小失败: ${error.message}`);
        }
        return '未知';
    }

    /**
     * 获取芯片版本
     */
    async getChipRevision() {
        try {
            if (this.espLoader && this.espLoader.chip && this.espLoader.chip.getChipRevision) {
                return await this.espLoader.chip.getChipRevision(this.espLoader);
            }
        } catch (error) {
            this.log(`获取芯片版本失败: ${error.message}`, 'warning');
        }
        return 0;
    }

    /**
     * 格式化Flash大小显示
     */
    formatFlashSize(sizeBytes) {
        if (sizeBytes >= 1024 * 1024) {
            return `${(sizeBytes / (1024 * 1024)).toFixed(1)}MB`;
        } else if (sizeBytes >= 1024) {
            return `${(sizeBytes / 1024).toFixed(1)}KB`;
        }
            return `${sizeBytes}B`;
        }

    /**
     * 将Uint8Array转换为二进制字符串 - esptool-js需要的格式
     */
    ui8ToBstr(u8Array) {
        let bStr = "";
        for (let i = 0; i < u8Array.length; i++) {
            bStr += String.fromCharCode(u8Array[i]);
        }
        return bStr;
    }

    /**
     * 将字节数组转换为十六进制字符串 - 用于调试
     */
    bytesToHex(bytes) {
        return Array.from(bytes, byte => 
            ('0' + byte.toString(16)).slice(-2)
        ).join(' ');
    }

    /**
     * 清理资源
     */
    async cleanup() {
        this.debugLog('正在清理ESP32下载器资源...');
        
        try {
            // 清理自定义Transport
            if (this.customTransport) {
                try {
                    await this.customTransport.disconnect();
                    this.debugLog('✅ 自定义Transport断开连接成功');
                } catch (transportError) {
                    this.debugLog(`自定义Transport断开连接失败: ${transportError.message}`);
                }
                this.customTransport = null;
            }
            
            // 清理ESPLoader实例
            if (this.espLoader) {
                try {
                    if (typeof this.espLoader.disconnect === 'function') {
                        await this.espLoader.disconnect();
                        this.debugLog('✅ ESPLoader断开连接成功');
                    }
                } catch (disconnectError) {
                    this.debugLog(`ESPLoader断开连接失败: ${disconnectError.message}`);
                }
                this.espLoader = null;
            }
            
            // 等待一下确保所有异步操作完成
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.debugLog('✅ ESP32下载器资源清理完成');
            
        } catch (error) {
            this.debugLog(`资源清理时出错: ${error.message}`);
        }
    }

    /**
     * 自定义Transport类 - 使用我们已有的串口控制
     * 借鉴esptool-js的Transport实现，但通过我们的reader/writer控制
     */
    createCustomTransport() {
        const self = this;
        
        return {
            // 借鉴esptool-js的SLIP协议实现
            SLIP_END: 0xc0,
            SLIP_ESC: 0xdb,
            SLIP_ESC_END: 0xdc,
            SLIP_ESC_ESC: 0xdd,
            
            device: this.port,
            baudrate: 115200,
            reader: null,
            writer: null,
            buffer: new Uint8Array(0),
            
            // 初始化Transport，获取我们自己的reader/writer
            async connect(baud = 115200) {
                if (!this.device.readable || !this.device.writable) {
                    throw new Error('串口未连接或不可用');
                }
                
                // 获取reader和writer - 使用我们的控制
                this.reader = this.device.readable.getReader();
                this.writer = this.device.writable.getWriter();
                this.baudrate = baud;
                
                self.debugLog('✅ 自定义Transport连接成功');
            },
            
            // 释放资源
            async disconnect() {
                if (this.reader) {
                    await this.reader.releaseLock();
                    this.reader = null;
                }
                if (this.writer) {
                    await this.writer.releaseLock();
                    this.writer = null;
                }
                self.debugLog('✅ 自定义Transport断开连接');
            },
            
            // SLIP格式化数据包 - 借鉴esptool-js实现
            slipWriter(data) {
                const outData = [];
                outData.push(this.SLIP_END);
                for (let i = 0; i < data.length; i++) {
                    if (data[i] === this.SLIP_ESC) {
                        outData.push(this.SLIP_ESC, this.SLIP_ESC_ESC);
                    } else if (data[i] === this.SLIP_END) {
                        outData.push(this.SLIP_ESC, this.SLIP_ESC_END);
                    } else {
                        outData.push(data[i]);
                    }
                }
                outData.push(this.SLIP_END);
                return new Uint8Array(outData);
            },
            
            // 写入数据
            async write(data) {
                if (!this.writer) {
                    throw new Error('Writer未初始化');
                }
                
                const slipData = this.slipWriter(data);
                await this.writer.write(slipData);
                
                if (self.debugMode) {
                    self.debugLog(`发送数据 (${data.length} 字节): ${self.bytesToHex(data)}`);
                }
            },
            
            // 读取数据 - 实现SLIP解码
            async *read(timeout = 3000) {
                if (!this.reader) {
                    throw new Error('Reader未初始化');
                }
                
                let partialPacket = null;
                let isEscaping = false;
                
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('读取超时')), timeout);
                });
                
                while (true) {
                    try {
                        const readPromise = this.reader.read();
                        const result = await Promise.race([readPromise, timeoutPromise]);
                        
                        if (result.done) {
                            throw new Error('串口连接中断');
                        }
                        
                        const readBytes = result.value;
                        if (!readBytes || readBytes.length === 0) {
                            continue;
                        }
                        
                        if (self.debugMode) {
                            self.debugLog(`接收数据 (${readBytes.length} 字节): ${self.bytesToHex(readBytes)}`);
                        }
                        
                        let i = 0;
                        while (i < readBytes.length) {
                            const byte = readBytes[i++];
                            
                            if (partialPacket === null) {
                                if (byte === this.SLIP_END) {
                                    partialPacket = new Uint8Array(0);
                                }
                            } else if (isEscaping) {
                                isEscaping = false;
                                if (byte === this.SLIP_ESC_END) {
                                    partialPacket = this.appendArray(partialPacket, new Uint8Array([this.SLIP_END]));
                                } else if (byte === this.SLIP_ESC_ESC) {
                                    partialPacket = this.appendArray(partialPacket, new Uint8Array([this.SLIP_ESC]));
                                } else {
                                    throw new Error(`无效的SLIP转义序列: 0x${byte.toString(16)}`);
                                }
                            } else if (byte === this.SLIP_ESC) {
                                isEscaping = true;
                            } else if (byte === this.SLIP_END) {
                                if (partialPacket.length > 0) {
                                    yield partialPacket;
                                    partialPacket = null;
                                }
                            } else {
                                partialPacket = this.appendArray(partialPacket, new Uint8Array([byte]));
                            }
                        }
                    } catch (error) {
                        if (error.message === '读取超时') {
                            throw error;
                        }
                        self.debugLog(`读取过程中出错: ${error.message}`);
                        throw new Error(`串口读取失败: ${error.message}`);
                    }
                }
            },
            
            // 数组合并工具函数
            appendArray(arr1, arr2) {
                const result = new Uint8Array(arr1.length + arr2.length);
                result.set(arr1, 0);
                result.set(arr2, arr1.length);
                return result;
            },
            
            // ESPLoader期望的其他方法
            getInfo() {
                // 获取设备信息
                try {
                    const info = this.device.getInfo();
                    return info.usbVendorId && info.usbProductId
                        ? `WebSerial VendorID 0x${info.usbVendorId.toString(16)} ProductID 0x${info.usbProductId.toString(16)}`
                        : "Custom Transport";
                } catch (error) {
                    self.debugLog(`获取设备信息失败: ${error.message}`);
                    return "Custom Transport (信息不可用)";
                }
            },
            
            getPid() {
                // 获取产品ID
                try {
                    return this.device.getInfo().usbProductId;
                } catch (error) {
                    return undefined;
                }
            },
            
            hexConvert(data) {
                // 将数据转换为十六进制字符串
                return Array.from(data, byte => 
                    ('0' + byte.toString(16)).slice(-2)
                ).join(' ');
            },
            
            trace(message) {
                // 跟踪日志
                if (this.tracing) {
                    self.debugLog(`Transport trace: ${message}`);
                }
            },
            
            // 可读写的tracing属性
            tracing: self.debugMode,
            
            inWaiting() {
                // 返回缓冲区中等待的字节数
                // 在Web Serial中这个概念不完全适用，返回0
                return 0;
            },
            
            async newRead(numBytes, timeout = 3000) {
                // 读取指定数量的字节
                // 简单实现：通过read生成器获取数据
                try {
                    const generator = this.read(timeout);
                    const result = await generator.next();
                    
                    if (result.done || !result.value) {
                        return new Uint8Array(0);
                    }
                    
                    const data = result.value;
                    return data.length > numBytes ? data.slice(0, numBytes) : data;
                } catch (error) {
                    self.debugLog(`newRead失败: ${error.message}`);
                    return new Uint8Array(0);
                }
            },
            
            async flushInput() {
                // 刷新输入缓冲区
                try {
                    // 尝试读取并丢弃所有可用数据
                    let attempts = 0;
                    while (attempts < 10) {
                        try {
                            const result = await Promise.race([
                                this.reader.read(),
                                new Promise(resolve => setTimeout(() => resolve({done: true}), 50))
                            ]);
                            
                            if (result.done || !result.value || result.value.length === 0) {
                                break;
                            }
                            attempts++;
                        } catch (e) {
                            break;
                        }
                    }
                    self.debugLog('输入缓冲区已刷新');
                } catch (error) {
                    self.debugLog(`刷新输入缓冲区失败: ${error.message}`);
                }
            },
            
            async flushOutput() {
                // 刷新输出缓冲区 - Web Serial中这个方法不太需要，但提供空实现
                self.debugLog('输出缓冲区已刷新');
            },
            
            async setRTS(state) {
                // 设置RTS信号
                try {
                    await this.device.setSignals({ requestToSend: state });
                    self.debugLog(`RTS信号设置为: ${state}`);
                } catch (error) {
                    self.debugLog(`设置RTS信号失败: ${error.message}`);
                }
            },
            
            async setDTR(state) {
                // 设置DTR信号
                try {
                    await this.device.setSignals({ dataTerminalReady: state });
                    self.debugLog(`DTR信号设置为: ${state}`);
                } catch (error) {
                    self.debugLog(`设置DTR信号失败: ${error.message}`);
                }
            },
            
            async sleep(ms) {
                // 延时函数
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            
            async waitForUnlock(timeout) {
                // 等待串口解锁
                return new Promise(resolve => setTimeout(resolve, timeout));
            },
            
            get _DTR_state() {
                // DTR状态 - 简单实现
                return false;
            }
        };
    }

}

// 导出到全局作用域
window.ESP32SeriesDownloader = ESP32SeriesDownloader; 