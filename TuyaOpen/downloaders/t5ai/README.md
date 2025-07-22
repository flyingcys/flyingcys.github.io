# T5AI模块化下载器

本目录包含了将原始 `t5ai-downloader.js` 完全模块化后的实现，保持了与原始版本100%的功能和逻辑一致性。

## 📁 目录结构

```
dloaders/t5ai/
├── configs/                    # 配置模块
│   ├── t5-flash-config.js      # Flash配置管理
│   └── t5-flash-database.js    # Flash芯片数据库
├── core/                       # 核心模块
│   └── t5-serial-manager.js    # 串口通信管理
├── protocols/                  # 协议模块
│   └── t5-protocols.js         # 所有T5通信协议
├── utils/                      # 工具模块
│   ├── t5-crc-utils.js         # CRC校验工具
│   └── t5-debug-utils.js       # 调试工具
├── t5-downloader-modular.js    # 主控制器
├── index.js                    # 模块加载器和工厂类
├── example-usage.js            # 使用示例
└── README.md                   # 本文件
```

## 🚀 快速开始

### 方式1: 兼容性包装器（推荐）

这种方式提供与原始 `T5Downloader` 完全相同的接口，无需修改现有代码：

```javascript
// Node.js 环境
const { T5Downloader } = require('./downloaders/t5ai/index.js');

// 浏览器环境（确保已加载所有模块文件）
// const T5Downloader = window.T5Downloader;

// 创建下载器实例（与原始版本完全相同）
const downloader = new T5Downloader(serialPort, debugCallback);

// 设置回调
downloader.setProgressCallback(progressCallback);
downloader.setDebugMode(true);

// 使用下载器
await downloader.connect();
await downloader.downloadFirmware(firmwareData, 0x08000000);
```

### 方式2: 工厂类（更灵活）

```javascript
const { T5DownloaderFactory } = require('./downloaders/t5ai/index.js');

// 检查Flash支持
const isSupported = await T5DownloaderFactory.isFlashSupported(0x00134051);

// 获取Flash配置
const flashConfig = await T5DownloaderFactory.getFlashConfig(0x00134051);

// 创建下载器
const downloader = await T5DownloaderFactory.createDownloader(serialPort, debugCallback);
```

## 📋 模块详细说明

### 核心模块

#### T5SerialManager (core/t5-serial-manager.js)
- 串口通信管理
- 数据发送和接收
- 错误处理和重试机制
- 串口信号控制

#### T5DownloaderModular (t5-downloader-modular.js)
- 主控制器，协调所有模块
- 实现完整的下载流程
- 与原始 `t5ai-downloader.js` 逻辑完全一致

### 配置模块

#### T5FlashConfig (configs/t5-flash-config.js)
- Flash配置管理
- 保护/解保护配置
- 扩展协议支持判断

#### T5FlashDatabase (configs/t5-flash-database.js)
- Flash芯片数据库
- 支持的Flash芯片列表
- Flash ID查询和配置获取

### 协议模块

#### T5Protocols (protocols/t5-protocols.js)
包含所有T5通信协议：
- `LinkCheckProtocol` - 链路检查
- `GetChipIdProtocol` - 获取芯片ID
- `GetFlashMidProtocol` - 获取Flash ID
- `SetBaudrateProtocol` - 设置波特率
- `FlashReadSRProtocol` - 读取Flash状态寄存器
- `FlashWriteSRProtocol` - 写入Flash状态寄存器
- `FlashErase4kProtocol` / `FlashErase4kExtProtocol` - 4K擦除
- `FlashErase64kProtocol` / `FlashErase64kExtProtocol` - 64K擦除
- `FlashRead4kProtocol` / `FlashRead4kExtProtocol` - 4K读取
- `FlashWrite256Protocol` / `FlashWrite256ExtProtocol` - 256字节写入

### 工具模块

