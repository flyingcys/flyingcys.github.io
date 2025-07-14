/**
 * XModem协议发送器
 * 基于Python版本ln882h_flash.py的XModem实现
 * 负责文件传输的核心逻辑
 */

class XModemSender {
    constructor(serialHandler, protocolFactory, config) {
        this.serialHandler = serialHandler;
        this.protocolFactory = protocolFactory;
        this.config = config;
        this.protocol = protocolFactory.create('XModemSend');
        
        // 状态管理
        this.isAborted = false;
        this.currentSequence = 1;
        
        // 回调函数
        this.progressCallback = null;
        this.debugCallback = null;
    }

    /**
     * 设置进度回调
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    /**
     * 设置调试回调
     */
    setDebugCallback(callback) {
        this.debugCallback = callback;
    }

    /**
     * 调试日志
     */
    debug(message, data = null) {
        if (this.debugCallback) {
            this.debugCallback('XModemSender', message, data);
        }
    }

    /**
     * 中止传输
     */
    async abort(count = 2) {
        this.isAborted = true;
        for (let i = 0; i < count; i++) {
            await this.serialHandler.sendData([this.protocol.CAN]);
        }
        this.debug(`发送了 ${count} 个CAN字符中止传输`);
    }

    /**
     * 等待接收CRC字符（传输开始）
     */
    async receiveHeader(retry = 20) {
        this.debug('等待接收CRC字符开始传输...');
        let errorCount = 0;
        let cancelCount = 0;

        while (!this.isAborted) {
            const char = await this.serialHandler.readData(1, 100);
            
            if (this.protocol.isCrcChar(char)) {
                this.debug('接收到CRC字符，传输开始');
                return true;
            } else if (this.protocol.isCanChar(char)) {
                cancelCount++;
                this.debug(`接收到CAN字符 (${cancelCount}/2)`);
                if (cancelCount >= 2) {
                    this.debug('接收到2次CAN，传输被对方取消');
                    return false;
                }
            } else {
                errorCount++;
                this.debug(`接收到未知字符: ${char.length > 0 ? `0x${char[0].toString(16)}` : 'empty'} (${errorCount}/${retry})`);
                if (errorCount > retry) {
                    await this.abort();
                    this.debug(`错误字符超过${retry}次，中止传输`);
                    return false;
                }
            }
        }

        return false;
    }

    /**
     * 发送文件信息头
     */
    async receiveResponse(fileName, fileSize, retry = 20) {
        this.debug(`发送文件信息: ${fileName}, 大小: ${fileSize}`);
        
        // 创建文件信息包
        const header = this.protocol.makeSendHeader(128, 0);
        const name = new TextEncoder().encode(fileName);
        const size = new TextEncoder().encode(fileSize.toString());
        
        // 构建数据包
        let data = new Uint8Array(name.length + 1 + size.length + 1);
        data.set(name, 0);
        data[name.length] = 0x00;
        data.set(size, name.length + 1);
        data[name.length + 1 + size.length] = 0x20;
        
        // 填充到128字节
        const paddedData = new Uint8Array(128);
        paddedData.set(data);
        for (let i = data.length; i < 128; i++) {
            paddedData[i] = this.protocol.headerPad;
        }
        
        // 计算校验和并组装完整数据包
        const checksum = this.protocol.makeSendChecksum(paddedData);
        const dataForSend = new Uint8Array(header.length + paddedData.length + checksum.length);
        dataForSend.set(header);
        dataForSend.set(paddedData, header.length);
        dataForSend.set(checksum, header.length + paddedData.length);
        
        // 发送数据包
        await this.serialHandler.sendData(dataForSend);
        
        // 等待ACK + CRC响应
        let errorCount = 0;
        let cancelCount = 0;
        
        while (!this.isAborted) {
            const char = await this.serialHandler.readData(1, 100);
            
            if (this.protocol.isAckChar(char)) {
                this.debug('接收到ACK字符');
                // 等待CRC字符
                const char2 = await this.serialHandler.readData(1, 100);
                if (this.protocol.isCrcChar(char2)) {
                    this.debug('接收到CRC字符，文件信息发送成功');
                    return true;
                } else {
                    this.debug(`ACK后未收到CRC: ${char2.length > 0 ? `0x${char2[0].toString(16)}` : 'empty'}`);
                }
            } else if (this.protocol.isCanChar(char)) {
                cancelCount++;
                this.debug(`接收到CAN字符 (${cancelCount}/2)`);
                if (cancelCount >= 2) {
                    this.debug('接收到2次CAN，传输被对方取消');
                    return false;
                }
            } else {
                errorCount++;
                this.debug(`接收到未知字符: ${char.length > 0 ? `0x${char[0].toString(16)}` : 'empty'} (${errorCount}/${retry})`);
                if (errorCount > retry) {
                    await this.abort();
                    this.debug(`错误字符超过${retry}次，中止传输`);
                    return false;
                }
            }
        }
        
        return false;
    }

