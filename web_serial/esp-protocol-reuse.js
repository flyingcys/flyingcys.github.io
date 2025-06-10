/**
 * ESP协议复用模块 - 直接复用esptool-js成熟函数
 * 提供标准ESP32协议实现，与现有下载器兼容
 */
class ESPProtocolReuse {
    constructor() {
        // === 直接复用esptool-js的协议常量 ===
        this.ESP_SYNC = 0x08;
        this.ESP_READ_REG = 0x0a;
        this.ESP_WRITE_REG = 0x09;
        this.ESP_FLASH_BEGIN = 0x02;
        this.ESP_FLASH_DATA = 0x03;
        this.ESP_FLASH_END = 0x04;
        this.ESP_MEM_BEGIN = 0x05;
        this.ESP_MEM_END = 0x06;
        this.ESP_MEM_DATA = 0x07;
        this.ESP_CHANGE_BAUDRATE = 0x0f;
        this.ESP_SPI_ATTACH = 0x0d;
        this.ESP_ERASE_FLASH = 0xd0;
        this.ESP_READ_FLASH = 0xd2;
        
        // === SLIP协议常量 ===
        this.SLIP_END = 0xc0;
        this.SLIP_ESC = 0xdb;
        this.SLIP_ESC_END = 0xdc;
        this.SLIP_ESC_ESC = 0xdd;
        
        // === 超时设置 ===
        this.DEFAULT_TIMEOUT = 3000;
        this.SYNC_TIMEOUT = 100;
        
        // === 芯片检测魔数地址 ===
        this.CHIP_DETECT_MAGIC_REG_ADDR = 0x40001000;
        
        // === 校验和魔数 ===
        this.ESP_CHECKSUM_MAGIC = 0xef;
        
        // === Flash大小映射 ===
        this.DETECTED_FLASH_SIZES = {
            0x12: "256KB",
            0x13: "512KB", 
            0x14: "1MB",
            0x15: "2MB",
            0x16: "4MB",
            0x17: "8MB",
            0x18: "16MB"
        };
    }

    /**
     * 芯片魔数到芯片名映射 - 直接复用esptool-js逻辑
     */
    magic2ChipName(magic) {
        const chipMap = {
            0x00f01d83: 'ESP32',
            0x000007c6: 'ESP32-S2', 
            0x00000009: 'ESP32-S3',
            0x6921506f: 'ESP32-C3',
            0x1b31506f: 'ESP32-C3',
            0x4881606f: 'ESP32-C3',
            0x4361606f: 'ESP32-C3',
            0x2ce0806f: 'ESP32-C6',
            0xd7b73e80: 'ESP32-H2',
            0xfff0c101: 'ESP8266'
        };
        
        return chipMap[magic] || `ESP-Unknown(0x${magic.toString(16)})`;
    }

    /**
     * 数据转换函数 - 直接复用esptool-js实现
     */
    _shortToBytearray(i) {
        return new Uint8Array([i & 0xff, (i >> 8) & 0xff]);
    }

    _intToByteArray(i) {
        return new Uint8Array([
            i & 0xff,
            (i >> 8) & 0xff,
            (i >> 16) & 0xff,
            (i >> 24) & 0xff
        ]);
    }

    _byteArrayToInt(i, j, k, l) {
        return i | (j << 8) | (k << 16) | (l << 24);
    }

    _appendArray(arr1, arr2) {
        const result = new Uint8Array(arr1.length + arr2.length);
        result.set(arr1);
        result.set(arr2, arr1.length);
        return result;
    }

    /**
     * 校验和计算 - 直接复用esptool-js实现
     */
    checksum(data, state = this.ESP_CHECKSUM_MAGIC) {
        for (let i = 0; i < data.length; i++) {
            state ^= data[i];
        }
        return state;
    }

    /**
     * SLIP编码 - 直接复用esptool-js实现
     */
    slipWriter(data) {
        const outData = [];
        outData.push(this.SLIP_END);
        for (let i = 0; i < data.length; i++) {
            if (data[i] === this.SLIP_ESC) {
                outData.push(this.SLIP_ESC, this.SLIP_ESC_ESC);
            } else if (data[i] === this.SLIP_END) {
                outData.push(this.SLIP_ESC, this.SLIP_ESC_END);
            } else {
                outData.push(data[i]);
            }
        }
        outData.push(this.SLIP_END);
        return new Uint8Array(outData);
    }

    /**
     * 命令数据包构建 - 完全复制esptool-js实现
     */
    buildCommandPacket(op, data = new Uint8Array(0), chk = 0) {
        const pkt = new Uint8Array(8 + data.length);
        pkt[0] = 0x00;  // direction
        pkt[1] = op;    // command
        
        const sizeBytes = this._shortToBytearray(data.length);
        pkt[2] = sizeBytes[0];
        pkt[3] = sizeBytes[1];
        
        const chkBytes = this._intToByteArray(chk);
        pkt[4] = chkBytes[0];
        pkt[5] = chkBytes[1];
        pkt[6] = chkBytes[2];
        pkt[7] = chkBytes[3];

        for (let i = 0; i < data.length; i++) {
            pkt[8 + i] = data[i];
        }
        
        return pkt;
    }

    /**
     * 同步数据包构建 - 完全复制esptool-js实现
     */
    buildSyncPacket() {
        const cmd = new Uint8Array(36);
        cmd[0] = 0x07;
        cmd[1] = 0x07;
        cmd[2] = 0x12;
        cmd[3] = 0x20;
        for (let i = 0; i < 32; i++) {
            cmd[4 + i] = 0x55;
        }
        return cmd;
    }

