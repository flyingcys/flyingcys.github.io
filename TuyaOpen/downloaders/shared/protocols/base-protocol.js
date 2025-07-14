/**
 * 基础协议类 - 所有芯片协议的基类
 * 基于 Python tyutool 的协议设计，提供统一的协议接口
 */

class BaseProtocol {
    constructor() {
        this.name = 'BaseProtocol';
        this.debugMode = false;
        this.traceLog = '';
        this.lastTraceTime = Date.now();
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 调试追踪输出
     */
    trace(message) {
        if (this.debugMode) {
            const delta = Date.now() - this.lastTraceTime;
            const traceMessage = `TRACE ${delta.toFixed(3)}ms [${this.name}] ${message}`;
            console.log(traceMessage);
            this.traceLog += traceMessage + '\n';
            this.lastTraceTime = Date.now();
        }
    }

    /**
     * 生成协议命令 - 子类必须实现
     * @param {...any} args 命令参数
     * @returns {Array<number>} 命令字节数组
     */
    cmd(...args) {
        throw new Error(`${this.constructor.name} must implement cmd() method`);
    }

    /**
     * 检查响应内容 - 子类必须实现
     * @param {Uint8Array} responseContent 响应内容
     * @param {...any} args 检查参数
     * @returns {boolean} 响应是否有效
     */
    responseCheck(responseContent, ...args) {
        throw new Error(`${this.constructor.name} must implement responseCheck() method`);
    }

    /**
     * 解析响应内容 - 子类可选实现
     * @param {Uint8Array} responseContent 响应内容
     * @returns {any} 解析后的数据
     */
    parseResponse(responseContent) {
        return responseContent;
    }

    /**
     * 获取协议名称
     */
    getName() {
        return this.name;
    }

    /**
     * 获取调试日志
     */
    getTraceLog() {
        return this.traceLog;
    }

    /**
     * 清空调试日志
     */
    clearTraceLog() {
        this.traceLog = '';
    }
}

/**
 * T5 基础协议类 - T5芯片的基础协议实现
 * 基于 Python BaseBootRomProtocol 实现
 */
class BaseBootRomProtocol extends BaseProtocol {
    constructor() {
        super();
        this.name = 'BaseBootRomProtocol';
        
        // 基础协议头 - 完全按照Python版本
        this.baseTxTypeAndOpcode = [0x01, 0xe0, 0xfc];
        this.rxHeaderAndEvent = [0x04, 0x0e];
    }

    /**
     * 生成T5基础协议命令
     * @param {number} cmd 命令码
     * @param {Array<number>} payload 负载数据
     * @returns {Array<number>} 完整命令
     */
    commandGenerate(cmd, payload = []) {
        const command = [];
        command.push(...this.baseTxTypeAndOpcode);
        command.push(1 + payload.length);  // 长度 = 命令码(1) + 负载长度
        command.push(cmd);
        command.push(...payload);
        
        this.trace(`Generated command: [${command.map(x => '0x' + x.toString(16).padStart(2, '0')).join(', ')}]`);
        return command;
    }

    /**
     * 检查响应头段
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 响应头是否正确
     */
    checkResponseHeaderSeg(responseContent) {
        if (responseContent.length < 2) {
            this.trace(`Response too short: ${responseContent.length} bytes`);
            return false;
        }
        
        const isValid = responseContent[0] === this.rxHeaderAndEvent[0] && 
                       responseContent[1] === this.rxHeaderAndEvent[1];
        
        if (!isValid) {
            this.trace(`Invalid response header: [${responseContent[0].toString(16)}, ${responseContent[1].toString(16)}], expected: [${this.rxHeaderAndEvent[0].toString(16)}, ${this.rxHeaderAndEvent[1].toString(16)}]`);
        }
        
        return isValid;
    }

    /**
     * 检查响应长度段
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 长度是否正确
     */
    checkResponseLengthSeg(responseContent) {
        if (responseContent.length < 3) {
            this.trace(`Response too short for length check: ${responseContent.length} bytes`);
            return false;
        }
        
        const declaredLength = responseContent[2];
        const actualLength = responseContent.length - 3; // 减去头部3字节
        
        const isValid = declaredLength === actualLength;
        if (!isValid) {
            this.trace(`Length mismatch: declared=${declaredLength}, actual=${actualLength}`);
        }
        
        return isValid;
    }

    /**
     * 检查响应发送头段
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 发送头是否正确
     */
    checkResponseTxHeaderSeg(responseContent) {
        if (responseContent.length < 6) {
            this.trace(`Response too short for tx header check: ${responseContent.length} bytes`);
            return false;
        }
        
        const isValid = responseContent[3] === this.baseTxTypeAndOpcode[0] &&
                       responseContent[4] === this.baseTxTypeAndOpcode[1] &&
                       responseContent[5] === this.baseTxTypeAndOpcode[2];
        
        if (!isValid) {
            this.trace(`Invalid tx header in response: [${responseContent[3].toString(16)}, ${responseContent[4].toString(16)}, ${responseContent[5].toString(16)}]`);
        }
        
        return isValid;
    }

