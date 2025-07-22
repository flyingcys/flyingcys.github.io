/**
 * T5 芯片协议实现 - 修复版本
 * 解决脚本加载时序问题，确保类继承正常工作
 * 完全基于 Python tyutool 的协议实现
 */

/**
 * 1. 链路检查协议 - 对应Python LinkCheckProtocol
 */
class LinkCheckProtocol extends window.BaseBootRomProtocol {
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
class GetChipIdProtocol extends window.BaseBootRomProtocol {
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
class GetFlashMidProtocol extends window.BaseBootRomFlashProtocol {
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
class SetBaudrateProtocol extends window.BaseBootRomProtocol {
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
class FlashReadSRProtocol extends window.BaseBootRomFlashProtocol {
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
class FlashWriteSRProtocol extends window.BaseBootRomFlashProtocol {
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
class FlashErase4kProtocol extends window.BaseBootRomFlashProtocol {
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
 * 其他协议类的简化实现...
 */
class FlashErase4kExtProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashErase4kExtProtocol';
    }
    cmd(flashAddr) {
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff];
        return this.commandGenerate(0x15, payload);
    }
    responseCheck(responseContent, flashAddr) {
        return new FlashErase4kProtocol().responseCheck(responseContent, flashAddr);
    }
}

class FlashCustomEraseProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashCustomEraseProtocol';
    }
    cmd(flashAddr, eraseCmd) {
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff, eraseCmd & 0xff];
        return this.commandGenerate(0x0f, payload);
    }
    responseCheck(responseContent, flashAddr, eraseCmd) {
        return super.responseCheck(responseContent);
    }
}

class FlashRead4kProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashRead4kProtocol';
    }
    cmd(flashAddr) {
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff];
        return this.commandGenerate(0x09, payload);
    }
    responseCheck(responseContent, flashAddr) {
        return super.responseCheck(responseContent);
    }
    getReadData(responseContent) {
        if (responseContent.length < 15 + 4096) return null;
        return responseContent.slice(15, 15 + 4096);
    }
}

class FlashRead4kExtProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashRead4kExtProtocol';
    }
    cmd(flashAddr) {
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff];
        return this.commandGenerate(0x13, payload);
    }
    responseCheck(responseContent, flashAddr) {
        return new FlashRead4kProtocol().responseCheck(responseContent, flashAddr);
    }
    getReadData(responseContent) {
        return new FlashRead4kProtocol().getReadData(responseContent);
    }
}

class FlashWrite4kProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashWrite4kProtocol';
    }
    cmd(flashAddr, data) {
        if (!data || data.length !== 4096) {
            throw new Error('Data must be exactly 4096 bytes for 4K write');
        }
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff];
        payload.push(...data);
        return this.commandGenerate(0x07, payload);
    }
    responseCheck(responseContent, flashAddr) {
        return super.responseCheck(responseContent);
    }
}

class FlashWrite4kExtProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashWrite4kExtProtocol';
    }
    cmd(flashAddr, data) {
        if (!data || data.length !== 4096) {
            throw new Error('Data must be exactly 4096 bytes for 4K write');
        }
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff];
        payload.push(...data);
        return this.commandGenerate(0x11, payload);
    }
    responseCheck(responseContent, flashAddr) {
        return new FlashWrite4kProtocol().responseCheck(responseContent, flashAddr);
    }
}

class CheckCrcProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'CheckCrcProtocol';
    }
    cmd(flashAddr, length) {
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff,
                        length & 0xff, (length >> 8) & 0xff, (length >> 16) & 0xff, (length >> 24) & 0xff];
        return this.commandGenerate(0x10, payload);
    }
    responseCheck(responseContent, flashAddr, length) {
        return super.responseCheck(responseContent);
    }
    getCrcValue(responseContent) {
        if (responseContent.length < 23) return null;
        const crc = responseContent[19] | (responseContent[20] << 8) | (responseContent[21] << 16) | (responseContent[22] << 24);
        return crc;
    }
}

class CheckCrcExtProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'CheckCrcExtProtocol';
    }
    cmd(flashAddr, length) {
        const payload = [flashAddr & 0xff, (flashAddr >> 8) & 0xff, (flashAddr >> 16) & 0xff, (flashAddr >> 24) & 0xff,
                        length & 0xff, (length >> 8) & 0xff, (length >> 16) & 0xff, (length >> 24) & 0xff];
        return this.commandGenerate(0x14, payload);
    }
    responseCheck(responseContent, flashAddr, length) {
        return new CheckCrcProtocol().responseCheck(responseContent, flashAddr, length);
    }
    getCrcValue(responseContent) {
        return new CheckCrcProtocol().getCrcValue(responseContent);
    }
}

