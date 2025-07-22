/**
 * T5AI 调试工具模块
 * 提供调试日志管理、数据格式转换、错误信息格式化等功能
 */

class T5DebugUtils {
    constructor(debugCallback) {
        this.debugCallback = debugCallback;
        this.debugMode = false;
    }

    /**
     * 设置调试模式
     * @param {boolean} enabled - 是否启用调试模式
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 主流程日志输出（总是显示）- 用于关键进度和状态信息
     * @param {string} message - 日志消息
     */
    mainLog(message) {
        this.debug('main', message);
    }

    /**
     * 信息日志输出（总是显示）- 用于重要的操作信息
     * @param {string} message - 日志消息
     */
    infoLog(message) {
        this.debug('info', message);
    }

    /**
     * 调试日志输出（仅在调试模式下显示）- 用于详细的技术信息
     * @param {string} message - 日志消息
     * @param {*} data - 附加数据
     */
    debugLog(message, data = null) {
        if (this.debugMode) {
            this.debug('debug', message, data);
        }
    }

    /**
     * 警告日志输出（总是显示）
     * @param {string} message - 日志消息
     */
    warningLog(message) {
        this.debug('warning', message);
    }

    /**
     * 错误日志输出（总是显示）
     * @param {string} message - 日志消息
     */
    errorLog(message) {
        this.debug('error', message);
    }

    /**
     * 通信日志输出（总是显示）- 用于基本的通信状态信息
     * @param {string} message - 日志消息
     */
    commLog(message) {
        this.debug('comm', message);
    }

    /**
     * 基础调试输出方法
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {*} data - 附加数据
     */
    debug(level, message, data = null) {
        if (this.debugCallback) {
            this.debugCallback(level, message, data);
        }
    }

    /**
     * 将字节数组转换为十六进制字符串
     * @param {Array|Uint8Array} bytes - 字节数组
     * @returns {string} 十六进制字符串
     */
    bytesToHex(bytes) {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
    }

    /**
     * 格式化地址显示
     * @param {number} addr - 地址值
     * @param {number} width - 显示宽度（默认8位）
     * @returns {string} 格式化的地址字符串
     */
    formatAddress(addr, width = 8) {
        return `0x${addr.toString(16).padStart(width, '0').toUpperCase()}`;
    }

    /**
     * 格式化文件大小显示
     * @param {number} size - 文件大小（字节）
     * @returns {string} 格式化的大小字符串
     */
    formatFileSize(size) {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)}MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)}KB`;
        } else {
            return `${size}B`;
        }
    }

    /**
     * 格式化进度百分比
     * @param {number} current - 当前进度
     * @param {number} total - 总进度
     * @returns {string} 格式化的百分比字符串
     */
    formatProgress(current, total) {
        const percentage = Math.round((current / total) * 100);
        return `${percentage}%`;
    }

    /**
     * 检查是否为串口断开错误
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否为串口断开错误
     */
    isPortDisconnectionError(error) {
        const message = error.message.toLowerCase();
        return message.includes('device lost') || 
               message.includes('disconnected') || 
               message.includes('not open') ||
               message.includes('network error');
    }

    /**
     * 格式化错误信息
     * @param {Error} error - 错误对象
     * @param {string} context - 错误上下文
     * @returns {string} 格式化的错误信息
     */
    formatError(error, context = '') {
        const prefix = context ? `${context}: ` : '';
        
        if (this.isPortDisconnectionError(error)) {
            return `${prefix}设备连接已断开，请检查USB连接后重试`;
        }
        
        return `${prefix}${error.message}`;
    }

    /**
     * 创建带时间戳的日志消息
     * @param {string} message - 原始消息
     * @returns {string} 带时间戳的消息
     */
    timestampMessage(message) {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('zh-CN', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
        return `[${timestamp}] ${message}`;
    }

    /**
     * 验证响应数据格式
     * @param {Array} response - 响应数据
     * @param {Array} expectedHeader - 期望的头部数据
     * @param {number} minLength - 最小长度
     * @returns {Object} 验证结果
     */
    validateResponse(response, expectedHeader, minLength) {
        const result = {
            valid: false,
            lengthOk: false,
            headerOk: false,
            statusOk: false,
            message: ''
        };

        // 检查长度
        result.lengthOk = response.length >= minLength;
        if (!result.lengthOk) {
            result.message = `响应长度不足: ${response.length} < ${minLength}`;
            return result;
        }

        // 检查头部
        result.headerOk = expectedHeader.every((byte, index) => response[index] === byte);
        if (!result.headerOk) {
            result.message = `响应头部错误: 期望[${this.bytesToHex(expectedHeader)}], 实际[${this.bytesToHex(response.slice(0, expectedHeader.length))}]`;
            return result;
        }

        // 检查状态码（如果有）
        if (response.length > 10) {
            result.statusOk = response[10] === 0x00;
            if (!result.statusOk) {
                result.message = `状态码错误: 0x${response[10].toString(16).padStart(2, '0').toUpperCase()}`;
                return result;
            }
        }

        result.valid = true;
        result.message = '响应验证成功';
        return result;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T5DebugUtils;
} else if (typeof window !== 'undefined') {
    window.T5DebugUtils = T5DebugUtils;
}