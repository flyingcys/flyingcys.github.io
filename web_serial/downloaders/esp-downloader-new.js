/**
 * ESP下载器 - 完全按照Python esp_flash.py逻辑实现
 * 参考T5AI的JS串口通信机制
 */

class ESPDownloaderNew extends BaseDownloader {
    constructor(serialPort, debugCallback, chipType = 'ESP32') {
        super(serialPort, debugCallback);
        this.chipType = chipType.toUpperCase();
        this.chipName = this.chipType;
        
        // Python版本的常量 - 完全按照loader.py
        this.DEFAULT_TIMEOUT = 3000; // 3秒 = 3000ms
        this.SYNC_TIMEOUT = 100; // 0.1秒 = 100ms  
        this.MAX_TIMEOUT = 240000; // 240秒
        this.MEM_END_ROM_TIMEOUT = 200; // 0.2秒
        this.ERASE_WRITE_TIMEOUT_PER_MB = 40000; // 40秒每MB
        this.WRITE_BLOCK_ATTEMPTS = 3;
        this.MD5_TIMEOUT_PER_MB = 8000; // 8秒每MB
        
        // 命令常量 - 完全按照Python版本
        this.ESP_FLASH_BEGIN = 0x02;
        this.ESP_MEM_BEGIN = 0x05;
        this.ESP_MEM_END = 0x06;
        this.ESP_MEM_DATA = 0x07;
        this.ESP_SYNC = 0x08;
        this.ESP_WRITE_REG = 0x09;
        this.ESP_READ_REG = 0x0A;
        this.ESP_SPI_SET_PARAMS = 0x0B;
        this.ESP_CHANGE_BAUDRATE = 0x0F;
        this.ESP_FLASH_DEFL_BEGIN = 0x10;
        this.ESP_FLASH_DEFL_DATA = 0x11;
        this.ESP_FLASH_DEFL_END = 0x12;
        this.ESP_SPI_FLASH_MD5 = 0x13;
        
        this.ROM_INVALID_RECV_MSG = 0x05;
        this.ESP_RAM_BLOCK = 0x1800;
        this.STATUS_BYTES_LENGTH = 2;
        this.ESP_CHECKSUM_MAGIC = 0xEF;
        this.FLASH_WRITE_SIZE = 0x400;
        
        // 芯片检测寄存器地址
        this.CHIP_DETECT_MAGIC_REG_ADDR = 0x40001000;
        this.UART_DATE_REG_ADDR = 0x60000078;
        
        // Flash大小检测 - 完全按照Python版本
        this.DETECTED_FLASH_SIZES = {
            0x12: "256KB", 0x13: "512KB", 0x14: "1MB", 0x15: "2MB",
            0x16: "4MB", 0x17: "8MB", 0x18: "16MB", 0x19: "32MB",
            0x1A: "64MB", 0x1B: "128MB", 0x1C: "256MB",
            0x20: "64MB", 0x21: "128MB", 0x22: "256MB",
            0x32: "256KB", 0x33: "512KB", 0x34: "1MB", 0x35: "2MB",
            0x36: "4MB", 0x37: "8MB", 0x38: "16MB", 0x39: "32MB",
            0x3A: "64MB"
        };
        
        // 状态变量
        this.esp = null;
        this.espInitialBaud = 115200;
        this.binfileData = {};
        this.isStub = false;
        this.slipReader = null;
        
        // 设置芯片特定参数
        this.setupChipParams();
    }
    
    /**
     * 设置芯片特定参数 - 按照Python targets实现
     */
    setupChipParams() {
        switch (this.chipType) {
            case 'ESP32':
                this.STATUS_BYTES_LENGTH = 4;
                this.SPI_REG_BASE = 0x3FF42000;
                this.SPI_USR_OFFS = 0x1C;
                this.SPI_USR1_OFFS = 0x20;
                this.SPI_USR2_OFFS = 0x24;
                this.SPI_MOSI_DLEN_OFFS = 0x28;
                this.SPI_MISO_DLEN_OFFS = 0x2C;
                this.SPI_W0_OFFS = 0x80;
                break;
            case 'ESP32C3':
            case 'ESP32S3':
                this.STATUS_BYTES_LENGTH = 4;
                this.SPI_REG_BASE = 0x60002000;
                this.SPI_USR_OFFS = 0x18;
                this.SPI_USR1_OFFS = 0x1C;
                this.SPI_USR2_OFFS = 0x20;
                this.SPI_MOSI_DLEN_OFFS = 0x24;
                this.SPI_MISO_DLEN_OFFS = 0x28;
                this.SPI_W0_OFFS = 0x58;
                break;
            default:
                throw new Error(`不支持的芯片类型: ${this.chipType}`);
        }
    }
    
