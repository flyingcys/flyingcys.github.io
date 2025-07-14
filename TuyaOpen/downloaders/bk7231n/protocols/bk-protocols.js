/**
 * BK系列芯片协议实现 - 基于Python tyutool的BK7231N协议
 * 完全按照 third_party/tyutool/tyutool/flash/bk7231n/protocol.py 实现
 * 
 * BK7231N使用SLIP协议，与T5协议结构有所不同
 * 支持的协议类型：
 * 1. 基础协议（使用简单头部）
 * 2. Flash协议（使用扩展头部）
 */

// 导入基础协议类
let BaseProtocol;
if (typeof window !== 'undefined') {
    // 浏览器环境
    BaseProtocol = window.BaseProtocol;
} else {
    // Node.js环境
    const baseProtocol = require('./base-protocol.js');
    BaseProtocol = baseProtocol.BaseProtocol;
}

/**
 * BK基础协议类 - BK芯片的基础协议实现
 * 对应Python中的基础命令格式
 */
class BaseBKProtocol extends BaseProtocol {
    constructor() {
        super();
        this.name = 'BaseBKProtocol';
        
        // BK基础协议头 - 对应Python中的基础命令格式
        this.baseTxHeader = [0x01, 0xe0, 0xfc];
        this.baseRxHeader = [0x04, 0x0e];
    }

    /**
     * 生成BK基础协议命令
     * @param {number} cmd 命令码
     * @param {Array<number>} payload 负载数据
     * @returns {Array<number>} 完整命令
     */
    commandGenerate(cmd, payload = []) {
        const command = [];
        command.push(...this.baseTxHeader);
        command.push(1 + payload.length);  // 长度 = 命令码(1) + 负载长度
        command.push(cmd);
        command.push(...payload);
        
        this.trace(`Generated BK command: [${command.map(x => '0x' + x.toString(16).padStart(2, '0')).join(', ')}]`);
        return command;
    }

    /**
     * 检查BK基础响应
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 响应是否有效
     */
    responseCheck(responseContent) {
        this.trace(`Checking BK response: ${responseContent.length} bytes`);
        
        if (responseContent.length < 7) {
            this.trace('Response too short for BK protocol');
            return false;
        }
        
        // 检查响应头
        if (responseContent[0] !== this.baseRxHeader[0] || 
            responseContent[1] !== this.baseRxHeader[1]) {
            this.trace(`Invalid BK response header: [${responseContent[0].toString(16)}, ${responseContent[1].toString(16)}]`);
            return false;
        }
        
        // 检查长度
        const declaredLength = responseContent[2];
        const actualLength = responseContent.length - 3;
        if (declaredLength !== actualLength) {
            this.trace(`BK length mismatch: declared=${declaredLength}, actual=${actualLength}`);
            return false;
        }
        
        // 检查发送头回显
        if (responseContent[3] !== this.baseTxHeader[0] ||
            responseContent[4] !== this.baseTxHeader[1] ||
            responseContent[5] !== this.baseTxHeader[2]) {
            this.trace('Invalid BK tx header echo');
            return false;
        }
        
        return true;
    }
}

/**
 * BK Flash协议类 - BK芯片的Flash操作协议实现  
 * 对应Python中的扩展命令格式
 */
class BaseBKFlashProtocol extends BaseProtocol {
    constructor() {
        super();
        this.name = 'BaseBKFlashProtocol';
        
        // BK Flash协议头 - 对应Python中的扩展命令格式
        this.baseTxHeader = [0x01, 0xe0, 0xfc, 0xff, 0xf4];
        this.baseRxHeader = [0x04, 0x0e, 0xff, 0x01, 0xe0, 0xfc, 0xf4];
    }

    /**
     * 生成BK Flash协议命令
     * @param {number} cmd 命令码
     * @param {Array<number>} payload 负载数据
     * @returns {Array<number>} 完整命令
     */
    commandGenerate(cmd, payload = []) {
        const command = [];
        command.push(...this.baseTxHeader);
        
        // 长度字段（小端序）
        const length = 1 + payload.length;
        command.push(length & 0xff);           // 低字节
        command.push((length >> 8) & 0xff);    // 高字节
        
        command.push(cmd);                     // 命令码
        command.push(...payload);              // 负载
        
        this.trace(`Generated BK Flash command: [${command.map(x => '0x' + x.toString(16).padStart(2, '0')).join(', ')}]`);
        return command;
    }

