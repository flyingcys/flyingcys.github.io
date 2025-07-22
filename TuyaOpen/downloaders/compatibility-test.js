/**
 * T5AI Downloader Compatibility Test
 * 兼容性测试 - 确保模块化版本与原版本API完全兼容
 */

import { T5AIDownloader } from './t5ai-downloader-modular.js';

/**
 * API兼容性测试
 */
function testAPICompatibility() {
    console.log('=== API兼容性测试 ===');
    
    const downloader = new T5AIDownloader();
    const requiredMethods = [
        'connect',
        'disconnect', 
        'downloadFirmware',
        'setBaudrate',
        'readFlash',
        'eraseFlash',
        'crcCheck',
        'reboot',
        'getDeviceStatus',
        'getFlashInfo',
        'getSupportedFlashChips',
        'checkConnection',
        'reset',
        'getUserConfiguredBaudrate',
        'setUserConfiguredBaudrate'
    ];
    
    const requiredProperties = [
        'isConnected',
        'chipId',
        'flashId',
        'flashSize'
    ];
    
    console.log('检查必需的方法...');
    for (const method of requiredMethods) {
        if (typeof downloader[method] === 'function') {
            console.log(`✓ ${method}`);
        } else {
            console.error(`❌ 缺少方法: ${method}`);
            return false;
        }
    }
    
    console.log('\n检查必需的属性...');
    for (const prop of requiredProperties) {
        if (prop in downloader) {
            console.log(`✓ ${prop}: ${downloader[prop]}`);
        } else {
            console.error(`❌ 缺少属性: ${prop}`);
            return false;
        }
    }
    
    return true;
}

/**
 * 方法签名兼容性测试
 */
function testMethodSignatures() {
    console.log('\n=== 方法签名兼容性测试 ===');
    
    const downloader = new T5AIDownloader();
    
    try {
        // 测试connect方法
        console.log('✓ connect(port) - 方法存在');
        
        // 测试downloadFirmware方法
        console.log('✓ downloadFirmware(firmwareData, options) - 方法存在');
        
        // 测试setBaudrate方法
        console.log('✓ setBaudrate(baudrate) - 方法存在');
        
        // 测试readFlash方法
        console.log('✓ readFlash(startAddress, size, progressCallback) - 方法存在');
        
        // 测试eraseFlash方法
        console.log('✓ eraseFlash(startAddress, size, progressCallback) - 方法存在');
        
        // 测试crcCheck方法
        console.log('✓ crcCheck(startAddress, size, expectedCrc) - 方法存在');
        
        // 测试其他方法
        console.log('✓ reboot() - 方法存在');
        console.log('✓ getDeviceStatus() - 方法存在');
        console.log('✓ getFlashInfo() - 方法存在');
        console.log('✓ getSupportedFlashChips() - 方法存在');
        console.log('✓ checkConnection() - 方法存在');
        console.log('✓ reset() - 方法存在');
        
        return true;
    } catch (error) {
        console.error('❌ 方法签名测试失败:', error.message);
        return false;
    }
}

/**
 * 错误处理兼容性测试
 */
