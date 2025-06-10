/**
 * ESP32简化下载器
 * 基于esptool-js完全重写，直接使用SLIP协议和正确的reset序列
 */
class ESP32SimpleDownloader {
    constructor(port, options = {}) {
        this.port = port;
        this.reader = null;
        this.writer = null;
        this.buffer = new Uint8Array(0);
        this.debugEnabled = options.debug || false;
        this.DTR_state = false;
        
        // 连接状态管理
        this.isConnected = false;
        this.chipType = null;
        this.chipMagicValue = null;
        
        // esptool-js constants
        this.ESP_SYNC = 0x08;
        this.ESP_READ_REG = 0x0a;
        this.ESP_CHECKSUM_MAGIC = 0xef;
        this.ROM_INVALID_RECV_MSG = 0x05;
        this.DEFAULT_TIMEOUT = 3000;
        this.CHIP_DETECT_MAGIC_REG_ADDR = 0x40001000;
        
        // Flash操作常量
        this.ESP_FLASH_BEGIN = 0x02;
        this.ESP_FLASH_DATA = 0x03;
        this.ESP_FLASH_END = 0x04;
        this.ESP_ERASE_FLASH = 0xd0;
        this.ESP_ERASE_REGION = 0xd1;
        this.ESP_READ_FLASH = 0xd2;
        this.ESP_SPI_FLASH_MD5 = 0x13;
        
        // Flash参数
        this.FLASH_WRITE_SIZE = 0x4000; // 16KB
        this.FLASH_SECTOR_SIZE = 0x1000; // 4KB
        
        // 压缩相关常量
        this.ESP_FLASH_DEFL_BEGIN = 0x10;
        this.ESP_FLASH_DEFL_DATA = 0x11;
        this.ESP_FLASH_DEFL_END = 0x12;
        
        // 超时常量
        this.ERASE_REGION_TIMEOUT_PER_MB = 30000;
        this.ERASE_WRITE_TIMEOUT_PER_MB = 40000;
        this.MD5_TIMEOUT_PER_MB = 8000;
        this.CHIP_ERASE_TIMEOUT = 120000;
        
        // ESP32 specific constants
        this.ESP_IMAGE_MAGIC = 0xe9;
        this.BOOTLOADER_FLASH_OFFSET = 0x1000;
        
        // SLIP protocol constants
        this.SLIP_END = 0xc0;
        this.SLIP_ESC = 0xdb;
        this.SLIP_ESC_END = 0xdc;
        this.SLIP_ESC_ESC = 0xdd;
    }

    debug(message) {
        if (this.debugEnabled) {
            console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
        }
    }

    hexConvert(uint8Array) {
        return Array.from(uint8Array, byte => byte.toString(16).padStart(2, '0')).join(' ');
    }

