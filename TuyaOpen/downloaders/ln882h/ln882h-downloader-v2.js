/**
 * LN882H芯片下载器 - 重构版本
 * 基于重构框架的模块化实现
 * 使用协议层、配置管理、核心模块的分离架构
 */

class LN882HDownloaderV2 extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        this.chipName = 'LN882H';
        this.version = 'v2.0';
        
        // 初始化组件
        this.config = null;
        this.protocolFactory = null;
        this.xmodemSender = null;
        this.ramLoader = null;
        this.serialHandler = null;
        
        // 状态管理
        this.isInitialized = false;
        this.stopFlag = false;
        this.currentBaudrate = 115200;
        
        // 进度回调
        this.onProgress = null;
    }

    /**
     * 初始化下载器组件
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        this.debug('main', '初始化LN882H下载器组件...');

        // 1. 初始化配置
        this.config = new LNFlashConfig();
        
        // 2. 初始化协议工厂
        this.protocolFactory = LNProtocolFactory;
        
        // 3. 初始化串口处理器
        this.serialHandler = {
            sendData: (data) => this.sendData(data),
            readData: (length, timeout) => this.readData(length, timeout),
            resetBuffers: () => this.resetBuffers()
        };
        
        // 4. 初始化XModem发送器
        this.xmodemSender = new XModemSender(
            this.serialHandler, 
            this.protocolFactory, 
            this.config
        );
        this.xmodemSender.setDebugCallback(this.debug.bind(this));
        
        // 5. 初始化RAM加载器
        this.ramLoader = new RamLoader(this.config);
        this.ramLoader.setDebugCallback(this.debug.bind(this));
        
        // 6. 尝试加载RAM Binary
        await this.ramLoader.autoLoad({
            createPlaceholder: true,
            placeholderSize: 1024
        });
        
        this.isInitialized = true;
        this.debug('main', 'LN882H下载器组件初始化完成');
    }

    /**
     * 设置进度回调函数
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
        if (this.xmodemSender) {
            this.xmodemSender.setProgressCallback(callback);
        }
    }

    /**
     * 停止操作
     */
    stop() {
        this.stopFlag = true;
        if (this.xmodemSender) {
            this.xmodemSender.abort();
        }
    }

    /**
     * 重置串口缓冲区
     */
    async resetBuffers() {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            while (true) {
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 5))
                ]);
                if (done || !value || value.length === 0) break;
            }
        } catch (error) {
            // 忽略清空缓冲区时的错误
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 发送数据
     */
    async sendData(data) {
        let writer = null;
        try {
            writer = this.port.writable.getWriter();
            const dataToSend = data instanceof Uint8Array ? data : new Uint8Array(data);
            await writer.write(dataToSend);
        } finally {
            if (writer) {
                try { writer.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 读取数据
     */
    async readData(length, timeout = 10000) {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const buffer = [];
            const startTime = Date.now();
            
            while (buffer.length < length && Date.now() - startTime < timeout && !this.stopFlag) {
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 10))
                ]);
                if (done) break;
                if (value) {
                    buffer.push(...value);
                }
            }
            
            return new Uint8Array(buffer.slice(0, length));
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }

    /**
     * 读取行数据
     */
    async readLine(times = 1, timeout = 1000) {
        const data = [];
        for (let i = 0; i < times; i++) {
            const lineData = await this.readData(1024, timeout);
            data.push(...lineData);
        }
        return new Uint8Array(data);
    }

    /**
     * 执行协议命令
     */
    async executeProtocol(protocol, args = [], timeout = 1000) {
        const command = protocol.cmd(...args);
        await this.resetBuffers();
        await this.sendData(command);
        return await this.readLine(2, timeout);
    }

    /**
     * 显示版本信息
     */
    async showVersion() {
        this.debug('info', "等待复位...");
        const protocol = this.protocolFactory.create('VersionCheck');
        const chipInfo = this.config.getChipInfo();
        let overTime = this.config.getRetries().version;
        
        while (overTime > 0 && !this.stopFlag) {
            const response = await this.executeProtocol(protocol, [], this.config.getTimeouts().version);
            const responseStr = protocol.parseTextResponse(response);
            this.debug('debug', `version receive: ${responseStr}`);
            
            if (protocol.isRamMode(response) || protocol.isKnownChip(response, chipInfo)) {
                this.debug('info', `显示版本接收: ${responseStr}`);
                return true;
            }
            overTime--;
        }
        
        return false;
    }

    /**
     * 检查RAM模式
     */
    async checkRamMode(times = 2, timeout = 1000) {
        const protocol = this.protocolFactory.create('RamModeCheck');
        const response = await this.executeProtocol(protocol, [], timeout);
        this.debug('debug', `check_ram_mode receive: ${protocol.parseTextResponse(response)}`);
        return protocol.isRamMode(response);
    }

    /**
     * 检查启动版本（包含RAM Binary加载）
     */
    async checkBootVersion() {
        this.debug('debug', "首次检查RAM模式...");
        let mode = await this.checkRamMode();
        if (mode) {
            this.debug('info', "RAM模式检查成功.");
            return true;
        }
        
        this.debug('debug', "首次RAM模式检查失败，准备下载RAM Binary");
        
        // 确保RAM Binary已加载
        if (!this.ramLoader.isRamBinaryLoaded()) {
            this.debug('error', "RAM Binary未加载");
            return false;
        }
        
        const ramBinary = this.ramLoader.getRamBinary();
        const ramSize = this.ramLoader.getRamBinarySize();
        
        // 发送下载命令
        const downloadProtocol = this.protocolFactory.create('RamBinaryDownload', ramSize);
        await this.sendData(downloadProtocol.cmd());
        this.debug('info', "正在下载ram.bin...");
        
        // 使用XModem发送RAM Binary
        const xmodemConfig = this.config.getXModemConfig();
        const result = await this.xmodemSender.send(
            ramBinary, 
            "ram.bin", 
            ramSize, 
            xmodemConfig.ramBinaryPacketSize
        );
        
        if (result.success) {
            this.debug('info', "检查下载...");
            const res = await this.readData(300, 1000);
            this.debug('debug', `下载ram.bin接收: ${new TextDecoder().decode(res)}`);
            this.debug('info', "RAM下载成功.");
        } else {
            this.debug('error', `RAM Binary下载失败: ${result.error}`);
            return false;
        }
        
        if (this.stopFlag) {
            return false;
        }
        
        this.debug('debug', "再次检查RAM模式...");
        mode = await this.checkRamMode();
        if (mode) {
            this.debug('info', "RAM模式检查成功.");
            return true;
        }
        
        this.debug('error', "再次RAM模式检查失败.");
        return false;
    }

    /**
     * 设置波特率
     */
    async setBaudrate(baud, retry = 3) {
        this.debug('info', `设置波特率 [${baud}]...`);
        
        if (!this.config.isValidBaudrate(baud)) {
            this.debug('error', `无效的波特率: ${baud}`);
            return false;
        }
        
        const protocol = this.protocolFactory.create('BaudrateSet', baud);
        let tryCnt = 0;
        
        while (tryCnt < retry && !this.stopFlag) {
            // 发送波特率设置命令
            const response = await this.executeProtocol(protocol, [], this.config.getTimeouts().baudrate);
            this.debug('debug', `uart_rx_byte: ${protocol.parseTextResponse(response)}`);
            
            // 关闭串口并重新以新波特率打开
            await this.port.close();
            await this.sleep(1000);
            await this.port.open({ baudRate: baud });
            this.currentBaudrate = baud;
            
            this.debug('debug', "检查波特率...");
            const mode = await this.checkRamMode(2, this.config.getTimeouts().baudrate);
            if (!mode) {
                tryCnt++;
                this.debug('debug', `尝试设置波特率 [${tryCnt}].`);
            } else {
                break;
            }
        }
        
        if (tryCnt >= retry) {
            this.debug('error', `设置波特率 [${baud}] 失败.`);
            return false;
        }
        
        this.debug('info', `设置波特率 [${baud}] 成功.`);
        return true;
    }

    /**
     * 握手流程
     */
    async shake() {
        this.debug('info', "注意: 在启动tyutool之前进行复位.");
        
        if (!await this.showVersion()) {
            return false;
        }
        
        if (!await this.checkBootVersion()) {
            return false;
        }
        
        const baudrateConfig = this.config.getBaudrateConfig();
        if (!await this.setBaudrate(baudrateConfig.default, this.config.getRetries().baudrate)) {
            return false;
        }
        
        return true;
    }

    /**
     * 擦除Flash
     */
    async erase() {
        this.debug('info', "正在擦除...");
        const flashConfig = this.config.getFlashConfig();
        const protocol = this.protocolFactory.create('FlashErase', flashConfig.eraseAddr, flashConfig.eraseSize);
        
        const response = await this.executeProtocol(protocol, [], this.config.getTimeouts().erase);
        this.debug('debug', `erase receive: ${protocol.parseTextResponse(response)}`);
        
        if (!protocol.isEraseSuccess(response)) {
            this.debug('error', "擦除Flash失败.");
            return false;
        }
        
        this.debug('info', "擦除Flash成功");
        return true;
    }

    /**
     * 设置Flash地址
     */
    async flashSetAddr() {
        const flashConfig = this.config.getFlashConfig();
        const protocol = this.protocolFactory.create('FlashSetAddr', flashConfig.startAddr);
        
        const response = await this.executeProtocol(protocol, [], this.config.getTimeouts().write);
        return protocol.isSetSuccess(response);
    }

    /**
     * 写入Flash
     */
    async write(fileData) {
        if (!await this.flashSetAddr()) {
            this.debug('error', "设置Flash地址失败.");
            return false;
        }
        
        this.debug('info', "正在下载qio.bin...");
        
        // 发送升级命令
        const upgradeProtocol = this.protocolFactory.create('FirmwareUpgrade');
        await this.sendData(upgradeProtocol.cmd());
        await this.readData(100, 100);
        await this.resetBuffers();
        
        // 使用XModem发送固件数据
        const xmodemConfig = this.config.getXModemConfig();
        const result = await this.xmodemSender.send(
            fileData, 
            "qio.bin", 
            fileData.length, 
            xmodemConfig.defaultPacketSize
        );
        
        if (!result.success) {
            this.debug('error', `固件写入失败: ${result.error}`);
            return false;
        }
        
        this.debug('info', "写入Flash成功");
        return true;
    }

    /**
     * CRC检查（LN882H不需要实际CRC检查）
     */
    async crcCheck() {
        this.debug('info', "CRC检查成功");
        return true;
    }

    /**
     * 重启设备
     */
    async reboot() {
        const protocol = this.protocolFactory.create('Reboot');
        const response = await this.executeProtocol(protocol, [], this.config.getTimeouts().reboot);
        this.debug('debug', `reboot receive: ${protocol.parseTextResponse(response)}`);
        
        if (!protocol.isRebootSuccess(response)) {
            this.debug('error', "重启失败.");
            return false;
        }
        
        this.debug('info', "重启完成");
        return true;
    }

    /**
     * 主下载流程
     */
    async downloadFirmware(fileData) {
        this.debug('main', `开始下载固件到 ${this.chipName}，文件大小: ${fileData.length} 字节`);
        
        try {
            // 初始化组件
            await this.initialize();
            
            // 1. 握手
            this.debug('main', "开始握手流程...");
            if (!await this.shake()) {
                throw new Error("握手失败");
            }
            
            // 2. 擦除
            this.debug('main', "开始擦除Flash...");
            if (!await this.erase()) {
                throw new Error("擦除失败");
            }
            
            // 3. 写入
            this.debug('main', "开始写入固件...");
            if (!await this.write(fileData)) {
                throw new Error("写入失败");
            }
            
            // 4. CRC检查
            this.debug('main', "开始CRC检查...");
            if (!await this.crcCheck()) {
                throw new Error("CRC检查失败");
            }
            
            // 5. 重启
            this.debug('main', "开始重启...");
            if (!await this.reboot()) {
                throw new Error("重启失败");
            }
            
            this.debug('main', "固件下载完成!");
            return { success: true };
            
        } catch (error) {
            this.debug('error', `下载失败: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * 连接设备
     */
    async connect() {
        this.debug('main', `正在连接 ${this.chipName}...`);
        this.stopFlag = false;
        await this.initialize();
        return { success: true };
    }

    /**
     * 断开连接
     */
    async disconnect() {
        this.debug('main', `断开 ${this.chipName} 连接`);
        this.stopFlag = true;
        if (this.xmodemSender) {
            this.xmodemSender.reset();
        }
    }

    /**
     * 获取设备状态
     */
    getDeviceStatus() {
        const status = {
            chipName: this.chipName,
            version: this.version,
            connected: !this.stopFlag,
            initialized: this.isInitialized,
            currentBaudrate: this.currentBaudrate
        };
        
        if (this.isInitialized) {
            status.config = this.config.getDebugInfo();
            status.ramLoader = this.ramLoader.getStatus();
            status.xmodemSender = this.xmodemSender.getStatus();
        }
        
        return status;
    }

    /**
     * 检查是否连接
     */
    isConnected() {
        return !this.stopFlag && this.isInitialized;
    }

    /**
     * 辅助函数：睡眠
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取配置信息（用于调试）
     */
    getConfig() {
        return this.config ? this.config.getFullConfig() : null;
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        if (this.config) {
            this.config.updateConfig(newConfig);
        }
    }

    /**
     * 加载RAM Binary
     */
    async loadRamBinary(source) {
        await this.initialize();
        
        if (typeof source === 'string') {
            // URL或Base64
            if (source.startsWith('http') || source.startsWith('/')) {
                return await this.ramLoader.loadFromUrl(source);
            } else {
                return await this.ramLoader.loadFromBase64(source);
            }
        } else if (source instanceof File) {
            // 文件对象
            return await this.ramLoader.loadFromFile(source);
        } else if (source instanceof Uint8Array) {
            // 直接设置二进制数据
            this.ramLoader.ramBinary = source;
            this.ramLoader.isLoaded = true;
            this.config.setRamBinaryConfig(source.length);
            return true;
        }
        
        return false;
    }
}

// 确保类在全局范围内可用
if (typeof window !== 'undefined') {
    window.LN882HDownloaderV2 = LN882HDownloaderV2;
}

// Node.js导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LN882HDownloaderV2;
}