/**
 * T5AI 协议定义模块
 * 定义T5芯片的21个通信协议
 */

/**
 * 基础协议类
 */
class BaseProtocol {
    constructor(cmd) {
        this.cmd = cmd;
    }

    /**
     * 生成命令
     * @param {Array} payload - 载荷数据
     * @returns {Array} 完整命令
     */
    generateCommand(payload = []) {
        const payloadLength = 1 + payload.length;
        return [0x01, 0xE0, 0xFC, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, this.cmd, ...payload];
    }

    /**
     * 计算期望响应长度
     * @param {number} dataLength - 数据长度
     * @returns {number} 期望响应长度
     */
    getExpectedResponseLength(dataLength) {
        // 基础响应格式: 2 + 1 + 3 + 1 + dataLength = 7 + dataLength
        return 7 + dataLength;
    }
}

/**
 * Flash基础协议类
 */
class BaseFlashProtocol {
    constructor(cmd) {
        this.cmd = cmd;
    }

    /**
     * 生成Flash命令
     * @param {Array} payload - 载荷数据
     * @returns {Array} 完整命令
     */
    generateCommand(payload = []) {
        const payloadLength = 1 + payload.length;
        return [0x01, 0xE0, 0xFC, 0xFF, 0xF4, payloadLength & 0xFF, (payloadLength >> 8) & 0xFF, this.cmd, ...payload];
    }

    /**
     * 计算期望响应长度
     * @param {number} dataLength - 数据长度
     * @returns {number} 期望响应长度
     */
    getExpectedResponseLength(dataLength) {
        // Flash响应格式: 7 + 2 + 1 + 1 + dataLength = 11 + dataLength
        return 11 + dataLength;
    }
}

/**
 * 1. 链路检查协议
 */
class LinkCheckProtocol extends BaseProtocol {
    constructor() {
        super(0x00);
    }

    /**
     * 执行链路检查命令
     * @returns {Array} 命令数组
     */
    cmd() {
        return [0x01, 0xE0, 0xFC, 0x01, 0x00];
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 8; // 2 + 1 + 3 + 1 + 1 = 8
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 8 &&
               response[0] === 0x04 && response[1] === 0x0E &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC &&
               response[6] === 0x01 && response[7] === 0x00;
    }
}

/**
 * 2. 获取芯片ID协议
 */
class GetChipIdProtocol extends BaseProtocol {
    constructor() {
        super(0x44);
    }

    /**
     * 执行获取芯片ID命令
     * @returns {Array} 命令数组
     */
    cmd() {
        return [0x01, 0xE0, 0xFC, 0x05, 0x03, 0x04, 0x00, 0x01, 0x44];
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 15; // 基础头部 + 4字节芯片ID
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 15 &&
               response[0] === 0x04 && response[1] === 0x0E &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC &&
               response[6] === 0x03;
    }

    /**
     * 提取芯片ID
     * @param {Array} response - 响应数据
     * @returns {number} 芯片ID
     */
    extractChipId(response) {
        if (!this.checkResponse(response)) {
            throw new Error('响应格式错误');
        }
        
        const chipIdBytes = response.slice(-4);
        return chipIdBytes[0] | (chipIdBytes[1] << 8) | (chipIdBytes[2] << 16) | (chipIdBytes[3] << 24);
    }
}

/**
 * 3. 获取Flash MID协议
 */
class GetFlashMidProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x0e);
    }

    /**
     * 执行获取Flash MID命令
     * @returns {Array} 命令数组
     */
    cmd() {
        return [0x01, 0xE0, 0xFC, 0xFF, 0xF4, 0x05, 0x00, 0x0e, 0x9f, 0x00, 0x00, 0x00];
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 15; // 基础头部 + 4字节Flash ID
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 11 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[9] === 0x0e && response[10] === 0x00;
    }

    /**
     * 提取Flash ID
     * @param {Array} response - 响应数据
     * @returns {number} Flash ID
     */
    extractFlashId(response) {
        if (!this.checkResponse(response) || response.length < 15) {
            throw new Error('响应格式错误或长度不足');
        }
        
        // Python: struct.unpack("<I", response_content[11:])[0] >> 8
        const flashIdData = response.slice(11, 15);
        const flashId32 = flashIdData[0] | (flashIdData[1] << 8) | (flashIdData[2] << 16) | (flashIdData[3] << 24);
        return flashId32 >>> 8;
    }
}

/**
 * 4. 设置波特率协议
 */
class SetBaudrateProtocol extends BaseProtocol {
    constructor() {
        super(0x43);
    }

