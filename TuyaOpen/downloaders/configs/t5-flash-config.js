/**
 * T5 Flash配置类 - 专用于T5芯片的Flash配置管理
 * 完全基于Python版本的flash_info.py和相关实现
 * 包含完整的52种Flash型号配置和T5专用的协议通信逻辑
 */

// 导入基础配置类
if (typeof window !== 'undefined') {
    // 浏览器环境
    var FlashConfigBase = window.FlashConfigBase;
} else {
    // Node.js环境
    var FlashConfigBase = require('./flash-config-base.js');
}

class T5FlashConfig extends FlashConfigBase {
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
            0x001840c8: [0x001840c8, 'GD25Q128C', 'GD', '128 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            
            // TH系列
            0x001260eb: [0x001260eb, 'TH25D20HA', 'TH', '2 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001360cd: [0x001360cd, 'TH25Q40HB', 'TH', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001460cd: [0x001460cd, 'TH25Q80HB', 'TH', '8 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001560eb: [0x001560eb, 'TH25Q16HB', 'TH', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001760eb: [0x001760eb, 'TH25Q64HA', 'TH', '64 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            
            // XTX系列
            0x0015400b: [0x0015400b, 'XT25F16B', 'XTX', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x0016400b: [0x0016400b, 'XT25F32B', 'XTX', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            
            // BY系列
            0x001440e0: [0x001440e0, 'BY25Q80A', 'BY', '8 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001340e0: [0x001340e0, 'BY25Q40A', 'BY', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            
            // PY系列
            0x00124485: [0x00124485, 'PY25D22U', 'PY', '2 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
            0x00124585: [0x00124585, 'PY25D24U', 'PY', '2 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
            0x00136085: [0x00136085, 'PY25Q40H', 'PY', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x00146085: [0x00146085, 'PY25Q80H', 'PY', '8 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x00156085: [0x00156085, 'PY25Q16H', 'PY', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x00154285: [0x00154285, 'PY25Q16SH', 'PY', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            0x00166085: [0x00166085, 'PY25Q32H', 'PY', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
            
            // UC系列
            0x001260b3: [0x001260b3, 'UC25HQ20', 'UC', '2 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001360b3: [0x001360b3, 'UC25HQ40', 'UC', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            
            // GT系列
            0x001240c4: [0x001240c4, 'GT25Q20D', 'GT', '2 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
            0x001340c4: [0x001340c4, 'GT25Q40D', 'GT', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01]
        };
        
        this.trace(`T5FlashConfig初始化完成，支持${Object.keys(this.configDatabase).length}种Flash型号`);
    }

    /**
     * 读取Flash状态寄存器值 - 实现T5专用的状态寄存器读取逻辑
     * 完全按照Python _read_flash_status_reg_val方法实现
     * @param {Object} serialHandler 串口处理器（T5Downloader实例）
     * @param {number} retry 重试次数
     * @returns {Promise<Array<number>>} 状态寄存器值数组
     */
    async readFlashStatusRegVal(serialHandler, retry = 5) {
        this.trace('读取Flash状态寄存器值...');
        
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }

        const readRegCodes = this.flashStatusRegReadCode;
        this.trace(`读取命令: [${readRegCodes.map(c => '0x' + c.toString(16))}]`);
        
        const srVal = [];

        // Python逻辑：遍历所有读取命令
        for (const regCode of readRegCodes) {
            let tmpVal = null;
            
            // Python逻辑：重试机制
            for (let retryCount = 0; retryCount < retry; retryCount++) {
                try {
                    this.trace(`读取寄存器0x${regCode.toString(16)}, 尝试${retryCount + 1}/${retry}`);
                    
                    // 使用T5协议读取状态寄存器
                    const response = await serialHandler.executeProtocol(
                        serialHandler.protocols.flashReadSR,  // FlashReadSRProtocol实例
                        [regCode],                            // 寄存器地址
                        13,                                   // 期望响应长度
                        100,                                  // 超时100ms
                        [regCode]                             // 检查参数
                    );
                    
                    // 使用协议的方法提取状态寄存器值
                    tmpVal = serialHandler.protocols.flashReadSR.getStatusRegisterValue(response);
                    if (tmpVal !== null) {
                        this.trace(`寄存器0x${regCode.toString(16)}值: 0x${tmpVal.toString(16)}`);
                        break;
                    }
                } catch (error) {
                    this.trace(`读取寄存器0x${regCode.toString(16)}失败: ${error.message}`);
                    if (retryCount === retry - 1) {
                        throw new Error(`read flash status register fail: 0x${regCode.toString(16)}`);
                    }
                }
            }
            
            if (tmpVal === null) {
                throw new Error(`read flash status register fail: 0x${regCode.toString(16)}`);
            }
            
            srVal.push(tmpVal);
        }
        
        this.trace(`读取状态寄存器完成: [${srVal.map(v => '0x' + v.toString(16))}]`);
        return srVal;
    }

    /**
     * 写入Flash状态寄存器值 - 实现T5专用的状态寄存器写入逻辑
     * 完全按照Python _write_flash_status_reg_val方法实现
     * @param {Object} serialHandler 串口处理器（T5Downloader实例）
     * @param {Array<number>} writeVal 要写入的值数组
     * @param {number} retry 重试次数
     * @returns {Promise<boolean>} 写入是否成功
     */
    async writeFlashStatusRegVal(serialHandler, writeVal, retry = 5) {
        this.trace(`写入Flash状态寄存器值: [${writeVal.map(v => '0x' + v.toString(16))}]`);
        
        if (!this.flashInfo) {
            throw new Error('Flash信息未初始化');
        }

        const writeRegCodes = this.flashStatusRegWriteCode;
        this.trace(`写入命令: [${writeRegCodes.map(c => '0x' + c.toString(16))}]`);
        
        // Python逻辑：检查是单个寄存器还是多个寄存器
        if (writeRegCodes.length === 1) {
            // 单个寄存器写入逻辑
            this.trace('单个寄存器写入模式');
            let tmpRes = false;
            
            for (let retryCount = 0; retryCount < retry; retryCount++) {
                try {
                    this.trace(`写入寄存器0x${writeRegCodes[0].toString(16)}, 尝试${retryCount + 1}/${retry}`);
                    
                    // 使用T5协议写入状态寄存器
                    const response = await serialHandler.executeProtocol(
                        serialHandler.protocols.flashWriteSR,  // FlashWriteSRProtocol实例
                        [writeRegCodes[0], writeVal],          // 寄存器地址和值
                        7 + 2 + 1 + 1 + (1 + writeVal.length), // 期望响应长度
                        100,                                   // 超时100ms
                        [writeRegCodes[0], writeVal]           // 检查参数
                    );
                    
                    tmpRes = true;
                    this.trace(`寄存器0x${writeRegCodes[0].toString(16)}写入成功`);
                    break;
                } catch (error) {
                    this.trace(`写入寄存器0x${writeRegCodes[0].toString(16)}失败: ${error.message}`);
                    if (retryCount === retry - 1) {
                        throw new Error(`write flash status register fail: 0x${writeRegCodes[0].toString(16)}`);
                    }
                }
            }
            
            if (!tmpRes) {
                throw new Error(`write flash status register fail: 0x${writeRegCodes[0].toString(16)}`);
            }
        } else {
            // 多个寄存器写入逻辑 - 按照Python的实现
            this.trace('多个寄存器写入模式');
            
            for (let idx = 0; idx < writeRegCodes.length && idx < writeVal.length; idx++) {
                const regCode = writeRegCodes[idx];
                const regVal = [writeVal[idx]]; // 单个字节作为数组
                let tmpRes = false;
                
                for (let retryCount = 0; retryCount < retry; retryCount++) {
                    try {
                        this.trace(`写入寄存器${idx}: 0x${regCode.toString(16)} = 0x${regVal[0].toString(16)}, 尝试${retryCount + 1}/${retry}`);
                        
                        // 使用T5协议写入状态寄存器
                        const response = await serialHandler.executeProtocol(
                            serialHandler.protocols.flashWriteSR,  // FlashWriteSRProtocol实例
                            [regCode, regVal[0]],                  // 寄存器地址和值
                            7 + 2 + 1 + 1 + 2,                     // 期望响应长度
                            100,                                   // 超时100ms
                            [regCode, regVal[0]]                   // 检查参数
                        );
                        
                        tmpRes = true;
                        this.trace(`寄存器${idx}: 0x${regCode.toString(16)}写入成功`);
                        break;
                    } catch (error) {
                        this.trace(`写入寄存器${idx}: 0x${regCode.toString(16)}失败: ${error.message}`);
                        if (retryCount === retry - 1) {
                            throw new Error(`write flash status register fail: 0x${regCode.toString(16)}`);
                        }
                    }
                }
                
                if (!tmpRes) {
                    throw new Error(`write flash status register fail: 0x${regCode.toString(16)}`);
                }
            }
        }
        
        this.trace('写入Flash状态寄存器完成');
        return true;
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
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5FlashConfig;
} else if (typeof window !== 'undefined') {
    window.T5FlashConfig = T5FlashConfig;
}