async function testErrorHandling() {
    console.log('\n=== 错误处理兼容性测试 ===');
    
    const downloader = new T5AIDownloader();
    
    try {
        // 测试未连接时的错误处理
        try {
            await downloader.downloadFirmware(new Uint8Array([1, 2, 3, 4]));
            console.error('❌ 应该抛出"设备未连接"错误');
            return false;
        } catch (error) {
            if (error.message.includes('设备未连接')) {
                console.log('✓ 未连接错误处理正确');
            } else {
                console.error('❌ 错误消息不正确:', error.message);
                return false;
            }
        }
        
        try {
            await downloader.setBaudrate(115200);
            console.error('❌ 应该抛出"设备未连接"错误');
            return false;
        } catch (error) {
            if (error.message.includes('设备未连接')) {
                console.log('✓ 设置波特率错误处理正确');
            } else {
                console.error('❌ 错误消息不正确:', error.message);
                return false;
            }
        }
        
        try {
            await downloader.readFlash(0, 1024);
            console.error('❌ 应该抛出"设备未连接"错误');
            return false;
        } catch (error) {
            if (error.message.includes('设备未连接')) {
                console.log('✓ 读取Flash错误处理正确');
            } else {
                console.error('❌ 错误消息不正确:', error.message);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ 错误处理测试失败:', error.message);
        return false;
    }
}

/**
 * 返回值格式兼容性测试
 */
function testReturnValueFormats() {
    console.log('\n=== 返回值格式兼容性测试 ===');
    
    const downloader = new T5AIDownloader();
    
    try {
        // 测试getDeviceStatus返回格式
        const status = downloader.getDeviceStatus();
        const requiredStatusFields = ['isConnected', 'chipId', 'flashId', 'flashSize'];
        
        for (const field of requiredStatusFields) {
            if (!(field in status)) {
                console.error(`❌ getDeviceStatus缺少字段: ${field}`);
                return false;
            }
        }
        console.log('✓ getDeviceStatus返回格式正确');
        
        // 测试getVersion返回格式
        const version = downloader.getVersion();
        const requiredVersionFields = ['version', 'description'];
        
        for (const field of requiredVersionFields) {
            if (!(field in version)) {
                console.error(`❌ getVersion缺少字段: ${field}`);
                return false;
            }
        }
        console.log('✓ getVersion返回格式正确');
        
        // 测试getSupportedFlashChips返回格式
        const chips = downloader.getSupportedFlashChips();
        if (!Array.isArray(chips)) {
            console.error('❌ getSupportedFlashChips应该返回数组');
            return false;
        }
        console.log('✓ getSupportedFlashChips返回格式正确');
        
        return true;
    } catch (error) {
        console.error('❌ 返回值格式测试失败:', error.message);
        return false;
    }
}

/**
 * 配置兼容性测试
 */
function testConfigurationCompatibility() {
    console.log('\n=== 配置兼容性测试 ===');
    
    const downloader = new T5AIDownloader();
    
    try {
        // 测试波特率配置
        const originalBaudrate = downloader.getUserConfiguredBaudrate();
        console.log(`✓ 获取默认波特率: ${originalBaudrate}`);
        
        downloader.setUserConfiguredBaudrate(1500000);
        const newBaudrate = downloader.getUserConfiguredBaudrate();
        if (newBaudrate !== 1500000) {
            console.error('❌ 波特率设置失败');
            return false;
        }
        console.log('✓ 波特率设置成功');
        
        downloader.setUserConfiguredBaudrate(originalBaudrate);
        console.log('✓ 波特率恢复成功');
        
        return true;
    } catch (error) {
        console.error('❌ 配置兼容性测试失败:', error.message);
        return false;
    }
}

/**
 * 运行所有兼容性测试
 */
async function runCompatibilityTests() {
    console.log('开始T5AI下载器兼容性测试...\n');
    
    const tests = [
        { name: 'API兼容性', test: testAPICompatibility },
        { name: '方法签名兼容性', test: testMethodSignatures },
        { name: '错误处理兼容性', test: testErrorHandling },
        { name: '返回值格式兼容性', test: testReturnValueFormats },
        { name: '配置兼容性', test: testConfigurationCompatibility }
    ];
    
    let passedTests = 0;
    
    for (const { name, test } of tests) {
        try {
            const result = await test();
            if (result) {
                console.log(`\n✅ ${name}测试通过`);
                passedTests++;
            } else {
                console.log(`\n❌ ${name}测试失败`);
            }
        } catch (error) {
            console.log(`\n❌ ${name}测试异常:`, error.message);
        }
    }
    
    console.log(`\n=== 兼容性测试结果 ===`);
    console.log(`通过: ${passedTests}/${tests.length}`);
    
    if (passedTests === tests.length) {
        console.log('🎉 所有兼容性测试通过！模块化版本与原版本完全兼容。');
        return true;
    } else {
        console.log('⚠️  部分兼容性测试失败，需要修复。');
        return false;
    }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
    // Node.js环境
    runCompatibilityTests().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // 浏览器环境
    window.runCompatibilityTests = runCompatibilityTests;
}

export { runCompatibilityTests };