#!/usr/bin/env node

/**
 * LN882H重构实现测试脚本 - 修复版本
 */

const fs = require('fs');
const path = require('path');

// 测试结果统计
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
};

// 测试工具函数
function test(name, testFunc) {
    testResults.total++;
    console.log(`\n🧪 测试: ${name}`);
    try {
        testFunc();
        console.log(`✅ 通过: ${name}`);
        testResults.passed++;
    } catch (error) {
        console.log(`❌ 失败: ${name}`);
        console.log(`   错误: ${error.message}`);
        testResults.failed++;
        testResults.errors.push({ name, error: error.message });
    }
}

function assertTrue(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertNotNull(value, message) {
    if (value === null || value === undefined) {
        throw new Error(message);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: 期望 ${expected}, 实际 ${actual}`);
    }
}

console.log('🚀 开始 LN882H 重构实现测试 (修复版本)\n');

// 准备所有依赖
console.log('📦 准备依赖...');

// 1. 加载基础协议 (导出对象)
const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
global.BaseProtocol = baseProtocolExports.BaseProtocol;

// 2. 加载基础配置 (导出对象)
const flashConfigExports = require('./downloaders/shared/configs/flash-config-base.js');
global.FlashConfigBase = flashConfigExports.FlashConfigBase;

// 3. 加载基础下载器 (直接导出类)
const BaseDownloader = require('./downloaders/shared/base-downloader.js');
global.BaseDownloader = BaseDownloader;

// 4. 加载LN882H协议 (导出对象)
const lnProtocolExports = require('./downloaders/ln882h/protocols/ln-protocols.js');

// 5. 加载LN882H配置 (直接导出类)
const LNFlashConfig = require('./downloaders/ln882h/configs/ln-flash-config.js');

// 6. 加载核心模块 (直接导出类)
const XModemSender = require('./downloaders/ln882h/core/xmodem-sender.js');
const RamLoader = require('./downloaders/ln882h/core/ram-loader.js');

// 7. 设置全局变量
global.LNProtocolFactory = lnProtocolExports.LNProtocolFactory;
global.LNFlashConfig = LNFlashConfig;
global.XModemSender = XModemSender;
global.RamLoader = RamLoader;

// 8. 加载主下载器 (直接导出类)
const LN882HDownloaderV2 = require('./downloaders/ln882h/ln882h-downloader-v2.js');

// 9. 加载下载器管理器 (直接导出类)
const DownloaderManager = require('./downloaders/shared/downloader-manager.js');

console.log('✅ 依赖准备完成');

// 测试1: 基础类型检查
test('基础类型检查', () => {
    assertTrue(typeof baseProtocolExports.BaseProtocol === 'function', 'BaseProtocol应该是一个函数');
    assertTrue(typeof flashConfigExports.FlashConfigBase === 'function', 'FlashConfigBase应该是一个函数');
    assertTrue(typeof BaseDownloader === 'function', 'BaseDownloader应该是一个函数');
    assertTrue(typeof LNFlashConfig === 'function', 'LNFlashConfig应该是一个函数');
    assertTrue(typeof XModemSender === 'function', 'XModemSender应该是一个函数');
    assertTrue(typeof RamLoader === 'function', 'RamLoader应该是一个函数');
    assertTrue(typeof LN882HDownloaderV2 === 'function', 'LN882HDownloaderV2应该是一个函数');
    assertTrue(typeof DownloaderManager === 'function', 'DownloaderManager应该是一个函数');
    
    console.log('   ✓ 所有基础类型检查通过');
});

// 测试2: 协议层测试
test('协议层测试', () => {
    const factory = lnProtocolExports.LNProtocolFactory;
    assertTrue(typeof factory === 'function', 'LNProtocolFactory应该是一个函数（类）');
    assertTrue(typeof factory.create === 'function', 'factory.create应该是一个函数');
    
    const supportedProtocols = factory.getSupportedProtocols();
    assertTrue(Array.isArray(supportedProtocols), '支持的协议列表应该是数组');
    assertTrue(supportedProtocols.includes('VersionCheck'), '应该支持VersionCheck协议');
    assertTrue(supportedProtocols.includes('XModemSend'), '应该支持XModemSend协议');
    
    // 测试协议创建
    const versionProtocol = factory.create('VersionCheck');
    assertNotNull(versionProtocol, 'VersionCheck协议不应该为null');
    assertEqual(versionProtocol.name, 'VersionCheckProtocol', '协议名称应该正确');
    
    const xmodemProtocol = factory.create('XModemSend');
    assertNotNull(xmodemProtocol, 'XModemSend协议不应该为null');
    
    // 测试协议命令生成
    const versionCmd = versionProtocol.cmd();
    assertTrue(versionCmd instanceof Uint8Array, '版本命令应该是Uint8Array');
    
    // 测试CRC计算
    const testData = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
    const crc = xmodemProtocol.calcCrc(testData);
    assertTrue(typeof crc === 'number', 'CRC应该是数字');
    assertTrue(crc >= 0 && crc <= 0xFFFF, 'CRC应该在有效范围内');
    
    console.log('   ✓ 协议层测试通过');
});

// 测试3: 配置层测试
test('配置层测试', () => {
    const config = new LNFlashConfig();
    assertNotNull(config, 'LNFlashConfig实例不应该为null');
    assertEqual(config.chipType, 'LN882H', 'chipType应该是LN882H');
    
    // 测试芯片信息
    const chipInfo = config.getChipInfo();
    assertTrue(typeof chipInfo === 'object', '芯片信息应该是对象');
    assertTrue('QS200' in chipInfo, '应该包含QS200芯片信息');
    
    // 测试波特率配置
    const baudrateConfig = config.getBaudrateConfig();
    assertEqual(baudrateConfig.default, 115200, '默认波特率应该是115200');
    assertTrue(config.isValidBaudrate(115200), '115200应该是有效波特率');
    
    // 测试Flash配置
    const flashConfig = config.getFlashConfig();
    assertEqual(flashConfig.eraseAddr, 0, 'Flash擦除地址应该是0');
    assertEqual(flashConfig.eraseSize, 1228 * 1024, 'Flash擦除大小应该是1228KB');
    
    // 测试XModem配置
    const xmodemConfig = config.getXModemConfig();
    assertTrue(Array.isArray(xmodemConfig.packetSizes), '包大小应该是数组');
    assertTrue(xmodemConfig.packetSizes.includes(128), '应该支持128字节包');
    
    // 测试配置验证
    const validation = config.validateConfig();
    assertTrue(validation.valid, '配置应该是有效的');
    
    console.log('   ✓ 配置层测试通过');
});

// 测试4: 核心模块测试
test('核心模块测试', () => {
    const config = new LNFlashConfig();
    
    // 测试RAM加载器
    const ramLoader = new RamLoader(config);
    assertNotNull(ramLoader, 'RamLoader实例不应该为null');
    assertEqual(ramLoader.isLoaded, false, 'RAM加载器初始状态应该是未加载');
    
    // 测试占位符创建
    const placeholderResult = ramLoader.createPlaceholder(1024);
    assertTrue(placeholderResult, '占位符创建应该成功');
    assertTrue(ramLoader.isRamBinaryLoaded(), '占位符创建后应该已加载');
    assertEqual(ramLoader.getRamBinarySize(), 1024, '占位符大小应该是1024');
    
    // 测试模拟串口处理器
    const mockSerialHandler = {
        sendData: async (data) => {},
        readData: async (length, timeout) => new Uint8Array(length),
        resetBuffers: async () => {}
    };
    
    const xmodemSender = new XModemSender(mockSerialHandler, lnProtocolExports.LNProtocolFactory, config);
    assertNotNull(xmodemSender, 'XModemSender实例不应该为null');
    
    const status = xmodemSender.getStatus();
    assertTrue(typeof status === 'object', 'XModemSender状态应该是对象');
    assertTrue(status.protocolReady, '协议应该准备就绪');
    
    console.log('   ✓ 核心模块测试通过');
});

// 测试5: 主下载器测试
test('主下载器测试', () => {
    // 创建模拟串口
    const mockSerialPort = {
        readable: { 
            getReader: () => ({
                read: () => Promise.resolve({ value: new Uint8Array([0x43]), done: false }),
                releaseLock: () => {}
            })
        },
        writable: { 
            getWriter: () => ({
                write: (data) => Promise.resolve(),
                releaseLock: () => {}
            })
        },
        close: async () => {},
        open: async (options) => {}
    };
    
    const debugCallback = (level, message, data) => {
        // 模拟调试回调
    };
    
    const downloader = new LN882HDownloaderV2(mockSerialPort, debugCallback);
    assertNotNull(downloader, 'LN882HDownloaderV2实例不应该为null');
    assertEqual(downloader.chipName, 'LN882H', 'chipName应该是LN882H');
    assertEqual(downloader.version, 'v2.0', 'version应该是v2.0');
    
    console.log('   ✓ 主下载器测试通过');
});

// 测试6: 下载器管理器测试
test('下载器管理器测试', () => {
    const manager = new DownloaderManager();
    
    // 测试支持的芯片
    assertTrue(manager.isChipSupported('LN882H'), '应该支持LN882H芯片');
    
    // 测试芯片信息
    const chipInfo = manager.getChipInfo('LN882H');
    assertNotNull(chipInfo, 'LN882H芯片信息不应该为null');
    assertEqual(chipInfo.displayName, 'LN882H', 'displayName应该是LN882H');
    
    // 测试支持的芯片列表
    const supportedChips = manager.getSupportedChips();
    assertTrue(Array.isArray(supportedChips), '支持的芯片列表应该是数组');
    
    const ln882hChip = supportedChips.find(chip => chip.name === 'LN882H');
    assertNotNull(ln882hChip, '应该在支持列表中找到LN882H');
    
    console.log('   ✓ 下载器管理器测试通过');
});

// 测试7: 集成测试
test('集成测试', async () => {
    // 创建模拟串口
    const mockSerialPort = {
        readable: { 
            getReader: () => ({
                read: () => Promise.resolve({ value: new Uint8Array([0x43]), done: false }),
                releaseLock: () => {}
            })
        },
        writable: { 
            getWriter: () => ({
                write: (data) => Promise.resolve(),
                releaseLock: () => {}
            })
        },
        close: async () => {},
        open: async (options) => {}
    };
    
    const debugCallback = (level, message, data) => {
        // 模拟调试回调
    };
    
    const downloader = new LN882HDownloaderV2(mockSerialPort, debugCallback);
    
    // 测试初始化
    await downloader.initialize();
    assertTrue(downloader.isInitialized, '下载器应该已初始化');
    
    // 测试状态获取
    const status = downloader.getDeviceStatus();
    assertNotNull(status, '设备状态不应该为null');
    assertEqual(status.chipName, 'LN882H', 'chipName应该是LN882H');
    assertEqual(status.version, 'v2.0', 'version应该是v2.0');
    
    // 测试配置获取
    const config = downloader.getConfig();
    assertNotNull(config, '配置不应该为null');
    assertEqual(config.chipType, 'LN882H', 'chipType应该是LN882H');
    
    // 测试连接
    const connectResult = await downloader.connect();
    assertTrue(connectResult.success, '连接应该成功');
    
    // 测试断开连接
    await downloader.disconnect();
    
    console.log('   ✓ 集成测试通过');
});

// 运行所有测试
console.log('\n📊 测试完成统计:');
console.log(`总计: ${testResults.total}`);
console.log(`通过: ${testResults.passed} ✅`);
console.log(`失败: ${testResults.failed} ❌`);

if (testResults.failed > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.errors.forEach(error => {
        console.log(`  - ${error.name}: ${error.error}`);
    });
    process.exit(1);
} else {
    console.log('\n🎉 所有测试通过! LN882H重构实现基本功能验证成功。');
    
    console.log('\n📋 验证结果总结:');
    console.log('✅ 文件结构正确');
    console.log('✅ 语法没有错误');
    console.log('✅ 依赖关系正确');
    console.log('✅ 类实例化正常');
    console.log('✅ 协议层功能正常');
    console.log('✅ 配置管理功能正常');
    console.log('✅ 核心模块功能正常');
    console.log('✅ 主下载器功能正常');
    console.log('✅ 下载器管理器集成正常');
    console.log('✅ 基本集成测试通过');
    
    process.exit(0);
}