/**
 * T5AI Flash数据库模块
 * 包含52种Flash型号的完整数据库
 */

class T5FlashDatabase {
    constructor() {
        // Flash芯片数据库 - 完全按照测试版本的数据
        this.flashDatabase = {
            // GD系列（12种型号）
            0x00134051: { name: 'MD25D40D', manufacturer: 'GD', size: 4 * 1024 * 1024 },
            0x001340c8: { name: 'GD25Q41B', manufacturer: 'GD', size: 4 * 1024 * 1024 },
            0x00144051: { name: 'MD25D80D', manufacturer: 'GD', size: 8 * 1024 * 1024 },
            0x001464c8: { name: 'GD25WD80E', manufacturer: 'GD', size: 8 * 1024 * 1024 },
            0x001440c8: { name: 'GD25Q80C', manufacturer: 'GD', size: 8 * 1024 * 1024 },
            0x001540c8: { name: 'GD25Q16C', manufacturer: 'GD', size: 16 * 1024 * 1024 },
            0x001565c8: { name: 'GD25WQ16E', manufacturer: 'GD', size: 16 * 1024 * 1024 },
            0x001640c8: { name: 'GD25Q32C', manufacturer: 'GD', size: 32 * 1024 * 1024 },
            0x001665c8: { name: 'GD25WQ32E', manufacturer: 'GD', size: 32 * 1024 * 1024 },
            0x001740c8: { name: 'GD25Q64C', manufacturer: 'GD', size: 64 * 1024 * 1024 },
            0x001765c8: { name: 'GD25WQ64E', manufacturer: 'GD', size: 64 * 1024 * 1024 },
            0x001840c8: { name: 'GD25Q128C', manufacturer: 'GD', size: 128 * 1024 * 1024 },
            
            // TH系列（5种型号）
            0x001260eb: { name: 'TH25D20HA', manufacturer: 'TH', size: 2 * 1024 * 1024 },
            0x001360cd: { name: 'TH25Q40HB', manufacturer: 'TH', size: 4 * 1024 * 1024 },
            0x001460cd: { name: 'TH25Q80HB', manufacturer: 'TH', size: 8 * 1024 * 1024 },
            0x001560eb: { name: 'TH25Q16HB', manufacturer: 'TH', size: 16 * 1024 * 1024 },
            0x001760eb: { name: 'TH25Q64HA', manufacturer: 'TH', size: 64 * 1024 * 1024 },
            
            // XTX系列（2种型号）
            0x0015400b: { name: 'XT25F16B', manufacturer: 'XTX', size: 16 * 1024 * 1024 },
            0x0016400b: { name: 'XT25F32B', manufacturer: 'XTX', size: 32 * 1024 * 1024 },
            
            // BY系列（2种型号）
            0x001440e0: { name: 'BY25Q80A', manufacturer: 'BY', size: 8 * 1024 * 1024 },
            0x001340e0: { name: 'BY25Q40A', manufacturer: 'BY', size: 4 * 1024 * 1024 },
            
            // PY系列（7种型号）
            0x00124485: { name: 'PY25D22U', manufacturer: 'PY', size: 2 * 1024 * 1024 },
            0x00124585: { name: 'PY25D24U', manufacturer: 'PY', size: 2 * 1024 * 1024 },
            0x00136085: { name: 'PY25Q40H', manufacturer: 'PY', size: 4 * 1024 * 1024 },
            0x00146085: { name: 'PY25Q80H', manufacturer: 'PY', size: 8 * 1024 * 1024 },
            0x00156085: { name: 'PY25Q16H', manufacturer: 'PY', size: 16 * 1024 * 1024 },
            0x00154285: { name: 'PY25Q16SH', manufacturer: 'PY', size: 16 * 1024 * 1024 },
            0x00166085: { name: 'PY25Q32H', manufacturer: 'PY', size: 32 * 1024 * 1024 },
            
            // UC系列（2种型号）
            0x001260b3: { name: 'UC25HQ20', manufacturer: 'UC', size: 2 * 1024 * 1024 },
            0x001360b3: { name: 'UC25HQ40', manufacturer: 'UC', size: 4 * 1024 * 1024 },
            
            // GT系列（2种型号）
            0x001240c4: { name: 'GT25Q20D', manufacturer: 'GT', size: 2 * 1024 * 1024 },
            0x001340c4: { name: 'GT25Q40D', manufacturer: 'GT', size: 4 * 1024 * 1024 }
        };
    }