    /**
     * 检查BK Flash响应
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 响应是否有效
     */
    responseCheck(responseContent) {
        this.trace(`Checking BK Flash response: ${responseContent.length} bytes`);
        
        if (responseContent.length < this.baseRxHeader.length) {
            this.trace(`BK Flash response too short: ${responseContent.length} bytes`);
            return false;
        }
        
        // 检查响应头
        for (let i = 0; i < this.baseRxHeader.length; i++) {
            if (responseContent[i] !== this.baseRxHeader[i]) {
                this.trace(`BK Flash response header mismatch at position ${i}: got 0x${responseContent[i].toString(16)}, expected 0x${this.baseRxHeader[i].toString(16)}`);
                return false;
            }
        }
        
        // 检查长度
        if (responseContent.length >= 9) {
            const declaredLength = responseContent[7] | (responseContent[8] << 8);
            const actualLength = responseContent.length - 9;
            if (declaredLength !== actualLength) {
                this.trace(`BK Flash length mismatch: declared=${declaredLength}, actual=${actualLength}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * 获取Flash响应的状态码
     * @param {Uint8Array} responseContent 响应内容
     * @returns {number|null} 状态码
     */
    getResponseStatus(responseContent) {
        if (responseContent.length < 10) {
            this.trace(`BK Flash response too short to get status: ${responseContent.length} bytes`);
            return null;
        }
        
        const status = responseContent[9];
        this.trace(`BK Flash response status: 0x${status.toString(16)}`);
        return status;
    }

    /**
     * 检查Flash操作是否成功
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 操作是否成功
     */
    isResponseSuccess(responseContent) {
        const status = this.getResponseStatus(responseContent);
        return status === 0x00;
    }
}

/**
 * 1. 链路检查协议 - 对应Python LinkCheck
 */
class BKLinkCheckProtocol extends BaseBKProtocol {
    constructor() {
        super();
        this.name = 'BKLinkCheckProtocol';
        this.CMD_LINK_CHECK = 0x00;
    }

    cmd() {
        return this.commandGenerate(this.CMD_LINK_CHECK, []);
    }

    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查命令码回显 - 应该是CMD_LINK_CHECK + 1 = 0x01
        if (responseContent.length < 7) {
            this.trace('Response too short for link check');
            return false;
        }
        
        const expectedCmd = this.CMD_LINK_CHECK + 1;
        const isValid = responseContent[6] === expectedCmd;
        if (!isValid) {
            this.trace(`Link check command echo mismatch: got 0x${responseContent[6].toString(16)}, expected 0x${expectedCmd.toString(16)}`);
        }
        
        return isValid;
    }
}

/**
 * 2. 设置波特率协议 - 对应Python SetBaudRate
 */
class BKSetBaudrateProtocol extends BaseBKProtocol {
    constructor() {
        super();
        this.name = 'BKSetBaudrateProtocol';
        this.CMD_SET_BAUDRATE = 0x0f;
    }

    cmd(baudrate, dlyMs = 100) {
        const payload = [
            baudrate & 0xff,
            (baudrate >> 8) & 0xff,
            (baudrate >> 16) & 0xff,
            (baudrate >> 24) & 0xff,
            dlyMs & 0xff
        ];
        return this.commandGenerate(this.CMD_SET_BAUDRATE, payload);
    }

    responseCheck(responseContent, baudrate, dlyMs = 100) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 12) {
            this.trace('Response too short for baudrate check');
            return false;
        }
        
        // 检查波特率回显
        const echoBaudrate = responseContent[7] | 
                           (responseContent[8] << 8) | 
                           (responseContent[9] << 16) | 
                           (responseContent[10] << 24);
        const echoDlyMs = responseContent[11];
        
        const isValid = echoBaudrate === baudrate && echoDlyMs === dlyMs;
        if (!isValid) {
            this.trace(`Baudrate echo mismatch: got ${echoBaudrate}:${echoDlyMs}, expected ${baudrate}:${dlyMs}`);
        }
        
        return isValid;
    }
}

/**
 * 3. Flash读取4K协议 - 对应Python FlashRead4K  
 */
class BKFlashRead4KProtocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashRead4KProtocol';
        this.CMD_FLASH_READ_4K = 0x09;
    }

    cmd(addr) {
        const payload = [
            addr & 0xff,
            (addr >> 8) & 0xff,
            (addr >> 16) & 0xff,
            (addr >> 24) & 0xff
        ];
        return this.commandGenerate(this.CMD_FLASH_READ_4K, payload);
    }

    responseCheck(responseContent, addr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 15) {
            this.trace('Response too short for flash read 4K check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_READ_4K) {
            this.trace(`Flash read 4K command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_READ_4K.toString(16)}`);
            return false;
        }
        
        return true;
    }

    /**
     * 获取读取的数据
     * @param {Uint8Array} responseContent 响应内容
     * @returns {Uint8Array|null} 读取的4K数据
     */
    getData(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        if (responseContent.length < 15 + 4096) {
            this.trace('Response too short to extract 4K data');
            return null;
        }
        
        // 数据从索引15开始，长度4096字节
        return responseContent.slice(15, 15 + 4096);
    }
}

/**
 * 4. Flash写入4K协议 - 对应Python FlashWrite4K
 */
class BKFlashWrite4KProtocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashWrite4KProtocol';
        this.CMD_FLASH_WRITE_4K = 0x07;
    }

    cmd(addr, data) {
        // 确保数据长度为4K
        const data4K = new Array(4096).fill(0xff);
        for (let i = 0; i < Math.min(data.length, 4096); i++) {
            data4K[i] = data[i];
        }
        
        const payload = [
            addr & 0xff,
            (addr >> 8) & 0xff,
            (addr >> 16) & 0xff,
            (addr >> 24) & 0xff,
            ...data4K
        ];
        return this.commandGenerate(this.CMD_FLASH_WRITE_4K, payload);
    }

    responseCheck(responseContent, addr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 15) {
            this.trace('Response too short for flash write 4K check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_WRITE_4K) {
            this.trace(`Flash write 4K command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_WRITE_4K.toString(16)}`);
            return false;
        }
        
        return true;
    }
}

/**
 * 5. Flash擦除协议 - 对应Python FlashErase
 */
class BKFlashEraseProtocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashEraseProtocol';
        this.CMD_FLASH_ERASE = 0x0f;
    }

    cmd(addr, szCmd) {
        const payload = [
            szCmd,
            addr & 0xff,
            (addr >> 8) & 0xff,
            (addr >> 16) & 0xff,
            (addr >> 24) & 0xff
        ];
        return this.commandGenerate(this.CMD_FLASH_ERASE, payload);
    }

    responseCheck(responseContent, addr, szCmd) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 16) {
            this.trace('Response too short for flash erase check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_ERASE) {
            this.trace(`Flash erase command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_ERASE.toString(16)}`);
            return false;
        }
        
        // 检查擦除命令回显
        if (responseContent[11] !== szCmd) {
            this.trace(`Flash erase size command echo mismatch: got 0x${responseContent[11].toString(16)}, expected 0x${szCmd.toString(16)}`);
            return false;
        }
        
        return true;
    }
}

/**
 * 6. CRC检查协议 - 对应Python CheckCRC
 */
class BKCheckCRCProtocol extends BaseBKProtocol {
    constructor() {
        super();
        this.name = 'BKCheckCRCProtocol';
        this.CMD_CHECK_CRC = 0x10;
    }

    cmd(startAddr, endAddr) {
        const payload = [
            startAddr & 0xff,
            (startAddr >> 8) & 0xff,
            (startAddr >> 16) & 0xff,
            (startAddr >> 24) & 0xff,
            endAddr & 0xff,
            (endAddr >> 8) & 0xff,
            (endAddr >> 16) & 0xff,
            (endAddr >> 24) & 0xff
        ];
        return this.commandGenerate(this.CMD_CHECK_CRC, payload);
    }

    responseCheck(responseContent, startAddr, endAddr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 11) {
            this.trace('Response too short for CRC check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[6] !== this.CMD_CHECK_CRC) {
            this.trace(`CRC check command echo mismatch: got 0x${responseContent[6].toString(16)}, expected 0x${this.CMD_CHECK_CRC.toString(16)}`);
            return false;
        }
        
        return true;
    }

    /**
     * 获取CRC值
     * @param {Uint8Array} responseContent 响应内容
     * @returns {number|null} CRC值
     */
    getCRC(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        if (responseContent.length < 11) {
            this.trace('Response too short to extract CRC');
            return null;
        }
        
        // CRC值是小端序4字节
        const crc = responseContent[7] | 
                   (responseContent[8] << 8) | 
                   (responseContent[9] << 16) | 
                   (responseContent[10] << 24);
        
        this.trace(`Parsed CRC: 0x${crc.toString(16)}`);
        return crc >>> 0; // 确保无符号32位
    }
}

/**
 * 7. Flash获取MID协议 - 对应Python FlashGetMID
 */
class BKFlashGetMIDProtocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashGetMIDProtocol';
        this.CMD_FLASH_GET_MID = 0x0e;
    }

    cmd(regAddr = 0x9f) {
        const payload = [
            regAddr & 0xff,
            0x00,
            0x00,
            0x00
        ];
        return this.commandGenerate(this.CMD_FLASH_GET_MID, payload);
    }

    responseCheck(responseContent, regAddr = 0x9f) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 15) {
            this.trace('Response too short for flash MID check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_GET_MID) {
            this.trace(`Flash MID command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_GET_MID.toString(16)}`);
            return false;
        }
        
        return true;
    }

    /**
     * 获取Flash MID
     * @param {Uint8Array} responseContent 响应内容
     * @returns {number|null} Flash MID
     */
    getMID(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        if (responseContent.length < 15) {
            this.trace('Response too short to extract MID');
            return null;
        }
        
        // MID从字节11开始，4字节数据，但只取前3字节
        const mid = (responseContent[11] << 16) | 
                   (responseContent[12] << 8) | 
                   responseContent[13];
        
        this.trace(`Parsed Flash MID: 0x${mid.toString(16)}`);
        return mid;
    }
}

/**
 * 8. Flash读状态寄存器协议 - 对应Python FlashReadSR
 */
class BKFlashReadSRProtocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashReadSRProtocol';
        this.CMD_FLASH_READ_SR = 0x0c;
    }

    cmd(regAddr) {
        const payload = [regAddr & 0xff];
        return this.commandGenerate(this.CMD_FLASH_READ_SR, payload);
    }

    responseCheck(responseContent, regAddr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 13) {
            this.trace('Response too short for flash read SR check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_READ_SR) {
            this.trace(`Flash read SR command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_READ_SR.toString(16)}`);
            return false;
        }
        
        // 检查寄存器地址回显
        if (responseContent[11] !== regAddr) {
            this.trace(`Flash read SR register address echo mismatch: got 0x${responseContent[11].toString(16)}, expected 0x${regAddr.toString(16)}`);
            return false;
        }
        
        return true;
    }

    /**
     * 获取状态寄存器值
     * @param {Uint8Array} responseContent 响应内容
     * @returns {number|null} 状态寄存器值
     */
    getStatusValue(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        if (responseContent.length < 13) {
            this.trace('Response too short to extract status register value');
            return null;
        }
        
        const value = responseContent[12];
        this.trace(`Parsed status register value: 0x${value.toString(16)}`);
        return value;
    }
}

/**
 * 9. Flash写状态寄存器协议 - 对应Python FlashWriteSR
 */
class BKFlashWriteSRProtocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashWriteSRProtocol';
        this.CMD_FLASH_WRITE_SR = 0x0d;
    }

    cmd(regAddr, value) {
        const payload = [
            regAddr & 0xff,
            value & 0xff
        ];
        return this.commandGenerate(this.CMD_FLASH_WRITE_SR, payload);
    }

    responseCheck(responseContent, regAddr, value) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 13) {
            this.trace('Response too short for flash write SR check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_WRITE_SR) {
            this.trace(`Flash write SR command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_WRITE_SR.toString(16)}`);
            return false;
        }
        
        // 检查寄存器地址和值回显
        if (responseContent[11] !== regAddr || responseContent[12] !== (value & 0xff)) {
            this.trace(`Flash write SR parameter echo mismatch: got addr=0x${responseContent[11].toString(16)}, value=0x${responseContent[12].toString(16)}, expected addr=0x${regAddr.toString(16)}, value=0x${(value & 0xff).toString(16)}`);
            return false;
        }
        
        return true;
    }
}

/**
 * 10. Flash写状态寄存器2字节协议 - 对应Python FlashWriteSR2
 */
class BKFlashWriteSR2Protocol extends BaseBKFlashProtocol {
    constructor() {
        super();
        this.name = 'BKFlashWriteSR2Protocol';
        this.CMD_FLASH_WRITE_SR = 0x0d; // 与单字节写入使用相同命令码
    }

    cmd(regAddr, value) {
        const payload = [
            regAddr & 0xff,
            value & 0xff,
            (value >> 8) & 0xff
        ];
        return this.commandGenerate(this.CMD_FLASH_WRITE_SR, payload);
    }

    responseCheck(responseContent, regAddr, value) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        if (responseContent.length < 14) {
            this.trace('Response too short for flash write SR2 check');
            return false;
        }
        
        // 检查命令码回显
        if (responseContent[9] !== this.CMD_FLASH_WRITE_SR) {
            this.trace(`Flash write SR2 command echo mismatch: got 0x${responseContent[9].toString(16)}, expected 0x${this.CMD_FLASH_WRITE_SR.toString(16)}`);
            return false;
        }
        
        // 检查寄存器地址和值回显
        if (responseContent[11] !== regAddr || 
            responseContent[12] !== (value & 0xff) || 
            responseContent[13] !== ((value >> 8) & 0xff)) {
            this.trace(`Flash write SR2 parameter echo mismatch`);
            return false;
        }
        
        return true;
    }
}

/**
 * 11. 重启协议 - 对应Python Reboot
 */
class BKRebootProtocol extends BaseBKProtocol {
    constructor() {
        super();
        this.name = 'BKRebootProtocol';
        this.CMD_REBOOT = 0x0e;
    }

    cmd() {
        return this.commandGenerate(this.CMD_REBOOT, [0xa5]);
    }

    responseCheck(responseContent) {
        // 重启命令可能不会有响应，或者响应可能不完整
        return true;
    }
}

/**
 * 12. BK寄存器重启协议 - 对应Python BKRegDoReboot
 */
class BKRegDoRebootProtocol extends BaseBKProtocol {
    constructor() {
        super();
        this.name = 'BKRegDoRebootProtocol';
        this.CMD_BK_REG_DO_REBOOT = 0xfe;
    }

    cmd() {
        return this.commandGenerate(this.CMD_BK_REG_DO_REBOOT, [0x95, 0x27, 0x95, 0x27]);
    }

    responseCheck(responseContent) {
        // 重启命令可能不会有响应，或者响应可能不完整
        return true;
    }
}

/**
 * BK协议工厂类 - 管理所有BK协议类的创建
 */
class BKProtocolFactory {
    constructor() {
        this.protocols = {
            'LinkCheck': BKLinkCheckProtocol,
            'SetBaudrate': BKSetBaudrateProtocol,
            'FlashRead4K': BKFlashRead4KProtocol,
            'FlashWrite4K': BKFlashWrite4KProtocol,
            'FlashErase': BKFlashEraseProtocol,
            'CheckCRC': BKCheckCRCProtocol,
            'FlashGetMID': BKFlashGetMIDProtocol,
            'FlashReadSR': BKFlashReadSRProtocol,
            'FlashWriteSR': BKFlashWriteSRProtocol,
            'FlashWriteSR2': BKFlashWriteSR2Protocol,
            'Reboot': BKRebootProtocol,
            'BKRegDoReboot': BKRegDoRebootProtocol
        };
    }

    /**
     * 创建协议实例
     * @param {string} protocolName 协议名称
     * @returns {BaseProtocol} 协议实例
     */
    createProtocol(protocolName) {
        const ProtocolClass = this.protocols[protocolName];
        if (!ProtocolClass) {
            throw new Error(`不支持的BK协议: ${protocolName}`);
        }
        return new ProtocolClass();
    }

    /**
     * 获取所有支持的协议名称
     * @returns {Array<string>} 协议名称列表
     */
    getSupportedProtocols() {
        return Object.keys(this.protocols);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseBKProtocol,
        BaseBKFlashProtocol,
        BKLinkCheckProtocol,
        BKSetBaudrateProtocol,
        BKFlashRead4KProtocol,
        BKFlashWrite4KProtocol,
        BKFlashEraseProtocol,
        BKCheckCRCProtocol,
        BKFlashGetMIDProtocol,
        BKFlashReadSRProtocol,
        BKFlashWriteSRProtocol,
        BKFlashWriteSR2Protocol,
        BKRebootProtocol,
        BKRegDoRebootProtocol,
        BKProtocolFactory
    };
} else if (typeof window !== 'undefined') {
    window.BaseBKProtocol = BaseBKProtocol;
    window.BaseBKFlashProtocol = BaseBKFlashProtocol;
    window.BKLinkCheckProtocol = BKLinkCheckProtocol;
    window.BKSetBaudrateProtocol = BKSetBaudrateProtocol;
    window.BKFlashRead4KProtocol = BKFlashRead4KProtocol;
    window.BKFlashWrite4KProtocol = BKFlashWrite4KProtocol;
    window.BKFlashEraseProtocol = BKFlashEraseProtocol;
    window.BKCheckCRCProtocol = BKCheckCRCProtocol;
    window.BKFlashGetMIDProtocol = BKFlashGetMIDProtocol;
    window.BKFlashReadSRProtocol = BKFlashReadSRProtocol;
    window.BKFlashWriteSRProtocol = BKFlashWriteSRProtocol;
    window.BKFlashWriteSR2Protocol = BKFlashWriteSR2Protocol;
    window.BKRebootProtocol = BKRebootProtocol;
    window.BKRegDoRebootProtocol = BKRegDoRebootProtocol;
    window.BKProtocolFactory = BKProtocolFactory;
}