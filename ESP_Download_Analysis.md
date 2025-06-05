# ESP下载流程分析与JS实现

## 1. Python版本ESP下载流程分析

基于 `web_serial/tyutool/tyutool/flash/esp/esp_flash.py` 的分析，ESP下载包含以下关键步骤：

### 1.1 流程步骤

#### Step 1: shake() - 握手建立连接
```python
def shake(self):
    if not self.binfile_prepare():
        return False
    chip_class = CHIP_DEFS[self.device.lower()]
    self.esp = chip_class(self.ser, self.logger)
    if not self.esp.connect(self.check_stop):
        self.logger.error("Shake failed.")
    return True
```

**关键操作：**
- 准备二进制文件 (`binfile_prepare()`)
- 初始化芯片类
- 建立串口连接 (`esp.connect()`)

#### Step 2: erase() - 擦除（运行Stub）
```python
def erase(self):
    stub_flasher = STUB_DEFS[self.device.lower()]
    self.esp = self.esp.run_stub(stub_flasher)
    if self.esp is None:
        self.logger.error("Stub flash failed")
        return False
    return True
```

**关键操作：**
- 获取Stub加载器数据
- 运行Stub加载器 (`esp.run_stub()`)

#### Step 3: write() - 写入固件
```python
def write(self):
    if not self._set_baudrate(self.baudrate):
        return False
    flash_size_str = self._detect_flash_size()
    flash_size = self.esp.flash_size_bytes(flash_size_str)
    self.esp.flash_set_parameters(flash_size)
    
    # 压缩并写入数据
    uncsize = self.binfile_data['uncsize']
    uncimage = self.binfile_data['uncimage']
    image = zlib.compress(uncimage, 9)
    blocks = 1 + self.esp.flash_defl_begin(uncsize, len(image), self.start_addr)
    
    # 分块写入
    while len(image) > 0:
        block = image[0:self.esp.FLASH_WRITE_SIZE]
        self.esp.flash_defl_block(block, seq, timeout=timeout)
        image = image[self.esp.FLASH_WRITE_SIZE:]
        seq += 1
```

**关键操作：**
- 设置波特率 (`_set_baudrate()`)
- 检测Flash大小 (`_detect_flash_size()`)
- 设置Flash参数 (`flash_set_parameters()`)
- 压缩数据 (`zlib.compress()`)
- 分块写入 (`flash_defl_begin()`, `flash_defl_block()`)

#### Step 4: crc_check() - CRC校验
```python
def crc_check(self):
    res = self.esp.flash_md5sum(self.start_addr, self.binfile_data['uncsize'])
    calcmd5 = self.binfile_data['calcmd5']
    if res != calcmd5:
        self.logger.error(f"Check CRC fail")
        return False
    return True
```

**关键操作：**
- 计算Flash MD5校验 (`flash_md5sum()`)
- 与文件MD5对比

#### Step 5: reboot() - 重启设备
```python
def reboot(self):
    if self.esp is None:
        return False
    self.esp.hard_reset()
    return True
```

**关键操作：**
- 硬重启设备 (`hard_reset()`)

### 1.2 关键常量和参数

#### 超时设置
```python
DEFAULT_TIMEOUT = 3                    # 3秒
SYNC_TIMEOUT = 0.1                     # 0.1秒
ERASE_WRITE_TIMEOUT_PER_MB = 40        # 40秒每MB
MD5_TIMEOUT_PER_MB = 8                 # 8秒每MB
```

#### 重试次数
```python
WRITE_BLOCK_ATTEMPTS = 3               # 写入块重试3次
connect(attempts=7)                    # 连接重试7次
```

#### Flash大小检测
```python
DETECTED_FLASH_SIZES = {
    0x12: "256KB", 0x13: "512KB", 0x14: "1MB", 0x15: "2MB",
    0x16: "4MB", 0x17: "8MB", 0x18: "16MB", 0x19: "32MB",
    # ... 更多尺寸映射
}
```

## 2. JS实现方案

### 2.1 整体架构

参考T5AI的成功实现机制，JS版本采用以下架构：

```javascript
class ESPDownloaderComplete extends ESPDownloaderNew {
    // 继承基础通信能力
    // 实现ESP特定的下载流程
}
```

### 2.2 关键实现要点

#### 2.2.1 串口通信机制
参考T5AI的串口收发机制：
- **clearBuffer()**: 清空接收缓冲区
- **sendCommand()**: 发送命令
- **receiveResponse()**: 接收响应（模拟Python的阻塞读取）
- **readSlipPacket()**: 读取SLIP协议数据包

