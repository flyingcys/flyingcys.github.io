/**
 * RAM Binary加载器
 * 负责管理和加载LN882H所需的RAM Binary数据
 */

class RamLoader {
    constructor(config) {
        this.config = config;
        this.ramBinary = null;
        this.isLoaded = false;
        this.loadingPromise = null;
        
        // 调试回调
        this.debugCallback = null;
    }

    /**
     * 设置调试回调
     */
    setDebugCallback(callback) {
        this.debugCallback = callback;
    }

    /**
     * 调试日志
     */
    debug(message, data = null) {
        if (this.debugCallback) {
            this.debugCallback('RamLoader', message, data);
        }
    }

    /**
     * 检查RAM Binary是否已加载
     */
    isRamBinaryLoaded() {
        return this.isLoaded && this.ramBinary !== null;
    }

    /**
     * 获取RAM Binary大小
     */
    getRamBinarySize() {
        if (!this.isRamBinaryLoaded()) {
            return 0;
        }
        return this.ramBinary.length;
    }

    /**
     * 获取RAM Binary数据
     */
    getRamBinary() {
        if (!this.isRamBinaryLoaded()) {
            throw new Error('RAM Binary未加载');
        }
        return this.ramBinary;
    }

    /**
     * 从全局变量加载RAM Binary
     */
    async loadFromGlobal() {
        this.debug('尝试从全局变量加载RAM Binary...');
        
        if (typeof window !== 'undefined' && window.LN882H_RAM_BIN) {
            this.ramBinary = window.LN882H_RAM_BIN;
            this.isLoaded = true;
            this.config.setRamBinaryConfig(this.ramBinary.length);
            this.debug(`从全局变量加载RAM Binary成功，大小: ${this.ramBinary.length} 字节`);
            return true;
        }
        
        this.debug('全局变量中未找到LN882H_RAM_BIN');
        return false;
    }

