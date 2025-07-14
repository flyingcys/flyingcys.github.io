#!/usr/bin/env node

/**
 * LN882H重构实现测试脚本
 * 用于Node.js环境下测试所有文件的加载和基本功能
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

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: 期望 ${expected}, 实际 ${actual}`);
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

// 检查文件是否存在
function checkFile(filePath) {
    const fullPath = path.resolve(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`文件不存在: ${fullPath}`);
    }
    return fullPath;
}

console.log('🚀 开始 LN882H 重构实现测试\n');

// 测试1: 文件存在性检查
test('文件存在性检查', () => {
    const requiredFiles = [
        'downloaders/shared/protocols/base-protocol.js',
        'downloaders/shared/configs/flash-config-base.js',
        'downloaders/shared/base-downloader.js',
        'downloaders/ln882h/protocols/ln-protocols.js',
        'downloaders/ln882h/configs/ln-flash-config.js',
        'downloaders/ln882h/core/xmodem-sender.js',
        'downloaders/ln882h/core/ram-loader.js',
        'downloaders/ln882h/ln882h-downloader-v2.js',
        'downloaders/shared/downloader-manager.js'
    ];
    
    requiredFiles.forEach(file => {
        checkFile(file);
        console.log(`   ✓ ${file}`);
    });
});

// 测试2: 基础依赖加载
test('基础依赖加载', () => {
    // 加载基础协议
    const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
    assertTrue(typeof baseProtocolExports === 'object', 'base-protocol.js应该导出一个对象');
    assertTrue(typeof baseProtocolExports.BaseProtocol === 'function', 'BaseProtocol应该是一个函数');
    
    // 加载基础配置
    const FlashConfigBase = require('./downloaders/shared/configs/flash-config-base.js');
    assertTrue(typeof FlashConfigBase === 'function', 'FlashConfigBase应该是一个函数');
    
    // 加载基础下载器
    const BaseDownloader = require('./downloaders/shared/base-downloader.js');
    assertTrue(typeof BaseDownloader === 'function', 'BaseDownloader应该是一个函数');
    
    console.log('   ✓ 基础依赖加载成功');
});

// 测试3: LN882H协议层加载
test('LN882H协议层加载', () => {
    // 先加载基础协议
    const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
    global.BaseProtocol = baseProtocolExports.BaseProtocol;
    
    // 加载LN882H协议
    const protocols = require('./downloaders/ln882h/protocols/ln-protocols.js');
    
    assertTrue(typeof protocols.BaseLNProtocol === 'function', 'BaseLNProtocol应该是一个函数');
    assertTrue(typeof protocols.LNProtocolFactory === 'object', 'LNProtocolFactory应该是一个对象');
    assertTrue(typeof protocols.VersionCheckProtocol === 'function', 'VersionCheckProtocol应该是一个函数');
    assertTrue(typeof protocols.XModemSendProtocol === 'function', 'XModemSendProtocol应该是一个函数');
    
    console.log('   ✓ LN882H协议层加载成功');
});

// 测试4: LN882H配置层加载
test('LN882H配置层加载', () => {
    // 先加载基础配置
    const FlashConfigBase = require('./downloaders/shared/configs/flash-config-base.js');
    global.FlashConfigBase = FlashConfigBase;
    
    // 加载LN882H配置
    const LNFlashConfig = require('./downloaders/ln882h/configs/ln-flash-config.js');
    
    assertTrue(typeof LNFlashConfig === 'function', 'LNFlashConfig应该是一个函数');
    
    console.log('   ✓ LN882H配置层加载成功');
});

// 测试5: 核心模块加载
test('核心模块加载', () => {
    // 先准备依赖
    const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
    global.BaseProtocol = baseProtocolExports.BaseProtocol;
    
    const FlashConfigBase = require('./downloaders/shared/configs/flash-config-base.js');
    global.FlashConfigBase = FlashConfigBase;
    
    const protocols = require('./downloaders/ln882h/protocols/ln-protocols.js');
    const LNFlashConfig = require('./downloaders/ln882h/configs/ln-flash-config.js');
    
    // 加载核心模块
    const XModemSender = require('./downloaders/ln882h/core/xmodem-sender.js');
    const RamLoader = require('./downloaders/ln882h/core/ram-loader.js');
    
    assertTrue(typeof XModemSender === 'function', 'XModemSender应该是一个函数');
    assertTrue(typeof RamLoader === 'function', 'RamLoader应该是一个函数');
    
    console.log('   ✓ 核心模块加载成功');
});

// 测试6: 主下载器加载
test('主下载器加载', () => {
    // 先加载所有依赖
    const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
    global.BaseProtocol = baseProtocolExports.BaseProtocol;
    
    const FlashConfigBase = require('./downloaders/shared/configs/flash-config-base.js');
    global.FlashConfigBase = FlashConfigBase;
    
    const BaseDownloader = require('./downloaders/shared/base-downloader.js');
    global.BaseDownloader = BaseDownloader;
    
    const protocols = require('./downloaders/ln882h/protocols/ln-protocols.js');
    const LNFlashConfig = require('./downloaders/ln882h/configs/ln-flash-config.js');
    const XModemSender = require('./downloaders/ln882h/core/xmodem-sender.js');
    const RamLoader = require('./downloaders/ln882h/core/ram-loader.js');
    
    // 设置全局变量
    global.LNProtocolFactory = protocols.LNProtocolFactory;
    global.LNFlashConfig = LNFlashConfig;
    global.XModemSender = XModemSender;
    global.RamLoader = RamLoader;
    
    // 加载主下载器
    const LN882HDownloaderV2 = require('./downloaders/ln882h/ln882h-downloader-v2.js');
    
    assertTrue(typeof LN882HDownloaderV2 === 'function', 'LN882HDownloaderV2应该是一个函数');
    
    console.log('   ✓ 主下载器加载成功');
});

// 测试7: 类实例化测试
test('类实例化测试', () => {
    // 设置所有依赖
    const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
    global.BaseProtocol = baseProtocolExports.BaseProtocol;
    
    const FlashConfigBase = require('./downloaders/shared/configs/flash-config-base.js');
    global.FlashConfigBase = FlashConfigBase;
    
    const BaseDownloader = require('./downloaders/shared/base-downloader.js');
    global.BaseDownloader = BaseDownloader;
    
    const protocols = require('./downloaders/ln882h/protocols/ln-protocols.js');
    const LNFlashConfig = require('./downloaders/ln882h/configs/ln-flash-config.js');
    const XModemSender = require('./downloaders/ln882h/core/xmodem-sender.js');
    const RamLoader = require('./downloaders/ln882h/core/ram-loader.js');
    
    global.LNProtocolFactory = protocols.LNProtocolFactory;
    global.LNFlashConfig = LNFlashConfig;
    global.XModemSender = XModemSender;
    global.RamLoader = RamLoader;
    
    const LN882HDownloaderV2 = require('./downloaders/ln882h/ln882h-downloader-v2.js');
    
    // 测试配置类实例化
    const config = new LNFlashConfig();
    assertNotNull(config, 'LNFlashConfig实例不应该为null');
    assertEqual(config.chipType, 'LN882H', 'chipType应该是LN882H');
    
    // 测试协议工厂
    const versionProtocol = protocols.LNProtocolFactory.create('VersionCheck');
    assertNotNull(versionProtocol, 'VersionCheck协议不应该为null');
    assertEqual(versionProtocol.name, 'VersionCheckProtocol', '协议名称应该正确');
    
    // 测试RAM加载器
    const ramLoader = new RamLoader(config);
    assertNotNull(ramLoader, 'RamLoader实例不应该为null');
    assertEqual(ramLoader.isLoaded, false, 'RAM加载器初始状态应该是未加载');
    
    // 测试模拟串口处理器
    const mockSerialHandler = {
        sendData: async (data) => {},
        readData: async (length, timeout) => new Buffer.alloc(length),
        resetBuffers: async () => {}
    };
    
    const xmodemSender = new XModemSender(mockSerialHandler, protocols.LNProtocolFactory, config);
    assertNotNull(xmodemSender, 'XModemSender实例不应该为null');
    
    // 测试主下载器（需要模拟串口）
    const mockSerialPort = {
        readable: { getReader: () => ({}) },
        writable: { getWriter: () => ({}) },
        close: async () => {},
        open: async () => {}
    };
    
    const debugCallback = (level, message, data) => {
        // 模拟调试回调
    };
    
    const downloader = new LN882HDownloaderV2(mockSerialPort, debugCallback);
    assertNotNull(downloader, 'LN882HDownloaderV2实例不应该为null');
    assertEqual(downloader.chipName, 'LN882H', 'chipName应该是LN882H');
    assertEqual(downloader.version, 'v2.0', 'version应该是v2.0');
    
    console.log('   ✓ 所有类实例化成功');
});

// 测试8: 配置功能测试
test('配置功能测试', () => {
    const FlashConfigBase = require('./downloaders/shared/configs/flash-config-base.js');
    global.FlashConfigBase = FlashConfigBase;
    
    const LNFlashConfig = require('./downloaders/ln882h/configs/ln-flash-config.js');
    
    const config = new LNFlashConfig();
    
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
    
    console.log('   ✓ 配置功能测试成功');
});

// 测试9: 协议功能测试
test('协议功能测试', () => {
    const baseProtocolExports = require('./downloaders/shared/protocols/base-protocol.js');
    global.BaseProtocol = baseProtocolExports.BaseProtocol;
    
    const protocols = require('./downloaders/ln882h/protocols/ln-protocols.js');
    
    const factory = protocols.LNProtocolFactory;
    
    // 测试协议工厂
    const supportedProtocols = factory.getSupportedProtocols();
    assertTrue(Array.isArray(supportedProtocols), '支持的协议列表应该是数组');
    assertTrue(supportedProtocols.includes('VersionCheck'), '应该支持VersionCheck协议');
    assertTrue(supportedProtocols.includes('XModemSend'), '应该支持XModemSend协议');
    
    // 测试版本检查协议
    const versionProtocol = factory.create('VersionCheck');
    const versionCmd = versionProtocol.cmd();
    assertTrue(versionCmd instanceof Uint8Array, '版本命令应该是Uint8Array');
    
    // 测试XModem协议
    const xmodemProtocol = factory.create('XModemSend');
    
    // 测试CRC计算
    const testData = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
    const crc = xmodemProtocol.calcCrc(testData);
    assertTrue(typeof crc === 'number', 'CRC应该是数字');
    assertTrue(crc >= 0 && crc <= 0xFFFF, 'CRC应该在有效范围内');
    
    // 测试数据包头创建
    const header = xmodemProtocol.makeSendHeader(128, 1);
    assertTrue(header instanceof Uint8Array, '数据包头应该是Uint8Array');
    assertEqual(header.length, 3, '数据包头长度应该是3');
    
    console.log('   ✓ 协议功能测试成功');
});

// 测试10: 下载器管理器测试
test('下载器管理器测试', () => {
    const DownloaderManager = require('./downloaders/shared/downloader-manager.js');
    
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
    
    console.log('   ✓ 下载器管理器测试成功');
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
    console.log('\n🎉 所有测试通过!');
    process.exit(0);
}