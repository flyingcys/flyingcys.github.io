#!/usr/bin/env node

/**
 * T5AI下载器迁移验证脚本
 * 在Node.js环境中验证T5AI下载器的基本结构和语法
 */

const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
global.window = {
    serialTerminal: {
        flashBaudRateSelect: {
            value: '921600'
        }
    }
};

// 模拟module环境
global.module = undefined;

console.log('🚀 开始T5AI下载器迁移验证...\n');

// 1. 检查文件存在性
const baseDownloaderPath = './downloaders/shared/base-downloader.js';
const t5DownloaderPath = './downloaders/t5/t5ai/t5ai-downloader.js';

console.log('📁 检查文件存在性:');
if (fs.existsSync(baseDownloaderPath)) {
    console.log('✅ BaseDownloader文件存在');
} else {
    console.log('❌ BaseDownloader文件不存在');
    process.exit(1);
}

if (fs.existsSync(t5DownloaderPath)) {
    console.log('✅ T5AI下载器文件存在');
} else {
    console.log('❌ T5AI下载器文件不存在');
    process.exit(1);
}

// 2. 加载BaseDownloader
console.log('\n📦 加载BaseDownloader:');
try {
    const baseCode = fs.readFileSync(baseDownloaderPath, 'utf8');
    eval(baseCode);
    
    if (typeof BaseDownloader !== 'undefined') {
        console.log('✅ BaseDownloader类定义成功');
        
        // 测试实例化
        const baseInstance = new BaseDownloader(null, console.log);
        console.log('✅ BaseDownloader实例化成功');
        console.log(`   芯片名称: ${baseInstance.chipName}`);
        
        // 检查关键方法
        const methods = ['isPortDisconnectionError', 'clearBuffer', 'setProgressCallback'];
        methods.forEach(method => {
            if (typeof baseInstance[method] === 'function') {
                console.log(`✅ 方法 ${method} 存在`);
            } else {
                console.log(`❌ 方法 ${method} 不存在`);
            }
        });
    } else {
        console.log('❌ BaseDownloader类未定义');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ BaseDownloader加载失败:', error.message);
    process.exit(1);
}

// 3. 加载T5DownloaderV2
console.log('\n🔧 加载T5DownloaderV2:');
try {
    const t5Code = fs.readFileSync(t5DownloaderPath, 'utf8');
    eval(t5Code);
    
    if (typeof T5DownloaderV2 !== 'undefined') {
        console.log('✅ T5DownloaderV2类定义成功');
        
        // 测试实例化
        const t5Instance = new T5DownloaderV2(null, console.log);
        console.log('✅ T5DownloaderV2实例化成功');
        console.log(`   芯片名称: ${t5Instance.chipName}`);
        
        // 检查继承关系
        if (t5Instance instanceof BaseDownloader) {
            console.log('✅ 正确继承BaseDownloader');
        } else {
            console.log('❌ 继承关系错误');
        }
        
        // 检查T5特有方法
        const t5Methods = ['connect', 'downloadFirmware', 'disconnect', 'getChipId', 'getFlashId'];
        t5Methods.forEach(method => {
            if (typeof t5Instance[method] === 'function') {
                console.log(`✅ T5方法 ${method} 存在`);
            } else {
                console.log(`❌ T5方法 ${method} 不存在`);
            }
        });
        
        // 测试继承的方法
        console.log('\n🔬 测试继承方法:');
        try {
            const testError = new Error('test error');
            const result = t5Instance.isPortDisconnectionError(testError);
            console.log('✅ isPortDisconnectionError方法调用成功:', result);
        } catch (error) {
            console.log('❌ isPortDisconnectionError方法调用失败:', error.message);
        }
        
        try {
            t5Instance.setProgressCallback(() => {});
            console.log('✅ setProgressCallback方法调用成功');
        } catch (error) {
            console.log('❌ setProgressCallback方法调用失败:', error.message);
        }
        
        // 检查Flash数据库
        if (t5Instance.flashDatabase && typeof t5Instance.flashDatabase === 'object') {
            const chipCount = Object.keys(t5Instance.flashDatabase).length;
            console.log(`✅ Flash芯片数据库可用，包含 ${chipCount} 个芯片`);
        } else {
            console.log('❌ Flash芯片数据库不可用');
        }
        
    } else {
        console.log('❌ T5DownloaderV2类未定义');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ T5DownloaderV2加载失败:', error.message);
    console.log('错误详情:', error.stack);
    process.exit(1);
}

// 4. 检查DownloaderManager配置
console.log('\n⚙️ 检查DownloaderManager配置:');
try {
    const managerPath = './downloaders/shared/downloader-manager.js';
    if (fs.existsSync(managerPath)) {
        const managerCode = fs.readFileSync(managerPath, 'utf8');
        eval(managerCode);
        
        if (typeof DownloaderManager !== 'undefined') {
            const manager = new DownloaderManager();
            const t5aiConfig = manager.supportedChips.T5AI;
            
            if (t5aiConfig) {
                console.log('✅ DownloaderManager中找到T5AI配置');
                console.log(`   下载器类: ${t5aiConfig.downloaderClass}`);
                console.log(`   脚本路径: ${t5aiConfig.scriptPath}`);
                console.log(`   依赖数量: ${t5aiConfig.dependencies.length}`);
                
                if (t5aiConfig.downloaderClass === 'T5DownloaderV2') {
                    console.log('✅ 下载器类配置正确');
                } else {
                    console.log('❌ 下载器类配置错误');
                }
            } else {
                console.log('❌ DownloaderManager中未找到T5AI配置');
            }
        } else {
            console.log('❌ DownloaderManager类未定义');
        }
    } else {
        console.log('❌ DownloaderManager文件不存在');
    }
} catch (error) {
    console.log('❌ DownloaderManager检查失败:', error.message);
}

console.log('\n🎉 T5AI下载器迁移验证完成！');
console.log('\n💡 建议后续步骤:');
console.log('   1. 使用浏览器访问 http://localhost:8000/test-fixed-t5.html');
console.log('   2. 检查浏览器控制台是否有JavaScript错误');
console.log('   3. 验证T5AI下载器在实际项目中的集成效果');