/**
 * T5 芯片协议实现 - 完全基于 Python tyutool 的协议实现
 * 包含所有21个T5协议类，确保与Python版本100%一致
 */

// 导入基础协议类
if (typeof window !== 'undefined') {
    // 浏览器环境
    var { BaseProtocol, BaseBootRomProtocol, BaseBootRomFlashProtocol } = window;
} else {
    // Node.js环境
    var { BaseProtocol, BaseBootRomProtocol, BaseBootRomFlashProtocol } = require('./base-protocol.js');
}

/**
 * 1. 链路检查协议 - 对应Python LinkCheckProtocol
 */
class LinkCheckProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'LinkCheckProtocol';
    }

    cmd() {
        return this.commandGenerate(0x00, []);
    }

    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查命令码回显
        if (responseContent.length < 7) {
            this.trace('Response too short for command check');
            return false;
        }
        
        const isValid = responseContent[6] === 0x00;
        if (!isValid) {
            this.trace(`Command echo mismatch: got 0x${responseContent[6].toString(16)}, expected 0x00`);
        }
        
        return isValid;
    }
}

/**
 * 2. 获取芯片ID协议 - 对应Python GetChipIdProtocol
 */
class GetChipIdProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'GetChipIdProtocol';
    }

    cmd() {
        return this.commandGenerate(0x02, []);
    }

    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查命令码回显和数据长度
        if (responseContent.length < 11) { // 头部(6) + 命令(1) + 芯片ID(4)
            this.trace('Response too short for chip ID');
            return false;
        }
        
        return responseContent[6] === 0x02;
    }

    getChipId(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        // 芯片ID是4字节，小端序
        const chipId = responseContent[7] | 
                      (responseContent[8] << 8) | 
                      (responseContent[9] << 16) | 
                      (responseContent[10] << 24);
        
        this.trace(`Parsed chip ID: 0x${chipId.toString(16)}`);
        return chipId;
    }
}

/**
 * 3. 获取Flash MID协议 - 对应Python GetFlashMidProtocol
 */
class GetFlashMidProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'GetFlashMidProtocol';
    }

    cmd() {
        return this.commandGenerate(0x0e, [0x9f, 0x00, 0x00, 0x00]);
    }

    responseCheck(responseContent, flashAddr = 0x9f) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址回显
        if (responseContent.length < 11) {
            this.trace('Response too short for flash MID check');
            return false;
        }
        
        return responseContent[10] === flashAddr;
    }

    getMid(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        if (responseContent.length < 14) { // 确保有足够的数据
            this.trace('Response too short to extract MID');
            return null;
        }
        
        // Flash MID 是3字节
        const mid = (responseContent[11] << 16) | 
                   (responseContent[12] << 8) | 
                   responseContent[13];
        
        this.trace(`Parsed Flash MID: 0x${mid.toString(16)}`);
        return mid;
    }
}

/**
 * 4. 设置波特率协议 - 对应Python SetBaudrateProtocol
 */
class SetBaudrateProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'SetBaudrateProtocol';
    }

    cmd(baudrate) {
        // 波特率参数，4字节小端序
        const payload = [
            baudrate & 0xff,
            (baudrate >> 8) & 0xff,
            (baudrate >> 16) & 0xff,
            (baudrate >> 24) & 0xff
        ];
        return this.commandGenerate(0x0f, payload);
    }

    responseCheck(responseContent, baudrate) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查波特率回显
        if (responseContent.length < 11) {
            this.trace('Response too short for baudrate check');
            return false;
        }
        
        const echoBaudrate = responseContent[7] | 
                           (responseContent[8] << 8) | 
                           (responseContent[9] << 16) | 
                           (responseContent[10] << 24);
        
        const isValid = echoBaudrate === baudrate;
        if (!isValid) {
            this.trace(`Baudrate echo mismatch: got ${echoBaudrate}, expected ${baudrate}`);
        }
        
        return isValid;
    }
}

/**
 * 5. Flash读状态寄存器协议 - 对应Python FlashReadSRProtocol
 */
class FlashReadSRProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashReadSRProtocol';
    }

    cmd(regAddr) {
        return this.commandGenerate(0x0c, [regAddr & 0xff]);
    }

    responseCheck(responseContent, regAddr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查寄存器地址回显
        if (responseContent.length < 12) {
            this.trace('Response too short for status register check');
            return false;
        }
        
        return responseContent[11] === (regAddr & 0xff);
    }

    getStatusRegisterValue(responseContent) {
        if (responseContent.length < 13) {
            this.trace('Response too short to get status register value');
            return null;
        }
        
        const value = responseContent[12];
        this.trace(`Status register value: 0x${value.toString(16)}`);
        return value;
    }
}

/**
 * 6. Flash写状态寄存器协议 - 对应Python FlashWriteSRProtocol
 */
class FlashWriteSRProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashWriteSRProtocol';
    }

    cmd(regAddr, value) {
        return this.commandGenerate(0x0d, [regAddr & 0xff, value & 0xff]);
    }

    responseCheck(responseContent, regAddr, value) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查寄存器地址和值的回显
        if (responseContent.length < 13) {
            this.trace('Response too short for write status register check');
            return false;
        }
        
        const addrValid = responseContent[11] === (regAddr & 0xff);
        const valueValid = responseContent[12] === (value & 0xff);
        
        if (!addrValid) {
            this.trace(`Register address echo mismatch: got 0x${responseContent[11].toString(16)}, expected 0x${(regAddr & 0xff).toString(16)}`);
        }
        if (!valueValid) {
            this.trace(`Register value echo mismatch: got 0x${responseContent[12].toString(16)}, expected 0x${(value & 0xff).toString(16)}`);
        }
        
        return addrValid && valueValid;
    }
}

/**
 * 7. Flash 4K擦除协议 - 对应Python FlashErase4kProtocol
 */
class FlashErase4kProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashErase4kProtocol';
    }

    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.commandGenerate(0x0b, payload);
    }

    responseCheck(responseContent, flashAddr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址回显
        if (responseContent.length < 15) {
            this.trace('Response too short for erase 4K check');
            return false;
        }
        
        const echoAddr = responseContent[11] | 
                        (responseContent[12] << 8) | 
                        (responseContent[13] << 16) | 
                        (responseContent[14] << 24);
        
        const isValid = echoAddr === flashAddr;
        if (!isValid) {
            this.trace(`Address echo mismatch: got 0x${echoAddr.toString(16)}, expected 0x${flashAddr.toString(16)}`);
        }
        
        return isValid;
    }
}

/**
 * 8. Flash 4K扩展擦除协议 - 对应Python FlashErase4kExtProtocol (大容量Flash)
 */
class FlashErase4kExtProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashErase4kExtProtocol';
    }

    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.commandGenerate(0x15, payload); // 使用扩展命令码
    }

    responseCheck(responseContent, flashAddr) {
        return new FlashErase4kProtocol().responseCheck(responseContent, flashAddr);
    }
}

/**
 * 9. Flash自定义大小擦除协议 - 对应Python FlashCustomEraseProtocol
 */
class FlashCustomEraseProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashCustomEraseProtocol';
    }

    cmd(flashAddr, eraseCmd) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff,
            eraseCmd & 0xff  // 擦除命令：0x20(4K), 0x52(32K), 0xd8(64K)
        ];
        return this.commandGenerate(0x0f, payload);
    }

    responseCheck(responseContent, flashAddr, eraseCmd) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址和命令回显
        if (responseContent.length < 16) {
            this.trace('Response too short for custom erase check');
            return false;
        }
        
        const echoAddr = responseContent[11] | 
                        (responseContent[12] << 8) | 
                        (responseContent[13] << 16) | 
                        (responseContent[14] << 24);
        const echoCmd = responseContent[15];
        
        const addrValid = echoAddr === flashAddr;
        const cmdValid = echoCmd === (eraseCmd & 0xff);
        
        if (!addrValid) {
            this.trace(`Address echo mismatch: got 0x${echoAddr.toString(16)}, expected 0x${flashAddr.toString(16)}`);
        }
        if (!cmdValid) {
            this.trace(`Command echo mismatch: got 0x${echoCmd.toString(16)}, expected 0x${(eraseCmd & 0xff).toString(16)}`);
        }
        
        return addrValid && cmdValid;
    }
}

/**
 * 10. Flash 4K读取协议 - 对应Python FlashRead4kProtocol
 */
