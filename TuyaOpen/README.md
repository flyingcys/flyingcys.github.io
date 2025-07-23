# TuyaOpen Tools


## TuyaOpen-WebSerial
**One-stop Developer Toolkit Based on Chrome Web APIs**

A powerful modern web toolkit that currently supports serial debugging, firmware flashing, and TuyaOpen authorization. No software installation required - complete all operations directly in your browser. More development tools will be added in future updates.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](license.md)
[![Chrome](https://img.shields.io/badge/Chrome-89%2B-green.svg)](https://www.google.com/chrome/)
[![Web Serial API](https://img.shields.io/badge/Web%20Serial%20API-supported-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)

## Key Features

### Current Tools

### Serial Debugging
- **Real-time Serial Communication**: Support for multiple baud rates and serial parameter configurations
- **Smart Data Display**: Automatic timestamps, HEX/ASCII mode switching
- **Error Log Analysis**: Automatic detection and analysis of common error patterns
- **Quick Commands**: Customizable quick send buttons
- **Data Export**: Support for log saving and export functionality
- **Fullscreen Mode**: Focused debugging experience

### Firmware Flashing
- **Multi-chip Support**: 
  - **T5AI/T3**: TuyaOpen series chips
  - **ESP32 Series**: Based on esptool-js, supports automatic detection of all ESP32 chips
- **Smart Flashing**: Automatic chip detection and parameter configuration
- **Progress Monitoring**: Real-time display of flashing progress and speed
- **Debug Mode**: Detailed flashing logs and error diagnostics
- **Resume Support**: Support for recovery after flashing interruption

### TuyaOpen Authorization
- **Authorization Code Writing**: Support for UUID and AUTH_KEY writing for TuyaOpen projects
- **Device Authorization**: One-click device authorization configuration
- **Security Verification**: Ensure correctness and security of authorization information

### Internationalization Support
- **Multi-language Interface**: Support for 10 languages including Chinese, English, Japanese, Korean
- **Dynamic Switching**: Switch languages without page refresh
- **Localization Adaptation**: Complete UI text localization

## Technical Architecture

### Core Technology Stack
- **Frontend Framework**: Native JavaScript + Modular Architecture
- **Serial Communication**: Chrome Web Serial API
- **Firmware Flashing**: Integrated esptool-js and custom downloaders
- **UI Framework**: Responsive CSS + Modern Design
- **Internationalization**: Custom i18n System

### Modular Architecture
```
modules/
├── config/           # 配置模块
│   └── Constants.js     # 全局配置常量
├── core/             # 核心模块
│   ├── EventBus.js      # 事件总线（模块间通信）
│   └── SerialTerminal.js # 主控制器
├── utils/            # 工具模块
│   ├── Logger.js        # 统一日志系统
│   └── FileUtils.js     # 文件操作工具
├── serial/           # 串口模块
│   ├── SerialManager.js  # 串口连接管理
│   └── DataProcessor.js # 数据处理与显示
├── firmware/         # 固件模块
│   ├── FlashManager.js   # 固件烧录管理
│   └── ProgressTracker.js # 进度跟踪
├── ui/               # UI模块
│   ├── UIManager.js      # DOM管理与基础交互
│   ├── ModalManager.js   # 模态框管理
│   ├── TabManager.js     # 标签页管理
│   └── FullscreenManager.js # 全屏管理
└── i18n/             # 国际化模块
    ├── LanguageManager.js # 语言管理
    └── TextUpdater.js    # 文本更新
```

### Downloader Architecture
```
downloaders/
├── base-downloader.js      # 基础下载器抽象类
├── downloader-manager.js   # 下载器管理器
├── t5ai/
│   └── t5ai-downloader.js  # T5AI系列下载器
├── esp32/
    └── esp32-esptool-js-wrapper.js # ESP32下载器包装
```

## Quick Start

### System Requirements
- **Browser**: Chrome 89+ / Edge 89+ / Other Chromium-based browsers
- **Operating System**: Windows / macOS / Linux
- **Hardware**: Devices with USB serial port support

### Usage

1. **Open Tool**
   ```
   Direct access: https://your-domain.com/
   Or run locally: Open index.html
   ```

2. **Serial Debugging**
   - Click "Serial Debug" tab
   - Configure serial parameters (baud rate, data bits, etc.)
   - Click "Connect Serial" to select device
   - Start sending and receiving data

3. **Firmware Flashing**
   - Click "Firmware Flash" tab
   - Select target device type
   - Select firmware file (.bin)
   - Connect serial port and start flashing

4. **TuyaOpen Authorization**
   - Click "TuyaOpen Auth" tab
   - Enter UUID and AUTH_KEY
   - Connect device and write authorization information

### Supported Device Types

| Device Type | Status | Description |
|-------------|--------|-------------|
| T5AI | Fully Supported |  |
| T3 | Fully Supported |  |
| ESP32 Series | Fully Supported | Supports all ESP32/ESP32-S2/S3/C3 series |


## Detailed Documentation

### Troubleshooting
- If serial connection fails, please check:
  - Whether the browser supports Web Serial API
  - Whether device drivers are correctly installed
  - Whether the serial port is occupied by other programs
- Detailed troubleshooting guide: [troubleshooting.html](troubleshooting.html)

### Development Guide
- Modular architecture documentation: [modules/README.md](modules/README.md)
- Downloader development guide: [downloaders/README.md](downloaders/README.md)
- Internationalization development: [i18n/README.md](i18n/README.md)

## Contributing

Welcome to submit Issues and Pull Requests!

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

This project has referenced and learned from the following excellent open-source projects during development. We express our sincere gratitude:

- **[tyutool](https://github.com/tuya/tyutool)** - Official Tuya serial tool that provided important reference for our project's feature design and user experience
- **[esptool-js](https://github.com/espressif/esptool-js)** - Official Espressif JavaScript flashing tool that provides core technical support for ESP32 series chip firmware flashing functionality

Thanks to the developers of these projects for their contributions to the open-source community!

## Related Projects

- [TuyaOpen](https://github.com/tuya/tuya-open-sdk-for-device) - TuyaOpen Device SDK
- [Arduino-TuyaOpen](https://github.com/tuya/arduino-tuyaopen) - Arduino Platform Support
- [Luanode-TuyaOpen](https://github.com/tuya/luanode-tuyaopen) - Lua Development Support

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/Tuya/TuyaOpen-Tools/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Tuya/TuyaOpen-Tools/discussions)

---

**Developed and maintained by TuyaOpen Team**

