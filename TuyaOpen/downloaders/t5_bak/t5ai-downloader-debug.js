/**
 * T5AI芯片下载器 - 调试版本
 * 用于诊断类加载问题
 */

class T5DownloaderDebug extends BaseDownloader {
    constructor(serialPort, debugCallback) {
        super(serialPort, debugCallback);
        this.chipName = 'T5AI';
        this.version = 'debug';
        this.isInitialized = false;
    }

    /**
     * 调试类加载状态
     */
    debugClassLoading() {
        const classes = [
            'BaseProtocol',
            'BaseBootRomProtocol', 
            'BaseBootRomFlashProtocol',
            'FlashConfigBase',
            'LinkCheckProtocol',
            'GetChipIdProtocol',
            'T5FlashConfig',
            'T5SerialHandler',
            'T5ConnectionManager',
            'T5FlashOperations'
        ];

        classes.forEach(className => {
            const classRef = window[className];
            this.debug('debug', `${className}: ${typeof classRef} ${classRef ? '✅' : '❌'}`);
        });
    }

    /**
     * 测试协议类创建
     */
    testProtocolCreation() {
        try {
            this.debug('debug', '测试LinkCheckProtocol创建...');
            const linkCheck = new window.LinkCheckProtocol();
            this.debug('debug', '✅ LinkCheckProtocol创建成功');
            return true;
        } catch (error) {
            this.debug('error', `❌ LinkCheckProtocol创建失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试Flash配置类创建
     */
    testFlashConfigCreation() {
        try {
            this.debug('debug', '测试T5FlashConfig创建...');
            const flashConfig = new window.T5FlashConfig();
            this.debug('debug', '✅ T5FlashConfig创建成功');
            return true;
        } catch (error) {
            this.debug('error', `❌ T5FlashConfig创建失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 初始化（调试版本）
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        this.debug('main', '=== T5下载器调试初始化 ===');
        
        // 1. 调试类加载状态
        this.debugClassLoading();
        
        // 2. 测试协议类创建
        if (!this.testProtocolCreation()) {
            throw new Error('协议类创建失败');
        }
        
        // 3. 测试Flash配置类创建
        if (!this.testFlashConfigCreation()) {
            throw new Error('Flash配置类创建失败');
        }
        
        this.debug('main', '✅ 所有类创建测试通过');
        this.isInitialized = true;
    }

    /**
     * 连接设备
     */
    async connect() {
        this.debug('main', `正在连接 ${this.chipName} (调试版本)...`);
        
        try {
            await this.initialize();
            this.debug('main', `✅ ${this.chipName} 调试连接成功`);
            return { success: true };
        } catch (error) {
            this.debug('error', `连接失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 其他必需的方法（简化版本）
     */
    async disconnect() {
        this.debug('main', `断开 ${this.chipName} 连接`);
    }

    async downloadFirmware(fileData, startAddr = 0x10000) {
        this.debug('main', '调试版本不执行实际下载');
        return { success: true, message: '调试版本' };
    }

    getDeviceStatus() {
        return {
            chipName: this.chipName,
            version: this.version,
            connected: this.isInitialized,
            initialized: this.isInitialized
        };
    }

    isConnected() {
        return this.isInitialized;
    }

    setProgressCallback(callback) {
        // 空实现
    }

    stop() {
        // 空实现
    }

    reset() {
        this.isInitialized = false;
    }
}

// 确保类在全局范围内可用
if (typeof window !== 'undefined') {
    window.T5DownloaderDebug = T5DownloaderDebug;
}

// Node.js导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5DownloaderDebug;
}