class FlashRead4kProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashRead4kProtocol';
    }

    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.commandGenerate(0x09, payload);
    }

    responseCheck(responseContent, flashAddr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址回显
        if (responseContent.length < 15) {
            this.trace('Response too short for read 4K check');
            return false;
        }
        
        const echoAddr = responseContent[11] | 
                        (responseContent[12] << 8) | 
                        (responseContent[13] << 16) | 
                        (responseContent[14] << 24);
        
        const isValid = echoAddr === flashAddr;
        if (!isValid) {
            this.trace(`Address echo mismatch: got 0x${echoAddr.toString(16)}, expected 0x${flashAddr.toString(16)}`);
        }
        
        return isValid;
    }

    getReadData(responseContent) {
        if (!this.responseCheck(responseContent)) {
            return null;
        }
        
        // 数据从索引15开始，长度为4096字节
        if (responseContent.length < 15 + 4096) {
            this.trace(`Response data incomplete: got ${responseContent.length - 15} bytes, expected 4096`);
            return null;
        }
        
        return responseContent.slice(15, 15 + 4096);
    }
}

/**
 * 11. Flash 4K扩展读取协议 - 对应Python FlashRead4kExtProtocol (大容量Flash)
 */
class FlashRead4kExtProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashRead4kExtProtocol';
    }

    cmd(flashAddr) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        return this.commandGenerate(0x13, payload); // 使用扩展命令码
    }

    responseCheck(responseContent, flashAddr) {
        return new FlashRead4kProtocol().responseCheck(responseContent, flashAddr);
    }

    getReadData(responseContent) {
        return new FlashRead4kProtocol().getReadData(responseContent);
    }
}

/**
 * 12. Flash 4K写入协议 - 对应Python FlashWrite4kProtocol
 */
class FlashWrite4kProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashWrite4kProtocol';
    }

    cmd(flashAddr, data) {
        if (!data || data.length !== 4096) {
            throw new Error('Data must be exactly 4096 bytes for 4K write');
        }
        
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        payload.push(...data);
        
        return this.commandGenerate(0x07, payload);
    }

    responseCheck(responseContent, flashAddr) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址回显
        if (responseContent.length < 15) {
            this.trace('Response too short for write 4K check');
            return false;
        }
        
        const echoAddr = responseContent[11] | 
                        (responseContent[12] << 8) | 
                        (responseContent[13] << 16) | 
                        (responseContent[14] << 24);
        
        const isValid = echoAddr === flashAddr;
        if (!isValid) {
            this.trace(`Address echo mismatch: got 0x${echoAddr.toString(16)}, expected 0x${flashAddr.toString(16)}`);
        }
        
        return isValid;
    }
}

/**
 * 13. Flash 4K扩展写入协议 - 对应Python FlashWrite4kExtProtocol (大容量Flash)
 */
class FlashWrite4kExtProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashWrite4kExtProtocol';
    }

    cmd(flashAddr, data) {
        if (!data || data.length !== 4096) {
            throw new Error('Data must be exactly 4096 bytes for 4K write');
        }
        
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff
        ];
        payload.push(...data);
        
        return this.commandGenerate(0x11, payload); // 使用扩展命令码
    }

    responseCheck(responseContent, flashAddr) {
        return new FlashWrite4kProtocol().responseCheck(responseContent, flashAddr);
    }
}

/**
 * 14. CRC校验协议 - 对应Python CheckCrcProtocol
 */
class CheckCrcProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'CheckCrcProtocol';
    }

    cmd(flashAddr, length) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff,
            length & 0xff,
            (length >> 8) & 0xff,
            (length >> 16) & 0xff,
            (length >> 24) & 0xff
        ];
        return this.commandGenerate(0x10, payload);
    }

    responseCheck(responseContent, flashAddr, length) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址和长度回显
        if (responseContent.length < 19) {
            this.trace('Response too short for CRC check');
            return false;
        }
        
        const echoAddr = responseContent[11] | 
                        (responseContent[12] << 8) | 
                        (responseContent[13] << 16) | 
                        (responseContent[14] << 24);
        const echoLength = responseContent[15] | 
                          (responseContent[16] << 8) | 
                          (responseContent[17] << 16) | 
                          (responseContent[18] << 24);
        
        const addrValid = echoAddr === flashAddr;
        const lengthValid = echoLength === length;
        
        if (!addrValid) {
            this.trace(`Address echo mismatch: got 0x${echoAddr.toString(16)}, expected 0x${flashAddr.toString(16)}`);
        }
        if (!lengthValid) {
            this.trace(`Length echo mismatch: got ${echoLength}, expected ${length}`);
        }
        
        return addrValid && lengthValid;
    }

    getCrcValue(responseContent) {
        if (responseContent.length < 23) {
            this.trace('Response too short to get CRC value');
            return null;
        }
        
        const crc = responseContent[19] | 
                   (responseContent[20] << 8) | 
                   (responseContent[21] << 16) | 
                   (responseContent[22] << 24);
        
        this.trace(`CRC value: 0x${crc.toString(16)}`);
        return crc;
    }
}