    /**
     * 基础响应检查
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 响应是否有效
     */
    responseCheck(responseContent) {
        this.trace(`Checking response: ${responseContent.length} bytes`);
        
        return this.checkResponseHeaderSeg(responseContent) &&
               this.checkResponseLengthSeg(responseContent) &&
               this.checkResponseTxHeaderSeg(responseContent);
    }
}

/**
 * T5 Flash协议类 - T5芯片的Flash操作协议实现
 * 基于 Python BaseBootRomFlashProtocol 实现
 */
class BaseBootRomFlashProtocol extends BaseProtocol {
    constructor() {
        super();
        this.name = 'BaseBootRomFlashProtocol';
        
        // Flash协议头 - 完全按照Python版本
        this.baseTxHeader = [0x01, 0xe0, 0xfc, 0xff, 0xf4];
        this.baseRxHeader = [0x04, 0x0e, 0xff, 0x01, 0xe0, 0xfc, 0xf4];
    }

    /**
     * 生成T5 Flash协议命令
     * @param {number} cmd 命令码
     * @param {Array<number>} payload 负载数据
     * @returns {Array<number>} 完整命令
     */
    commandGenerate(cmd, payload = []) {
        const command = [];
        command.push(...this.baseTxHeader);
        
        // 长度字段（小端序）- 长度 = 命令码(1) + 负载长度
        const length = 1 + payload.length;
        command.push(length & 0xff);           // 低字节
        command.push((length >> 8) & 0xff);    // 高字节
        
        command.push(cmd);                     // 命令码
        command.push(...payload);              // 负载
        
        this.trace(`Generated Flash command: [${command.map(x => '0x' + x.toString(16).padStart(2, '0')).join(', ')}]`);
        return command;
    }

    /**
     * 检查Flash响应头
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 响应头是否正确
     */
    checkResponseHeader(responseContent) {
        if (responseContent.length < this.baseRxHeader.length) {
            this.trace(`Flash response too short: ${responseContent.length} bytes, expected at least ${this.baseRxHeader.length}`);
            return false;
        }
        
        for (let i = 0; i < this.baseRxHeader.length; i++) {
            if (responseContent[i] !== this.baseRxHeader[i]) {
                this.trace(`Flash response header mismatch at position ${i}: got 0x${responseContent[i].toString(16)}, expected 0x${this.baseRxHeader[i].toString(16)}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * 检查Flash响应长度
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 长度是否正确
     */
    checkResponseLength(responseContent) {
        if (responseContent.length < 9) { // 基础头(7) + 长度(2)
            this.trace(`Flash response too short for length check: ${responseContent.length} bytes`);
            return false;
        }
        
        // 长度字段在索引7和8（小端序）
        const declaredLength = responseContent[7] | (responseContent[8] << 8);
        const actualLength = responseContent.length - 9; // 减去头部9字节
        
        const isValid = declaredLength === actualLength;
        if (!isValid) {
            this.trace(`Flash length mismatch: declared=${declaredLength}, actual=${actualLength}`);
        }
        
        return isValid;
    }

    /**
     * Flash基础响应检查
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 响应是否有效
     */
    responseCheck(responseContent) {
        this.trace(`Checking Flash response: ${responseContent.length} bytes`);
        
        return this.checkResponseHeader(responseContent) &&
               this.checkResponseLength(responseContent);
    }

    /**
     * 获取Flash响应的状态码
     * @param {Uint8Array} responseContent 响应内容
     * @returns {number|null} 状态码
     */
    getResponseStatus(responseContent) {
        if (responseContent.length < 10) { // 至少需要头部(9) + 状态码(1)
            this.trace(`Response too short to get status: ${responseContent.length} bytes`);
            return null;
        }
        
        const status = responseContent[9];
        this.trace(`Flash response status: 0x${status.toString(16)}`);
        return status;
    }

    /**
     * 检查Flash操作是否成功
     * @param {Uint8Array} responseContent 响应内容
     * @returns {boolean} 操作是否成功
     */
    isResponseSuccess(responseContent) {
        const status = this.getResponseStatus(responseContent);
        return status === 0x00; // 0x00 表示成功
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseProtocol,
        BaseBootRomProtocol,
        BaseBootRomFlashProtocol
    };
} else if (typeof window !== 'undefined') {
    window.BaseProtocol = BaseProtocol;
    window.BaseBootRomProtocol = BaseBootRomProtocol;
    window.BaseBootRomFlashProtocol = BaseBootRomFlashProtocol;
}