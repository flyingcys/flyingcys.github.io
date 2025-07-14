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
            // 1. 链路检查
            await this.linkCheck();
            
            // 2. 获取芯片ID
            await this.getChipId();
            
            // 3. 获取Flash ID
            await this.getFlashId();
            
            // 4. 初始化Flash配置
            await this.initializeFlashConfig();
            
            // 5. 设置更高波特率
            await this.setBaudrate(1500000);
            
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
     * 链路检查 - 完全按照Python link_check()方法实现
     */
    async linkCheck() {
        this.debug('info', '📡 执行链路检查...');
        
        const maxRetries = 10;
        let attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                await this.serialHandler.clearBuffer();
                
                // 使用协议层执行链路检查
                const response = await this.serialHandler.executeProtocol(
                    this.protocols.linkCheck, 
                    [], 
                    15, 
                    500
                );
                
                this.debug('info', '✅ 链路检查成功');
                return response;
                
            } catch (error) {
                attempt++;
                this.debug('debug', `链路检查失败，重试 ${attempt}/${maxRetries}: ${error.message}`);
                
                if (attempt >= maxRetries) {
                    throw new Error(`链路检查失败，已重试${maxRetries}次。请检查设备连接和波特率设置。`);
                }
                
                // 重试前稍作等待
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    /**
     * 获取芯片ID - 完全按照Python get_chip_id()方法实现
     */
    async getChipId() {
        this.debug('info', '🔍 获取芯片ID...');
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.getChipId, 
                [], 
                15, 
                500
            );
            
            // 解析芯片ID
            this.chipId = this.protocols.getChipId.getChipId(response);
            this.debug('info', `✅ 芯片ID: 0x${this.chipId.toString(16).toUpperCase()}`);
            
            return this.chipId;
            
        } catch (error) {
            throw new Error(`获取芯片ID失败: ${error.message}`);
        }
    }

    /**
     * 获取Flash ID - 完全按照Python get_flash_mid()方法实现
     */
    async getFlashId() {
        this.debug('info', '💾 获取Flash ID...');
        
        try {
            const response = await this.serialHandler.executeProtocol(
                this.protocols.getFlashMid, 
                [], 
                15, 
                500
            );
            
            // 解析Flash ID
            this.flashId = this.protocols.getFlashMid.getFlashMid(response);
            this.debug('info', `✅ Flash ID: 0x${this.flashId.toString(16).toUpperCase()}`);
            
            return this.flashId;
            
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
            await this.flashConfig.unprotectFlash(this.serialHandler, this.protocols, this.flashInfo);
            
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
            await this.linkCheck();
            
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