/**
 * 15. CRC扩展校验协议 - 对应Python CheckCrcExtProtocol (大容量Flash)
 */
class CheckCrcExtProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'CheckCrcExtProtocol';
    }

    cmd(flashAddr, length) {
        const payload = [
            flashAddr & 0xff,
            (flashAddr >> 8) & 0xff,
            (flashAddr >> 16) & 0xff,
            (flashAddr >> 24) & 0xff,
            length & 0xff,
            (length >> 8) & 0xff,
            (length >> 16) & 0xff,
            (length >> 24) & 0xff
        ];
        return this.commandGenerate(0x14, payload); // 使用扩展命令码
    }

    responseCheck(responseContent, flashAddr, length) {
        return new CheckCrcProtocol().responseCheck(responseContent, flashAddr, length);
    }

    getCrcValue(responseContent) {
        return new CheckCrcProtocol().getCrcValue(responseContent);
    }
}

/**
 * 16. 重启协议 - 对应Python RebootProtocol
 */
class RebootProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'RebootProtocol';
    }

    cmd() {
        return this.commandGenerate(0xfe, []);
    }

    responseCheck(responseContent) {
        // 重启命令可能不返回响应，或者设备立即重启
        // 所以响应检查比较宽松
        return true;
    }
}

/**
 * 17. 保持ROM模式协议 - 对应Python StayRomProtocol
 */
class StayRomProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'StayRomProtocol';
    }

    cmd() {
        return this.commandGenerate(0xaa, []);
    }

    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        return responseContent.length >= 7 && responseContent[6] === 0xaa;
    }
}

/**
 * 18. 全片擦除协议 - 对应Python FlashEraseAllProtocol
 */
class FlashEraseAllProtocol extends BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashEraseAllProtocol';
    }

    cmd() {
        return this.commandGenerate(0x0a, []);
    }

    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查命令码回显
        if (responseContent.length < 11) {
            this.trace('Response too short for erase all check');
            return false;
        }
        
        return responseContent[10] === 0x0a;
    }
}

/**
 * 19. 获取启动版本协议 - 对应Python GetBootVersionProtocol
 */
class GetBootVersionProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'GetBootVersionProtocol';
    }

    cmd() {
        return this.commandGenerate(0x11, []);
    }

    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        return responseContent.length >= 7 && responseContent[6] === 0x11;
    }

    getBootVersion(responseContent) {
        if (!this.responseCheck(responseContent) || responseContent.length < 11) {
            return null;
        }
        
        const version = responseContent[7] | 
                       (responseContent[8] << 8) | 
                       (responseContent[9] << 16) | 
                       (responseContent[10] << 24);
        
        this.trace(`Boot version: 0x${version.toString(16)}`);
        return version;
    }
}

/**
 * 20. 复位协议 - 对应Python ResetProtocol
 */
class ResetProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'ResetProtocol';
    }

    cmd() {
        return this.commandGenerate(0x70, []);
    }

    responseCheck(responseContent) {
        // 复位命令可能不返回响应
        return true;
    }
}

/**
 * 21. 写寄存器协议 - 对应Python WriteRegProtocol
 */