#### T5CrcUtils (utils/t5-crc-utils.js)
- CRC校验计算
- 数据完整性验证

#### T5DebugUtils (utils/t5-debug-utils.js)
- 调试日志输出
- 错误检测和处理
- 数据格式化工具

## 🔧 API 参考

### T5Downloader (兼容性包装器)

与原始 `t5ai-downloader.js` 提供完全相同的API：

```javascript
// 构造函数
new T5Downloader(serialPort, debugCallback)

// 主要方法
await downloader.connect()                    // 连接设备
await downloader.downloadFirmware(data, addr) // 下载固件
await downloader.readFlash(addr, size)        // 读取Flash
downloader.setProgressCallback(callback)      // 设置进度回调
downloader.setDebugMode(enabled)              // 设置调试模式
downloader.stop()                             // 停止操作

// 状态查询
downloader.isConnected()                      // 检查连接状态
downloader.getDeviceStatus()                  // 获取设备状态
downloader.getSupportedFlashChips()           // 获取支持的Flash芯片

// 属性
downloader.chipName                           // 芯片名称
downloader.chipId                             // 芯片ID
downloader.flashId                            // Flash ID
```

### T5DownloaderFactory (工厂类)

```javascript
// 静态方法
T5DownloaderFactory.createDownloader(serialPort, debugCallback)
T5DownloaderFactory.getSupportedFlashChips()
T5DownloaderFactory.isFlashSupported(flashId)
T5DownloaderFactory.getFlashConfig(flashId)
T5DownloaderFactory.getVersion()
```

## 🔄 与原始版本的兼容性

### 完全兼容的功能
- ✅ 所有API接口保持一致
- ✅ 所有协议实现逻辑一致
- ✅ 错误处理机制一致
- ✅ 进度回调格式一致
- ✅ 调试日志格式一致
- ✅ Flash数据库完全一致
- ✅ 支持的Flash芯片列表一致

### 改进的特性
- 🚀 模块化架构，便于维护和扩展
- 🚀 更好的代码组织和复用
- 🚀 支持按需加载模块
- 🚀 更灵活的配置管理
- 🚀 更好的错误隔离

## 🌐 环境支持

### Node.js 环境
- 支持 CommonJS 模块系统
- 自动加载依赖模块
- 完整的错误处理

### 浏览器环境
- 支持通过 script 标签加载
- 兼容现代浏览器
- 支持 ES6+ 特性

## 📝 使用注意事项

1. **模块加载顺序**：在浏览器环境中，请确保按正确顺序加载模块文件
2. **异步初始化**：兼容性包装器使用异步初始化，首次调用方法时会自动完成初始化
3. **错误处理**：所有异步操作都应该使用 try-catch 包装
4. **资源清理**：使用完毕后建议调用 `stop()` 方法清理资源

## 🐛 故障排除

### 常见问题

1. **模块加载失败**
   - 检查文件路径是否正确
   - 确保所有依赖文件都存在
   - 检查模块导出格式

2. **连接失败**
   - 检查串口是否正确打开
   - 确认设备连接状态
   - 检查波特率设置

3. **下载失败**
   - 检查固件数据格式
   - 确认Flash芯片支持
   - 检查地址范围

### 调试技巧

1. 启用调试模式：`downloader.setDebugMode(true)`
2. 查看详细日志输出
3. 检查设备状态：`downloader.getDeviceStatus()`
4. 使用进度回调监控操作进度

## 📄 许可证

本模块化实现遵循与原始 `t5ai-downloader.js` 相同的许可证。

## 🤝 贡献

欢迎提交问题报告和改进建议。在修改代码时，请确保：
- 保持与原始版本的兼容性
- 添加适当的测试
- 更新相关文档

---

**注意**：本模块化实现完全基于原始 `t5ai-downloader.js` 的逻辑，确保了功能和行为的完全一致性。如果您在使用过程中发现任何不一致的地方，请及时反馈。