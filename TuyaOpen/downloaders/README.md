# T5AI Downloader - 模块化版本

## 概述

这是T5AI下载器的模块化重构版本，将原来的单一大文件（2371行）拆分为多个职责单一、低耦合的模块。新版本保持与原版本完全相同的API和功能，同时提供了更好的代码组织、可维护性和可扩展性。

## 目录结构

```
downloaders/
├── core/                           # 核心功能模块
│   ├── t5-serial-handler.js        # 串口通信处理器
│   ├── t5-connection-manager.js    # 连接管理器
│   └── t5-flash-operations.js      # Flash操作核心
├── protocols/                      # 协议定义模块
│   └── t5-protocols.js            # T5通信协议定义
├── configs/                        # 配置模块
│   └── t5-flash-config.js         # Flash配置和状态寄存器操作
├── utils/                          # 工具模块
│   └── t5-utils.js                # 通用工具函数
├── t5ai-downloader-modular.js      # 主下载器模块（新版本入口）
├── test-modular.js                 # 模块化测试
├── compatibility-test.js           # 兼容性测试
└── README.md                       # 本文档
```

## 模块说明

### 核心模块 (core/)

#### T5SerialHandler
- **职责**: 串口通信底层处理
- **功能**: 串口初始化、数据发送接收、波特率设置、信号控制
- **特点**: 增强的错误处理和重试机制

#### T5ConnectionManager
- **职责**: 设备连接和握手管理
- **功能**: 设备连接、总线控制、芯片ID获取、链路检查
- **特点**: 智能重试和连接诊断

#### T5FlashOperations
- **职责**: Flash操作核心功能
- **功能**: Flash擦除、写入、读取、校验、保护
- **特点**: 策略模式管理不同操作，支持进度回调

### 协议模块 (protocols/)

#### T5Protocols
- **职责**: T5通信协议定义
- **功能**: 21个协议类的完整实现
- **特点**: 基于Python tyutool的协议实现，工厂模式管理

### 配置模块 (configs/)

#### T5FlashConfig
- **职责**: Flash配置管理
- **功能**: 52种Flash型号配置、状态寄存器操作
- **特点**: 完整的Flash保护配置支持

### 工具模块 (utils/)

#### T5Utils
- **职责**: 通用工具函数
- **功能**: CRC计算、数据处理、地址工具、错误处理、重试工具
- **特点**: 高度复用的工具函数集合

## 使用方法

### 基本使用

```javascript
import { T5AIDownloader } from './downloaders/t5ai-downloader-modular.js';

// 创建下载器实例
const downloader = new T5AIDownloader();

// 连接设备
try {
    const result = await downloader.connect(port);
    console.log('连接成功:', result);
} catch (error) {
    console.error('连接失败:', error.message);
}

// 下载固件
try {
    const result = await downloader.downloadFirmware(firmwareData, {
        startAddress: 0x0,
        baudrate: 2000000,
        progressCallback: (progress) => {
            console.log(`进度: ${progress.progress.toFixed(1)}%`);
        }
    });
    console.log('下载成功:', result);
} catch (error) {
    console.error('下载失败:', error.message);
}
```

### 高级使用

```javascript
// 单独使用各个模块
import { T5SerialHandler } from './downloaders/core/t5-serial-handler.js';
import { T5FlashOperations } from './downloaders/core/t5-flash-operations.js';
import { T5ProtocolFactory } from './downloaders/protocols/t5-protocols.js';

// 创建协议实例
const linkCheckProtocol = T5ProtocolFactory.createProtocol('linkCheck');
const cmd = linkCheckProtocol.cmd();

// 使用工具函数
import { CRC32Calculator, DataProcessor } from './downloaders/utils/t5-utils.js';

const crcCalc = new CRC32Calculator();
const crc = crcCalc.calculateCRC(data);
const formattedSize = DataProcessor.formatBytes(1024 * 1024);
```

## API兼容性

新的模块化版本与原版本保持100%的API兼容性：

- ✅ 所有公共方法签名保持不变
- ✅ 所有返回值格式保持不变
- ✅ 所有错误处理行为保持不变
- ✅ 所有配置选项保持不变

## 测试

### 运行模块化测试

```bash
node downloaders/test-modular.js
```

### 运行兼容性测试

```bash
node downloaders/compatibility-test.js
```

## 优势

### 代码组织
- **模块化**: 将2371行代码拆分为6个模块，每个模块职责单一
- **低耦合**: 模块间依赖关系清晰，易于理解和维护
- **高内聚**: 相关功能集中在同一模块内

### 可维护性
- **易于调试**: 问题定位更精确，可以快速找到相关模块
- **易于测试**: 每个模块可以独立测试
- **易于修改**: 修改某个功能只需要关注对应模块

### 可扩展性
- **新协议**: 在protocols模块中添加新协议类
- **新Flash**: 在configs模块中添加新Flash配置
- **新功能**: 在对应模块中添加新方法

### 性能
- **按需加载**: 可以只加载需要的模块
- **代码分割**: 支持现代打包工具的代码分割
- **缓存优化**: 模块可以独立缓存

## 迁移指南

### 从原版本迁移

1. **替换导入**:
   ```javascript
   // 原版本
   import T5aiDownloader from './t5ai-downloader.js';
   
   // 新版本
   import { T5AIDownloader } from './downloaders/t5ai-downloader-modular.js';
   ```

2. **使用方式完全相同**:
   ```javascript
   // 创建实例和使用方法完全不变
   const downloader = new T5AIDownloader();
   await downloader.connect(port);
   await downloader.downloadFirmware(data);
   ```

3. **向后兼容**:
   ```javascript
   // 仍然支持原类名（会有弃用警告）
   import { T5aiDownloader } from './downloaders/t5ai-downloader-modular.js';
   ```

## 开发指南

### 添加新协议

1. 在`protocols/t5-protocols.js`中添加新协议类
2. 在`T5ProtocolFactory`中注册新协议
3. 在相关操作模块中使用新协议

### 添加新Flash支持

1. 在`configs/t5-flash-config.js`的`initFlashConfigs`方法中添加配置
2. 确保包含所有必需字段：name, size, protect_mask, protect_level

### 添加新工具函数

1. 在`utils/t5-utils.js`中添加新的工具类或函数
2. 确保函数是纯函数，无副作用
3. 添加适当的错误处理

## 版本信息

- **版本**: 2.0.0-modular
- **基于**: 原版本t5ai-downloader.js (2371行)
- **兼容性**: 100%向后兼容
- **模块数**: 6个主要模块
- **代码行数**: 约2500行（包含注释和文档）

## 许可证

与原版本保持相同的许可证。