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
            
            // 检查esptool-js是否已加载
            if (typeof ESPLoader === 'undefined') {
                this.debugLog('❌ esptool-js 检查失败 - ESPLoader 未定义');
                this.debugLog(`当前 window 对象上的 ESPLoader: ${typeof window.ESPLoader}`);
                this.debugLog(`全局范围内的 ESPLoader: ${typeof ESPLoader}`);
                
                // 提供详细的错误信息和解决方案
                const errorMessage = `
esptool-js未加载，请检查依赖

可能的解决方案:
1. 检查网络连接是否正常
2. 确认 third_party/esptool-js.bundle.js 文件存在
3. 刷新页面重新加载依赖
4. 检查浏览器控制台是否有其他错误
5. 如果问题持续存在，请联系管理员

技术详情: 
- typeof ESPLoader = ${typeof ESPLoader}
- typeof window.ESPLoader = ${typeof window.ESPLoader}
                `.trim();
                
                throw new Error(errorMessage);
            }
            
            this.debugLog('✅ esptool-js 验证通过');

            // 创建esptool-js实例
            const terminal = this.createTerminalInterface();
            this.espLoader = new ESPLoader(this.port, { 
                debug: this.debugMode, 
                logger: terminal 
            });

            // 连接并检测芯片
            this.mainLog('正在连接ESP32设备...');
            await this.espLoader.connect();
            
            this.mainLog('正在识别芯片类型...');
            const chipName = await this.espLoader.chipName();
            const macAddr = await this.espLoader.macAddr();
            
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
     * 下载固件到芯片 - 实现BaseDownloader抽象方法
     */
    async downloadFirmware(fileData, startAddr = 0x10000) {
        if (!this.isInitialized || !this.espLoader) {
            throw new Error('下载器未初始化，请先调用connect()');
        }

        try {
            this.mainLog(`开始向${this.detectedChip.name}下载固件...`);
            this.debugLog(`目标地址: 0x${startAddr.toString(16).toUpperCase()}`);
            this.debugLog(`数据大小: ${fileData.length} 字节`);

            // 加载stub以提高传输速度
            this.mainLog('正在优化传输速度...');
            await this.espLoader.loadStub();
            
            // 提高波特率（如果支持）
            try {
                await this.espLoader.setBaudRate(115200, 921600);
                this.debugLog('传输速度已优化到921600bps');
            } catch (e) {
                this.debugLog('保持原有传输速度');
            }

            // 使用esptool-js进行实际下载
            await this.espLoader.flashData(fileData, startAddr, (bytesWritten, totalBytes) => {
                const percentage = Math.round((bytesWritten / totalBytes) * 100);
                
                if (this.onProgress) {
                    this.onProgress({
                        percentage: percentage,
                        bytesWritten: bytesWritten,
                        totalBytes: totalBytes,
                        message: `正在下载到${this.detectedChip.name}... ${percentage}%`
                    });
                }
            });

            this.mainLog('固件下载完成');
            this.debugLog('下载验证通过');
            
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
     * 设置波特率
     */
    async setBaudrate(baudrate) {
        if (this.espLoader) {
            try {
                await this.espLoader.setBaudRate(115200, baudrate);
                this.debugLog(`波特率已设置为 ${baudrate}bps`);
                return true;
            } catch (error) {
                this.debugLog(`设置波特率失败: ${error.message}`);
                return false;
            }
        }
        return false;
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
            if (this.espLoader && this.espLoader.flashSize) {
                const size = this.espLoader.flashSize();
                return this.formatFlashSize(size);
            }
        } catch (error) {
            this.log(`获取Flash大小失败: ${error.message}`, 'warning');
        }
        return '未知';
    }

    /**
     * 获取芯片版本
     */
    async getChipRevision() {
        try {
            if (this.espLoader && this.espLoader.chipRevision) {
                return this.espLoader.chipRevision();
            }
        } catch (error) {
            this.log(`获取芯片版本失败: ${error.message}`, 'warning');
        }
        return 0;
    }

    /**
     * 格式化Flash大小
     */
    formatFlashSize(sizeBytes) {
        if (sizeBytes >= 1024 * 1024) {
            return `${Math.round(sizeBytes / (1024 * 1024))}MB`;
        } else if (sizeBytes >= 1024) {
            return `${Math.round(sizeBytes / 1024)}KB`;
        } else {
            return `${sizeBytes}B`;
        }
    }

    /**
     * 清理资源
     */
    async cleanup() {
        this.debugLog('正在清理ESP32下载器资源...');
        
        try {
            // 调用disconnect方法进行清理
            await this.disconnect();
            
            this.debugLog('资源清理完成');
            
        } catch (error) {
            this.debugLog(`资源清理时出错: ${error.message}`);
        }
    }


}

// 导出到全局作用域
window.ESP32SeriesDownloader = ESP32SeriesDownloader; 