class RebootProtocol extends window.BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'RebootProtocol';
    }
    cmd() {
        return this.commandGenerate(0xfe, []);
    }
    responseCheck(responseContent) {
        return true;
    }
}

class StayRomProtocol extends window.BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'StayRomProtocol';
    }
    cmd() {
        return this.commandGenerate(0xaa, []);
    }
    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) return false;
        return responseContent.length >= 7 && responseContent[6] === 0xaa;
    }
}

class FlashEraseAllProtocol extends window.BaseBootRomFlashProtocol {
    constructor() {
        super();
        this.name = 'FlashEraseAllProtocol';
    }
    cmd() {
        return this.commandGenerate(0x0a, []);
    }
    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) return false;
        if (responseContent.length < 11) return false;
        return responseContent[10] === 0x0a;
    }
}

class GetBootVersionProtocol extends window.BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'GetBootVersionProtocol';
    }
    cmd() {
        return this.commandGenerate(0x11, []);
    }
    responseCheck(responseContent) {
        if (!super.responseCheck(responseContent)) return false;
        return responseContent.length >= 7 && responseContent[6] === 0x11;
    }
    getBootVersion(responseContent) {
        if (!this.responseCheck(responseContent) || responseContent.length < 11) return null;
        const version = responseContent[7] | (responseContent[8] << 8) | (responseContent[9] << 16) | (responseContent[10] << 24);
        return version;
    }
}

class ResetProtocol extends window.BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'ResetProtocol';
    }
    cmd() {
        return this.commandGenerate(0x70, []);
    }
    responseCheck(responseContent) {
        return true;
    }
}

class WriteRegProtocol extends window.BaseBootRomProtocol {
    constructor() {
        super();
        this.name = 'WriteRegProtocol';
    }
    cmd(regAddr, value) {
        const payload = [regAddr & 0xff, (regAddr >> 8) & 0xff, (regAddr >> 16) & 0xff, (regAddr >> 24) & 0xff,
                        value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
        return this.commandGenerate(0x01, payload);
    }
    responseCheck(responseContent, regAddr, value) {
        return super.responseCheck(responseContent);
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

// 浏览器环境，直接挂载到window对象
if (typeof window !== 'undefined') {
    // 直接挂载所有协议类
    window.LinkCheckProtocol = LinkCheckProtocol;
    window.GetChipIdProtocol = GetChipIdProtocol;
    window.GetFlashMidProtocol = GetFlashMidProtocol;
    window.SetBaudrateProtocol = SetBaudrateProtocol;
    window.FlashReadSRProtocol = FlashReadSRProtocol;
    window.FlashWriteSRProtocol = FlashWriteSRProtocol;
    window.FlashErase4kProtocol = FlashErase4kProtocol;
    window.FlashErase4kExtProtocol = FlashErase4kExtProtocol;
    window.FlashCustomEraseProtocol = FlashCustomEraseProtocol;
    window.FlashRead4kProtocol = FlashRead4kProtocol;
    window.FlashRead4kExtProtocol = FlashRead4kExtProtocol;
    window.FlashWrite4kProtocol = FlashWrite4kProtocol;
    window.FlashWrite4kExtProtocol = FlashWrite4kExtProtocol;
    window.CheckCrcProtocol = CheckCrcProtocol;
    window.CheckCrcExtProtocol = CheckCrcExtProtocol;
    window.RebootProtocol = RebootProtocol;
    window.StayRomProtocol = StayRomProtocol;
    window.FlashEraseAllProtocol = FlashEraseAllProtocol;
    window.GetBootVersionProtocol = GetBootVersionProtocol;
    window.ResetProtocol = ResetProtocol;
    window.WriteRegProtocol = WriteRegProtocol;
    window.T5ProtocolFactory = T5ProtocolFactory;
    
    console.log('✅ T5协议类修复版已加载，所有21个协议类已注册到window对象');
}

// Node.js导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LinkCheckProtocol, GetChipIdProtocol, GetFlashMidProtocol, SetBaudrateProtocol,
        FlashReadSRProtocol, FlashWriteSRProtocol, FlashErase4kProtocol, FlashErase4kExtProtocol,
        FlashCustomEraseProtocol, FlashRead4kProtocol, FlashRead4kExtProtocol, FlashWrite4kProtocol,
        FlashWrite4kExtProtocol, CheckCrcProtocol, CheckCrcExtProtocol, RebootProtocol,
        StayRomProtocol, FlashEraseAllProtocol, GetBootVersionProtocol, ResetProtocol,
        WriteRegProtocol, T5ProtocolFactory
    };
}