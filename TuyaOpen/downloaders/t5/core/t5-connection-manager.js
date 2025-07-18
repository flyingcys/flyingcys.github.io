/**
 * T5连接管理器
 * 负责T5芯片的连接、握手、波特率设置等连接相关功能
 * 从t5ai-downloader.js中拆分出来
 */

class T5ConnectionManager {
    constructor(serialHandler, protocols, flashConfig, debugCallback) {
        this.serialHandler = serialHandler;
        this.protocols = protocols;
        this.flashConfig = flashConfig;
        this.debugCallback = debugCallback;
        
        // 连接状态
        this.chipId = null;
        this.flashId = null;
        this.flashInfo = null;
        this.currentBaudrate = 115200;
        this.isConnected = false;
    }

    /**
     * 调试日志输出
     */
    debug(level, message, data = null) {
        if (this.debugCallback) {
            this.debugCallback(level, message, data);
        }
    }

    /**
     * 连接并初始化设备
     */
    async connect() {
        this.debug('main', '🔗 开始连接T5芯片...');
        
        try {
            // 1. 获取总线控制权（包含复位和链路检查）
            const busControlResult = await this.getBusControl();
            if (!busControlResult) {
                throw new Error('链路检查失败，已重试100次。请检查设备连接和波特率设置。');
            }
            
            // 2. 获取芯片ID
            await this.getChipId();
            
            // 3. 获取Flash ID
            await this.getFlashId();
            
            // 4. 初始化Flash配置
            await this.initializeFlashConfig();
            
            // 注意：高波特率设置移到下载流程中，连接时保持115200
            
            this.isConnected = true;
            this.debug('main', '✅ T5芯片连接成功');
            
            return {
                success: true,
                chipId: this.chipId,
                flashId: this.flashId,
                flashInfo: this.flashInfo,
                baudrate: this.currentBaudrate
            };
            
        } catch (error) {
            this.debug('error', `连接失败: ${error.message}`);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * 获取总线控制权 - 修复版本，基于参考实现增强诊断功能
     */
    async getBusControl() {
        this.debug('main', '=== 步骤1: 获取总线控制权 ===');
        this.debug('info', '📡 执行链路检查...');
        
        // 添加连接诊断信息
        this.debug('info', '🔍 连接诊断信息:');
        this.debug('info', `   - 波特率: ${this.currentBaudrate} bps`);
        this.debug('info', '   - 协议: T5AI LinkCheck');
        this.debug('info', '   - 复位方式: RTS控制信号');
        
        const maxTryCount = 100; // 与参考版本保持一致
        for (let attempt = 1; attempt <= maxTryCount; attempt++) {
            this.debug('comm', `🔄 总线控制权尝试 ${attempt}/${maxTryCount}`);
            
            // 增强版设备复位 - 基于参考实现，添加更强的诊断
            try {
                this.debug('debug', `开始复位设备，第${attempt}次尝试`);
                
                // 步骤1: 拉高RTS（请求发送），保持DTR低电平
                await this.serialHandler.port.setSignals({ dataTerminalReady: false, requestToSend: true });
                this.debug('debug', '复位信号: DTR=LOW, RTS=HIGH (复位状态)');
                
                // 步骤2: 保持复位状态300ms - 与参考版本完全一致
                await new Promise(resolve => setTimeout(resolve, 300)); // 参考版本: time.sleep(0.3)
                
                // 步骤3: 释放复位信号，让设备启动
                await this.serialHandler.port.setSignals({ dataTerminalReady: false, requestToSend: false });
                this.debug('debug', '复位信号: DTR=LOW, RTS=LOW (运行状态)');
                
                // 步骤4: 等待设备启动完成 - 增加等待时间，确保设备完全启动
                await new Promise(resolve => setTimeout(resolve, 50)); // 从10ms增加到50ms
                
                this.debug('debug', `✅ 复位设备完成，第${attempt}次尝试`);
            } catch (error) {
                this.debug('debug', `❌ 复位设备失败: ${error.message}`);
                this.debug('debug', '可能原因: 串口控制信号不可用或设备硬件连接问题');
                continue; // 复位失败继续下一次尝试
            }
            
            // do_link_check_ex - 与参考版本一致，最多60次
            const linkCheckSuccess = await this.doLinkCheckEx(60);
            if (linkCheckSuccess) {
                this.debug('main', `✅ 第${attempt}次尝试成功获取总线控制权`);
                return true;
            }
            
            // 提供诊断建议
            if (attempt === 1) {
                this.debug('info', '💡 首次连接失败，常见解决方案:');
                this.debug('info', '   1. 确认设备已正确连接USB线');
                this.debug('info', '   2. 确认设备处于下载模式(按住BOOT键上电)');
                this.debug('info', '   3. 检查是否选择了正确的串口');
                this.debug('info', '   4. 尝试更换USB线或USB端口');
            } else if (attempt === 10) {
                this.debug('warning', '⚠️  多次连接失败，请检查:');
                this.debug('warning', '   - 设备是否支持RTS复位信号');
                this.debug('warning', '   - 波特率是否正确(应为115200)');
                this.debug('warning', '   - 设备固件是否损坏');
            } else if (attempt === 50) {
                this.debug('error', '🚨 连接严重困难，可能原因:');
                this.debug('error', '   - 设备硬件故障');
                this.debug('error', '   - 串口驱动程序问题');
                this.debug('error', '   - 浏览器WebSerial兼容性问题');
            }
            
            // 添加失败后的短暂延迟，避免过快重试
            if (attempt < maxTryCount) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        this.debug('error', '❌ 连接失败: 链路检查失败，已重试100次');
        this.debug('error', '📋 最终诊断建议:');
        this.debug('error', '   1. 重新插拔设备USB连接');
        this.debug('error', '   2. 确认设备进入下载模式');
        this.debug('error', '   3. 尝试使用不同的浏览器');
        this.debug('error', '   4. 检查设备是否为正品T5AI芯片');
        return false;
    }

    /**
     * do_link_check_ex - 修复版本，完全基于参考实现的成功逻辑
     * 参考版本: max_try_count=60, timeout_sec=0.001
     * 使用串口处理器的增强版链路检查方法
     */
    async doLinkCheckEx(maxTryCount = 60) {
        this.debug('debug', `开始增强链路检查，最多尝试${maxTryCount}次`);
        
        // 直接使用串口处理器的增强版链路检查方法
        return await this.serialHandler.doLinkCheckEx(maxTryCount);
    }

    /**
     * 单次链路检查 - 供其他方法调用，直接使用串口处理器方法
     */
    async doLinkCheck() {
        return await this.serialHandler.doLinkCheck();
    }

    /**
     * 获取芯片ID - 完全按照参考版本getChipId()方法实现
     */
    async getChipId() {
        this.debug('main', '=== 步骤2: 获取芯片ID ===');
        this.debug('comm', '正在获取芯片ID...');
        
        try {
            const command = [0x01, 0xE0, 0xFC, 0x05, 0x03, 0x04, 0x00, 0x01, 0x44];
            
            const response = await this.serialHandler.executeDirectProtocol(
                'GetChipId',
                command,
                15,
                500
            );
            
            if (response.length >= 15) {
                const r = response.slice(0, 15);
                this.debug('debug', `完整响应: ${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                
                if (r[0] === 0x04 && r[1] === 0x0E && r[3] === 0x01 && 
                    r[4] === 0xE0 && r[5] === 0xFC && r[6] === 0x03) {
                    
                    const chipIdBytes = r.slice(-4);
                    const chipId = chipIdBytes[0] | (chipIdBytes[1] << 8) | (chipIdBytes[2] << 16) | (chipIdBytes[3] << 24);
                    
                    this.chipId = chipId;
                    this.debug('main', `✅ 芯片ID: 0x${chipId.toString(16).toUpperCase().padStart(8, '0')}`);
                    
                    return chipId;
                }
            }
            
            throw new Error('获取芯片ID响应格式错误');
            
        } catch (error) {
            throw new Error(`获取芯片ID失败: ${error.message}`);
        }
    }

    /**
     * 获取Flash ID - 完全按照参考版本getFlashId()方法实现
     */
    async getFlashId() {
        this.debug('main', '=== 步骤3: 获取Flash ID ===');
        this.debug('comm', '正在获取Flash ID...');
        
        try {
            // 使用正确的Flash协议格式：[0x01, 0xE0, 0xFC, 0xFF, 0xF4, payload_length_low, payload_length_high, cmd, reg_addr, 0, 0, 0]
            // 其中: payload_length = 5 (cmd + 4字节地址), cmd = 0x0e, reg_addr = 0x9f
            const command = [0x01, 0xE0, 0xFC, 0xFF, 0xF4, 0x05, 0x00, 0x0e, 0x9f, 0x00, 0x00, 0x00];
            
            const response = await this.serialHandler.executeDirectProtocol(
                'FlashGetMID',
                command,
                15,
                100
            );
            
            if (response.length >= 11) {
                const r = response;
                this.debug('debug', `完整响应: ${r.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                
                // 检查基本Flash协议格式：04 0E FF 01 E0 FC F4
                if (r[0] === 0x04 && r[1] === 0x0E && r[2] === 0xFF && 
                    r[3] === 0x01 && r[4] === 0xE0 && r[5] === 0xFC && r[6] === 0xF4) {
                    
                    // 检查命令响应 (位置9应该是0x0e)
                    if (r[9] === 0x0e) {
                        // 检查状态码 (位置10)
                        const status = r[10];
                        this.debug('debug', `状态码: 0x${status.toString(16).padStart(2, '0').toUpperCase()}`);
                        
                        if (status === 0x00) {
                            // 状态正常，提取Flash ID - 完全按照参考版本逻辑
                            if (response.length >= 15) {
                                // 参考版本: struct.unpack("<I", response_content[11:])[0] >> 8
                                // 从位置11开始取4字节，小端序解析为32位整数，然后右移8位
                                const flashIdData = response.slice(11, 15);
                                this.debug('debug', `Flash ID原始数据: ${flashIdData.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
                                
                                // 小端序解析为32位整数
                                const flashId32 = flashIdData[0] | (flashIdData[1] << 8) | (flashIdData[2] << 16) | (flashIdData[3] << 24);
                                this.debug('debug', `32位整数 (小端序): 0x${flashId32.toString(16).toUpperCase().padStart(8, '0')}`);
                                
                                // 右移8位得到最终Flash ID
                                const flashId = flashId32 >>> 8;
                                this.debug('debug', `Flash ID (右移8位): 0x${flashId.toString(16).toUpperCase().padStart(6, '0')}`);
                                
                                this.flashId = flashId;
                                this.debug('main', `✅ Flash ID: 0x${flashId.toString(16).toUpperCase().padStart(6, '0')}`);
                                
                                return flashId;
                            } else {
                                throw new Error(`响应长度不足，期望15字节，实际${response.length}字节`);
                            }
                        } else {
                            // 状态码错误，查找错误信息
                            const statusInfo = [
                                { code: 0x0, desc: 'normal' },
                                { code: 0x1, desc: 'FLASH_STATUS_BUSY' },
                                { code: 0x2, desc: 'spi timeout' },
                                { code: 0x3, desc: 'flash operate timeout' },
                                { code: 0x4, desc: 'package payload length error' },
                                { code: 0x5, desc: 'package length error' },
                                { code: 0x6, desc: 'flash operate PARAM_ERROR' },
                                { code: 0x7, desc: 'unknown cmd' },
                            ];
                            
                            const errorInfo = statusInfo.find(info => info.code === status);
                            const errorDesc = errorInfo ? errorInfo.desc : `未知错误码 0x${status.toString(16)}`;
                            throw new Error(`Flash操作失败: ${errorDesc} (状态码: 0x${status.toString(16).padStart(2, '0').toUpperCase()})`);
                        }
                    } else {
                        throw new Error(`命令响应码错误，期望0x0e，实际0x${r[9].toString(16).padStart(2, '0').toUpperCase()}`);
                    }
                } else {
                    throw new Error(`Flash协议头部格式错误`);
                }
            } else {
                throw new Error(`响应长度不足，期望至少11字节，实际${response.length}字节`);
            }
            
        } catch (error) {
            throw new Error(`获取Flash ID失败: ${error.message}`);
        }
    }

    /**
     * 初始化Flash配置
     */
    async initializeFlashConfig() {
        this.debug('info', '⚙️ 初始化Flash配置...');
        
        try {
            // 使用新的Flash配置系统
            const flashInfo = this.flashConfig.getFlashInfo(this.flashId);
            if (!flashInfo) {
                this.debug('warning', `未知的Flash ID: 0x${this.flashId.toString(16)}, 使用默认配置`);
                this.flashInfo = { 
                    name: 'Unknown', 
                    manufacturer: 'Unknown', 
                    size: 4 * 1024 * 1024,
                    id: this.flashId
                };
            } else {
                this.flashInfo = flashInfo;
                this.debug('info', `✅ Flash: ${flashInfo.name} (${flashInfo.manufacturer}) ${(flashInfo.size / 1024 / 1024).toFixed(1)}MB`);
            }
            
            // 解保护Flash
            await this.flashConfig.unprotectFlash(this.serialHandler);
            
        } catch (error) {
            throw new Error(`Flash配置初始化失败: ${error.message}`);
        }
    }

    /**
     * 设置波特率 - 完全按照Python set_baudrate()方法实现
     */
    async setBaudrate(baudrate) {
        this.debug('info', `⚡ 设置波特率为 ${baudrate}...`);
        
        try {
            // 发送波特率设置命令
            const response = await this.serialHandler.executeProtocol(
                this.protocols.setBaudrate, 
                [baudrate], 
                15, 
                500
            );
            
            // 检查响应
            if (!this.protocols.setBaudrate.isSuccess(response)) {
                throw new Error('波特率设置命令响应错误');
            }
            
            this.debug('info', '📡 波特率设置命令发送成功，等待设备切换...');
            
            // 等待设备完成波特率切换
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 关闭串口并重新以新波特率打开
            await this.serialHandler.port.close();
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.serialHandler.port.open({ baudRate: baudrate });
            
            this.currentBaudrate = baudrate;
            
            // 验证新波特率
            if (!await this.doLinkCheck()) {
                throw new Error('波特率切换后通信验证失败');
            }
            
            this.debug('info', `✅ 波特率设置为 ${baudrate} 成功`);
            
        } catch (error) {
            throw new Error(`设置波特率失败: ${error.message}`);
        }
    }

    /**
     * 保持ROM模式 - 完全按照Python stay_rom()方法实现
     */
    async stayRom() {
        this.debug('info', '🔒 保持ROM模式...');
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.stayRom, 
                [], 
                15, 
                500
            );
            
            this.debug('info', '✅ ROM模式保持成功');
            return response;
            
        } catch (error) {
            throw new Error(`保持ROM模式失败: ${error.message}`);
        }
    }

    /**
     * 重启设备 - 完全按照Python reboot()方法实现
     */
    async reboot() {
        this.debug('info', '🔄 重启设备...');
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.reboot, 
                [], 
                15, 
                500
            );
            
            this.debug('info', '✅ 设备重启命令发送成功');
            this.isConnected = false;
            return response;
            
        } catch (error) {
            // 重启命令可能不会有响应，所以某些错误是预期的
            this.debug('info', '✅ 设备重启命令发送成功（可能无响应）');
            this.isConnected = false;
            return null;
        }
    }

    /**
     * 获取连接状态
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            chipId: this.chipId,
            flashId: this.flashId,
            flashInfo: this.flashInfo,
            currentBaudrate: this.currentBaudrate
        };
    }

    /**
     * 断开连接
     */
    async disconnect() {
        this.debug('info', '🔌 断开连接...');
        this.isConnected = false;
        this.chipId = null;
        this.flashId = null;
        this.flashInfo = null;
    }

    /**
     * 重置连接状态
     */
    reset() {
        this.isConnected = false;
        this.chipId = null;
        this.flashId = null;
        this.flashInfo = null;
        this.currentBaudrate = 115200;
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.T5ConnectionManager = T5ConnectionManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5ConnectionManager;
}