    /**
     * 日志输出 - 参考T5AI模式
     */
    mainLog(message) { this.debug('main', message); }
    infoLog(message) { this.debug('info', message); }
    debugLog(message) { this.debug('debug', message); }
    errorLog(message) { this.debug('error', message); }
    commLog(message) { this.debug('comm', message); }
    
    /**
     * 清空接收缓冲区 - 完全按照T5AI的逻辑
     */
    async clearBuffer() {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            while (true) {
                const { value, done } = await Promise.race([
                    reader.read(),
                    new Promise(resolve => setTimeout(() => resolve({ done: true }), 5))
                ]);
                if (done || !value || value.length === 0) break;
            }
        } catch (error) {
            if (this.isPortDisconnectionError(error)) {
                throw new Error('设备连接已断开，请检查USB连接后重试');
            }
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }
    
    /**
     * 发送命令 - 参考T5AI模式
     */
    async sendCommand(command, commandName) {
        this.commLog(`发送${commandName}`);
        this.debugLog(`发送${commandName}: ${command.map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
        
        let writer = null;
        try {
            writer = this.port.writable.getWriter();
            await writer.write(new Uint8Array(command));
        } catch (error) {
            throw new Error(`发送${commandName}失败: ${error.message}`);
        } finally {
            if (writer) {
                try { writer.releaseLock(); } catch (e) {}
            }
        }
    }
    
    /**
     * SLIP编码 - 完全按照Python版本实现
     */
    slipEncode(data) {
        const encoded = [0xc0]; // SLIP开始标志
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            if (byte === 0xdb) {
                encoded.push(0xdb, 0xdd);
            } else if (byte === 0xc0) {
                encoded.push(0xdb, 0xdc);
            } else {
                encoded.push(byte);
            }
        }
        encoded.push(0xc0); // SLIP结束标志
        return new Uint8Array(encoded);
    }
    
    /**
     * SLIP解码 - 完全按照Python版本实现
     */
    slipDecode(data) {
        const decoded = [];
        let inEscape = false;
        
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            if (inEscape) {
                inEscape = false;
                if (byte === 0xdc) {
                    decoded.push(0xc0);
                } else if (byte === 0xdd) {
                    decoded.push(0xdb);
                } else {
                    throw new Error(`无效的SLIP转义序列: 0xdb ${byte.toString(16)}`);
                }
            } else if (byte === 0xdb) {
                inEscape = true;
            } else if (byte === 0xc0) {
                // 忽略SLIP开始/结束标志
                continue;
            } else {
                decoded.push(byte);
            }
        }
        
        return new Uint8Array(decoded);
    }
    
    /**
     * 计算校验和 - 完全按照Python版本
     */
    checksum(data, state = this.ESP_CHECKSUM_MAGIC) {
        for (let i = 0; i < data.length; i++) {
            state ^= data[i];
        }
        return state;
    }
    
    /**
     * 发送命令并接收响应 - 完全按照Python command()方法
     */
    async command(op = null, data = new Uint8Array(0), chk = 0, waitResponse = true, timeout = this.DEFAULT_TIMEOUT) {
        if (op !== null) {
            // 构造数据包：<方向><命令><长度><校验> + 数据
            const pkt = new Uint8Array(8 + data.length);
            pkt[0] = 0x00; // 方向：请求
            pkt[1] = op; // 命令
            pkt[2] = data.length & 0xff; // 长度低位
            pkt[3] = (data.length >> 8) & 0xff;
            pkt[4] = (data.length >> 16) & 0xff;
            pkt[5] = (data.length >> 24) & 0xff;
            pkt[6] = chk & 0xff; // 校验低位
            pkt[7] = (chk >> 8) & 0xff;
            pkt[8] = (chk >> 16) & 0xff;
            pkt[9] = (chk >> 24) & 0xff;
            
            // 复制数据
            pkt.set(data, 8);
            
            // SLIP编码并发送
            const encoded = this.slipEncode(pkt);
            await this.sendCommand(Array.from(encoded), `ESP命令0x${op.toString(16)}`);
        }
        
        if (!waitResponse) {
            return { val: 0, data: new Uint8Array(0) };
        }
        
        // 等待响应 - 重试100次
        for (let retry = 0; retry < 100; retry++) {
            const response = await this.readSlipPacket(timeout);
            if (response.length < 8) {
                continue;
            }
            
            const resp = response[0];
            const opRet = response[1];
            const lenRet = (response[2] | (response[3] << 8) | (response[4] << 16) | (response[5] << 24));
            const val = (response[6] | (response[7] << 8) | (response[8] << 16) | (response[9] << 24));
            
            if (resp !== 1) {
                continue;
            }
            
            const responseData = response.slice(8);
            
            if (op === null || opRet === op) {
                return { val, data: responseData };
            }
            
            if (responseData.length > 0 && responseData[0] !== 0 && responseData[1] === this.ROM_INVALID_RECV_MSG) {
                await this.clearBuffer();
                throw new Error("收到无效响应消息");
            }
        }
        
        throw new Error("响应不匹配请求");
    }
    
    /**
     * 读取SLIP数据包 - 参考T5AI的接收逻辑
     */
    async readSlipPacket(timeout = this.DEFAULT_TIMEOUT) {
        let reader = null;
        try {
            reader = this.port.readable.getReader();
            const buffer = [];
            const startTime = Date.now();
            let inPacket = false;
            
            while (Date.now() - startTime < timeout) {
                const remainingTime = timeout - (Date.now() - startTime);
                if (remainingTime <= 0) break;
                
                const readPromise = reader.read();
                const timeoutPromise = new Promise(resolve => 
                    setTimeout(() => resolve({ done: true, timedOut: true }), remainingTime)
                );
                
                const result = await Promise.race([readPromise, timeoutPromise]);
                
                if (result.timedOut || result.done) {
                    if (result.timedOut) break;
                    await new Promise(resolve => setTimeout(resolve, 1));
                    continue;
                }
                
                if (result.value && result.value.length > 0) {
                    for (const byte of result.value) {
                        if (byte === 0xc0) {
                            if (inPacket) {
                                // 数据包结束
                                if (buffer.length > 0) {
                                    return this.slipDecode(new Uint8Array([0xc0, ...buffer, 0xc0]));
                                }
                            } else {
                                // 数据包开始
                                inPacket = true;
                                buffer.length = 0;
                            }
                        } else if (inPacket) {
                            buffer.push(byte);
                        }
                    }
                }
            }
            
            throw new Error("读取SLIP数据包超时");
            
        } catch (error) {
            if (this.isPortDisconnectionError(error)) {
                throw new Error('设备连接已断开，请检查USB连接后重试');
            }
            throw error;
        } finally {
            if (reader) {
                try { reader.releaseLock(); } catch (e) {}
            }
        }
    }
    
    /**
     * 检查命令执行结果 - 完全按照Python版本
     */
    async checkCommand(opDescription, op = null, data = new Uint8Array(0), chk = 0, timeout = this.DEFAULT_TIMEOUT) {
        this.debugLog(`执行命令: ${opDescription}`);
        
        const result = await this.command(op, data, chk, true, timeout);
        
        if (result.data.length > 0 && result.data[0] !== 0) {
            throw new Error(`${opDescription}失败`);
        }
        
        return { val: result.val, data: result.data };
    }
    
    // 继续实现其他方法...
    /**
     * 同步连接 - 完全按照Python版本实现
     */
    async sync() {
        this.debugLog("开始同步连接");
        const syncCmd = new Uint8Array([
            0x07, 0x07, 0x12, 0x20,
            0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
            0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
            0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
            0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55
        ]);
        
        return await this.command(this.ESP_SYNC, syncCmd, 0, true, this.SYNC_TIMEOUT);
    }
}

// 暂时导出，后续继续完善其他方法
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ESPDownloaderNew;
} else if (typeof window !== 'undefined') {
    window.ESPDownloaderNew = ESPDownloaderNew;
} 