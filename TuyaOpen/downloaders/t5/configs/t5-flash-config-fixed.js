/**
 * T5 Flash配置类 - 修复版本
 * 解决脚本加载时序问题，确保类继承正常工作
 * 完全基于Python版本的flash_info.py和相关实现
 */

class T5FlashConfig extends window.FlashConfigBase {
    constructor() {
        super();
        this.name = 'T5FlashConfig';
        
        // 完整的T5 Flash数据库 - 完全按照Python flash_info.py的数据
        // 数据格式：[flash_id, name, manufacturer, size, unprotect_bits, protect_bits, reserved, read_code, write_code]
        this.configDatabase = {
            // GD系列
            0x00134051: [0x00134051, 'MD25D40D', 'GD', '4 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
            0x001340c8: [0x001340c8, 'GD25Q41B', 'GD', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            0x00144051: [0x00144051, 'MD25D80D', 'GD', '8 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
            0x001464c8: [0x001464c8, 'GD25WD80E', 'GD', '8 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
            0x001440c8: [0x001440c8, 'GD25Q80C', 'GD', '8 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            0x001540c8: [0x001540c8, 'GD25Q16C', 'GD', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001565c8: [0x001565c8, 'GD25WQ16E', 'GD', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, 1, 1, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001640c8: [0x001640c8, 'GD25Q32C', 'GD', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            0x001665c8: [0x001665c8, 'GD25WQ32E', 'GD', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001740c8: [0x001740c8, 'GD25Q64C', 'GD', '64 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            0x001765c8: [0x001765c8, 'GD25WQ64E', 'GD', '64 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            0x001840c8: [0x001840c8, 'GD25Q128C', 'GD', '128 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]]
        };
        
        this.trace(`T5FlashConfig修复版初始化完成，支持${Object.keys(this.configDatabase).length}种Flash型号`);
    }

    /**
     * 获取支持的Flash型号列表
     * @returns {Array} Flash型号信息数组
     */
    getSupportedFlashList() {
        return Object.values(this.configDatabase).map(config => ({
            flashId: '0x' + config[0].toString(16),
            name: config[1],
            manufacturer: config[2],
            size: config[3],
            sizeBytes: this.parseFlashSize(config[3])
        }));
    }

    /**
     * 解析Flash大小字符串
     * @param {string} sizeStr 大小字符串（如 "4 * 1024 * 1024"）
     * @returns {number} 字节数
     */
    parseFlashSize(sizeStr) {
        const parts = sizeStr.split('*');
        let size = 1;
        for (const part of parts) {
            size *= parseInt(part.trim());
        }
        return size;
    }

    /**
     * 根据Flash ID获取配置信息
     * @param {number} flashId Flash ID
     * @returns {Object|null} Flash配置信息
     */
    getFlashConfig(flashId) {
        const config = this.configDatabase[flashId];
        if (!config) {
            this.trace(`Flash ID 0x${flashId.toString(16)} not found in database`);
            return null;
        }
        
        return {
            flashId: config[0],
            name: config[1],
            manufacturer: config[2],
            size: config[3],
            sizeBytes: this.parseFlashSize(config[3]),
            unprotectBits: config[4],
            protectBits: config[5],
            reserved: config[6],
            readCode: config[7],
            writeCode: config[8]
        };
    }

    /**
     * 检查Flash ID是否支持
     * @param {number} flashId Flash ID
     * @returns {boolean} 是否支持
     */
    isFlashSupported(flashId) {
        return this.configDatabase.hasOwnProperty(flashId);
    }

    /**
     * 获取Flash读取命令
     * @param {number} flashId Flash ID
     * @returns {Array<number>|number} 读取命令
     */
    getFlashReadCode(flashId) {
        const config = this.configDatabase[flashId];
        if (!config) return null;
        return config[7]; // read_code
    }

    /**
     * 获取Flash写入命令
     * @param {number} flashId Flash ID
     * @returns {Array<number>|number} 写入命令
     */
    getFlashWriteCode(flashId) {
        const config = this.configDatabase[flashId];
        if (!config) return null;
        return config[8]; // write_code
    }

    /**
     * 验证Flash配置的完整性
     * @param {number} flashId Flash ID
     * @returns {Object} 验证结果
     */
    validateFlashConfig(flashId) {
        const config = this.configDatabase[flashId];
        if (!config) {
            return { valid: false, error: 'Flash ID不存在' };
        }
        
        // 检查配置数组长度
        if (config.length !== 9) {
            return { valid: false, error: `配置数组长度错误: ${config.length}, 期望9` };
        }
        
        // 检查必需字段
        const checks = [
            { field: 0, name: 'Flash ID', condition: typeof config[0] === 'number' },
            { field: 1, name: 'Flash Name', condition: typeof config[1] === 'string' },
            { field: 2, name: 'Manufacturer', condition: typeof config[2] === 'string' },
            { field: 3, name: 'Size', condition: typeof config[3] === 'string' },
            { field: 4, name: 'Unprotect Bits', condition: Array.isArray(config[4]) },
            { field: 5, name: 'Protect Bits', condition: Array.isArray(config[5]) },
            { field: 7, name: 'Read Code', condition: typeof config[7] === 'number' || Array.isArray(config[7]) },
            { field: 8, name: 'Write Code', condition: typeof config[8] === 'number' || Array.isArray(config[8]) }
        ];
        
        for (const check of checks) {
            if (!check.condition) {
                return { valid: false, error: `字段${check.field} (${check.name})无效` };
            }
        }
        
        return { valid: true };
    }

    /**
     * 根据制造商查找Flash配置
     * @param {string} manufacturer 制造商名称
     * @returns {Array} 匹配的Flash配置数组
     */
    findFlashByManufacturer(manufacturer) {
        return Object.values(this.configDatabase).filter(config => {
            return config[2].toLowerCase() === manufacturer.toLowerCase();
        });
    }

    /**
     * 根据大小查找Flash配置
     * @param {number} sizeBytes 字节数
     * @returns {Array} 匹配的Flash配置数组
     */
    findFlashBySize(sizeBytes) {
        return Object.values(this.configDatabase).filter(config => {
            const configSize = this.parseFlashSize(config[3]);
            return configSize === sizeBytes;
        });
    }
}

// 浏览器环境，直接挂载到window对象
if (typeof window !== 'undefined') {
    window.T5FlashConfig = T5FlashConfig;
    console.log('✅ T5FlashConfig修复版已加载并注册到window对象');
}

// Node.js导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5FlashConfig;
}