    /**
     * 响应包解析 - 直接复用esptool-js实现
     */
    parseResponsePacket(packet) {
        if (packet.length < 8) {
            return null;
        }
        
        const resp = packet[0];
        const opRet = packet[1];
        const val = this._byteArrayToInt(packet[4], packet[5], packet[6], packet[7]);
        const data = packet.slice(8);
        
        return {
            direction: resp,
            command: opRet,
            value: val,
            data: data,
            isValid: resp === 1
        };
    }

    /**
     * SLIP解码器 - 直接复用esptool-js实现
     */
    createSlipDecoder() {
        let partialPacket = null;
        let isEscaping = false;
        
        return {
            decode: (byte) => {
                if (partialPacket === null) {
                    if (byte === this.SLIP_END) {
                        partialPacket = new Uint8Array(0);
                    }
                    return null;
                } else if (isEscaping) {
                    isEscaping = false;
                    if (byte === this.SLIP_ESC_END) {
                        partialPacket = this._appendArray(partialPacket, new Uint8Array([this.SLIP_END]));
                    } else if (byte === this.SLIP_ESC_ESC) {
                        partialPacket = this._appendArray(partialPacket, new Uint8Array([this.SLIP_ESC]));
                    } else {
                        throw new Error(`无效的SLIP转义序列: 0x${byte.toString(16)}`);
                    }
                    return null;
                } else if (byte === this.SLIP_ESC) {
                    isEscaping = true;
                    return null;
                } else if (byte === this.SLIP_END) {
                    if (partialPacket.length > 0) {
                        const packet = partialPacket;
                        partialPacket = null;
                        return packet;
                    }
                    return null;
                } else {
                    partialPacket = this._appendArray(partialPacket, new Uint8Array([byte]));
                    return null;
                }
            },
            
            reset: () => {
                partialPacket = null;
                isEscaping = false;
            }
        };
    }

    /**
     * Flash操作参数构建 - 直接复用esptool-js实现
     */
    buildFlashBeginParams(size, blocks, blocksize, offset) {
        const data = new Uint8Array(16);
        const view = new DataView(data.buffer);
        view.setUint32(0, size, true);
        view.setUint32(4, blocks, true);
        view.setUint32(8, blocksize, true);
        view.setUint32(12, offset, true);
        return data;
    }

    buildFlashDataParams(data, seq) {
        const header = new Uint8Array(16);
        const view = new DataView(header.buffer);
        view.setUint32(0, data.length, true);
        view.setUint32(4, seq, true);
        view.setUint32(8, 0, true);  // reserved
        view.setUint32(12, 0, true); // reserved
        
        return this._appendArray(header, data);
    }

    buildFlashEndParams(reboot = true) {
        const data = new Uint8Array(4);
        data[0] = reboot ? 0 : 1;
        return data;
    }

    /**
     * 工具函数
     */
    toHex(data) {
        return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' ');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 串口操作助手 - 与我们现有的串口机制兼容
     */
    createSerialHelper(port) {
        const self = this;
        return {
            async writeSlip(data) {
                try {
                    const slipData = self.slipWriter(data);
                    
                    // 检查写入流是否可用
                    if (!port.writable || port.writable.locked) {
                        throw new Error('串口写入流不可用或已被锁定');
                    }
                    
                    const writer = port.writable.getWriter();
                    try {
                        await writer.write(slipData);
                    } finally {
                        writer.releaseLock();
                    }
                } catch (error) {
                    throw new Error(`串口写入失败: ${error.message}`);
                }
            },

            async readWithTimeout(timeout = 3000) {
                try {
                    // 检查读取流是否可用
                    if (!port.readable || port.readable.locked) {
                        throw new Error('串口读取流不可用或已被锁定');
                    }
                    
                    const reader = port.readable.getReader();
                    try {
                        const result = await Promise.race([
                            reader.read(),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('读取超时')), timeout)
                            )
                        ]);
                        return result;
                    } finally {
                        try {
                            reader.releaseLock();
                        } catch (e) {
                            // 忽略释放锁定时的错误
                        }
                    }
                } catch (error) {
                    throw new Error(`串口读取失败: ${error.message}`);
                }
            },

            async clearBuffer() {
                try {
                    // 检查读取流是否可用
                    if (!port.readable || port.readable.locked) {
                        return; // 静默跳过，不抛出错误
                    }
                    
                    const reader = port.readable.getReader();
                    try {
                        let clearCount = 0;
                        while (clearCount < 50) { // 限制清空次数，防止无限循环
                            const result = await Promise.race([
                                reader.read(),
                                new Promise(resolve => setTimeout(() => resolve({ done: true }), 10))
                            ]);
                            if (result.done || !result.value || result.value.length === 0) break;
                            clearCount++;
                        }
                    } catch (error) {
                        // 忽略清空时的错误
                    } finally {
                        try {
                            reader.releaseLock();
                        } catch (e) {
                            // 忽略释放锁定时的错误
                        }
                    }
                } catch (error) {
                    // 清空缓冲区失败不应该中断操作
                }
            },

            // 添加流状态检查方法
            checkStreamStatus() {
                return {
                    readable: port.readable && !port.readable.locked,
                    writable: port.writable && !port.writable.locked
                };
            }
        };
    }
}

// 导出单例，但也保留类供需要时使用
window.ESPProtocolReuse = new ESPProtocolReuse();
window.ESPProtocolReuseClass = ESPProtocolReuse; 