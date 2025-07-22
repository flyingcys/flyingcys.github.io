/**
 * T5AI模块化下载器使用示例
 * 展示如何使用新的模块化架构替代原始的 t5ai-downloader.js
 */

// ===== 方式1: 使用兼容性包装器（推荐，与原始代码完全兼容） =====

// Node.js 环境
if (typeof require !== 'undefined') {
    const { T5Downloader } = require('./index.js');
    
    async function downloadWithCompatWrapper() {
        console.log('=== 使用兼容性包装器 ===');
        
        // 创建下载器实例（与原始 T5Downloader 完全相同的接口）
        const downloader = new T5Downloader(serialPort, debugCallback);
        
        // 设置进度回调
        downloader.setProgressCallback((progress) => {
            console.log(`进度: ${(progress.progress * 100).toFixed(1)}% - ${progress.message}`);
        });
        
        // 设置调试模式
        downloader.setDebugMode(true);
        
        try {
            // 连接设备
            await downloader.connect();
            console.log('设备连接成功');
            
            // 下载固件
            const firmwareData = new Uint8Array(1024).fill(0xAA); // 示例固件数据
            await downloader.downloadFirmware(firmwareData, 0x08000000);
            console.log('固件下载完成');
            
            // 读取Flash
            const readData = await downloader.readFlash(0x08000000, 1024);
            console.log('Flash读取完成:', readData.length, '字节');
            
        } catch (error) {
            console.error('操作失败:', error.message);
        }
    }
}

// 浏览器环境
if (typeof window !== 'undefined') {
    async function downloadWithCompatWrapperBrowser() {
        console.log('=== 浏览器环境使用兼容性包装器 ===');
        
        // 确保所有模块已加载（通过 script 标签）
        if (typeof window.T5Downloader === 'undefined') {
            console.error('请确保已加载所有必要的模块文件');
            return;
        }
        
        // 创建下载器实例
        const downloader = new window.T5Downloader(serialPort, debugCallback);
        
        // 其余代码与 Node.js 环境相同...
    }
}

// ===== 方式2: 使用工厂类（更灵活的控制） =====

if (typeof require !== 'undefined') {
    const { T5DownloaderFactory } = require('./index.js');
    
    async function downloadWithFactory() {
        console.log('=== 使用工厂类 ===');
        
        try {
            // 检查Flash支持
            const flashId = 0x00134051; // 示例Flash ID
            const isSupported = await T5DownloaderFactory.isFlashSupported(flashId);
            console.log(`Flash ID 0x${flashId.toString(16)} 支持:`, isSupported);
            
            // 获取Flash配置
            const flashConfig = await T5DownloaderFactory.getFlashConfig(flashId);
            console.log('Flash配置:', flashConfig);
            
            // 获取所有支持的Flash芯片
            const supportedChips = await T5DownloaderFactory.getSupportedFlashChips();
            console.log('支持的Flash芯片数量:', supportedChips.length);
            
            // 创建下载器实例
            const downloader = await T5DownloaderFactory.createDownloader(serialPort, debugCallback);
            
            // 使用下载器...
            await downloader.connect();
            console.log('设备连接成功');
            
        } catch (error) {
            console.error('操作失败:', error.message);
        }
    }
}

// ===== 方式3: 直接使用模块化下载器（高级用法） =====

if (typeof require !== 'undefined') {
    async function downloadWithModular() {
        console.log('=== 直接使用模块化下载器 ===');
        
        // 手动加载模块
        const { T5ModuleLoader } = require('./index.js');
        await T5ModuleLoader.loadModules();
        
        // 获取模块化下载器类
        const T5DownloaderModular = T5ModuleLoader.getModule('T5DownloaderModular');
        
        // 创建实例
        const downloader = new T5DownloaderModular(serialPort, debugCallback);
        
        // 使用下载器...
        await downloader.connect();
        console.log('设备连接成功');
    }
}

// ===== 调试回调函数示例 =====

function debugCallback(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
        console.log(logMessage, data);
    } else {
        console.log(logMessage);
    }
    
    // 可以根据需要将日志保存到文件或发送到服务器
}

// ===== 进度回调函数示例 =====

function progressCallback(progress) {
    const percentage = (progress.progress * 100).toFixed(1);
    const phase = progress.phase || 'unknown';
    const message = progress.message || '';
    
    console.log(`[${phase.toUpperCase()}] ${percentage}% - ${message}`);
    
    // 在浏览器中可以更新进度条
    if (typeof document !== 'undefined') {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${percentage}%`;
        }
        
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = message;
        }
    }
}

// ===== 错误处理示例 =====

function handleDownloadError(error) {
    console.error('下载过程中发生错误:', error);
    
    // 根据错误类型进行不同的处理
    if (error.message.includes('串口断开')) {
        console.log('检测到串口断开，请检查设备连接');
    } else if (error.message.includes('Flash')) {
        console.log('Flash操作失败，请检查设备状态');
    } else if (error.message.includes('超时')) {
        console.log('操作超时，请重试');
    } else {
        console.log('未知错误，请查看详细日志');
    }
}

// ===== 完整的使用示例 =====

async function completeExample() {
    console.log('=== T5AI模块化下载器完整示例 ===');
    
    // 模拟串口对象（实际使用中应该是真实的串口实例）
    const mockSerialPort = {
        readable: { getReader: () => ({}) },
        writable: { getWriter: () => ({}) },
        close: async () => {},
        open: async () => {},
        setSignals: async () => {}
    };
    
    try {
        // 使用兼容性包装器（推荐方式）
        const downloader = new (typeof require !== 'undefined' ? 
            require('./index.js').T5Downloader : 
            window.T5Downloader)(mockSerialPort, debugCallback);
        
        // 设置回调
        downloader.setProgressCallback(progressCallback);
        downloader.setDebugMode(true);
        
        // 连接设备
        console.log('正在连接设备...');
        await downloader.connect();
        
        // 获取设备状态
        const deviceStatus = downloader.getDeviceStatus();
        console.log('设备状态:', deviceStatus);
        
        // 下载固件
        const firmwareData = new Uint8Array(4096).fill(0xAA);
        console.log('正在下载固件...');
        await downloader.downloadFirmware(firmwareData, 0x08000000);
        
        // 验证下载
        console.log('正在验证下载...');
        const readData = await downloader.readFlash(0x08000000, firmwareData.length);
        
        // 比较数据
        let verified = true;
        for (let i = 0; i < firmwareData.length; i++) {
            if (readData[i] !== firmwareData[i]) {
                verified = false;
                break;
            }
        }
        
        console.log('下载验证:', verified ? '成功' : '失败');
        
    } catch (error) {
        handleDownloadError(error);
    }
}

// ===== 模块导出 =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        downloadWithCompatWrapper,
        downloadWithFactory,
        downloadWithModular,
        debugCallback,
        progressCallback,
        handleDownloadError,
        completeExample
    };
}

// ===== 自动运行示例（如果直接执行此文件） =====

if (typeof module !== 'undefined' && require.main === module) {
    console.log('运行T5AI模块化下载器示例...');
    // completeExample().catch(console.error);
    console.log('示例代码已加载，请根据需要调用相应的函数');
}

// ===== 浏览器环境自动初始化 =====

if (typeof window !== 'undefined') {
    window.T5AIExamples = {
        downloadWithCompatWrapperBrowser,
        debugCallback,
        progressCallback,
        handleDownloadError,
        completeExample
    };
    
    console.log('T5AI模块化下载器示例已加载到 window.T5AIExamples');
}