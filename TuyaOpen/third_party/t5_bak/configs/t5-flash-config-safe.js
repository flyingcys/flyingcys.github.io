/**
 * T5 Flash配置类 - 安全加载版本
 * 解决加载时序问题，确保在FlashConfigBase加载完成后再定义类
 */

(function() {
    'use strict';
    
    // 等待FlashConfigBase加载的函数
    function waitForFlashConfigBase(callback, maxAttempts = 50) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof window.FlashConfigBase === 'function') {
                clearInterval(checkInterval);
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('T5FlashConfig: FlashConfigBase未能在预期时间内加载');
            }
        }, 100);
    }
    
    // 定义T5FlashConfig类的函数
    function defineT5FlashConfig() {
        // 确保FlashConfigBase存在
        if (typeof window.FlashConfigBase !== 'function') {
            console.error('T5FlashConfig: FlashConfigBase未定义');
            return;
        }
        
        class T5FlashConfig extends window.FlashConfigBase {
            constructor() {
                super();
                this.name = 'T5FlashConfig';
                
                // 完整的T5 Flash数据库
                this.configDatabase = {
                    // GD系列
                    0x00134051: [0x00134051, 'MD25D40D', 'GD', '4 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
                    0x001340c8: [0x001340c8, 'GD25Q41B', 'GD', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    0x00144051: [0x00144051, 'MD25D80D', 'GD', '8 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
                    0x001464c8: [0x001464c8, 'GD25WD80E', 'GD', '8 * 1024 * 1024', [null, 0, 0, 0, 0, 0, null, null], [null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null], 0x05, 0x01],
                    0x001440c8: [0x001440c8, 'GD25Q80C', 'GD', '8 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    0x001540c8: [0x001540c8, 'GD25Q16C', 'GD', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001565c8: [0x001565c8, 'GD25WQ16E', 'GD', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, 1, 1, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001640c8: [0x001640c8, 'GD25Q32C', 'GD', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    0x001665c8: [0x001665c8, 'GD25WQ32E', 'GD', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001740c8: [0x001740c8, 'GD25Q64C', 'GD', '64 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    0x001765c8: [0x001765c8, 'GD25WQ64E', 'GD', '64 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    0x001840c8: [0x001840c8, 'GD25Q128C', 'GD', '128 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    
                    // TH系列
                    0x001260eb: [0x001260eb, 'TH25D20HA', 'TH', '2 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001360cd: [0x001360cd, 'TH25Q40HB', 'TH', '4 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001460cd: [0x001460cd, 'TH25Q80HB', 'TH', '8 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001560eb: [0x001560eb, 'TH25Q16HB', 'TH', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x001760eb: [0x001760eb, 'TH25Q64HA', 'TH', '64 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, 1, 1, 1, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], [0x01, 0x31]],
                    
                    // 其他系列...（添加所有其他Flash配置）
                    // XTX系列
                    0x0015400b: [0x0015400b, 'XT25F16B', 'XTX', '16 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                    0x0016400b: [0x0016400b, 'XT25F32B', 'XTX', '32 * 1024 * 1024', [null, 0, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, null, null], [null, 0, null, null, null, null, null, null, null, 0, 0, 1, 1, 1, null, null], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], [0x05, 0x35], 0x01],
                };
                
                this.chipDatabase = window.ChipDatabase || {};
            }
            
            // 获取Flash信息
            getFlashInfo(flashId) {
                const config = this.configDatabase[flashId];
                if (!config) {
                    console.warn(`Flash ID 0x${flashId.toString(16)} 未找到配置`);
                    return null;
                }
                
                return {
                    id: config[0],
                    name: config[1],
                    manufacturer: config[2],
                    size: eval(config[3]),
                    unprotectBits: config[4],
                    protectBits: config[5],
                    reserved: config[6],
                    readCode: config[7],
                    writeCode: config[8]
                };
            }
            
            // 获取支持的Flash ID列表
            getSupportedFlashIds() {
                return Object.keys(this.configDatabase).map(id => parseInt(id));
            }
            
            // 其他必要的方法...
            isFlashSupported(flashId) {
                return flashId in this.configDatabase;
            }
            
            getFlashName(flashId) {
                const info = this.getFlashInfo(flashId);
                return info ? info.name : 'Unknown';
            }
            
            getFlashSize(flashId) {
                const info = this.getFlashInfo(flashId);
                return info ? info.size : 0;
            }
        }
        
        // 将类暴露到全局
        window.T5FlashConfig = T5FlashConfig;
        console.log('T5FlashConfig 类已成功定义并暴露到 window 对象');
    }
    
    // 立即尝试定义，如果FlashConfigBase已存在
    if (typeof window.FlashConfigBase === 'function') {
        defineT5FlashConfig();
    } else {
        // 否则等待FlashConfigBase加载
        console.log('等待FlashConfigBase加载...');
        waitForFlashConfigBase(defineT5FlashConfig);
    }
})();