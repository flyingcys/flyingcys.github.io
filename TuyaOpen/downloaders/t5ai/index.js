/**
 * T5AI模块化下载器 - 模块加载器
 * 统一加载所有模块并提供与原始 t5ai-downloader.js 相同的接口
 */

// 模块加载器 - 根据环境自动加载依赖
class T5ModuleLoader {
    constructor() {
        this.modules = {};
        this.loaded = false;
    }

    /**
     * 加载所有必要的模块
     */
    async loadModules() {
        if (this.loaded) return;

        try {
            // 检测运行环境
            const isNode = typeof module !== 'undefined' && module.exports;
            const isBrowser = typeof window !== 'undefined';

            if (isNode) {
                // Node.js 环境
                await this.loadNodeModules();
            } else if (isBrowser) {
                // 浏览器环境
                await this.loadBrowserModules();
            } else {
                throw new Error('不支持的运行环境');
            }

            this.loaded = true;
        } catch (error) {
            throw new Error(`模块加载失败: ${error.message}`);
        }
    }

    /**
     * Node.js 环境模块加载
     */
    async loadNodeModules() {
        const path = require('path');
        const currentDir = __dirname;

        // 加载基础下载器
        this.modules.BaseDownloader = require('../../base-downloader.js');

        // 加载核心模块
        this.modules.T5SerialManager = require(path.join(currentDir, 'core/t5-serial-manager.js'));

        // 加载配置模块
        this.modules.T5FlashConfig = require(path.join(currentDir, 'configs/t5-flash-config.js'));
        this.modules.T5FlashDatabase = require(path.join(currentDir, 'configs/t5-flash-database.js'));

        // 加载协议模块
        const protocols = require(path.join(currentDir, 'protocols/t5-protocols.js'));
        Object.assign(this.modules, protocols);

        // 加载工具模块
        this.modules.T5CrcUtils = require(path.join(currentDir, 'utils/t5-crc-utils.js'));
        this.modules.T5DebugUtils = require(path.join(currentDir, 'utils/t5-debug-utils.js'));

        // 加载主控制器
        this.modules.T5DownloaderModular = require(path.join(currentDir, 't5-downloader-modular.js'));
    }

    /**
     * 浏览器环境模块加载
     */
    async loadBrowserModules() {
        // 在浏览器环境中，假设所有模块已通过 script 标签加载
        const requiredClasses = [
            'BaseDownloader',
            'T5SerialManager',
            'T5FlashConfig',
            'T5FlashDatabase',
            'T5CrcUtils',
            'T5DebugUtils',
            'LinkCheckProtocol',
            'GetChipIdProtocol',
            'GetFlashMidProtocol',
            'SetBaudrateProtocol',
            'FlashReadSRProtocol',
            'FlashWriteSRProtocol',
            'FlashErase4kProtocol',
            'FlashErase4kExtProtocol',
            'FlashErase64kProtocol',
            'FlashErase64kExtProtocol',
            'FlashRead4kProtocol',
            'FlashRead4kExtProtocol',
            'FlashWrite256Protocol',
            'FlashWrite256ExtProtocol',
            'T5DownloaderModular'
        ];

        for (const className of requiredClasses) {
            if (typeof window[className] === 'undefined') {
                throw new Error(`缺少必要的类: ${className}`);
            }
            this.modules[className] = window[className];
        }
    }

    /**
     * 获取模块
     */
    getModule(name) {
        if (!this.loaded) {
            throw new Error('模块尚未加载，请先调用 loadModules()');
        }
        return this.modules[name];
    }

    /**
     * 获取所有模块
     */
    getAllModules() {
        if (!this.loaded) {
            throw new Error('模块尚未加载，请先调用 loadModules()');
        }
        return this.modules;
    }
}

// 全局模块加载器实例
const moduleLoader = new T5ModuleLoader();

/**
 * T5AI下载器工厂类 - 提供与原始 t5ai-downloader.js 相同的接口
 */
class T5DownloaderFactory {
    /**
     * 创建T5AI下载器实例
     * @param {SerialPort} serialPort - 串口实例
     * @param {Function} debugCallback - 调试回调函数
     * @returns {T5DownloaderModular} 下载器实例
     */
    static async createDownloader(serialPort, debugCallback) {
        // 确保模块已加载
        await moduleLoader.loadModules();
        
        // 获取所有必要的模块
        const modules = moduleLoader.getAllModules();
        
        // 将模块注入到全局作用域（用于模块化下载器）
        if (typeof window !== 'undefined') {
            Object.assign(window, modules);
        } else {
            // Node.js 环境，将模块注入到 global
            Object.assign(global, modules);
        }
        
        // 创建下载器实例
        const T5DownloaderModular = modules.T5DownloaderModular;
        return new T5DownloaderModular(serialPort, debugCallback);
    }