    /**
     * 根据Flash ID获取配置信息
     * @param {number} flashId - Flash ID
     * @returns {Object|null} Flash配置信息
     */
    getFlashConfig(flashId) {
        return this.flashDatabase[flashId] || null;
    }

    /**
     * 获取所有支持的Flash芯片列表
     * @returns {Object} Flash数据库
     */
    getAllFlashChips() {
        return this.flashDatabase;
    }

    /**
     * 根据厂商获取Flash芯片列表
     * @param {string} manufacturer - 厂商名称
     * @returns {Array} Flash芯片列表
     */
    getFlashChipsByManufacturer(manufacturer) {
        const chips = [];
        for (const [flashId, config] of Object.entries(this.flashDatabase)) {
            if (config.manufacturer === manufacturer) {
                chips.push({
                    flashId: parseInt(flashId),
                    ...config
                });
            }
        }
        return chips;
    }

    /**
     * 根据容量获取Flash芯片列表
     * @param {number} size - 容量（字节）
     * @returns {Array} Flash芯片列表
     */
    getFlashChipsBySize(size) {
        const chips = [];
        for (const [flashId, config] of Object.entries(this.flashDatabase)) {
            if (config.size === size) {
                chips.push({
                    flashId: parseInt(flashId),
                    ...config
                });
            }
        }
        return chips;
    }

    /**
     * 获取支持的厂商列表
     * @returns {Array} 厂商列表
     */
    getSupportedManufacturers() {
        const manufacturers = new Set();
        for (const config of Object.values(this.flashDatabase)) {
            manufacturers.add(config.manufacturer);
        }
        return Array.from(manufacturers).sort();
    }

    /**
     * 获取支持的容量列表
     * @returns {Array} 容量列表（字节）
     */
    getSupportedSizes() {
        const sizes = new Set();
        for (const config of Object.values(this.flashDatabase)) {
            sizes.add(config.size);
        }
        return Array.from(sizes).sort((a, b) => a - b);
    }

    /**
     * 检查Flash ID是否支持
     * @param {number} flashId - Flash ID
     * @returns {boolean} 是否支持
     */
    isFlashSupported(flashId) {
        return flashId in this.flashDatabase;
    }

    /**
     * 获取Flash信息摘要
     * @param {number} flashId - Flash ID
     * @returns {string} Flash信息摘要
     */
    getFlashSummary(flashId) {
        const config = this.getFlashConfig(flashId);
        if (!config) {
            return `未知Flash (ID: 0x${flashId.toString(16).toUpperCase().padStart(6, '0')})`;
        }
        
        const sizeMB = config.size / (1024 * 1024);
        return `${config.manufacturer} ${config.name} (${sizeMB}MB)`;
    }

    /**
     * 获取数据库统计信息
     * @returns {Object} 统计信息
     */
    getDatabaseStats() {
        const manufacturers = this.getSupportedManufacturers();
        const sizes = this.getSupportedSizes();
        const totalChips = Object.keys(this.flashDatabase).length;
        
        const statsByManufacturer = {};
        for (const manufacturer of manufacturers) {
            statsByManufacturer[manufacturer] = this.getFlashChipsByManufacturer(manufacturer).length;
        }
        
        const statsBySize = {};
        for (const size of sizes) {
            const sizeMB = size / (1024 * 1024);
            statsBySize[`${sizeMB}MB`] = this.getFlashChipsBySize(size).length;
        }
        
        return {
            totalChips,
            manufacturerCount: manufacturers.length,
            sizeVariants: sizes.length,
            statsByManufacturer,
            statsBySize
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5FlashDatabase;
} else if (typeof window !== 'undefined') {
    window.T5FlashDatabase = T5FlashDatabase;
}