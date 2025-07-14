/**
 * Flash配置基类 - 基于Python版本FlashConfig的完整实现
 * 支持Flash保护/解保护、状态寄存器操作等核心功能
 * 完全按照 third_party/tyutool/tyutool/flash/t5/config/flash_config.py 实现
 */

class FlashConfigBase {
    constructor() {
        this.flashInfo = null;          // 当前Flash信息数组
        this.configDatabase = {};       // Flash配置数据库，子类实现
        this.debugMode = false;
        this.name = 'FlashConfigBase';
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
     * 解析Flash信息 - 对应Python parse_flash_info方法
     * @param {number} flashId Flash ID
     */
    parseFlashInfo(flashId) {
        this.trace(`解析Flash信息: 0x${flashId.toString(16)}`);
        
        // 在配置数据库中查找对应的Flash信息
        for (const config of Object.values(this.configDatabase)) {
            if (Array.isArray(config) && config[0] === flashId) {
                this.flashInfo = config;
                this.trace(`找到Flash配置: ${config[1]} (${config[2]})`);
                return;
            }
        }
        
        // 如果没有找到配置，抛出异常
        this.flashInfo = null;
        throw new Error('No support flash, please update flash config');
    }

    /**
     * 获取Flash状态寄存器读取命令 - 对应Python flash_status_reg_read_code属性
     * @returns {Array<number>} 读取命令数组
     */
    get flashStatusRegReadCode() {
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }
        
        const readCode = this.flashInfo[7];
        // Python逻辑：如果是数组就返回数组，否则包装成数组
        if (Array.isArray(readCode)) {
            return readCode;
        } else {
            return [readCode];
        }
    }

    /**
     * 获取Flash状态寄存器写入命令 - 对应Python flash_status_reg_write_code属性
     * @returns {Array<number>} 写入命令数组
     */
    get flashStatusRegWriteCode() {
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }
        
