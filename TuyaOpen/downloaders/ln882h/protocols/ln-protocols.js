/**
 * LN882H协议层实现
 * 基于Python版本ln882h_flash.py的协议逻辑
 * 使用XModem协议进行文件传输
 */

/**
 * LN882H基础协议类
 */
class BaseLNProtocol extends BaseProtocol {
    constructor() {
        super();
        this.chipType = 'LN882H';
        
        // XModem协议常量
        this.SOH = 0x01;
        this.STX = 0x02;
        this.EOT = 0x04;
        this.ACK = 0x06;
        this.NAK = 0x15;
        this.CAN = 0x18;
        this.CRC = 0x43; // 'C'
        
        this.headerPad = 0x00;
    }

    /**
     * 生成文本命令
     */
    generateTextCommand(command) {
        return new TextEncoder().encode(command + '\r\n');
    }

    /**
     * 解析文本响应
     */
    parseTextResponse(response) {
        return new TextDecoder().decode(response);
    }

    /**
     * 检查响应是否包含期望字符串
     */
    checkResponseContains(response, expected) {
        const responseStr = this.parseTextResponse(response);
        return responseStr.includes(expected);
    }
}

/**
 * 版本检查协议
 */
class VersionCheckProtocol extends BaseLNProtocol {
    constructor() {
        super();
        this.name = 'VersionCheckProtocol';
        this.description = '检查设备版本信息';
    }

    /**
     * 生成版本检查命令
     */
    cmd() {
        return this.generateTextCommand('version');
    }

    /**
     * 检查是否为RAMCODE模式
     */
    isRamMode(response) {
        return this.checkResponseContains(response, 'RAMCODE');
    }

    /**
     * 检查是否为已知芯片版本
     */
    isKnownChip(response, chipInfo) {
        for (const [chipName, version] of Object.entries(chipInfo)) {
            if (this.checkResponseContains(response, version)) {
                return chipName;
            }
        }
        return null;
    }
}

/**
 * RAM模式检查协议
 */
class RamModeCheckProtocol extends BaseLNProtocol {
    constructor() {
        super();
        this.name = 'RamModeCheckProtocol';
        this.description = '检查设备是否处于RAM模式';
    }

    /**
     * 生成RAM模式检查命令
     */
    cmd() {
        return this.generateTextCommand('version');
    }

    /**
     * 检查是否为RAM模式
     */
    isRamMode(response) {
        return this.checkResponseContains(response, 'RAMCODE');
    }
}

/**
 * Flash UUID获取协议
 */
class FlashUuidGetProtocol extends BaseLNProtocol {
    constructor() {
        super();
        this.name = 'FlashUuidGetProtocol';
        this.description = '获取Flash UUID';
    }

    /**
     * 生成Flash UUID获取命令
     */
    cmd() {
        return this.generateTextCommand('flash_uid');
    }

    /**
     * 解析Flash UUID
     */
    parseUuid(response) {
        if (response.length >= 30) {
            return response;
        }
        return null;
    }
}

/**
 * 波特率设置协议
 */
class BaudrateSetProtocol extends BaseLNProtocol {
    constructor(baudrate) {
        super();
        this.name = 'BaudrateSetProtocol';
        this.description = `设置波特率为 ${baudrate}`;
        this.baudrate = baudrate;
    }

    /**
     * 生成波特率设置命令
     */
    cmd() {
        return this.generateTextCommand(`baudrate ${this.baudrate}`);
    }
}

/**
 * RAM Binary下载协议
 */
class RamBinaryDownloadProtocol extends BaseLNProtocol {
    constructor(size) {
        super();
        this.name = 'RamBinaryDownloadProtocol';
        this.description = `下载RAM Binary，大小: ${size}`;
        this.size = size;
    }

    /**
     * 生成RAM Binary下载命令
     */
    cmd() {
        return this.generateTextCommand(`download [rambin] [0x20000000] [${this.size}]`);
    }
}

/**
 * Flash擦除协议
 */
class FlashEraseProtocol extends BaseLNProtocol {
    constructor(addr = 0, length = 1228 * 1024) {
        super();
        this.name = 'FlashEraseProtocol';
        this.description = `擦除Flash，地址: 0x${addr.toString(16)}, 大小: 0x${length.toString(16)}`;
        this.addr = addr;
        this.length = length;
    }

    /**
     * 生成Flash擦除命令
     */
    cmd() {
        return this.generateTextCommand(`ferase 0x${this.addr.toString(16)} 0x${this.length.toString(16)}`);
    }

    /**
     * 检查擦除是否成功
     */
    isEraseSuccess(response) {
        return this.checkResponseContains(response, 'pppp');
    }
}

/**
 * Flash地址设置协议
 */
class FlashSetAddrProtocol extends BaseLNProtocol {
    constructor(addr = 0) {
        super();
        this.name = 'FlashSetAddrProtocol';
        this.description = `设置Flash起始地址: 0x${addr.toString(16)}`;
        this.addr = addr;
    }

    /**
     * 生成Flash地址设置命令
     */
    cmd() {
        return this.generateTextCommand(`startaddr 0x${this.addr.toString(16)}`);
    }

    /**
     * 检查设置是否成功
     */
    isSetSuccess(response) {
        return this.checkResponseContains(response, 'pppp');
    }
}

/**
 * 固件升级协议
 */
class FirmwareUpgradeProtocol extends BaseLNProtocol {
    constructor() {
        super();
        this.name = 'FirmwareUpgradeProtocol';
        this.description = '启动固件升级模式';
    }

