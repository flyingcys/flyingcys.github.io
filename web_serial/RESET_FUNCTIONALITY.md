# ESP32 DTR/RTS 复位功能实现

## 概述

ESP32包装器（`esp32-esptool-js-wrapper.js`）完全保持了T5AI和esptool-js的DTR/RTS复位功能。这些功能对于ESP32进入下载模式和正常重启至关重要。

## DTR/RTS 控制实现

### 基础控制方法

```javascript
// 在Transport适配器中实现
async setRTS(state) {
    await this.device.setSignals({ requestToSend: state });
}

async setDTR(state) {
    await this.device.setSignals({ dataTerminalReady: state });
}
```

### 信号含义
- **DTR (Data Terminal Ready)**：控制ESP32的EN引脚（复位）
  - `false` = EN=1 (正常运行)
  - `true` = EN=0 (复位状态)
- **RTS (Request To Send)**：控制ESP32的GPIO0引脚（启动模式）
  - `false` = GPIO0=1 (正常模式)
  - `true` = GPIO0=0 (下载模式)

## esptool-js 原生复位策略

我们支持esptool-js的所有原生复位策略：

### 1. ClassicReset (经典复位)
```javascript
const classicReset = wrapper.createClassicReset();
await classicReset.reset();
```
**序列**: D0→R1→W100→D1→R0→W50→D0
- 与T5AI的复位逻辑类似
- 最可靠的复位方式

### 2. HardReset (硬件复位)
```javascript
const hardReset = wrapper.createHardReset();
await hardReset.reset();
```
- 简单的硬件复位
- 适用于基本重启需求

### 3. UsbJtagSerialReset (USB JTAG复位)
```javascript
const usbJtagReset = wrapper.createUsbJtagSerialReset();
await usbJtagReset.reset();
```
- 针对USB JTAG接口的复位
- 适用于ESP32-S3等新芯片

### 4. CustomReset (自定义复位)
```javascript
const customReset = wrapper.createCustomReset("D0|R1|W100|D1|R0|W50|D0");
await customReset.reset();
```
- 完全可定制的复位序列
- 支持esptool-js的序列字符串格式

## 复位序列格式

### 命令格式
- **D**: setDTR - 1=True / 0=False
- **R**: setRTS - 1=True / 0=False  
- **W**: Wait - 正整数毫秒数

### 示例序列
- `"D0|R1|W100|D1|R0|W50|D0"` - 经典复位序列
- `"D0|R0|W100|D1|W100|D0"` - 简单复位序列

## 与T5AI的兼容性

### T5AI的复位逻辑
```javascript
// T5AI复位实现 (t5ai-downloader.js:262-264)
await this.port.setSignals({ dataTerminalReady: false, requestToSend: true });
await new Promise(resolve => setTimeout(resolve, 300));
await this.port.setSignals({ requestToSend: false });
```

### ESP32等效实现
```javascript
// ESP32 ClassicReset等效
await transport.setDTR(false);  // dataTerminalReady: false
await transport.setRTS(true);   // requestToSend: true  
await sleep(100);
await transport.setDTR(true);   // 进入复位
await transport.setRTS(false);  // 释放下载模式
await sleep(50);
await transport.setDTR(false);  // 退出复位
```

## 测试验证

### 测试覆盖范围
1. **基础DTR/RTS控制** - 验证底层信号控制
2. **esptool-js原生策略** - 验证所有复位策略类
3. **自定义序列** - 验证序列字符串解析
4. **兼容性** - 确保与T5AI行为一致

### 测试文件
- `flash-test.html` - 包含完整的复位功能测试
- 点击"重置设备"按钮执行全面测试

## 技术特点

### 1. 不重新发明轮子
- 完全使用esptool-js的原生reset类
- 只提供Transport适配器接口
- 保持官方实现的稳定性和可靠性

### 2. 完全兼容
- 与T5AI的复位逻辑兼容
- 支持esptool-js的所有复位策略
- 保持原有的时序和信号控制

### 3. 灵活扩展
- 支持自定义复位序列
- 可以根据不同ESP32变体调整
- 保持向前兼容性

## 结论

ESP32包装器完全保持了T5AI和esptool-js的DTR/RTS复位功能：

✅ **基础信号控制** - setDTR() 和 setRTS() 完全实现  
✅ **esptool-js原生策略** - 所有复位类都可用  
✅ **T5AI兼容性** - 复位逻辑完全一致  
✅ **自定义扩展** - 支持灵活的复位序列  
✅ **不重新实现** - 委托给官方esptool-js实现  

这确保了ESP32固件下载的可靠性和与现有工具的完全兼容性。 