/**
 * LN882H Flash配置管理
 * 基于Python版本的配置和功能特性
 */

/**
 * LN882H Flash配置类
 */
class LNFlashConfig extends FlashConfigBase {
    constructor() {
        super();
        this.chipType = 'LN882H';
        
        // 芯片信息数据库 - 基于Python版本
        this.chipInfo = {
            "QS200": "Mar 14 2021/00:23:32\r\n"
        };
        
        // 默认配置
        this.defaultBaudrate = 115200;
        this.initialBaudrate = 115200;
        this.maxBaudrate = 2000000;
        
        // Flash配置
        this.flashEraseAddr = 0;
        this.flashEraseSize = 1228 * 1024; // 1228KB
        this.flashStartAddr = 0x0;
        
        // XModem配置
        this.xmodemPacketSizes = [128, 1024, 16 * 1024];
        this.defaultPacketSize = 16 * 1024; // 16KB for firmware
        this.ramBinaryPacketSize = 1024; // 1KB for RAM binary
        
        // 超时配置
        this.timeouts = {
            version: 1000,
            ramMode: 1000,
            baudrate: 1000,
            erase: 1000,
            write: 100,
            reboot: 1000,
            flashUuid: 1000
        };
        
        // 重试配置
        this.retries = {
            version: 20,
            baudrate: 3,
            xmodem: 20
        };
        
        // RAM Binary配置
        this.ramBinaryAddr = 0x20000000;
        this.ramBinarySize = 0; // 将在运行时设置
    }

    /**
     * 获取芯片信息
     */
    getChipInfo() {
        return this.chipInfo;
    }

    /**
     * 获取已知芯片列表
     */
    getKnownChips() {
        return Object.keys(this.chipInfo);
    }

    /**
     * 检查是否为已知芯片
     */
    isKnownChip(chipName) {
        return chipName in this.chipInfo;
    }

    /**
     * 获取芯片版本信息
     */
    getChipVersion(chipName) {
        return this.chipInfo[chipName] || null;
    }

    /**
     * 获取波特率配置
     */
    getBaudrateConfig() {
        return {
            default: this.defaultBaudrate,
            initial: this.initialBaudrate,
            max: this.maxBaudrate
        };
    }

    /**
     * 验证波特率
     */
    isValidBaudrate(baudrate) {
        const validBaudrates = [
            9600, 19200, 38400, 57600, 115200, 230400, 
            460800, 921600, 1000000, 1500000, 2000000
        ];
        return validBaudrates.includes(baudrate);
    }

    /**
     * 获取Flash配置
     */
    getFlashConfig() {
        return {
            eraseAddr: this.flashEraseAddr,
            eraseSize: this.flashEraseSize,
            startAddr: this.flashStartAddr
        };
    }

    /**
     * 获取XModem配置
     */
    getXModemConfig() {
        return {
            packetSizes: this.xmodemPacketSizes,
            defaultPacketSize: this.defaultPacketSize,
            ramBinaryPacketSize: this.ramBinaryPacketSize
        };
    }

    /**
     * 获取超时配置
     */
    getTimeouts() {
        return { ...this.timeouts };
    }

    /**
     * 获取重试配置
     */
    getRetries() {
        return { ...this.retries };
    }

    /**
     * 设置RAM Binary配置
     */
    setRamBinaryConfig(size) {
        this.ramBinarySize = size;
    }

    /**
     * 获取RAM Binary配置
     */
    getRamBinaryConfig() {
        return {
            addr: this.ramBinaryAddr,
            size: this.ramBinarySize
        };
    }

    /**
     * 获取完整配置
     */
    getFullConfig() {
        return {
            chipType: this.chipType,
            chipInfo: this.getChipInfo(),
            baudrate: this.getBaudrateConfig(),
            flash: this.getFlashConfig(),
            xmodem: this.getXModemConfig(),
            timeouts: this.getTimeouts(),
            retries: this.getRetries(),
            ramBinary: this.getRamBinaryConfig()
        };
    }

    /**
     * 验证配置
     */
    validateConfig() {
        const errors = [];
        
        // 验证波特率
        if (!this.isValidBaudrate(this.defaultBaudrate)) {
            errors.push(`无效的默认波特率: ${this.defaultBaudrate}`);
        }
        
        // 验证Flash配置
        if (this.flashEraseSize <= 0) {
            errors.push(`无效的Flash擦除大小: ${this.flashEraseSize}`);
        }
        
        // 验证XModem包大小
        for (const size of this.xmodemPacketSizes) {
            if (![128, 1024, 16 * 1024].includes(size)) {
                errors.push(`无效的XModem包大小: ${size}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        if (newConfig.baudrate) {
            Object.assign(this, newConfig.baudrate);
        }
        
        if (newConfig.flash) {
            Object.assign(this, newConfig.flash);
        }
        
        if (newConfig.timeouts) {
            Object.assign(this.timeouts, newConfig.timeouts);
        }
        
        if (newConfig.retries) {
            Object.assign(this.retries, newConfig.retries);
        }
    }

    /**
     * 重置为默认配置
     */
    resetToDefaults() {
        this.defaultBaudrate = 115200;
        this.initialBaudrate = 115200;
        this.maxBaudrate = 2000000;
        this.flashEraseAddr = 0;
        this.flashEraseSize = 1228 * 1024;
        this.flashStartAddr = 0x0;
        this.defaultPacketSize = 16 * 1024;
        this.ramBinaryPacketSize = 1024;
        
        // 重置超时
        this.timeouts = {
            version: 1000,
            ramMode: 1000,
            baudrate: 1000,
            erase: 1000,
            write: 100,
            reboot: 1000,
            flashUuid: 1000
        };
        
        // 重置重试
        this.retries = {
            version: 20,
            baudrate: 3,
            xmodem: 20
        };
    }

    /**
     * 导出配置为JSON
     */
    exportConfig() {
        return JSON.stringify(this.getFullConfig(), null, 2);
    }

    /**
     * 从JSON导入配置
     */
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            this.updateConfig(config);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: `配置导入失败: ${error.message}` 
            };
        }
    }

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        const validation = this.validateConfig();
        return {
            chipType: this.chipType,
            configValid: validation.valid,
            configErrors: validation.errors,
            knownChips: this.getKnownChips().length,
            supportedBaudrates: [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600, 1000000, 1500000, 2000000].length,
            xmodemPacketSizes: this.xmodemPacketSizes.length
        };
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.LNFlashConfig = LNFlashConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LNFlashConfig;
}