    // esptool-js数据转换函数
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
        return i + (j << 8) + (k << 16) + (l << 24);
    }

    appendArray(arr1, arr2) {
        const combined = new Uint8Array(arr1.length + arr2.length);
        combined.set(arr1);
        combined.set(arr2, arr1.length);
        return combined;
    }

    // SLIP协议编码 - 直接来自esptool-js
    slipWriter(data) {
        let outData = new Uint8Array([this.SLIP_END]);
        for (let byte of data) {
            if (byte === this.SLIP_END) {
                outData = this.appendArray(outData, new Uint8Array([this.SLIP_ESC, this.SLIP_ESC_END]));
            } else if (byte === this.SLIP_ESC) {
                outData = this.appendArray(outData, new Uint8Array([this.SLIP_ESC, this.SLIP_ESC_ESC]));
            } else {
                outData = this.appendArray(outData, new Uint8Array([byte]));
            }
        }
        outData = this.appendArray(outData, new Uint8Array([this.SLIP_END]));
        return outData;
    }

    // 串口写入 - 使用SLIP协议
    async write(data) {
        if (!this.writer) {
            this.writer = this.port.writable.getWriter();
        }
        const slipData = this.slipWriter(data);
        this.debug(`SLIP写入: ${this.hexConvert(slipData)}`);
        await this.writer.write(slipData);
    }

    // DTR/RTS控制 - 直接来自esptool-js
    async setRTS(state) {
        await this.port.setSignals({ requestToSend: state });
        // Windows兼容性工作区
        await this.setDTR(this.DTR_state);
    }

    async setDTR(state) {
        this.DTR_state = state;
        await this.port.setSignals({ dataTerminalReady: state });
    }

    // 经典reset序列 - 直接来自esptool-js ClassicReset
    async classicReset(resetDelay = 50) {
        this.debug("执行经典reset序列");
        await this.setDTR(false);
        await this.setRTS(true);
        await this.sleep(100);
        await this.setDTR(true);
        await this.setRTS(false);
        await this.sleep(resetDelay);
        await this.setDTR(false);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 读取指定字节数
    async newRead(numBytes, timeout) {
        if (this.buffer.length >= numBytes) {
            const output = this.buffer.slice(0, numBytes);
            this.buffer = this.buffer.slice(numBytes);
            return output;
        }

        const startTime = Date.now();
        while (this.buffer.length < numBytes) {
            if (Date.now() - startTime > timeout) {
                throw new Error("读取超时");
            }

            const readLoop = this.readLoop(timeout);
            const { value, done } = await readLoop.next();
            if (done || !value) {
                break;
            }
            this.buffer = this.appendArray(this.buffer, value);
        }

        const output = this.buffer.slice(0, numBytes);
        this.buffer = this.buffer.slice(numBytes);
        return output;
    }

    async *readLoop(timeout) {
        if (!this.reader) {
            this.reader = this.port.readable.getReader();
        }

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("读取超时")), timeout);
        });

        try {
            const readPromise = this.reader.read();
            const result = await Promise.race([readPromise, timeoutPromise]);
            
            if (result.done || !result.value) {
                return;
            }
            
            this.debug(`原始读取 ${result.value.length} 字节: ${this.hexConvert(result.value)}`);
            yield result.value;
        } catch (error) {
            throw error;
        }
    }

    inWaiting() {
        return this.buffer.length;
    }

    // SLIP协议解码 - 直接来自esptool-js
    async *read(timeout) {
        let partialPacket = null;
        let isEscaping = false;

        while (true) {
            const waitingBytes = this.inWaiting();
            const readBytes = await this.newRead(waitingBytes > 0 ? waitingBytes : 1, timeout);

            if (!readBytes || readBytes.length === 0) {
                throw new Error("串口读取失败: 读取超时");
            }

            this.debug(`SLIP读取 ${readBytes.length} 字节: ${this.hexConvert(readBytes)}`);

            let i = 0;
            while (i < readBytes.length) {
                const byte = readBytes[i++];
                if (partialPacket === null) {
                    if (byte === this.SLIP_END) {
                        partialPacket = new Uint8Array(0);
                    } else {
                        // 跳过非SLIP数据（应用程序输出）
                        this.debug(`跳过非SLIP字节: 0x${byte.toString(16)}`);
                    }
                } else if (isEscaping) {
                    isEscaping = false;
                    if (byte === this.SLIP_ESC_END) {
                        partialPacket = this.appendArray(partialPacket, new Uint8Array([this.SLIP_END]));
                    } else if (byte === this.SLIP_ESC_ESC) {
                        partialPacket = this.appendArray(partialPacket, new Uint8Array([this.SLIP_ESC]));
                    } else {
                        throw new Error(`无效SLIP转义序列 (0xdb, 0x${byte.toString(16)})`);
                    }
                } else if (byte === this.SLIP_ESC) {
                    isEscaping = true;
                } else if (byte === this.SLIP_END) {
                    this.debug(`SLIP包接收完成: ${this.hexConvert(partialPacket)}`);
                    this.buffer = this.appendArray(this.buffer, readBytes.slice(i));
                    yield partialPacket;
                    partialPacket = null;
                } else {
                    partialPacket = this.appendArray(partialPacket, new Uint8Array([byte]));
                }
            }
        }
    }

    // 读取数据包 - 直接来自esptool-js
    async readPacket(op = null, timeout = this.DEFAULT_TIMEOUT) {
        for (let i = 0; i < 100; i++) {
            const { value: p } = await this.read(timeout).next();
            if (!p || p.length < 8) {
                continue;
            }
            const resp = p[0];
            if (resp !== 1) {
                continue;
            }
            const opRet = p[1];
            const val = this._byteArrayToInt(p[4], p[5], p[6], p[7]);
            const data = p.slice(8);
            if (resp === 1) {
                if (op === null || opRet === op) {
                    return [val, data];
                } else if (data[0] !== 0 && data[1] === this.ROM_INVALID_RECV_MSG) {
                    throw new Error("unsupported command error");
                }
            }
        }
        throw new Error("invalid response");
    }

    // 命令发送 - 直接来自esptool-js
    async command(op = null, data = new Uint8Array(0), chk = 0, waitResponse = true, timeout = this.DEFAULT_TIMEOUT) {
        if (op !== null) {
            this.debug(`发送命令: op=0x${op.toString(16).padStart(2, '0')}, data长度=${data.length}, 等待响应=${waitResponse}, 超时=${timeout}ms`);
            this.debug(`命令数据: ${this.hexConvert(data)}`);

            const pkt = new Uint8Array(8 + data.length);
            pkt[0] = 0x00;
            pkt[1] = op;
            const lengthBytes = this._shortToBytearray(data.length);
            pkt[2] = lengthBytes[0];
            pkt[3] = lengthBytes[1];
            const chkBytes = this._intToByteArray(chk);
            pkt[4] = chkBytes[0];
            pkt[5] = chkBytes[1];
            pkt[6] = chkBytes[2];
            pkt[7] = chkBytes[3];

            for (let i = 0; i < data.length; i++) {
                pkt[8 + i] = data[i];
            }

            this.debug(`发送数据包: ${this.hexConvert(pkt)}`);
            await this.write(pkt);
        }

        if (!waitResponse) {
            return [0, new Uint8Array(0)];
        }

        return await this.readPacket(op, timeout);
    }

    // 同步命令 - 直接来自esptool-js
    async sync() {
        this.debug("开始设备同步...");
        const cmd = new Uint8Array(36);
        cmd[0] = 0x07;
        cmd[1] = 0x07;
        cmd[2] = 0x12;
        cmd[3] = 0x20;
        for (let i = 0; i < 32; i++) {
            cmd[4 + i] = 0x55;
        }

        this.debug(`同步命令数据: ${this.hexConvert(cmd)}`);

        try {
            let resp = await this.command(this.ESP_SYNC, cmd, undefined, undefined, 100);
            this.debug(`同步响应: val=${resp[0]}, data=${this.hexConvert(resp[1])}`);

            // 发送7个空命令
            for (let i = 0; i < 7; i++) {
                resp = await this.command();
                this.debug(`空命令${i+1}响应: val=${resp[0]}, data=${this.hexConvert(resp[1])}`);
            }
            return resp;
        } catch (e) {
            this.debug("同步失败: " + e);
            throw e;
        }
    }

    // 读寄存器
    async readReg(addr, timeout = this.DEFAULT_TIMEOUT) {
        const pkt = this._intToByteArray(addr);
        const val = await this.command(this.ESP_READ_REG, pkt, undefined, undefined, timeout);
        return val[0];
    }

    // 连接尝试 - 直接来自esptool-js
    async _connectAttempt(resetStrategy = null) {
        this.debug("开始连接尝试");
        
        if (resetStrategy) {
            await resetStrategy();
        }

        // 读取等待字节以检测boot消息
        const waitingBytes = this.inWaiting();
        const readBytes = await this.newRead(waitingBytes > 0 ? waitingBytes : 1, this.DEFAULT_TIMEOUT);
        
        const binaryString = Array.from(readBytes, byte => String.fromCharCode(byte)).join("");
        const regex = /boot:(0x[0-9a-fA-F]+)(.*waiting for download)?/;
        const match = binaryString.match(regex);

        let bootLogDetected = false, bootMode = "", downloadMode = false;
        if (match) {
            bootLogDetected = true;
            bootMode = match[1];
            downloadMode = !!match[2];
            this.debug(`检测到boot日志: 模式=${bootMode}, 下载模式=${downloadMode}`);
        }

        let lastError = "";
        for (let i = 0; i < 5; i++) {
            try {
                this.debug(`同步尝试 ${i + 1}/5`);
                const resp = await this.sync();
                this.debug(`同步成功: ${resp[0]}`);
                return "success";
            } catch (error) {
                this.debug(`同步尝试 ${i + 1} 失败: ${error}`);
                lastError = error.message;
            }
        }

        if (bootLogDetected) {
            if (downloadMode) {
                lastError = `检测到下载模式，但没有同步回复: 串口TX路径可能有问题`;
            } else {
                lastError = `检测到错误的boot模式 (${bootMode}). 芯片需要进入下载模式`;
            }
        }

        return lastError;
    }

    // 连接 - 直接来自esptool-js
    async connect(attempts = 7) {
        // 如果已经连接，直接返回
        if (this.isConnected) {
            this.debug("设备已连接，跳过连接过程");
            return true;
        }

        this.debug("开始连接...");
        
        // 构建reset序列
        const resetSequences = [
            () => this.classicReset(50),   // 默认延迟
            () => this.classicReset(550)   // 额外延迟
        ];

        let resp;
        for (let i = 0; i < attempts; i++) {
            this.debug(`连接尝试 ${i + 1}/${attempts}`);
            const resetSequence = resetSequences[i % resetSequences.length];
            resp = await this._connectAttempt(resetSequence);
            if (resp === "success") {
                break;
            }
            this.debug(`尝试 ${i + 1} 失败: ${resp}`);
        }

        if (resp !== "success") {
            throw new Error("连接失败: " + resp);
        }

        this.isConnected = true;
        this.debug("连接成功");
        return true;
    }

    // 检测芯片
    async detectChip() {
        // 如果已经检测过芯片，直接返回缓存的结果
        if (this.chipType) {
            this.debug(`使用缓存的芯片信息: ${this.chipType}`);
            return this.chipType;
        }

        // 确保设备已连接
        if (!this.isConnected) {
            await this.connect();
        }

        this.debug("读取芯片Magic值...");
        this.chipMagicValue = (await this.readReg(this.CHIP_DETECT_MAGIC_REG_ADDR)) >>> 0;
        this.debug("芯片Magic值: " + this.chipMagicValue.toString(16));
        
        // 简化的芯片检测
        const chipMap = {
            0x00f01d83: "ESP32",
            0x000007c6: "ESP32-S2", 
            0x6921506f: "ESP32-S3",
            0x2ce0806f: "ESP32-C2",
            0x1b31506f: "ESP32-C3",
            0x55198041: "ESP32-C6",
            0x7749d83: "ESP32-H2"
        };

        this.chipType = chipMap[this.chipMagicValue] || "未知芯片";
        this.debug(`芯片检测完成: ${this.chipType}`);
        return this.chipType;
    }

    // 连接并检测芯片
    async connectAndDetect() {
        try {
            this.debug("=== 开始连接测试 ===");
            
            // 打开串口
            if (!this.port.readable) {
                await this.port.open({ baudRate: 115200 });
                this.debug("串口已打开");
            }

            // 连接到设备
            await this.connect();

            // 检测芯片类型
            const chipType = await this.detectChip();
            this.debug(`检测到芯片: ${chipType}`);
            
            this.debug("=== 连接测试成功 ===");
            return { success: true, chipType };

        } catch (error) {
            this.debug("连接测试失败: " + error.message);
            this.debug("=== 连接测试失败 ===");
            return { success: false, error: error.message };
        }
    }

    // 获取连接状态
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            chipType: this.chipType,
            chipMagicValue: this.chipMagicValue ? this.chipMagicValue.toString(16) : null
        };
    }

    // 断开连接
    async disconnect() {
        try {
            await this.cleanup();
            this.isConnected = false;
            this.chipType = null;
            this.chipMagicValue = null;
            this.debug("连接已断开，状态已重置");
        } catch (error) {
            this.debug("断开连接时出错: " + error.message);
        }
    }

    // 数据转换方法 - 直接来自esptool-js
    bstrToUi8(bstr) {
        const ui8 = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
            ui8[i] = bstr.charCodeAt(i);
        }
        return ui8;
    }

    ui8ToBstr(ui8) {
        let bstr = "";
        for (let i = 0; i < ui8.length; i++) {
            bstr += String.fromCharCode(ui8[i]);
        }
        return bstr;
    }

    // 校验和计算 - 直接来自esptool-js
    checksum(data) {
        let chk = this.ESP_CHECKSUM_MAGIC;
        for (let b of data) {
            chk ^= b;
        }
        return chk;
    }

    // 命令验证 - 直接来自esptool-js
    async checkCommand(opDescription, op, data, chk = 0, timeout = this.DEFAULT_TIMEOUT) {
        this.debug(`执行命令: ${opDescription}`);
        const resp = await this.command(op, data, chk, true, timeout);
        if (resp[1].length > 4) {
            return resp[1];
        } else {
            return resp[0];
        }
    }

    // 计算每MB的超时时间
    timeoutPerMb(secondsPerMb, sizeBytes) {
        const result = Math.max(secondsPerMb * (sizeBytes / (1024 * 1024)), 3000);
        return result;
    }

    // Flash开始操作 - 直接来自esptool-js
    async flashBegin(size, offset) {
        const numBlocks = Math.floor((size + this.FLASH_WRITE_SIZE - 1) / this.FLASH_WRITE_SIZE);
        const eraseSize = this.getEraseSize(offset, size);

        const d = new Date();
        const t1 = d.getTime();

        let timeout = 3000;
        timeout = this.timeoutPerMb(this.ERASE_REGION_TIMEOUT_PER_MB, size);

        this.debug(`flash begin ${eraseSize} ${numBlocks} ${this.FLASH_WRITE_SIZE} ${offset} ${size}`);
        let pkt = this.appendArray(this._intToByteArray(eraseSize), this._intToByteArray(numBlocks));
        pkt = this.appendArray(pkt, this._intToByteArray(this.FLASH_WRITE_SIZE));
        pkt = this.appendArray(pkt, this._intToByteArray(offset));
        pkt = this.appendArray(pkt, this._intToByteArray(0)); // Support encrypted

        await this.checkCommand("enter Flash download mode", this.ESP_FLASH_BEGIN, pkt, undefined, timeout);

        const t2 = new Date().getTime();
        if (size != 0) {
            this.debug(`擦除耗时 ${(t2 - t1) / 1000}s`);
        }
        return numBlocks;
    }

    // 计算擦除大小
    getEraseSize(offset, size) {
        const sectors_per_block = 16;
        const sector_size = this.FLASH_SECTOR_SIZE;
        const num_sectors = Math.floor((size + sector_size - 1) / sector_size);
        const start_sector = Math.floor(offset / sector_size);
        
        const head_sectors = sectors_per_block - (start_sector % sectors_per_block);
        if (num_sectors <= head_sectors) {
            return num_sectors * sector_size;
        }
        
        return (head_sectors + Math.floor((num_sectors - head_sectors + sectors_per_block - 1) / sectors_per_block) * sectors_per_block) * sector_size;
    }

    // Flash压缩开始 - 直接来自esptool-js  
    async flashDeflBegin(size, compsize, offset) {
        const numBlocks = Math.floor((compsize + this.FLASH_WRITE_SIZE - 1) / this.FLASH_WRITE_SIZE);
        const eraseBlocks = Math.floor((size + this.FLASH_WRITE_SIZE - 1) / this.FLASH_WRITE_SIZE);

        const d = new Date();
        const t1 = d.getTime();

        const writeSize = eraseBlocks * this.FLASH_WRITE_SIZE;
        const timeout = this.timeoutPerMb(this.ERASE_REGION_TIMEOUT_PER_MB, writeSize);
        
        this.debug(`压缩 ${size} 字节到 ${compsize}...`);

        let pkt = this.appendArray(this._intToByteArray(writeSize), this._intToByteArray(numBlocks));
        pkt = this.appendArray(pkt, this._intToByteArray(this.FLASH_WRITE_SIZE));
        pkt = this.appendArray(pkt, this._intToByteArray(offset));
        pkt = this.appendArray(pkt, this._intToByteArray(0));

        await this.checkCommand("enter compressed flash mode", this.ESP_FLASH_DEFL_BEGIN, pkt, undefined, timeout);
        const t2 = new Date().getTime();
        if (size != 0) {
            this.debug(`擦除耗时 ${(t2 - t1) / 1000}s`);
        }
        return numBlocks;
    }

    // Flash块写入 - 直接来自esptool-js
    async flashBlock(data, seq, timeout) {
        let pkt = this.appendArray(this._intToByteArray(data.length), this._intToByteArray(seq));
        pkt = this.appendArray(pkt, this._intToByteArray(0));
        pkt = this.appendArray(pkt, this._intToByteArray(0));
        pkt = this.appendArray(pkt, data);

        const checksum = this.checksum(data);
        await this.checkCommand(`write to target Flash after seq ${seq}`, this.ESP_FLASH_DATA, pkt, checksum, timeout);
    }

    // Flash压缩块写入 - 直接来自esptool-js
    async flashDeflBlock(data, seq, timeout) {
        let pkt = this.appendArray(this._intToByteArray(data.length), this._intToByteArray(seq));
        pkt = this.appendArray(pkt, this._intToByteArray(0));
        pkt = this.appendArray(pkt, this._intToByteArray(0));
        pkt = this.appendArray(pkt, data);

        const checksum = this.checksum(data);
        this.debug(`flash_defl_block ${data[0].toString(16)} ${data[1].toString(16)}`);

        await this.checkCommand(
            `write compressed data to flash after seq ${seq}`,
            this.ESP_FLASH_DEFL_DATA,
            pkt,
            checksum,
            timeout
        );
    }

    // Flash结束 - 直接来自esptool-js
    async flashFinish(reboot = false) {
        const val = reboot ? 0 : 1;
        const pkt = this._intToByteArray(val);
        await this.checkCommand("leave Flash mode", this.ESP_FLASH_END, pkt);
    }

    // Flash压缩结束
    async flashDeflFinish() {
        const pkt = new Uint8Array(0);
        await this.checkCommand("leave compressed flash mode", this.ESP_FLASH_DEFL_END, pkt);
    }

    // 数组填充到指定大小 - 直接来自esptool-js
    padTo(data, alignment, padCharacter = '\xff') {
        const pad_mod = data.length % alignment;
        if (pad_mod != 0) {
            const padding_length = alignment - pad_mod;
            const padding = new Uint8Array(padding_length).fill(padCharacter.charCodeAt(0));
            return this.appendArray(data, padding);
        }
        return data;
    }

    // 更新镜像flash参数 - 直接来自esptool-js
    _updateImageFlashParams(image, address, flashSize, flashMode, flashFreq) {
        this.debug(`_update_image_flash_params ${flashSize} ${flashMode} ${flashFreq}`);
        if (image.length < 8) {
            return image;
        }
        if (address != this.BOOTLOADER_FLASH_OFFSET) {
            return image;
        }
        if (flashSize === "keep" && flashMode === "keep" && flashFreq === "keep") {
            this.debug("Not changing the image");
            return image;
        }

        const magic = image.charCodeAt(0);
        let aFlashMode = image.charCodeAt(2);
        const flashSizeFreq = image.charCodeAt(3);
        
        if (magic !== this.ESP_IMAGE_MAGIC) {
            this.debug(
                `Warning: Image file at 0x${address.toString(16)} doesn't look like an image file, so not changing any flash settings.`
            );
            return image;
        }

        if (flashMode !== "keep") {
            const flashModes = { qio: 0, qout: 1, dio: 2, dout: 3 };
            aFlashMode = flashModes[flashMode];
        }
        
        let aFlashFreq = flashSizeFreq & 0x0f;
        if (flashFreq !== "keep") {
            const flashFreqs = { "40m": 0, "26m": 1, "20m": 2, "80m": 0xf };
            aFlashFreq = flashFreqs[flashFreq];
        }
        
        let aFlashSize = flashSizeFreq & 0xf0;
        if (flashSize !== "keep") {
            const flashSizes = {
                "1MB": 0x00, "2MB": 0x10, "4MB": 0x20, "8MB": 0x30, "16MB": 0x40
            };
            aFlashSize = flashSizes[flashSize];
        }

        const flashParams = (aFlashMode << 8) | (aFlashFreq + aFlashSize);
        this.debug(`Flash params set to ${flashParams.toString(16)}`);
        
        if (image.charCodeAt(2) !== aFlashMode) {
            image = image.substring(0, 2) + String.fromCharCode(aFlashMode) + image.substring(3);
        }
        if (image.charCodeAt(3) !== aFlashFreq + aFlashSize) {
            image = image.substring(0, 3) + String.fromCharCode(aFlashFreq + aFlashSize) + image.substring(4);
        }
        
        return image;
    }

    // 主要的writeFlash方法 - 完全基于esptool-js实现
    async writeFlash(options) {
        this.debug("EspLoader program");
        
        // 检查flash空间
        if (options.flashSize !== "keep") {
            const flashEnd = this.flashSizeBytes(options.flashSize);
            for (let i = 0; i < options.fileArray.length; i++) {
                if (options.fileArray[i].data.length + options.fileArray[i].address > flashEnd) {
                    throw new Error(`File ${i + 1} doesn't fit in the available flash`);
                }
            }
        }

        // 如果需要擦除全部flash
        if (options.eraseAll === true) {
            await this.eraseFlash();
        }

        let image, address;
        for (let i = 0; i < options.fileArray.length; i++) {
            this.debug(`Data Length ${options.fileArray[i].data.length}`);
            image = options.fileArray[i].data;
            this.debug(`Image Length ${image.length}`);
            
            if (image.length === 0) {
                this.debug("Warning: File is empty");
                continue;
            }

            // 数据填充到4字节对齐
            image = this.ui8ToBstr(this.padTo(this.bstrToUi8(image), 4));
            address = options.fileArray[i].address;

            // 更新flash参数
            image = this._updateImageFlashParams(
                image, 
                address, 
                options.flashSize || "keep", 
                options.flashMode || "keep", 
                options.flashFreq || "keep"
            );

            // 计算MD5如果需要
            let calcmd5 = null;
            if (options.calculateMD5Hash) {
                calcmd5 = options.calculateMD5Hash(image);
                this.debug(`Image MD5 ${calcmd5}`);
            }

            const uncsize = image.length;
            let blocks;

            // 压缩处理
            if (options.compress) {
                const uncimage = this.bstrToUi8(image);
                // 注意：这里需要压缩库，暂时使用原始数据
                // image = this.ui8ToBstr(deflate(uncimage, { level: 9 }));
                blocks = await this.flashDeflBegin(uncsize, image.length, address);
            } else {
                blocks = await this.flashBegin(uncsize, address);
            }

            let seq = 0;
            let bytesSent = 0;
            const totalBytes = image.length;
            
            if (options.reportProgress) {
                options.reportProgress(i, 0, totalBytes);
            }

            const d = new Date();
            const t1 = d.getTime();
            let timeout = 5000;

            // 写入flash数据
            while (image.length > 0) {
                this.debug(`Write loop ${address} ${seq} ${blocks}`);
                this.debug(
                    `Writing at 0x${(address + bytesSent).toString(16)}... (${Math.floor((100 * (seq + 1)) / blocks)}%)`
                );
                
                const block = this.bstrToUi8(image.slice(0, this.FLASH_WRITE_SIZE));

                if (options.compress) {
                    let blockTimeout = 3000;
                    if (this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB, block.length) > 3000) {
                        blockTimeout = this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB, block.length);
                    }
                    timeout = blockTimeout;
                    await this.flashDeflBlock(block, seq, timeout);
                } else {
                    timeout = this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB, block.length);
                    await this.flashBlock(block, seq, timeout);
                }

                bytesSent += block.length;
                image = image.slice(this.FLASH_WRITE_SIZE);
                seq++;
                
                if (options.reportProgress) {
                    options.reportProgress(i, bytesSent, totalBytes);
                }
            }

            // 等待flash写入完成
            await this.readReg(this.CHIP_DETECT_MAGIC_REG_ADDR, timeout);

            const t2 = new Date().getTime();
            if (options.compress) {
                this.debug(
                    `Wrote ${uncsize} bytes (${bytesSent} compressed) at 0x${address.toString(16)} in ${(t2 - t1) / 1000} seconds.`
                );
            } else {
                this.debug(
                    `Wrote ${uncsize} bytes at 0x${address.toString(16)} in ${(t2 - t1) / 1000} seconds.`
                );
            }

            // MD5验证
            if (calcmd5) {
                // 注意：这里需要实现flashMd5sum方法
                this.debug("跳过MD5验证（未实现flashMd5sum）");
            }
        }

        this.debug("Leaving...");

        // 结束flash操作
        await this.flashBegin(0, 0);
        if (options.compress) {
            await this.flashDeflFinish();
        } else {
            await this.flashFinish();
        }
    }

    // Flash大小转换 - 直接来自esptool-js
    flashSizeBytes(flashSize) {
        let flashSizeB = -1;
        if (flashSize.indexOf("KB") !== -1) {
            flashSizeB = parseInt(flashSize.slice(0, flashSize.indexOf("KB"))) * 1024;
        } else if (flashSize.indexOf("MB") !== -1) {
            flashSizeB = parseInt(flashSize.slice(0, flashSize.indexOf("MB"))) * 1024 * 1024;
        }
        return flashSizeB;
    }

    // 擦除flash - 直接来自esptool-js
    async eraseFlash() {
        this.debug("Erasing flash (this may take a while)...");
        const d1 = new Date();
        const t1 = d1.getTime();
        
        const ret = await this.checkCommand(
            "erase flash",
            this.ESP_ERASE_FLASH,
            undefined,
            undefined,
            this.CHIP_ERASE_TIMEOUT
        );
        
        const d2 = new Date();
        const t2 = d2.getTime();
        this.debug(`Chip erase completed successfully in ${(t2 - t1) / 1000}s`);
        return ret;
    }

    // 下载后处理 - 直接来自esptool-js
    async after() {
        this.debug("Hard resetting via RTS pin...");
        await this.setRTS(true);
        await this.sleep(100);
        await this.setRTS(false);
    }

    // 清理资源
    async cleanup() {
        try {
            if (this.reader) {
                await this.reader.cancel();
                this.reader.releaseLock();
                this.reader = null;
            }
            if (this.writer) {
                this.writer.releaseLock();
                this.writer = null;
            }
        } catch (error) {
            this.debug("清理资源时出错: " + error.message);
        }
    }
}

// 全局导出
window.ESP32SimpleDownloader = ESP32SimpleDownloader;