    /**
     * 生成固件升级命令
     */
    cmd() {
        return this.generateTextCommand('upgrade');
    }
}

/**
 * 重启协议
 */
class RebootProtocol extends BaseLNProtocol {
    constructor() {
        super();
        this.name = 'RebootProtocol';
        this.description = '重启设备';
    }

    /**
     * 生成重启命令
     */
    cmd() {
        return this.generateTextCommand('reboot');
    }

    /**
     * 检查重启是否成功
     */
    isRebootSuccess(response) {
        return this.checkResponseContains(response, 'pppp');
    }
}

/**
 * XModem发送协议
 */
class XModemSendProtocol extends BaseLNProtocol {
    constructor() {
        super();
        this.name = 'XModemSendProtocol';
        this.description = 'XModem文件传输协议';
        
        // CRC表 - 完全按照Python版本
        this.crctable = [
            0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
            0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
            0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
            0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
            0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
            0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
            0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
            0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
            0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
            0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
            0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
            0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
            0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
            0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
            0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
            0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
            0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
            0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
            0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
            0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
            0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
            0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
            0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
            0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
            0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
            0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
            0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
            0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
            0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
            0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
            0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
            0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
        ];
    }

    /**
     * 计算CRC - 完全按照Python版本
     */
    calcCrc(data, crc = 0) {
        for (let char of data) {
            const crctblIdx = ((crc >> 8) ^ char) & 0xff;
            crc = ((crc << 8) ^ this.crctable[crctblIdx]) & 0xffff;
        }
        return crc & 0xffff;
    }

    /**
     * 创建发送头部
     */
    makeSendHeader(packetSize, sequence) {
        if (![128, 1024, 16 * 1024].includes(packetSize)) {
            throw new Error(`Invalid packet size: ${packetSize}`);
        }
        
        const bytes = [];
        if (packetSize === 128) {
            bytes.push(this.SOH);
        } else if (packetSize <= 16 * 1024) {
            bytes.push(this.STX);
        }
        bytes.push(sequence, 0xff - sequence);
        return new Uint8Array(bytes);
    }

    /**
     * 创建发送校验和
     */
    makeSendChecksum(data) {
        const crc = this.calcCrc(data);
        return new Uint8Array([crc >> 8, crc & 0xff]);
    }

    /**
     * 检查是否为期望字符
     */
    isExpectedChar(data, expected) {
        return data.length > 0 && data[0] === expected;
    }

    /**
     * 检查是否为CRC字符
     */
    isCrcChar(data) {
        return this.isExpectedChar(data, this.CRC);
    }

    /**
     * 检查是否为ACK字符
     */
    isAckChar(data) {
        return this.isExpectedChar(data, this.ACK);
    }

    /**
     * 检查是否为CAN字符
     */
    isCanChar(data) {
        return this.isExpectedChar(data, this.CAN);
    }

    /**
     * 检查是否为EOT字符
     */
    isEotChar(data) {
        return this.isExpectedChar(data, this.EOT);
    }
}

/**
 * LN882H协议工厂类
 */
class LNProtocolFactory {
    static protocols = {
        'VersionCheck': VersionCheckProtocol,
        'RamModeCheck': RamModeCheckProtocol,
        'FlashUuidGet': FlashUuidGetProtocol,
        'BaudrateSet': BaudrateSetProtocol,
        'RamBinaryDownload': RamBinaryDownloadProtocol,
        'FlashErase': FlashEraseProtocol,
        'FlashSetAddr': FlashSetAddrProtocol,
        'FirmwareUpgrade': FirmwareUpgradeProtocol,
        'Reboot': RebootProtocol,
        'XModemSend': XModemSendProtocol
    };

    /**
     * 创建协议实例
     */
    static create(protocolName, ...args) {
        const ProtocolClass = this.protocols[protocolName];
        if (!ProtocolClass) {
            throw new Error(`未知的协议类型: ${protocolName}`);
        }
        return new ProtocolClass(...args);
    }

    /**
     * 获取所有支持的协议名称
     */
    static getSupportedProtocols() {
        return Object.keys(this.protocols);
    }

    /**
     * 检查协议是否支持
     */
    static isSupported(protocolName) {
        return protocolName in this.protocols;
    }
}

// 导出类和工厂
if (typeof window !== 'undefined') {
    // 浏览器环境
    window.BaseLNProtocol = BaseLNProtocol;
    window.VersionCheckProtocol = VersionCheckProtocol;
    window.RamModeCheckProtocol = RamModeCheckProtocol;
    window.FlashUuidGetProtocol = FlashUuidGetProtocol;
    window.BaudrateSetProtocol = BaudrateSetProtocol;
    window.RamBinaryDownloadProtocol = RamBinaryDownloadProtocol;
    window.FlashEraseProtocol = FlashEraseProtocol;
    window.FlashSetAddrProtocol = FlashSetAddrProtocol;
    window.FirmwareUpgradeProtocol = FirmwareUpgradeProtocol;
    window.RebootProtocol = RebootProtocol;
    window.XModemSendProtocol = XModemSendProtocol;
    window.LNProtocolFactory = LNProtocolFactory;
}

if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        BaseLNProtocol,
        VersionCheckProtocol,
        RamModeCheckProtocol,
        FlashUuidGetProtocol,
        BaudrateSetProtocol,
        RamBinaryDownloadProtocol,
        FlashEraseProtocol,
        FlashSetAddrProtocol,
        FirmwareUpgradeProtocol,
        RebootProtocol,
        XModemSendProtocol,
        LNProtocolFactory
    };
}