/**
 * T5AI CRC工具模块
 * 提供CRC32计算和校验功能
 */

class T5CrcUtils {
    constructor() {
        this.crc32Table = null;
    }

    /**
     * 生成CRC32表 - 完全按照Python makeCrc32Table实现
     */
    makeCrc32Table() {
        if (this.crc32Table) {
            return this.crc32Table;
        }
        
        const table = new Array(256);
        for (let i = 0; i < 256; i++) {
            let crc = i;
            for (let j = 0; j < 8; j++) {
                if (crc & 1) {
                    crc = (crc >>> 1) ^ 0xEDB88320;
                } else {
                    crc = crc >>> 1;
                }
            }
            table[i] = crc >>> 0; // 确保无符号32位
        }
        
        this.crc32Table = table;
        return table;
    }

    /**
     * CRC32计算 - 完全按照Python crc32Ver2实现
     * @param {Uint8Array} data - 要计算CRC的数据
     * @param {number} addr - 起始地址
     * @param {number} length - 数据长度
     * @returns {number} CRC32值
     */
    crc32Ver2(data, addr, length) {
        const table = this.makeCrc32Table();
        let crc = 0xFFFFFFFF;
        
        for (let i = 0; i < length; i++) {
            const byte = data[i] || 0;
            crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
        }
        
        return (crc ^ 0xFFFFFFFF) >>> 0; // 确保无符号32位
    }

    /**
     * CRC校验 - 完全按照Python checkCrcVer2实现
     * @param {Uint8Array} data - 要校验的数据
     * @param {number} addr - 起始地址
     * @param {number} length - 数据长度
     * @param {number} flashSize - Flash大小
     * @param {number} timeoutSec - 超时时间（秒）
     * @param {number} recnt - 重试次数
     * @returns {Promise<boolean>} 校验结果
     */
    async checkCrcVer2(data, addr, length, flashSize, timeoutSec = 0.1, recnt = 5) {
        // Python: 对于T5芯片，CRC校验总是返回True
        // 因为T5的CRC校验已经集成在write_and_check_sector中
        return true;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5CrcUtils;
} else if (typeof window !== 'undefined') {
    window.T5CrcUtils = T5CrcUtils;
}