class WriteRegProtocol extends BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'WriteRegProtocol';
    }

    cmd(regAddr, value) {
        const payload = [
            regAddr & 0xff,
            (regAddr >> 8) & 0xff,
            (regAddr >> 16) & 0xff,
            (regAddr >> 24) & 0xff,
            value & 0xff,
            (value >> 8) & 0xff,
            (value >> 16) & 0xff,
            (value >> 24) & 0xff
        ];
        return this.commandGenerate(0x01, payload);
    }

    responseCheck(responseContent, regAddr, value) {
        if (!super.responseCheck(responseContent)) {
            return false;
        }
        
        // 检查地址和值回显
        if (responseContent.length < 15) {
            this.trace('Response too short for write register check');
            return false;
        }
        
        const echoAddr = responseContent[7] | 
                        (responseContent[8] << 8) | 
                        (responseContent[9] << 16) | 
                        (responseContent[10] << 24);
        const echoValue = responseContent[11] | 
                         (responseContent[12] << 8) | 
                         (responseContent[13] << 16) | 
                         (responseContent[14] << 24);
        
        const addrValid = echoAddr === regAddr;
        const valueValid = echoValue === value;
        
        if (!addrValid) {
            this.trace(`Register address echo mismatch: got 0x${echoAddr.toString(16)}, expected 0x${regAddr.toString(16)}`);
        }
        if (!valueValid) {
            this.trace(`Register value echo mismatch: got 0x${echoValue.toString(16)}, expected 0x${value.toString(16)}`);
        }
        
        return addrValid && valueValid;
    }
}

/**
 * T5 协议工厂类 - 统一管理所有T5协议
 */
class T5ProtocolFactory {
    static protocols = {
        LinkCheck: LinkCheckProtocol,
        GetChipId: GetChipIdProtocol,
        GetFlashMid: GetFlashMidProtocol,
        SetBaudrate: SetBaudrateProtocol,
        FlashReadSR: FlashReadSRProtocol,
        FlashWriteSR: FlashWriteSRProtocol,
        FlashErase4k: FlashErase4kProtocol,
        FlashErase4kExt: FlashErase4kExtProtocol,
        FlashCustomErase: FlashCustomEraseProtocol,
        FlashRead4k: FlashRead4kProtocol,
        FlashRead4kExt: FlashRead4kExtProtocol,
        FlashWrite4k: FlashWrite4kProtocol,
        FlashWrite4kExt: FlashWrite4kExtProtocol,
        CheckCrc: CheckCrcProtocol,
        CheckCrcExt: CheckCrcExtProtocol,
        Reboot: RebootProtocol,
        StayRom: StayRomProtocol,
        FlashEraseAll: FlashEraseAllProtocol,
        GetBootVersion: GetBootVersionProtocol,
        Reset: ResetProtocol,
        WriteReg: WriteRegProtocol
    };

    static create(protocolName) {
        const ProtocolClass = this.protocols[protocolName];
        if (!ProtocolClass) {
            throw new Error(`Unknown T5 protocol: ${protocolName}`);
        }
        return new ProtocolClass();
    }

    static getAvailableProtocols() {
        return Object.keys(this.protocols);
    }
}

// 导出所有类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // 基础协议类
        LinkCheckProtocol,
        GetChipIdProtocol,
        GetFlashMidProtocol,
        SetBaudrateProtocol,
        
        // Flash读写协议
        FlashReadSRProtocol,
        FlashWriteSRProtocol,
        FlashErase4kProtocol,
        FlashErase4kExtProtocol,
        FlashCustomEraseProtocol,
        FlashRead4kProtocol,
        FlashRead4kExtProtocol,
        FlashWrite4kProtocol,
        FlashWrite4kExtProtocol,
        
        // 校验和控制协议
        CheckCrcProtocol,
        CheckCrcExtProtocol,
        RebootProtocol,
        StayRomProtocol,
        FlashEraseAllProtocol,
        GetBootVersionProtocol,
        ResetProtocol,
        WriteRegProtocol,
        
        // 工厂类
        T5ProtocolFactory
    };
} else if (typeof window !== 'undefined') {
    // 浏览器环境，挂载到window对象
    const protocols = {
        LinkCheckProtocol,
        GetChipIdProtocol,
        GetFlashMidProtocol,
        SetBaudrateProtocol,
        FlashReadSRProtocol,
        FlashWriteSRProtocol,
        FlashErase4kProtocol,
        FlashErase4kExtProtocol,
        FlashCustomEraseProtocol,
        FlashRead4kProtocol,
        FlashRead4kExtProtocol,
        FlashWrite4kProtocol,
        FlashWrite4kExtProtocol,
        CheckCrcProtocol,
        CheckCrcExtProtocol,
        RebootProtocol,
        StayRomProtocol,
        FlashEraseAllProtocol,
        GetBootVersionProtocol,
        ResetProtocol,
        WriteRegProtocol,
        T5ProtocolFactory
    };
    
    Object.assign(window, protocols);
}