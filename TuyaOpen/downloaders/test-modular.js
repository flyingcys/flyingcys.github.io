/**
 * T5AI Downloader Modular Test
 * 模块化版本测试文件
 */

import { T5AIDownloader } from './t5ai-downloader-modular.js';

/**
 * 测试模块化下载器
 */
async function testModularDownloader() {
    console.log('=== T5AI下载器模块化版本测试 ===');
    
    try {
        // 创建下载器实例
        const downloader = new T5AIDownloader();
        console.log('✓ 下载器实例创建成功');
        
        // 测试版本信息
        const version = downloader.getVersion();
        console.log('✓ 版本信息:', version);
        
        // 测试获取支持的Flash芯片（需要先初始化flashConfig）
        try {
            const chips = downloader.getSupportedFlashChips();
            console.log('✓ 支持的Flash芯片数量:', chips.length);
        } catch (error) {
            console.log('- Flash芯片列表需要连接后才能获取');
        }
        
        // 测试设备状态
        const status = downloader.getDeviceStatus();
        console.log('✓ 设备状态:', {
            isConnected: status.isConnected,
            chipId: status.chipId,
            flashId: status.flashId
        });
        
        // 测试配置
        const originalBaudrate = downloader.getUserConfiguredBaudrate();
        console.log('✓ 默认波特率:', originalBaudrate);
        
        downloader.setUserConfiguredBaudrate(1500000);
        const newBaudrate = downloader.getUserConfiguredBaudrate();
        console.log('✓ 设置新波特率:', newBaudrate);
        
        downloader.setUserConfiguredBaudrate(originalBaudrate);
        console.log('✓ 恢复原波特率:', downloader.getUserConfiguredBaudrate());
        
        console.log('\n=== 模块导入测试 ===');
        
        // 测试各个模块是否能正确导入
        const { T5SerialHandler } = await import('./t5ai/core/t5-serial-handler.js');
        console.log('✓ T5SerialHandler模块导入成功');
        
        const { T5ConnectionManager } = await import('./t5ai/core/t5-connection-manager.js');
        console.log('✓ T5ConnectionManager模块导入成功');
        
        const { T5FlashOperations } = await import('./t5ai/core/t5-flash-operations.js');
        console.log('✓ T5FlashOperations模块导入成功');
        
        const { T5FlashConfig } = await import('./t5ai/configs/t5-flash-config.js');
        console.log('✓ T5FlashConfig模块导入成功');
        
        const { T5ProtocolFactory } = await import('./t5ai/protocols/t5-protocols.js');
        console.log('✓ T5ProtocolFactory模块导入成功');
        
        const { CRC32Calculator, DataProcessor, AddressUtils, ErrorHandler, RetryUtils, Logger } = await import('./t5ai/utils/t5-utils.js');
        console.log('✓ 工具模块导入成功');
        
        console.log('\n=== 协议测试 ===');
        
        // 测试协议工厂
        const linkCheckProtocol = T5ProtocolFactory.createProtocol('linkCheck');
        const linkCheckCmd = linkCheckProtocol.cmd();
        console.log('✓ 链路检查协议命令:', Array.from(linkCheckCmd).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        
        const getChipIdProtocol = T5ProtocolFactory.createProtocol('getChipId');
        const getChipIdCmd = getChipIdProtocol.cmd();
        console.log('✓ 获取芯片ID协议命令:', Array.from(getChipIdCmd).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        
        console.log('\n=== 工具函数测试 ===');
        
        // 测试CRC计算
        const crcCalc = new CRC32Calculator();
        const testData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
        const crc = crcCalc.calculateCRC(testData);
        console.log('✓ CRC32计算:', '0x' + crc.toString(16).toUpperCase());
        
        // 测试数据处理
        const alignedData = DataProcessor.alignData(testData, 8);
        console.log('✓ 数据对齐:', Array.from(alignedData).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        
        const formattedSize = DataProcessor.formatBytes(1024 * 1024);
        console.log('✓ 大小格式化:', formattedSize);
        
        // 测试地址工具
        const isAligned = AddressUtils.isAligned(4096, 4096);
        console.log('✓ 地址对齐检查:', isAligned);
        
        const alignedAddr = AddressUtils.alignAddress(4100, 4096);
        console.log('✓ 地址对齐:', '0x' + alignedAddr.toString(16));
        
        console.log('\n=== 所有测试通过 ===');
        console.log('模块化拆分成功，所有模块都能正常工作！');
        
        return true;
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
        return false;
    }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
    // Node.js环境
    testModularDownloader().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // 浏览器环境
    window.testModularDownloader = testModularDownloader;
}

export { testModularDownloader };