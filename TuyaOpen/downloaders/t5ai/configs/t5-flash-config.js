/**
 * T5AI Flash配置管理模块
 * 管理Flash配置和设备兼容性
 */

class T5FlashConfig {
    constructor(flashDatabase) {
        this.flashDatabase = flashDatabase;
        this.currentFlashConfig = null;
        this.currentFlashId = null;
    }

    /**
     * 设置当前Flash配置
     * @param {number} flashId - Flash ID
     * @param {Object} config - Flash配置
     */
    setFlashConfig(flashId, config) {
        this.currentFlashId = flashId;
        this.currentFlashConfig = config;
    }

    /**
     * 获取当前Flash配置
     * @returns {Object|null} Flash配置
     */
    getCurrentFlashConfig() {
        return this.currentFlashConfig;
    }

    /**
     * 获取当前Flash ID
     * @returns {number|null} Flash ID
     */
    getCurrentFlashId() {
        return this.currentFlashId;
    }

    /**
     * 获取Flash保护配置 - 完全按照Python实现
     * @returns {Object} 保护配置 {protectRegVal, mask}
     */
    getFlashProtectConfig() {
        // Python: protect_register_value = ([0x3c, 0x00], [0x3c, 0x00])
        // 这是T5芯片的标准保护配置
        return {
            protectRegVal: [0x3c, 0x00],
            mask: [0x3c, 0x00]
        };
    }

    /**
     * 获取Flash解保护配置 - 完全按照Python实现
     * @returns {Object} 解保护配置 {unprotectRegVal, mask}
     */
    getFlashUnprotectConfig() {
        // Python: unprotect_register_value = ([0x00, 0x00], [0x3c, 0x00])
        // 这是T5芯片的标准解保护配置
        return {
            unprotectRegVal: [0x00, 0x00],
            mask: [0x3c, 0x00]
        };
    }

    /**
     * 获取状态寄存器读取配置
     * @returns {Array} 寄存器代码列表
     */
    getStatusRegisterReadConfig() {
        // Python: read_reg_code = [5, 53]
        return [5, 53];
    }

    /**
     * 获取状态寄存器写入配置
     * @returns {Array} 寄存器代码列表
     */
    getStatusRegisterWriteConfig() {
        // Python: write_reg_code = [1, 49]
        return [1, 49];
    }

    /**
     * 检查Flash是否需要扩展协议
     * @param {number} flashSize - Flash大小（可选，使用当前配置）
     * @returns {boolean} 是否需要扩展协议
     */
    needsExtendedProtocol(flashSize = null) {
        const size = flashSize || (this.currentFlashConfig ? this.currentFlashConfig.size : 0);
        // 256MB及以上的Flash需要使用扩展协议
        return size >= 256 * 1024 * 1024;
    }

    /**
     * 获取擦除命令
     * @param {string} type - 擦除类型 ('4k', '64k')
     * @param {number} flashSize - Flash大小（可选）
     * @returns {number} 命令码
     */
    getEraseCommand(type, flashSize = null) {
        const isExt = this.needsExtendedProtocol(flashSize);
        
        switch (type) {
            case '4k':
                return isExt ? 0xeb : 0x0b; // FlashErase4kExtProtocol : FlashErase4kProtocol
            case '64k':
                return isExt ? 0x21 : 0x20; // FlashErase64kExtProtocol : FlashErase64kProtocol
            default:
                throw new Error(`未知的擦除类型: ${type}`);
        }
    }

    /**
     * 获取读取命令
     * @param {string} type - 读取类型 ('4k')
     * @param {number} flashSize - Flash大小（可选）
     * @returns {number} 命令码
     */
    getReadCommand(type, flashSize = null) {
        const isExt = this.needsExtendedProtocol(flashSize);
        
        switch (type) {
            case '4k':
                return isExt ? 0xea : 0x0a; // FlashRead4kExtProtocol : FlashRead4kProtocol
            default:
                throw new Error(`未知的读取类型: ${type}`);
        }
    }

    /**
     * 获取写入命令
     * @param {string} type - 写入类型 ('256')
     * @param {number} flashSize - Flash大小（可选）
     * @returns {number} 命令码
     */
    getWriteCommand(type, flashSize = null) {
        const isExt = this.needsExtendedProtocol(flashSize);
        
        switch (type) {
            case '256':
                return isExt ? 0xe9 : 0x09; // FlashWrite256ExtProtocol : FlashWrite256Protocol
            default:
                throw new Error(`未知的写入类型: ${type}`);
        }
    }

    /**
     * 获取Flash信息摘要
     * @returns {Object|null} Flash信息
     */
    getFlashInfo() {
        if (!this.currentFlashConfig || this.currentFlashId === null) {
            return null;
        }
        
        return {
            flashId: this.currentFlashId,
            manufacturer: this.currentFlashConfig.manufacturer,
            name: this.currentFlashConfig.name,
            size: this.currentFlashConfig.size,
            sizeString: `${this.currentFlashConfig.size / (1024 * 1024)}MB`,
            needsExtendedProtocol: this.needsExtendedProtocol()
        };
    }

    /**
     * 验证Flash配置
     * @returns {boolean} 配置是否有效
     */
    isConfigValid() {
        return this.currentFlashConfig !== null && 
               this.currentFlashId !== null &&
               typeof this.currentFlashConfig.size === 'number' &&
               this.currentFlashConfig.size > 0;
    }

    /**
     * 重置配置
     */
    reset() {
        this.currentFlashConfig = null;
        this.currentFlashId = null;
    }

    /**
     * 获取扇区大小
     * @returns {number} 扇区大小（字节）
     */
    getSectorSize() {
        return 0x1000; // 4KB
    }

    /**
     * 获取页大小
     * @returns {number} 页大小（字节）
     */
    getPageSize() {
        return 256; // 256字节
    }

    /**
     * 获取块大小
     * @returns {number} 块大小（字节）
     */
    getBlockSize() {
        return 0x10000; // 64KB
    }

    /**
     * 计算地址对齐
     * @param {number} addr - 原始地址
     * @param {number} alignment - 对齐大小
     * @returns {number} 对齐后的地址
     */
    alignAddress(addr, alignment) {
        return Math.floor(addr / alignment) * alignment;
    }

    /**
     * 计算扇区对齐地址
     * @param {number} addr - 原始地址
     * @returns {number} 扇区对齐后的地址
     */
    alignToSector(addr) {
        return this.alignAddress(addr, this.getSectorSize());
    }

    /**
     * 计算页对齐地址
     * @param {number} addr - 原始地址
     * @returns {number} 页对齐后的地址
     */
    alignToPage(addr) {
        return this.alignAddress(addr, this.getPageSize());
    }

    /**
     * 计算块对齐地址
     * @param {number} addr - 原始地址
     * @returns {number} 块对齐后的地址
     */
    alignToBlock(addr) {
        return this.alignAddress(addr, this.getBlockSize());
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5FlashConfig;
} else if (typeof window !== 'undefined') {
    window.T5FlashConfig = T5FlashConfig;
}