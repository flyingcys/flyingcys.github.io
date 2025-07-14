/**
 * 统一芯片数据库管理类 - 支持多芯片类型的配置管理
 * 为T5、BK7232N、ln882h等芯片提供统一的配置接口
 * 支持动态加载、配置缓存和扩展机制
 */

class ChipDatabase {
    constructor() {
        this.chipConfigs = new Map();       // 芯片配置缓存
        this.configClasses = new Map();     // 配置类映射
        this.debugMode = false;
        this.name = 'ChipDatabase';
        
        // 注册默认的芯片配置类
        this.registerDefaultChipTypes();
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 调试输出
     */
    trace(message) {
        if (this.debugMode) {
            console.log(`[${this.name}] ${message}`);
        }
    }

    /**
     * 注册默认芯片类型
     */
    registerDefaultChipTypes() {
        // 注册T5芯片配置类
        this.registerChipType('T5', {
            configClass: 'T5FlashConfig',
            description: 'T5/T5AI/T3 芯片系列',
            supportedFeatures: ['flash_protect', 'status_register', 'crc_check'],
            defaultBaudrate: 115200,
            protocolType: 'T5_BOOTROM'
        });

        // 预留BK7232N芯片配置
        this.registerChipType('BK7232N', {
            configClass: 'BK7232NFlashConfig',
            description: 'BK7232N 芯片系列',
            supportedFeatures: ['flash_protect', 'slip_protocol'],
            defaultBaudrate: 115200,
            protocolType: 'BK_BOOTROM'
        });

        // 预留ln882h芯片配置
        this.registerChipType('ln882h', {
            configClass: 'LN882HFlashConfig',
            description: 'ln882h 芯片系列',
            supportedFeatures: ['ram_download', 'flash_write'],
            defaultBaudrate: 115200,
            protocolType: 'LN_CUSTOM'
        });

        this.trace('默认芯片类型注册完成');
    }

    /**
     * 注册芯片类型
     * @param {string} chipType 芯片类型标识
     * @param {Object} config 芯片配置信息
     */
    registerChipType(chipType, config) {
        const requiredFields = ['configClass', 'description', 'supportedFeatures', 'protocolType'];
        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`芯片类型${chipType}缺少必需字段: ${field}`);
            }
        }

        this.configClasses.set(chipType, {
            ...config,
            registeredAt: new Date().toISOString()
        });

        this.trace(`注册芯片类型: ${chipType} (${config.description})`);
    }

    /**
     * 获取芯片配置实例
     * @param {string} chipType 芯片类型
     * @returns {Object} 配置实例
     */
    async getChipConfig(chipType) {
        // 检查缓存
        if (this.chipConfigs.has(chipType)) {
            this.trace(`从缓存获取${chipType}配置`);
            return this.chipConfigs.get(chipType);
        }

        // 检查芯片类型是否已注册
        const chipInfo = this.configClasses.get(chipType);
        if (!chipInfo) {
            throw new Error(`未知的芯片类型: ${chipType}`);
        }

        // 动态创建配置实例
        const configInstance = await this.createConfigInstance(chipType, chipInfo);
        
        // 缓存配置实例
        this.chipConfigs.set(chipType, configInstance);
        this.trace(`创建并缓存${chipType}配置实例`);
        
        return configInstance;
    }

    /**
     * 创建配置实例
     * @param {string} chipType 芯片类型
     * @param {Object} chipInfo 芯片信息
     * @returns {Object} 配置实例
     */
    async createConfigInstance(chipType, chipInfo) {
        const configClassName = chipInfo.configClass;
        
        try {
            // 尝试获取配置类
            let ConfigClass;
            
            if (typeof window !== 'undefined') {
                // 浏览器环境
                ConfigClass = window[configClassName];
            } else {
                // Node.js环境
                try {
                    const configModule = require(`./${configClassName.toLowerCase().replace('config', '-config')}.js`);
                    ConfigClass = configModule;
                } catch (error) {
                    this.trace(`无法加载配置模块: ${error.message}`);
                    ConfigClass = null;
                }
            }

            if (!ConfigClass) {
                this.trace(`配置类${configClassName}不可用，创建占位实例`);
                return this.createPlaceholderConfig(chipType, chipInfo);
            }

            // 创建配置实例
            const instance = new ConfigClass();
            if (instance.setDebugMode) {
                instance.setDebugMode(this.debugMode);
            }

            this.trace(`成功创建${chipType}配置实例`);
            return instance;

        } catch (error) {
            this.trace(`创建${chipType}配置实例失败: ${error.message}`);
            return this.createPlaceholderConfig(chipType, chipInfo);
        }
    }

    /**
     * 创建占位配置实例
     * @param {string} chipType 芯片类型
     * @param {Object} chipInfo 芯片信息
     * @returns {Object} 占位配置实例
     */
    createPlaceholderConfig(chipType, chipInfo) {
        return {
            chipType: chipType,
            isPlaceholder: true,
            description: chipInfo.description,
            supportedFeatures: chipInfo.supportedFeatures,
            defaultBaudrate: chipInfo.defaultBaudrate || 115200,
            protocolType: chipInfo.protocolType,
            
            // 占位方法
            parseFlashInfo: () => {
                throw new Error(`${chipType}配置类未实现`);
            },
            unprotectFlash: () => {
                throw new Error(`${chipType}配置类未实现`);
            },
            protectFlash: () => {
                throw new Error(`${chipType}配置类未实现`);
            }
        };
    }

    /**
     * 根据Flash ID查找芯片类型
     * @param {number} flashId Flash ID
     * @returns {Promise<Array>} 匹配的芯片类型数组
     */
    async findChipTypesByFlashId(flashId) {
        const results = [];
        
        for (const [chipType] of this.configClasses) {
            try {
                const config = await this.getChipConfig(chipType);
                
                // 如果是占位配置，跳过
                if (config.isPlaceholder) {
                    continue;
                }
                
                // 检查配置数据库中是否包含该Flash ID
                if (config.configDatabase && config.configDatabase[flashId]) {
                    const flashInfo = config.configDatabase[flashId];
                    results.push({
                        chipType: chipType,
                        flashId: flashId,
                        flashName: flashInfo[1],
                        manufacturer: flashInfo[2],
                        size: flashInfo[3],
                        confidence: 'high'
                    });
                }
            } catch (error) {
                this.trace(`检查${chipType}的Flash ID失败: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * 获取支持的芯片类型列表
     * @returns {Array} 芯片类型信息数组
     */
    getSupportedChipTypes() {
        const chipTypes = [];
        
        for (const [chipType, chipInfo] of this.configClasses) {
            chipTypes.push({
                chipType: chipType,
                description: chipInfo.description,
                supportedFeatures: chipInfo.supportedFeatures,
                defaultBaudrate: chipInfo.defaultBaudrate,
                protocolType: chipInfo.protocolType,
                registeredAt: chipInfo.registeredAt,
                isAvailable: !this.chipConfigs.get(chipType)?.isPlaceholder
            });
        }
        
        return chipTypes.sort((a, b) => a.chipType.localeCompare(b.chipType));
    }

    /**
     * 获取芯片支持的特性
     * @param {string} chipType 芯片类型
     * @returns {Array} 支持的特性列表
     */
    getChipFeatures(chipType) {
        const chipInfo = this.configClasses.get(chipType);
        return chipInfo ? chipInfo.supportedFeatures : [];
    }

    /**
     * 检查芯片是否支持特定特性
     * @param {string} chipType 芯片类型
     * @param {string} feature 特性名称
     * @returns {boolean} 是否支持
     */
    supportsFeature(chipType, feature) {
        const features = this.getChipFeatures(chipType);
        return features.includes(feature);
    }

    /**
     * 清除配置缓存
     * @param {string} chipType 可选的芯片类型，如果不指定则清除所有
     */
    clearCache(chipType = null) {
        if (chipType) {
            this.chipConfigs.delete(chipType);
            this.trace(`清除${chipType}配置缓存`);
        } else {
            this.chipConfigs.clear();
            this.trace('清除所有配置缓存');
        }
    }

    /**
     * 验证配置完整性
     * @param {string} chipType 芯片类型
     * @returns {Object} 验证结果
     */
    async validateChipConfig(chipType) {
        try {
            const config = await this.getChipConfig(chipType);
            
            if (config.isPlaceholder) {
                return {
                    valid: false,
                    chipType: chipType,
                    error: '配置类未实现',
                    suggestions: ['检查配置类是否正确加载', '确认配置文件路径正确']
                };
            }
            
            // 检查必需方法
            const requiredMethods = ['parseFlashInfo'];
            const missingMethods = requiredMethods.filter(method => typeof config[method] !== 'function');
            
            if (missingMethods.length > 0) {
                return {
                    valid: false,
                    chipType: chipType,
                    error: `缺少必需方法: ${missingMethods.join(', ')}`,
                    suggestions: ['检查配置类实现', '确认继承关系正确']
                };
            }
            
            // 检查配置数据库
            if (!config.configDatabase || Object.keys(config.configDatabase).length === 0) {
                return {
                    valid: false,
                    chipType: chipType,
                    error: '配置数据库为空',
                    suggestions: ['检查Flash配置数据', '确认数据库初始化正确']
                };
            }
            
            return {
                valid: true,
                chipType: chipType,
                flashCount: Object.keys(config.configDatabase).length,
                features: this.getChipFeatures(chipType)
            };
            
        } catch (error) {
            return {
                valid: false,
                chipType: chipType,
                error: error.message,
                suggestions: ['检查配置类构造函数', '确认依赖项已加载']
            };
        }
    }

    /**
     * 导出配置摘要
     * @returns {Object} 配置摘要
     */
    async exportConfigSummary() {
        const summary = {
            timestamp: new Date().toISOString(),
            registeredChipTypes: this.configClasses.size,
            cachedConfigs: this.chipConfigs.size,
            chipTypes: []
        };
        
        for (const chipType of this.configClasses.keys()) {
            const validation = await this.validateChipConfig(chipType);
            summary.chipTypes.push(validation);
        }
        
        return summary;
    }

    /**
     * 根据芯片特征自动检测芯片类型
     * @param {Object} chipFeatures 芯片特征
     * @returns {Array} 可能的芯片类型数组
     */
    autoDetectChipType(chipFeatures) {
        const candidates = [];
        
        for (const [chipType, chipInfo] of this.configClasses) {
            let score = 0;
            
            // 根据不同特征计算匹配分数
            if (chipFeatures.protocolType && chipFeatures.protocolType === chipInfo.protocolType) {
                score += 50;
            }
            
            if (chipFeatures.baudrate && chipFeatures.baudrate === chipInfo.defaultBaudrate) {
                score += 10;
            }
            
            if (chipFeatures.supportedFeatures) {
                const commonFeatures = chipFeatures.supportedFeatures.filter(f => 
                    chipInfo.supportedFeatures.includes(f)
                );
                score += commonFeatures.length * 20;
            }
            
            if (score > 0) {
                candidates.push({
                    chipType: chipType,
                    score: score,
                    confidence: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
                    description: chipInfo.description
                });
            }
        }
        
        // 按分数排序
        return candidates.sort((a, b) => b.score - a.score);
    }
}

// 创建全局实例
let globalChipDatabase = null;

/**
 * 获取全局芯片数据库实例
 * @returns {ChipDatabase} 芯片数据库实例
 */
function getGlobalChipDatabase() {
    if (!globalChipDatabase) {
        globalChipDatabase = new ChipDatabase();
    }
    return globalChipDatabase;
}

// 导出类和函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChipDatabase,
        getGlobalChipDatabase
    };
} else if (typeof window !== 'undefined') {
    window.ChipDatabase = ChipDatabase;
    window.getGlobalChipDatabase = getGlobalChipDatabase;
}