#### 2.2.2 SLIP协议实现
```javascript
// SLIP编码 - 完全按照Python版本
slipEncode(data) {
    const encoded = [0xc0]; // 开始标志
    for (let byte of data) {
        if (byte === 0xdb) encoded.push(0xdb, 0xdd);
        else if (byte === 0xc0) encoded.push(0xdb, 0xdc);
        else encoded.push(byte);
    }
    encoded.push(0xc0); // 结束标志
    return new Uint8Array(encoded);
}
```

#### 2.2.3 命令执行机制
```javascript
async command(op, data, chk, waitResponse, timeout) {
    // 构造数据包：<方向><命令><长度><校验> + 数据
    // SLIP编码并发送
    // 等待响应（重试100次，与Python一致）
    // 验证响应格式
}
```

#### 2.2.4 超时和重试机制
```javascript
// 完全按照Python的超时设置
this.DEFAULT_TIMEOUT = 3000;              // 3秒 = 3000ms
this.SYNC_TIMEOUT = 100;                  // 0.1秒 = 100ms
this.ERASE_WRITE_TIMEOUT_PER_MB = 40000;  // 40秒每MB = 40000ms

// 重试次数保持一致
connect(isStop, attempts = 7)             // 连接重试7次
```

### 2.3 主下载流程实现

```javascript
async downloadFirmware(fileData, startAddr = 0x00) {
    try {
        // 1. 握手 - 完全按照Python shake()
        if (!await this.shake(fileData)) {
            throw new Error("握手失败");
        }
        
        // 2. 擦除 - 完全按照Python erase()
        if (!await this.erase()) {
            throw new Error("擦除失败");
        }
        
        // 3. 写入 - 完全按照Python write()
        if (!await this.write(startAddr)) {
            throw new Error("写入失败");
        }
        
        // 4. CRC检查 - 完全按照Python crc_check()
        if (!await this.crcCheck(startAddr)) {
            throw new Error("CRC检查失败");
        }
        
        // 5. 重启 - 完全按照Python reboot()
        if (!await this.reboot()) {
            throw new Error("重启失败");
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### 2.4 关键差异处理

#### 2.4.1 MD5计算
Python使用hashlib，JS使用Web Crypto API：
```javascript
const hashBuffer = await crypto.subtle.digest('MD5', paddedData);
const calcmd5 = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
```

#### 2.4.2 数据压缩
Python使用zlib，JS使用CompressionStream API：
```javascript
async compress(data) {
    const stream = new CompressionStream('deflate');
    // 压缩流处理...
    return compressedData;
}
```

#### 2.4.3 波特率变更
Web Serial API限制，记录请求的波特率：
```javascript
async changeBaud(baud) {
    await this.command(this.ESP_CHANGE_BAUDRATE, data);
    this.currentBaudrate = baud; // 记录但无法实际更改
    return true;
}
```

## 3. 实现状态

### 3.1 已完成部分
- ✅ 基础架构和通信机制
- ✅ SLIP协议编解码
- ✅ 命令执行框架
- ✅ 五个主要流程的框架实现
- ✅ 超时和重试机制
- ✅ 进度回调机制

### 3.2 需要进一步完善的部分
- 🔄 Stub加载器的实际数据和执行逻辑
- 🔄 Flash操作的具体实现（需要实际的SPI Flash命令）
- 🔄 芯片特定的寄存器操作
- 🔄 错误处理和异常恢复
- 🔄 实际设备测试和调试

### 3.3 测试建议
1. 先在T5AI已验证的环境中测试基础通信能力
2. 逐步实现和测试每个流程步骤
3. 对比Python版本的日志输出验证一致性
4. 使用实际ESP设备进行端到端测试

## 4. 使用示例

```javascript
// 初始化下载器
const espDownloader = new ESPDownloaderComplete(serialPort, debugCallback, 'ESP32');

// 设置进度回调
espDownloader.setProgressCallback((current, total, stage) => {
    console.log(`${stage}: ${current}/${total}`);
});

// 执行下载
const result = await espDownloader.downloadFirmware(firmwareData, 0x00);
if (result.success) {
    console.log("ESP固件下载成功!");
} else {
    console.error("下载失败:", result.error);
}
```

## 5. 总结

JS版本的ESP下载器已按照Python版本的逻辑框架完整实现，包括：

1. **完全一致的流程步骤**：shake → erase → write → crc_check → reboot
2. **相同的超时时间和重试次数**
3. **参考T5AI的成熟串口通信机制**
4. **模块化的架构设计便于测试和调试**

下一步需要完善底层的Flash操作实现和Stub加载器数据，然后进行实际设备测试验证。 