    /**
     * 执行设置波特率命令
     * @param {number} baudrate - 波特率
     * @returns {Array} 命令数组
     */
    cmd(baudrate) {
        const payload = [
            baudrate & 0xff,
            (baudrate >> 8) & 0xff,
            (baudrate >> 16) & 0xff,
            (baudrate >> 24) & 0xff
        ];
        return [0x01, 0xE0, 0xFC, 0x08, 0x03, 0x04, 0x00, 0x04, 0x43, ...payload];
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 11; // 基础头部 + 4字节波特率确认
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} expectedBaudrate - 期望的波特率
     * @returns {boolean} 检查结果
     */
    checkResponse(response, expectedBaudrate) {
        if (response.length < 11) return false;
        
        // 检查基础格式
        if (!(response[0] === 0x04 && response[1] === 0x0E &&
              response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC &&
              response[6] === 0x03)) {
            return false;
        }
        
        // 检查波特率回显
        const responseBaudrate = response[7] | (response[8] << 8) | (response[9] << 16) | (response[10] << 24);
        return responseBaudrate === expectedBaudrate;
    }
}

/**
 * 5. Flash读状态寄存器协议
 */
class FlashReadSRProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x0c);
    }

    /**
     * 执行读状态寄存器命令
     * @param {number} regAddr - 寄存器地址
     * @returns {Array} 命令数组
     */
    cmd(regAddr) {
        const payload = [regAddr];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 13; // 11 + 2 (寄存器地址 + 值)
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} regAddr - 期望的寄存器地址
     * @returns {boolean} 检查结果
     */
    checkResponse(response, regAddr) {
        return response.length >= 13 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[10] === 0x00 && response[11] === regAddr;
    }

    /**
     * 获取状态寄存器值
     * @param {Array} response - 响应数据
     * @returns {number} 状态寄存器值
     */
    getStatusRegisterValue(response) {
        if (response.length < 13) {
            throw new Error('响应长度不足');
        }
        return response[12];
    }
}

/**
 * 6. Flash写状态寄存器协议
 */
class FlashWriteSRProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x0d);
    }

    /**
     * 执行写状态寄存器命令
     * @param {number} regAddr - 寄存器地址
     * @param {Array} values - 写入值数组
     * @returns {Array} 命令数组
     */
    cmd(regAddr, values) {
        const payload = [regAddr, ...values];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @param {number} valueCount - 写入值的数量
     * @returns {number} 期望长度
     */
    getExpectedLength(valueCount) {
        return 11 + 1 + valueCount; // 基础头部 + 寄存器地址 + 值
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} regAddr - 期望的寄存器地址
     * @returns {boolean} 检查结果
     */
    checkResponse(response, regAddr) {
        return response.length >= 12 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[10] === 0x00 && response[11] === regAddr;
    }
}

/**
 * 7. Flash 4K擦除协议
 */
class FlashErase4kProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x0b);
    }

    /**
     * 执行4K擦除命令
     * @param {number} flashAddr - Flash地址
     * @returns {Array} 命令数组
     */
    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 15; // 11 + 4 (地址确认)
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} flashAddr - 期望的Flash地址
     * @returns {boolean} 检查结果
     */
    checkResponse(response, flashAddr) {
        if (response.length < 15) return false;
        
        // 检查基础格式
        if (!(response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
              response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
              response[10] === 0x00)) {
            return false;
        }
        
        // 检查地址回显
        const responseAddr = response.slice(11, 15);
        const expectedAddr = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        
        return responseAddr.every((byte, index) => byte === expectedAddr[index]);
    }
}

/**
 * 8. Flash 4K擦除扩展协议
 */
class FlashErase4kExtProtocol extends BaseFlashProtocol {
    constructor() {
        super(0xeb);
    }

    /**
     * 执行4K擦除扩展命令
     * @param {number} flashAddr - Flash地址
     * @returns {Array} 命令数组
     */
    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 15; // 11 + 4 (地址确认)
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 11 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[10] === 0x00;
    }
}

/**
 * 9. Flash 64K擦除协议
 */
class FlashErase64kProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x20);
    }

    /**
     * 执行64K擦除命令
     * @param {number} flashAddr - Flash地址
     * @returns {Array} 命令数组
     */
    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 15; // 11 + 4 (地址确认)
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} flashAddr - 期望的Flash地址
     * @returns {boolean} 检查结果
     */
    checkResponse(response, flashAddr) {
        if (response.length < 15) return false;
        
        // 检查基础格式
        if (!(response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
              response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
              response[10] === 0x00)) {
            return false;
        }
        
        // 检查地址回显
        const responseAddr = response.slice(11, 15);
        const expectedAddr = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        
        return responseAddr.every((byte, index) => byte === expectedAddr[index]);
    }
}

/**
 * 10. Flash 64K擦除扩展协议
 */
class FlashErase64kExtProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x21);
    }

    /**
     * 执行64K擦除扩展命令
     * @param {number} flashAddr - Flash地址
     * @returns {Array} 命令数组
     */
    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 15; // 11 + 4 (地址确认)
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 11 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[10] === 0x00;
    }
}

/**
 * 11. Flash 4K读取协议
 */
class FlashRead4kProtocol extends BaseFlashProtocol {
    constructor() {
        super(0x0a);
    }

