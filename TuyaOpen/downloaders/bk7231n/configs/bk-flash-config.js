/**
 * BK系列芯片Flash配置 - 基于Python tyutool的BK7231N Flash配置
 * 完全按照 third_party/tyutool/tyutool/flash/bk7231n/protocol.py 中的FLASH类实现
 * 
 * Flash配置数组格式:
 * [MID, IC名称, 制造商, 大小, SR大小, 解保护值, 保护值, 掩码, 起始位, 长度, 读命令数组, 写命令数组]
 */

// 导入基础配置类
let FlashConfigBase;
if (typeof window !== 'undefined') {
    // 浏览器环境
    FlashConfigBase = window.FlashConfigBase;
} else {
    // Node.js环境  
    const flashConfigBase = require('./flash-config-base.js');
    FlashConfigBase = flashConfigBase.FlashConfigBase;
}

/**
 * BK Flash配置类 - BK系列芯片的Flash配置管理
 */
class BKFlashConfig extends FlashConfigBase {
    constructor() {
        super();
        this.name = 'BKFlashConfig';
        
        // BK Flash配置数据库 - 完全按照Python实现
        this.configDatabase = {
            // XTX系列
            XTX_25F08B: [
                0x14405e,          // MID
                'PN25F08B',        // IC名称
                'xtx',             // 制造商
                '8 * 1024 * 1024', // 大小
                1,                 // SR大小
                0x00,              // 解保护值
                0x07,              // 保护值
                this.calcBFD(0x0f, 2, 4), // 掩码
                2,                 // 起始位
                4,                 // 长度
                [0x05, 0xff, 0xff, 0xff], // 读命令数组
                [0x01, 0xff, 0xff, 0xff]  // 写命令数组
            ],
            
            XTX_25F04B: [
                0x13311c,
                'PN25F04B',
                'xtx',
                '4 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBFD(0x0f, 2, 4),
                2,
                4,
                [0x05, 0xff, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            XTX_25F16B: [
                0x15400b,
                'XT25F16B',
                'xtx',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            XTX_25F32B: [
                0x0016400b,
                'XT25F32B',
                'xtx',
                '32 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            XTX_25Q64B: [
                0x0017600b,
                'XT25Q64B',
                'xtx',
                '64 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            XTX_25F64B: [
                0x0017400b,
                'XT25F64B',
                'xtx',
                '64 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // MXIC系列
            MXIC_25V8035F: [
                0x1423c2,
                'MX25V8035F',
                'WH',
                '8 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(12) | this.calcBFD(0x1f, 2, 4),
                2,
                5,
                [0x05, 0x15, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            MXIC_25V4035F: [
                0x1323c2,
                'MX25V4035F',
                'WH',
                '4 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(12) | this.calcBFD(0x1f, 2, 4),
                2,
                5,
                [0x05, 0x15, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            MXIC_25V1635F: [
                0x1523c2,
                'MX25V1635F',
                'WH',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(12) | this.calcBFD(0x1f, 2, 4),
                2,
                5,
                [0x05, 0x15, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // GD系列
            GD_25D40: [
                0x134051,
                'GD25D40',
                'GD',
                '4 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBFD(0x0f, 2, 3),
                2,
                3,
                [0x05, 0xff, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25D80: [
                0x144051,
                'GD25D80',
                'GD',
                '8 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBFD(0x0f, 2, 3),
                2,
                3,
                [0x05, 0xff, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_1_25D80: [
                0x1440C8,
                'GD25D80',
                'GD',
                '8 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25WQ64E: [
                0x001765c8,
                'GD25WQ64E',
                'GD',
                '64 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25WQ32E: [
                0x001665c8,
                'GD25WQ32E',
                'GD',
                '32 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25WQ16E: [
                0x001565c8,
                'GD25WQ16E',
                'GD',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25Q64: [
                0x001740c8,
                'GD25Q64',
                'GD',
                '64 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25Q16: [
                0x001540c8,
                'GD25Q16',
                'GD',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25Q16B: [
                0x001540c8,
                'GD25Q16B',
                'GD',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            GD_25Q41B: [
                0x1340c8,
                'GD25Q41B',
                'GD',
                '4 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 3),
                2,
                3,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // Puya系列
            Puya_25Q16HB_K: [
                0x152085,
                'P25Q16HB_K',
                'Puya',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            Puya_25Q40: [
                0x136085,
                'P25Q40',
                'Puya',
                '4 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            Puya_25Q64H: [
                0x00176085,
                'P25Q64H',
                'Puya',
                '64 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            Puya_25Q80: [
                0x146085,
                'P25Q80',
                'Puya',
                '8 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            Puya_25Q80_38: [
                0x154285,
                'P25Q80',
                'Puya',
                '16 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            Puya_25Q32H: [
                0x166085,
                'P25Q32H',
                'Puya',
                '32 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // BY系列
            BY_PN25Q80A: [
                0x1440e0,
                'PN25Q80A',
                'BY',
                '8 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 3),
                2,
                3,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            BY_PN25Q40A: [
                0x1340e0,
                'PN25Q40A',
                'BY',
                '4 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 3),
                2,
                3,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // WB系列
            WB_25Q128JV: [
                0x001840ef,
                'WB25Q128JV',
                'WB',
                '128 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // ESMT系列
            ESMT_25QH16B: [
                0x0015701c,
                'EN25QH16B',
                'ESMT',
                '16 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBFD(0xf, 2, 5),
                2,
                4,
                [0x05, 0xff, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            ESMT_25QH32A: [
                0x0016411c,
                'EN25QH32A',
                'ESMT',
                '32 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBFD(0xf, 2, 5),
                2,
                4,
                [0x05, 0xff, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            ESMT_25QW32A: [
                0x0016611c,
                'EN25QH32A',
                'ESMT',
                '32 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // TH系列
            TH25Q_16HB: [
                0x001560eb,
                'TH25Q_16HB',
                'TH',
                '16 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            TH25Q_80HB: [
                0x001460cd,
                'TH25Q_80HB',
                'TH',
                '8 * 1024 * 1024',
                2,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ],
            
            // 通用/未知
            NA: [
                0x001640c8,
                'NA_NA',
                'NA',
                '32 * 1024 * 1024',
                1,
                0x00,
                0x07,
                this.calcBIT(14) | this.calcBFD(0x1f, 2, 5),
                2,
                5,
                [0x05, 0x35, 0xff, 0xff],
                [0x01, 0xff, 0xff, 0xff]
            ]
        };
    }

    /**
     * 位域值计算 - 对应Python CalcBFD函数
     * @param {number} v 值
     * @param {number} bs 起始位
     * @param {number} bl 位长度
     * @returns {number} 计算结果
     */
    calcBFD(v, bs, bl) {
        return (v & ((1 << bl) - 1)) << bs;
    }

    /**
     * 单位计算 - 对应Python BIT函数
     * @param {number} n 位数
     * @returns {number} 位值
     */
    calcBIT(n) {
        return 1 << n;
    }

    /**
     * 获取Flash信息的专用接口
     * @param {number} flashId Flash ID
     * @returns {Object|null} Flash信息对象
     */
    getFlashInfo(flashId) {
        this.trace(`获取BK Flash信息: 0x${flashId.toString(16)}`);
        
        // 在配置数据库中查找对应的Flash信息
        for (const [key, config] of Object.entries(this.configDatabase)) {
            if (Array.isArray(config) && config[0] === flashId) {
                const flashInfo = {
                    mid: config[0],
                    icNam: config[1],
                    manName: config[2],
                    szMem: this.parseSize(config[3]),
                    szSR: config[4],
                    cwUnp: config[5],
                    cwEnp: config[6],
                    cwMsk: config[7],
                    sb: config[8],
                    lb: config[9],
                    cwdRd: config[10],
                    cwdWr: config[11]
                };
                
                this.trace(`找到BK Flash配置: ${flashInfo.icNam} (${flashInfo.manName})`);
                return flashInfo;
            }
        }
        
        this.trace(`未找到BK Flash配置: 0x${flashId.toString(16)}`);
        return null;
    }

    /**
     * 解析大小字符串
     * @param {string} sizeStr 大小字符串，如 "4 * 1024 * 1024"
     * @returns {number} 大小（字节）
     */
    parseSize(sizeStr) {
        const parts = sizeStr.split('*');
        let size = 1;
        for (const part of parts) {
            size *= parseInt(part.trim());
        }
        return size;
    }

    /**
     * 获取支持的Flash类型列表
     * @returns {Array<Object>} Flash类型列表
     */
    getSupportedFlashTypes() {
        const flashTypes = [];
        for (const [key, config] of Object.entries(this.configDatabase)) {
            if (Array.isArray(config)) {
                flashTypes.push({
                    key: key,
                    mid: config[0],
                    name: config[1],
                    manufacturer: config[2],
                    size: this.parseSize(config[3])
                });
            }
        }
        return flashTypes.sort((a, b) => a.mid - b.mid);
    }

    /**
     * 检查Flash ID是否支持
     * @param {number} flashId Flash ID
     * @returns {boolean} 是否支持
     */
    isFlashSupported(flashId) {
        return this.getFlashInfo(flashId) !== null;
    }

    /**
     * 获取制造商列表
     * @returns {Array<string>} 制造商列表
     */
    getManufacturers() {
        const manufacturers = new Set();
        for (const config of Object.values(this.configDatabase)) {
            if (Array.isArray(config)) {
                manufacturers.add(config[2]);
            }
        }
        return Array.from(manufacturers).sort();
    }

    /**
     * 按制造商获取Flash列表
     * @param {string} manufacturer 制造商名称
     * @returns {Array<Object>} Flash列表
     */
    getFlashByManufacturer(manufacturer) {
        const flashList = [];
        for (const [key, config] of Object.entries(this.configDatabase)) {
            if (Array.isArray(config) && config[2] === manufacturer) {
                flashList.push({
                    key: key,
                    mid: config[0],
                    name: config[1],
                    size: this.parseSize(config[3])
                });
            }
        }
        return flashList.sort((a, b) => a.mid - b.mid);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BKFlashConfig
    };
} else if (typeof window !== 'undefined') {
    window.BKFlashConfig = BKFlashConfig;
}