    /**
     * 获取支持的Flash芯片列表（静态方法）
     */
    static async getSupportedFlashChips() {
        await moduleLoader.loadModules();
        const T5FlashDatabase = moduleLoader.getModule('T5FlashDatabase');
        const database = new T5FlashDatabase();
        return database.getAllFlashChips();
    }

    /**
     * 检查Flash ID是否支持（静态方法）
     */
    static async isFlashSupported(flashId) {
        await moduleLoader.loadModules();
        const T5FlashDatabase = moduleLoader.getModule('T5FlashDatabase');
        const database = new T5FlashDatabase();
        return database.isFlashSupported(flashId);
    }

    /**
     * 获取Flash配置信息（静态方法）
     */
    static async getFlashConfig(flashId) {
        await moduleLoader.loadModules();
        const T5FlashDatabase = moduleLoader.getModule('T5FlashDatabase');
        const database = new T5FlashDatabase();
        return database.getFlashConfig(flashId);
    }

    /**
     * 获取模块版本信息
     */
    static getVersion() {
        return {
            version: '1.0.0',
            description: 'T5AI模块化下载器',
            compatibility: '与 t5ai-downloader.js 完全兼容'
        };
    }
}

/**
 * 兼容性包装器 - 提供与原始 T5Downloader 类相同的接口
 */
class T5Downloader {
    constructor(serialPort, debugCallback) {
        this._initPromise = this._initialize(serialPort, debugCallback);
        this._downloader = null;
    }

    /**
     * 异步初始化
     */
    async _initialize(serialPort, debugCallback) {
        this._downloader = await T5DownloaderFactory.createDownloader(serialPort, debugCallback);
        
        // 将所有方法代理到实际的下载器实例
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this._downloader))
            .filter(name => name !== 'constructor' && typeof this._downloader[name] === 'function');
        
        for (const method of methods) {
            if (!this[method]) {
                this[method] = async (...args) => {
                    await this._initPromise;
                    return this._downloader[method](...args);
                };
            }
        }
        
        // 代理属性
        const properties = ['chipName', 'chipId', 'flashId', 'currentFlashConfig'];
        for (const prop of properties) {
            Object.defineProperty(this, prop, {
                get: () => this._downloader ? this._downloader[prop] : null,
                set: (value) => {
                    if (this._downloader) {
                        this._downloader[prop] = value;
                    }
                }
            });
        }
    }

    /**
     * 确保初始化完成
     */
    async _ensureInitialized() {
        await this._initPromise;
        if (!this._downloader) {
            throw new Error('下载器初始化失败');
        }
    }

    // 主要方法的显式代理（确保正确的异步处理）
    async connect() {
        await this._ensureInitialized();
        return this._downloader.connect();
    }

    async downloadFirmware(firmwareData, startAddress) {
        await this._ensureInitialized();
        return this._downloader.downloadFirmware(firmwareData, startAddress);
    }

    async readFlash(startAddress, size) {
        await this._ensureInitialized();
        return this._downloader.readFlash(startAddress, size);
    }

    setProgressCallback(callback) {
        if (this._downloader) {
            this._downloader.setProgressCallback(callback);
        }
        // 保存回调，在初始化完成后设置
        this._progressCallback = callback;
        this._initPromise.then(() => {
            if (this._progressCallback && this._downloader) {
                this._downloader.setProgressCallback(this._progressCallback);
            }
        });
    }

    setDebugMode(enabled) {
        if (this._downloader) {
            this._downloader.setDebugMode(enabled);
        }
        // 保存设置，在初始化完成后应用
        this._debugMode = enabled;
        this._initPromise.then(() => {
            if (this._debugMode !== undefined && this._downloader) {
                this._downloader.setDebugMode(this._debugMode);
            }
        });
    }

    stop() {
        if (this._downloader) {
            this._downloader.stop();
        }
    }

    isConnected() {
        return this._downloader ? this._downloader.isConnected() : false;
    }

    getDeviceStatus() {
        return this._downloader ? this._downloader.getDeviceStatus() : null;
    }

    getSupportedFlashChips() {
        return this._downloader ? this._downloader.getSupportedFlashChips() : [];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        T5Downloader,
        T5DownloaderFactory,
        T5ModuleLoader: moduleLoader
    };
} else if (typeof window !== 'undefined') {
    window.T5Downloader = T5Downloader;
    window.T5DownloaderFactory = T5DownloaderFactory;
    window.T5ModuleLoader = moduleLoader;
}