    /**
     * 执行4K读取命令
     * @param {number} flashAddr - Flash地址
     * @returns {Array} 命令数组
     */
    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 11 + 4 + 4096; // 基础头部 + 地址 + 4K数据
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} flashAddr - 期望的Flash地址
     * @returns {boolean} 检查结果
     */
    checkResponse(response, flashAddr) {
        if (response.length < this.getExpectedLength()) return false;
        
        // 检查基础格式
        if (!(response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
              response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
              response[10] === 0x00)) {
            return false;
        }
        
        // 检查地址回显
        const responseAddr = response.slice(11, 15);
        const expectedAddr = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        
        return responseAddr.every((byte, index) => byte === expectedAddr[index]);
    }

    /**
     * 获取读取内容
     * @param {Array} response - 响应数据
     * @returns {Uint8Array} 读取的数据
     */
    getReadContent(response) {
        if (response.length < this.getExpectedLength()) {
            throw new Error('响应长度不足');
        }
        return response.slice(15, 15 + 4096);
    }
}

/**
 * 12. Flash 4K读取扩展协议
 */
class FlashRead4kExtProtocol extends BaseFlashProtocol {
    constructor() {
        super(0xea);
    }

    /**
     * 执行4K读取扩展命令
     * @param {number} flashAddr - Flash地址
     * @returns {Array} 命令数组
     */
    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 11 + 4 + 4096; // 基础头部 + 地址 + 4K数据
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 11 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[10] === 0x00;
    }

    /**
     * 获取读取内容
     * @param {Array} response - 响应数据
     * @returns {Uint8Array} 读取的数据
     */
    getReadContent(response) {
        if (response.length < this.getExpectedLength()) {
            throw new Error('响应长度不足');
        }
        return response.slice(15, 15 + 4096);
    }
}

/**
 * 13. Flash 256字节写入协议
 */
class FlashWrite256Protocol extends BaseFlashProtocol {
    constructor() {
        super(0x09);
    }

    /**
     * 执行256字节写入命令
     * @param {number} flashAddr - Flash地址
     * @param {Uint8Array} data - 写入数据
     * @returns {Array} 命令数组
     */
    cmd(flashAddr, data) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff,
            ...data
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 11 + 4 + 256; // 基础头部 + 地址 + 256字节数据确认
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @param {number} flashAddr - 期望的Flash地址
     * @returns {boolean} 检查结果
     */
    checkResponse(response, flashAddr) {
        if (response.length < 15) return false;
        
        // 检查基础格式
        if (!(response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
              response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
              response[10] === 0x00)) {
            return false;
        }
        
        // 检查地址回显
        const responseAddr = response.slice(11, 15);
        const expectedAddr = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        
        return responseAddr.every((byte, index) => byte === expectedAddr[index]);
    }
}

/**
 * 14. Flash 256字节写入扩展协议
 */
class FlashWrite256ExtProtocol extends BaseFlashProtocol {
    constructor() {
        super(0xe9);
    }

    /**
     * 执行256字节写入扩展命令
     * @param {number} flashAddr - Flash地址
     * @param {Uint8Array} data - 写入数据
     * @returns {Array} 命令数组
     */
    cmd(flashAddr, data) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff,
            ...data
        ];
        return this.generateCommand(payload);
    }

    /**
     * 获取期望响应长度
     * @returns {number} 期望长度
     */
    getExpectedLength() {
        return 11 + 4 + 256; // 基础头部 + 地址 + 256字节数据确认
    }

    /**
     * 检查响应
     * @param {Array} response - 响应数据
     * @returns {boolean} 检查结果
     */
    checkResponse(response) {
        return response.length >= 11 &&
               response[0] === 0x04 && response[1] === 0x0E && response[2] === 0xFF &&
               response[3] === 0x01 && response[4] === 0xE0 && response[5] === 0xFC && response[6] === 0xF4 &&
               response[10] === 0x00;
    }
}

// 导出所有协议类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseProtocol,
        BaseFlashProtocol,
        LinkCheckProtocol,
        GetChipIdProtocol,
        GetFlashMidProtocol,
        SetBaudrateProtocol,
        FlashReadSRProtocol,
        FlashWriteSRProtocol,
        FlashErase4kProtocol,
        FlashErase4kExtProtocol,
        FlashErase64kProtocol,
        FlashErase64kExtProtocol,
        FlashRead4kProtocol,
        FlashRead4kExtProtocol,
        FlashWrite256Protocol,
        FlashWrite256ExtProtocol
    };
} else if (typeof window !== 'undefined') {
    Object.assign(window, {
        BaseProtocol,
        BaseFlashProtocol,
        LinkCheckProtocol,
        GetChipIdProtocol,
        GetFlashMidProtocol,
        SetBaudrateProtocol,
        FlashReadSRProtocol,
        FlashWriteSRProtocol,
        FlashErase4kProtocol,
        FlashErase4kExtProtocol,
        FlashErase64kProtocol,
        FlashErase64kExtProtocol,
        FlashRead4kProtocol,
        FlashRead4kExtProtocol,
        FlashWrite256Protocol,
        FlashWrite256ExtProtocol
    });
}