/**
 * 固件下载进度跟踪模块
 * 负责下载进度显示、速度计算、日志管理
 */
class ProgressTracker {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.elements = {};
        this.startTime = null;
        this.lastUpdateTime = null;
        this.lastBytes = 0;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        // 进度显示相关元素
        this.elements.progressArea = document.getElementById('progressArea');
        this.elements.progressText = document.getElementById('progressText');
        this.elements.progressPercent = document.getElementById('progressPercent');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.downloadedBytes = document.getElementById('downloadedBytes');
        this.elements.totalBytes = document.getElementById('totalBytes');
        this.elements.downloadSpeed = document.getElementById('downloadSpeed');
        
        // 固件下载日志相关元素
        this.elements.flashLogDisplay = document.getElementById('flashLogDisplay');
        this.elements.clearFlashLogBtn = document.getElementById('clearFlashLogBtn');
        this.elements.saveFlashLogBtn = document.getElementById('saveFlashLogBtn');
        this.elements.flashAutoScroll = document.getElementById('flashAutoScroll');
    }
    
    bindEvents() {
        // 固件下载日志事件
        this.elements.clearFlashLogBtn?.addEventListener('click', () => {
            this.clearFlashLog();
        });

        this.elements.saveFlashLogBtn?.addEventListener('click', () => {
            this.saveFlashLog();
        });
        
        // 监听模块事件
        this.eventBus.on('flash:progress-update', (progressData) => {
            this.updateProgress(progressData);
        });
        
        this.eventBus.on('flash:log-add', (logData) => {
            this.addToFlashLog(logData.message, logData.type, logData.isMainProcess);
        });
        
        this.eventBus.on('flash:log-clear', () => {
            this.clearFlashLog();
        });
        
        this.eventBus.on('flash:log-save', () => {
            this.saveFlashLog();
        });
        
        // 下载开始/结束事件
        this.eventBus.on('flash:download-started', () => {
            this.startTracking();
        });
        
        this.eventBus.on('flash:download-finished', () => {
            this.stopTracking();
        });
    }
    
    /**
     * 开始进度跟踪
     */
    startTracking() {
        this.startTime = Date.now();
        this.lastUpdateTime = this.startTime;
        this.lastBytes = 0;
        
        // 显示进度区域
        if (this.elements.progressArea) {
            this.elements.progressArea.style.display = 'block';
        }
    }
    
    /**
     * 停止进度跟踪
     */
    stopTracking() {
        this.startTime = null;
        this.lastUpdateTime = null;
        this.lastBytes = 0;
    }
    
    /**
     * 更新固件下载进度
     */
    updateProgress(detail) {
        // 更新进度文本和百分比
        if (this.elements.progressText) {
            this.elements.progressText.textContent = detail.message;
        }
        if (this.elements.progressPercent) {
            this.elements.progressPercent.textContent = `${Math.round(detail.percent)}%`;
        }
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${detail.percent}%`;
        }
        
        // 更新字节显示
        if (detail.totalSize > 0) {
            if (this.elements.downloadedBytes) {
                this.elements.downloadedBytes.textContent = detail.downloadedSize.toLocaleString();
            }
            if (this.elements.totalBytes) {
                this.elements.totalBytes.textContent = detail.totalSize.toLocaleString();
            }
        }
        
        // 计算和更新下载速度
        this.updateDownloadSpeed(detail.downloadedSize);

        // 添加到日志（如果是进度类型的消息）
        if (detail.message && detail.message.includes('%')) {
            this.addToFlashLog(detail.message, 'progress', false);
        }
    }
    
    /**
     * 计算并更新下载速度
     */
    updateDownloadSpeed(currentBytes) {
        if (!this.startTime || !this.elements.downloadSpeed) return;
        
        const now = Date.now();
        const timeDiff = now - this.lastUpdateTime;
        
        // 每500ms更新一次速度
        if (timeDiff >= 500) {
            const bytesDiff = currentBytes - this.lastBytes;
            const speed = (bytesDiff / timeDiff) * 1000; // bytes per second
            
            this.elements.downloadSpeed.textContent = this.formatSpeed(speed);
            
            this.lastUpdateTime = now;
            this.lastBytes = currentBytes;
        }
    }
    
    /**
     * 格式化速度显示
     */
    formatSpeed(bytesPerSecond) {
        if (bytesPerSecond < 1024) {
            return `${Math.round(bytesPerSecond)} B/s`;
        } else if (bytesPerSecond < 1024 * 1024) {
            return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
        } else {
            return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
        }
    }
    
    /**
     * 添加到固件下载日志
     */
    addToFlashLog(text, type = 'info', isMainProcess = false) {
        if (!this.elements.flashLogDisplay) return;
        
        // 如果不是调试模式，只显示主流程信息
        const debugMode = document.getElementById('flashDebugMode')?.checked;
        if (!debugMode && !isMainProcess) {
            return;
        }
        
        const timestamp = this.generateTimestamp();
        const logEntry = document.createElement('div');
        logEntry.className = `debug-entry ${type}`;
        
        // 为主流程信息添加特殊样式
        if (isMainProcess) {
            logEntry.classList.add('main-process');
        }
        
        // 创建时间戳
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'debug-timestamp';
        timestampSpan.textContent = `[${timestamp}]`;
        
        // 创建类型标签
        const typeSpan = document.createElement('span');
        typeSpan.className = 'debug-type';
        typeSpan.textContent = isMainProcess ? 'MAIN' : type.toUpperCase();
        
        // 创建消息内容
        const messageSpan = document.createElement('span');
        messageSpan.className = 'debug-message';
        messageSpan.textContent = text;
        
        logEntry.appendChild(timestampSpan);
        logEntry.appendChild(typeSpan);
        logEntry.appendChild(messageSpan);
        
        // 移除占位符
        const placeholder = this.elements.flashLogDisplay.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        this.elements.flashLogDisplay.appendChild(logEntry);
        
        // 自动滚动
        if (this.elements.flashAutoScroll?.checked) {
            this.elements.flashLogDisplay.scrollTop = this.elements.flashLogDisplay.scrollHeight;
        }
        
        // 触发日志添加事件（用于全屏同步）
        this.eventBus.emit('flash:log-added');
    }
    
    /**
     * 清空固件下载日志
     */
    clearFlashLog() {
        if (this.elements.flashLogDisplay) {
            this.elements.flashLogDisplay.innerHTML = `<div class="placeholder">${i18n.t('waiting_download')}</div>`;
        }
        
        // 触发日志清空事件
        this.eventBus.emit('flash:log-cleared');
    }
    
    /**
     * 保存固件下载日志
     */
    saveFlashLog() {
        if (!this.elements.flashLogDisplay) return;
        
        const lines = this.elements.flashLogDisplay.querySelectorAll('.debug-entry');
        if (lines.length === 0) {
            this.eventBus.emit('error', { message: i18n.t('no_log_to_save') });
            return;
        }

        let logContent = '';
        lines.forEach(line => {
            logContent += line.textContent + '\n';
        });

        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `flash_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 清理URL对象
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * 生成时间戳
     */
    generateTimestamp() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0') + ':' +
               now.getSeconds().toString().padStart(2, '0') + '.' +
               now.getMilliseconds().toString().padStart(3, '0');
    }
    
    /**
     * 获取进度状态
     */
    getStatus() {
        return {
            isTracking: !!this.startTime,
            startTime: this.startTime,
            lastUpdateTime: this.lastUpdateTime,
            lastBytes: this.lastBytes
        };
    }
    
    /**
     * 销毁模块
     */
    destroy() {
        this.elements = {};
        this.startTime = null;
        this.lastUpdateTime = null;
        this.lastBytes = 0;
        this.eventBus = null;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
} 