        const writeCode = this.flashInfo[8];
        // Python逻辑：如果是数组就返回数组，否则包装成数组
        if (Array.isArray(writeCode)) {
            return writeCode;
        } else {
            return [writeCode];
        }
    }

    /**
     * 获取Flash大小 - 对应Python flash_size属性
     * @returns {number} Flash大小（字节）
     */
    get flashSize() {
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }
        
        // Python逻辑：解析 "4 * 1024 * 1024" 这样的字符串
        const sizeStr = this.flashInfo[3];
        const parts = sizeStr.split('*');
        let size = 1;
        for (const part of parts) {
            size *= parseInt(part.trim());
        }
        
        this.trace(`Flash大小: ${size} 字节 (${size / (1024 * 1024)} MB)`);
        return size;
    }

    /**
     * 格式化寄存器位信息 - 对应Python __format_register_bit_info方法
     * @param {Array} bitList 位配置数组
     * @returns {Object} {value: Array, mask: Array} 寄存器值和掩码
     */
    formatRegisterBitInfo(bitList) {
        if (!bitList || !Array.isArray(bitList)) {
            this.trace('位配置数组为空或无效');
            return { value: [], mask: [] };
        }

        const val = [];     // 寄存器值数组
        const mask = [];    // 掩码数组
        let tmpMaskVal = 0x0;
        let tmpVal = 0x0;

        // Python逻辑：处理位配置数组
        for (let index = 0; index < bitList.length; index++) {
            if (bitList[index] !== null) {
                // 计算位位置（从高位到低位）
                const bitPos = bitList.length - index - 1;
                tmpMaskVal |= 1 << bitPos;
                tmpVal |= bitList[index] << bitPos;
            }
        }

        // Python逻辑：按字节分割值和掩码
        const byteCount = Math.floor(bitList.length / 8);
        for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
            val.push((tmpVal >> (8 * byteIndex)) & 0xff);
            mask.push((tmpMaskVal >> (8 * byteIndex)) & 0xff);
        }

        this.trace(`位配置转换: 输入=${JSON.stringify(bitList)}, 值=[${val.map(v => '0x' + v.toString(16))}], 掩码=[${mask.map(m => '0x' + m.toString(16))}]`);
        return { value: val, mask: mask };
    }

    /**
     * 获取解保护寄存器值 - 对应Python unprotect_register_value属性
     * @returns {Object} {value: Array, mask: Array}
     */
    get unprotectRegisterValue() {
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }
        
        const unprotectBits = this.flashInfo[4];
        const result = this.formatRegisterBitInfo(unprotectBits);
        this.trace(`解保护寄存器值: ${JSON.stringify(result)}`);
        return result;
    }

    /**
     * 获取保护寄存器值 - 对应Python protect_register_value属性
     * @returns {Object} {value: Array, mask: Array}
     */
    get protectRegisterValue() {
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }
        
        const protectBits = this.flashInfo[5];
        const result = this.formatRegisterBitInfo(protectBits);
        this.trace(`保护寄存器值: ${JSON.stringify(result)}`);
        return result;
    }

    /**
     * 比较寄存器值 - 对应Python compare_register_value方法
     * @param {Array<number>} src 源寄存器值数组
     * @param {Array<number>} dest 目标寄存器值数组
     * @param {Array<number>} mask 掩码数组
     * @returns {boolean} 是否匹配
     */
    compareRegisterValue(src, dest, mask) {
        if (!src || !dest || !mask) {
            this.trace('比较寄存器值：参数无效');
            return false;
        }

        // Python逻辑：逐字节比较，只比较掩码覆盖的位
        for (let i = 0; i < Math.min(src.length, dest.length, mask.length); i++) {
            if ((src[i] & mask[i]) !== (dest[i] & mask[i])) {
                this.trace(`寄存器值不匹配: 位置${i}, 源=(0x${src[i].toString(16)} & 0x${mask[i].toString(16)})=0x${(src[i] & mask[i]).toString(16)}, 目标=(0x${dest[i].toString(16)} & 0x${mask[i].toString(16)})=0x${(dest[i] & mask[i]).toString(16)}`);
                return false;
            }
        }
        
        this.trace('寄存器值匹配');
        return true;
    }

    /**
     * 读取Flash状态寄存器值 - 对应Python _read_flash_status_reg_val方法
     * 这是一个抽象方法，需要在子类中实现具体的串口通信逻辑
     * @param {Object} serialHandler 串口处理器
     * @param {number} retry 重试次数
     * @returns {Promise<Array<number>>} 状态寄存器值数组
     */
    async readFlashStatusRegVal(serialHandler, retry = 5) {
        throw new Error('readFlashStatusRegVal() 方法必须在子类中实现');
    }

    /**
     * 写入Flash状态寄存器值 - 对应Python _write_flash_status_reg_val方法
     * 这是一个抽象方法，需要在子类中实现具体的串口通信逻辑
     * @param {Object} serialHandler 串口处理器
     * @param {Array<number>} writeVal 要写入的值数组
     * @param {number} retry 重试次数
     * @returns {Promise<boolean>} 写入是否成功
     */
    async writeFlashStatusRegVal(serialHandler, writeVal, retry = 5) {
        throw new Error('writeFlashStatusRegVal() 方法必须在子类中实现');
    }

    /**
     * 解保护Flash - 对应Python unprotect_flash方法
     * @param {Object} serialHandler 串口处理器
     * @returns {Promise<boolean>} 解保护是否成功
     */
    async unprotectFlash(serialHandler) {
        this.trace('开始解保护Flash...');
        
        try {
            // 获取解保护配置
            const { value: unprotectRegVal, mask } = this.unprotectRegisterValue;
            this.trace(`解保护目标值: [${unprotectRegVal.map(v => '0x' + v.toString(16))}], 掩码: [${mask.map(m => '0x' + m.toString(16))}]`);
            
            // 读取当前状态寄存器值
            const regVal = await this.readFlashStatusRegVal(serialHandler);
            this.trace(`当前寄存器值: [${regVal.map(v => '0x' + v.toString(16))}]`);
            
            // 检查是否已经是解保护状态
            if (this.compareRegisterValue(regVal, unprotectRegVal, mask)) {
                this.trace('Flash已经处于解保护状态');
                return true;
            }
            
            // 需要修改寄存器值
            const writeVal = [...unprotectRegVal]; // 复制目标值
            for (let i = 0; i < writeVal.length && i < regVal.length && i < mask.length; i++) {
                // Python逻辑：保留非保护位的原始值，只修改保护相关位
                // writeVal[i] = writeVal[i] | (regVal[i] & (mask[i] ^ 0xff))
                writeVal[i] = writeVal[i] | (regVal[i] & (mask[i] ^ 0xff));
            }
            
            this.trace(`写入寄存器值: [${writeVal.map(v => '0x' + v.toString(16))}]`);
            
            // 写入新值
            await this.writeFlashStatusRegVal(serialHandler, writeVal);
            
            // 验证写入结果
            const newRegVal = await this.readFlashStatusRegVal(serialHandler);
            this.trace(`验证寄存器值: [${newRegVal.map(v => '0x' + v.toString(16))}]`);
            
            if (this.compareRegisterValue(newRegVal, unprotectRegVal, mask)) {
                this.trace('✅ Flash解保护成功');
                return true;
            } else {
                this.trace('❌ Flash解保护验证失败');
                return false;
            }
            
        } catch (error) {
            this.trace(`❌ Flash解保护失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 保护Flash - 基于Python代码中write方法的保护逻辑
     * @param {Object} serialHandler 串口处理器
     * @returns {Promise<boolean>} 保护是否成功
     */
    async protectFlash(serialHandler) {
        this.trace('开始保护Flash...');
        
        try {
            // 获取保护配置
            const { value: protectRegVal, mask } = this.protectRegisterValue;
            this.trace(`保护目标值: [${protectRegVal.map(v => '0x' + v.toString(16))}], 掩码: [${mask.map(m => '0x' + m.toString(16))}]`);
            
            // 读取当前状态寄存器值
            const regVal = await this.readFlashStatusRegVal(serialHandler);
            this.trace(`当前寄存器值: [${regVal.map(v => '0x' + v.toString(16))}]`);
            
            // 检查是否已经是保护状态
            if (this.compareRegisterValue(regVal, protectRegVal, mask)) {
                this.trace('Flash已经处于保护状态');
                return true;
            }
            
            // 需要修改寄存器值
            const writeVal = [...protectRegVal]; // 复制目标值
            for (let i = 0; i < writeVal.length && i < regVal.length && i < mask.length; i++) {
                // Python逻辑：保留非保护位的原始值，只修改保护相关位
                writeVal[i] = writeVal[i] | (regVal[i] & (mask[i] ^ 0xff));
            }
            
            this.trace(`写入寄存器值: [${writeVal.map(v => '0x' + v.toString(16))}]`);
            
            // 写入新值
            await this.writeFlashStatusRegVal(serialHandler, writeVal);
            
            // 验证写入结果
            const newRegVal = await this.readFlashStatusRegVal(serialHandler);
            this.trace(`验证寄存器值: [${newRegVal.map(v => '0x' + v.toString(16))}]`);
            
            if (this.compareRegisterValue(newRegVal, protectRegVal, mask)) {
                this.trace('✅ Flash保护成功');
                return true;
            } else {
                this.trace('❌ Flash保护验证失败');
                return false;
            }
            
        } catch (error) {
            this.trace(`❌ Flash保护失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取Flash配置信息摘要
     * @returns {Object} Flash配置摘要
     */
    getFlashConfigSummary() {
        if (!this.flashInfo) {
            return { error: 'Flash信息未初始化' };
        }
        
        return {
            flashId: '0x' + this.flashInfo[0].toString(16),
            name: this.flashInfo[1],
            manufacturer: this.flashInfo[2],
            size: this.flashSize,
            sizeStr: this.flashInfo[3],
            readCodes: this.flashStatusRegReadCode,
            writeCodes: this.flashStatusRegWriteCode,
            unprotectBits: this.flashInfo[4],
            protectBits: this.flashInfo[5]
        };
    }

    /**
     * 检查Flash是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isInitialized() {
        return this.flashInfo !== null;
    }

    /**
     * 重置Flash配置
     */
    reset() {
        this.flashInfo = null;
        this.trace('Flash配置已重置');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashConfigBase;
} else if (typeof window !== 'undefined') {
    window.FlashConfigBase = FlashConfigBase;
}