    /**
     * 从URL加载RAM Binary
     */
    async loadFromUrl(url) {
        this.debug(`尝试从URL加载RAM Binary: ${url}`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.ramBinary = new Uint8Array(arrayBuffer);
            this.isLoaded = true;
            this.config.setRamBinaryConfig(this.ramBinary.length);
            this.debug(`从URL加载RAM Binary成功，大小: ${this.ramBinary.length} 字节`);
            return true;
            
        } catch (error) {
            this.debug(`从URL加载RAM Binary失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 从Base64字符串加载RAM Binary
     */
    async loadFromBase64(base64String) {
        this.debug('尝试从Base64字符串加载RAM Binary...');
        
        try {
            // 移除可能的数据URL前缀
            const base64Data = base64String.replace(/^data:.*,/, '');
            
            // 解码Base64
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            this.ramBinary = bytes;
            this.isLoaded = true;
            this.config.setRamBinaryConfig(this.ramBinary.length);
            this.debug(`从Base64加载RAM Binary成功，大小: ${this.ramBinary.length} 字节`);
            return true;
            
        } catch (error) {
            this.debug(`从Base64加载RAM Binary失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 从文件对象加载RAM Binary
     */
    async loadFromFile(file) {
        this.debug(`尝试从文件加载RAM Binary: ${file.name}, ${file.size} 字节`);
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.ramBinary = new Uint8Array(arrayBuffer);
            this.isLoaded = true;
            this.config.setRamBinaryConfig(this.ramBinary.length);
            this.debug(`从文件加载RAM Binary成功，大小: ${this.ramBinary.length} 字节`);
            return true;
            
        } catch (error) {
            this.debug(`从文件加载RAM Binary失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 创建占位符RAM Binary（用于测试）
     */
    createPlaceholder(size = 1024) {
        this.debug(`创建占位符RAM Binary，大小: ${size} 字节`);
        
        this.ramBinary = new Uint8Array(size);
        // 填充一些模式数据以便识别
        for (let i = 0; i < size; i++) {
            this.ramBinary[i] = i % 256;
        }
        
        this.isLoaded = true;
        this.config.setRamBinaryConfig(this.ramBinary.length);
        this.debug('占位符RAM Binary创建成功');
        return true;
    }

    /**
     * 自动加载RAM Binary（按优先级尝试多种方式）
     */
    async autoLoad(options = {}) {
        // 避免重复加载
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._performAutoLoad(options);
        return this.loadingPromise;
    }

    /**
     * 执行自动加载
     */
    async _performAutoLoad(options) {
        this.debug('开始自动加载RAM Binary...');
        
        // 如果已经加载，直接返回
        if (this.isRamBinaryLoaded()) {
            this.debug('RAM Binary已经加载');
            return true;
        }
        
        const {
            globalVariableName = 'LN882H_RAM_BIN',
            fallbackUrl = null,
            useBase64 = null,
            useFile = null,
            createPlaceholder = false,
            placeholderSize = 1024
        } = options;
        
        // 1. 尝试从全局变量加载
        if (await this.loadFromGlobal()) {
            return true;
        }
        
        // 2. 尝试从用户提供的文件加载
        if (useFile && await this.loadFromFile(useFile)) {
            return true;
        }
        
        // 3. 尝试从Base64字符串加载
        if (useBase64 && await this.loadFromBase64(useBase64)) {
            return true;
        }
        
        // 4. 尝试从URL加载
        if (fallbackUrl && await this.loadFromUrl(fallbackUrl)) {
            return true;
        }
        
        // 5. 创建占位符（如果允许）
        if (createPlaceholder) {
            this.debug('所有加载方式都失败，创建占位符');
            return this.createPlaceholder(placeholderSize);
        }
        
        this.debug('所有RAM Binary加载方式都失败');
        return false;
    }

    /**
     * 验证RAM Binary
     */
    validateRamBinary() {
        if (!this.isRamBinaryLoaded()) {
            return {
                valid: false,
                error: 'RAM Binary未加载'
            };
        }
        
        const size = this.ramBinary.length;
        const errors = [];
        
        // 检查大小
        if (size === 0) {
            errors.push('RAM Binary大小为0');
        }
        
        if (size > 10 * 1024 * 1024) { // 10MB
            errors.push('RAM Binary大小过大（>10MB）');
        }
        
        // 检查是否全为0（可能的错误状态）
        const allZero = this.ramBinary.every(byte => byte === 0);
        if (allZero && size > 100) {
            errors.push('RAM Binary内容全为0，可能无效');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            size: size
        };
    }

    /**
     * 重置加载状态
     */
    reset() {
        this.ramBinary = null;
        this.isLoaded = false;
        this.loadingPromise = null;
        this.debug('RAM Loader状态已重置');
    }

    /**
     * 获取加载状态信息
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            size: this.isLoaded ? this.ramBinary.length : 0,
            validation: this.isLoaded ? this.validateRamBinary() : null
        };
    }

    /**
     * 导出RAM Binary为Base64
     */
    exportToBase64() {
        if (!this.isRamBinaryLoaded()) {
            throw new Error('RAM Binary未加载');
        }
        
        const binaryString = Array.from(this.ramBinary)
            .map(byte => String.fromCharCode(byte))
            .join('');
        
        return btoa(binaryString);
    }

    /**
     * 导出RAM Binary为Blob
     */
    exportToBlob() {
        if (!this.isRamBinaryLoaded()) {
            throw new Error('RAM Binary未加载');
        }
        
        return new Blob([this.ramBinary], { type: 'application/octet-stream' });
    }

    /**
     * 获取RAM Binary的摘要信息
     */
    getSummary() {
        if (!this.isRamBinaryLoaded()) {
            return {
                loaded: false,
                size: 0,
                checksum: null
            };
        }
        
        // 计算简单的校验和
        let checksum = 0;
        for (let i = 0; i < this.ramBinary.length; i++) {
            checksum = (checksum + this.ramBinary[i]) & 0xFFFFFFFF;
        }
        
        return {
            loaded: true,
            size: this.ramBinary.length,
            checksum: checksum.toString(16).padStart(8, '0'),
            firstBytes: Array.from(this.ramBinary.slice(0, 16))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(' ')
        };
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.RamLoader = RamLoader;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RamLoader;
}