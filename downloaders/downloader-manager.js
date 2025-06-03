/**
 * 下载器管理器
 * 统一管理所有芯片下载器的创建和配置
 */
class DownloaderManager {
    constructor() {
        // 支持的芯片列表
        this.supportedChips = {
            'T5AI': {
                name: 'T5AI',
                displayName: 'T5AI',
                description: 'T5AI系列芯片',
                downloaderClass: 'T5Downloader',
                scriptPath: 'downloaders/t5ai-downloader.js'
            },
            'T3': {
                name: 'T3',
                displayName: 'T3',
                description: 'T3系列芯片',
                downloaderClass: 'T5Downloader',  // 使用和T5AI相同的下载器
                scriptPath: 'downloaders/t5ai-downloader.js'  // 使用和T5AI相同的脚本
            }
            // 后续可以添加更多芯片
            // 'BK7231N': {
            //     name: 'BK7231N',
            //     displayName: 'BK7231N',
            //     description: 'BK7231N系列芯片',
            //     downloaderClass: 'BK7231NDownloader',
            //     scriptPath: 'downloaders/bk7231n-downloader.js'
            // }
        };
        
        // 已加载的下载器类
        this.loadedDownloaders = {};
    }

    /**
     * 获取支持的芯片列表
     */
    getSupportedChips() {
        return Object.keys(this.supportedChips).map(chipName => ({
            name: chipName,
            displayName: this.supportedChips[chipName].displayName,
            description: this.supportedChips[chipName].description
        }));
    }

    /**
     * 检查芯片是否支持
     */
    isChipSupported(chipName) {
        return chipName in this.supportedChips;
    }

    /**
     * 动态加载下载器脚本
     */
    async loadDownloaderScript(chipName) {
        if (!this.isChipSupported(chipName)) {
            throw new Error(`不支持的芯片类型: ${chipName}`);
        }

        const chipConfig = this.supportedChips[chipName];
        
        // 如果已经加载过，直接返回
        if (this.loadedDownloaders[chipName]) {
            return this.loadedDownloaders[chipName];
        }

        try {
            // 动态加载脚本
            const script = document.createElement('script');
            script.src = chipConfig.scriptPath;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    // 检查下载器类是否已加载
                    const DownloaderClass = window[chipConfig.downloaderClass];
                    if (DownloaderClass) {
                        this.loadedDownloaders[chipName] = DownloaderClass;
                        resolve(DownloaderClass);
                    } else {
                        reject(new Error(`下载器类 ${chipConfig.downloaderClass} 未找到`));
                    }
                };
                
                script.onerror = () => {
                    reject(new Error(`加载下载器脚本失败: ${chipConfig.scriptPath}`));
                };
                
                document.head.appendChild(script);
            });
        } catch (error) {
            throw new Error(`加载下载器失败: ${error.message}`);
        }
    }

    /**
     * 创建下载器实例
     */
    async createDownloader(chipName, serialPort, debugCallback) {
        if (!this.isChipSupported(chipName)) {
            throw new Error(`不支持的芯片类型: ${chipName}`);
        }

        // 加载下载器类
        const DownloaderClass = await this.loadDownloaderScript(chipName);
        
        // 创建实例
        const downloader = new DownloaderClass(serialPort, debugCallback);
        
        return downloader;
    }

    /**
     * 获取芯片信息
     */
    getChipInfo(chipName) {
        if (!this.isChipSupported(chipName)) {
            return null;
        }
        
        return this.supportedChips[chipName];
    }

    /**
     * 添加新的芯片支持
     */
    addChipSupport(chipName, config) {
        this.supportedChips[chipName] = {
            name: chipName,
            displayName: config.displayName || chipName,
            description: config.description || `${chipName}系列芯片`,
            downloaderClass: config.downloaderClass,
            scriptPath: config.scriptPath
        };
    }

    /**
     * 移除芯片支持
     */
    removeChipSupport(chipName) {
        delete this.supportedChips[chipName];
        delete this.loadedDownloaders[chipName];
    }

    /**
     * 获取所有已加载的下载器
     */
    getLoadedDownloaders() {
        return Object.keys(this.loadedDownloaders);
    }

    /**
     * 清理所有已加载的下载器
     */
    clearLoadedDownloaders() {
        this.loadedDownloaders = {};
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.DownloaderManager = DownloaderManager;
    window.downloaderManager = new DownloaderManager();
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DownloaderManager;
} 