    /**
     * 发送文件数据
     */
    async sendFile(fileData, packetSize, callback = null, retry = 20) {
        this.debug(`开始发送文件数据，包大小: ${packetSize}, 文件大小: ${fileData.length}`);
        
        let sequence = 1;
        let offset = 0;
        const totalPackets = Math.ceil(fileData.length / packetSize);
        let sentPackets = 0;
        
        while (offset < fileData.length && !this.isAborted) {
            // 获取当前包数据
            const data = fileData.slice(offset, offset + packetSize);
            if (data.length === 0) {
                this.debug("到达文件末尾");
                break;
            }
            
            // 创建数据包头
            const header = this.protocol.makeSendHeader(packetSize, sequence);
            
            // 填充数据到指定包大小
            const paddedData = new Uint8Array(packetSize);
            paddedData.set(data);
            for (let i = data.length; i < packetSize; i++) {
                paddedData[i] = this.protocol.headerPad;
            }
            
            // 计算校验和
            const checksum = this.protocol.makeSendChecksum(paddedData);
            
            // 组装完整数据包
            const dataForSend = new Uint8Array(header.length + paddedData.length + checksum.length);
            dataForSend.set(header);
            dataForSend.set(paddedData, header.length);
            dataForSend.set(checksum, header.length + paddedData.length);
            
            this.debug(`发送数据包 ${sequence} (${sentPackets + 1}/${totalPackets})`);
            
            // 发送数据包
            await this.serialHandler.sendData(dataForSend);
            
            // 等待ACK
            let errorCount = 0;
            let ackReceived = false;
            
            while (!ackReceived && !this.isAborted) {
                const char = await this.serialHandler.readData(1, 100);
                
                if (this.protocol.isAckChar(char)) {
                    ackReceived = true;
                    this.debug(`数据包 ${sequence} 发送成功`);
                } else {
                    errorCount++;
                    this.debug(`等待ACK时收到未知字符: ${char.length > 0 ? `0x${char[0].toString(16)}` : 'empty'} (${errorCount}/${retry})`);
                    
                    if (errorCount > retry) {
                        this.debug(`等待ACK超过${retry}次，中止传输`);
                        await this.abort();
                        return false;
                    }
                }
            }
            
            if (this.isAborted) {
                return false;
            }
            
            // 更新进度
            sentPackets++;
            if (callback) {
                callback(sentPackets, totalPackets);
            }
            
            if (this.progressCallback) {
                this.progressCallback(sentPackets, totalPackets, `发送数据包 ${sentPackets}/${totalPackets}`);
            }
            
            // 准备下一个包
            sequence = (sequence + 1) % 0x100;
            offset += packetSize;
        }
        
        this.debug(`文件数据发送完成，共发送 ${sentPackets} 个数据包`);
        return true;
    }

    /**
     * 发送EOT结束传输
     */
    async sendEot(retry = 20) {
        this.debug('发送EOT结束传输...');
        
        // 第一次发送EOT
        let errorCount = 0;
        while (!this.isAborted) {
            await this.serialHandler.sendData([this.protocol.EOT]);
            this.debug("发送EOT");
            
            const char = await this.serialHandler.readData(1, 100);
            if (this.protocol.isAckChar(char)) {
                this.debug("EOT发送成功，收到ACK");
                break;
            }
            
            errorCount++;
            if (errorCount > retry) {
                await this.abort();
                this.debug(`EOT发送失败，超过${retry}次重试`);
                return false;
            }
        }
        
        if (this.isAborted) {
            return false;
        }
        
        // 发送空数据包结束传输
        const header = this.protocol.makeSendHeader(128, 0);
        const data = new Uint8Array(128);
        data[0] = 0x00;
        for (let i = 1; i < 128; i++) {
            data[i] = this.protocol.headerPad;
        }
        const checksum = this.protocol.makeSendChecksum(data);
        
        const dataForSend = new Uint8Array(header.length + data.length + checksum.length);
        dataForSend.set(header);
        dataForSend.set(data, header.length);
        dataForSend.set(checksum, header.length + data.length);
        
        await this.serialHandler.sendData(dataForSend);
        
        // 等待最终ACK
        errorCount = 0;
        while (!this.isAborted) {
            const char = await this.serialHandler.readData(1, 100);
            if (this.protocol.isAckChar(char)) {
                this.debug("传输完全结束，收到最终ACK");
                return true;
            }
            
            errorCount++;
            if (errorCount > retry) {
                await this.abort();
                this.debug(`最终ACK接收失败，超过${retry}次重试`);
                return false;
            }
        }
        
        return false;
    }

    /**
     * 完整的XModem发送流程
     */
    async send(fileData, fileName, fileSize, packetSize = 128) {
        this.debug(`开始XModem传输: ${fileName}, ${fileSize} 字节, 包大小: ${packetSize}`);
        
        // 重置状态
        this.isAborted = false;
        this.currentSequence = 1;
        
        try {
            // 1. 等待传输开始信号
            if (!await this.receiveHeader()) {
                throw new Error('等待传输开始信号失败');
            }
            
            // 2. 发送文件信息
            if (!await this.receiveResponse(fileName, fileSize)) {
                throw new Error('发送文件信息失败');
            }
            
            // 3. 发送文件数据
            if (!await this.sendFile(fileData, packetSize)) {
                throw new Error('发送文件数据失败');
            }
            
            // 4. 发送EOT结束传输
            if (!await this.sendEot()) {
                throw new Error('发送EOT结束传输失败');
            }
            
            this.debug('XModem传输成功完成');
            return { success: true };
            
        } catch (error) {
            this.debug(`XModem传输失败: ${error.message}`);
            if (!this.isAborted) {
                await this.abort();
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 重置发送器状态
     */
    reset() {
        this.isAborted = false;
        this.currentSequence = 1;
        this.debug('XModem发送器状态已重置');
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isAborted: this.isAborted,
            currentSequence: this.currentSequence,
            protocolReady: !!this.protocol
        };
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.XModemSender = XModemSender;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = XModemSender;
}