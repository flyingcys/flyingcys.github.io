// JSON 可视化工具增强功能

// 扩展功能类
class JsonViewer {
    constructor() {
        this.jsonData = {};
        this.currentEditPath = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadFromLocalStorage();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 自动保存
        const editor = document.getElementById('jsonEditor');
        if (editor) {
            editor.addEventListener('input', this.debounce(() => {
                this.saveToLocalStorage();
                this.updateViewer();
            }, 300));
        }

        // 拖拽上传
        this.setupDragAndDrop();
        
        // 窗口大小改变
        window.addEventListener('resize', this.debounce(this.adjustLayout.bind(this), 200));
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        this.shortcuts.set('Ctrl+S', this.exportFile.bind(this));
        this.shortcuts.set('Ctrl+O', this.importFile.bind(this));
        this.shortcuts.set('Ctrl+F', this.focusSearch.bind(this));
        this.shortcuts.set('Ctrl+Z', this.undo.bind(this));
        this.shortcuts.set('Ctrl+Y', this.redo.bind(this));
        this.shortcuts.set('Ctrl+K', this.formatJson.bind(this));
        this.shortcuts.set('F11', this.toggleFullscreen.bind(this));
        this.shortcuts.set('Escape', this.closeModal.bind(this));

        document.addEventListener('keydown', (e) => {
            const key = (e.ctrlKey ? 'Ctrl+' : '') + 
                       (e.shiftKey ? 'Shift+' : '') + 
                       (e.altKey ? 'Alt+' : '') + 
                       e.key;
            
            if (this.shortcuts.has(key)) {
                e.preventDefault();
                this.shortcuts.get(key)();
            }
        });
    }

    // 设置拖拽上传
    setupDragAndDrop() {
        const dropZone = document.querySelector('.container');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.highlight.bind(this), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.unhighlight.bind(this), false);
        });

        dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(e) {
        e.currentTarget.classList.add('drag-highlight');
    }

    unhighlight(e) {
        e.currentTarget.classList.remove('drag-highlight');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.handleFileImport({ target: { files } });
        }
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 本地存储
    saveToLocalStorage() {
        try {
            const editor = document.getElementById('jsonEditor');
            if (editor) {
                localStorage.setItem('jsonViewer_content', editor.value);
                localStorage.setItem('jsonViewer_timestamp', Date.now().toString());
            }
        } catch (error) {
            console.warn('无法保存到本地存储:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const content = localStorage.getItem('jsonViewer_content');
            const timestamp = localStorage.getItem('jsonViewer_timestamp');
            
            if (content && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                // 如果内容不超过7天，则加载
                if (age < 7 * 24 * 60 * 60 * 1000) {
                    const editor = document.getElementById('jsonEditor');
                    if (editor && !editor.value.trim()) {
                        editor.value = content;
                        this.updateViewer();
                        this.showNotification('已恢复上次编辑的内容', 'info');
                    }
                }
            }
        } catch (error) {
            console.warn('无法从本地存储加载:', error);
        }
    }

    // 历史记录管理
    addToHistory(action, data) {
        // 清理未来的历史记录
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 添加新记录
        this.history.push({ action, data, timestamp: Date.now() });
        
        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const record = this.history[this.historyIndex];
            this.applyHistoryRecord(record, true);
            this.showNotification('已撤销操作', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const record = this.history[this.historyIndex];
            this.applyHistoryRecord(record, false);
            this.showNotification('已重做操作', 'info');
        }
    }

    applyHistoryRecord(record, isUndo) {
        // 根据记录类型应用更改
        const editor = document.getElementById('jsonEditor');
        if (editor) {
            editor.value = isUndo ? record.data.before : record.data.after;
            this.updateViewer();
        }
    }

    // 通知系统
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // 全屏切换
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // 聚焦搜索框
    focusSearch() {
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.focus();
            searchBox.select();
        }
    }

    // 布局调整
    adjustLayout() {
        const container = document.querySelector('.container');
        const mainContent = document.querySelector('.main-content');
        
        if (window.innerWidth < 768) {
            mainContent.style.flexDirection = 'column';
        } else {
            mainContent.style.flexDirection = 'row';
        }
    }

    // 高级搜索功能
    advancedSearch(searchTerm, options = {}) {
        const {
            caseSensitive = false,
            wholeWord = false,
            regex = false,
            searchKeys = true,
            searchValues = true
        } = options;

        const items = document.querySelectorAll('.json-item');
        let matches = 0;

        items.forEach(item => {
            let text = '';
            
            if (searchKeys) {
                const keys = item.querySelectorAll('.json-key');
                keys.forEach(key => text += key.textContent + ' ');
            }
            
            if (searchValues) {
                const values = item.querySelectorAll('.json-value');
                values.forEach(value => text += value.textContent + ' ');
            }

            let isMatch = false;
            
            if (regex) {
                try {
                    const regexPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi');
                    isMatch = regexPattern.test(text);
                } catch (e) {
                    // 无效的正则表达式，回退到普通搜索
                    isMatch = text.toLowerCase().includes(searchTerm.toLowerCase());
                }
            } else {
                const searchText = caseSensitive ? text : text.toLowerCase();
                const searchPattern = caseSensitive ? searchTerm : searchTerm.toLowerCase();
                
                if (wholeWord) {
                    const wordRegex = new RegExp(`\\b${searchPattern}\\b`, 'g');
                    isMatch = wordRegex.test(searchText);
                } else {
                    isMatch = searchText.includes(searchPattern);
                }
            }

            if (isMatch) {
                item.classList.add('search-highlight');
                matches++;
            } else {
                item.classList.remove('search-highlight');
            }
        });

        return matches;
    }

    // JSON 路径查找
    findJsonPath(obj, targetValue, currentPath = '') {
        const paths = [];

        if (obj === targetValue) {
            paths.push(currentPath || 'root');
            return paths;
        }

        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const newPath = currentPath ? `${currentPath}.${key}` : key;
                paths.push(...this.findJsonPath(value, targetValue, newPath));
            }
        }

        return paths;
    }

    // JSON 结构分析
    analyzeJsonStructure(obj, depth = 0) {
        const analysis = {
            depth: depth,
            type: this.getDetailedType(obj),
            size: 0,
            keys: [],
            values: [],
            children: {}
        };

        if (Array.isArray(obj)) {
            analysis.size = obj.length;
            obj.forEach((item, index) => {
                analysis.children[index] = this.analyzeJsonStructure(item, depth + 1);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            const keys = Object.keys(obj);
            analysis.size = keys.length;
            analysis.keys = keys;
            
            keys.forEach(key => {
                analysis.values.push(obj[key]);
                analysis.children[key] = this.analyzeJsonStructure(obj[key], depth + 1);
            });
        }

        return analysis;
    }

    getDetailedType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Date) return 'date';
        if (typeof value === 'object') return 'object';
        return typeof value;
    }

    // 数据验证
    validateJsonData(obj, schema = null) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // 基本验证
        if (typeof obj !== 'object') {
            validation.isValid = false;
            validation.errors.push('根级别必须是对象或数组');
        }

        // 循环引用检查
        const seen = new WeakSet();
        const checkCircular = (o, path = '') => {
            if (typeof o === 'object' && o !== null) {
                if (seen.has(o)) {
                    validation.warnings.push(`发现循环引用: ${path}`);
                    return;
                }
                seen.add(o);
                
                for (const [key, value] of Object.entries(o)) {
                    checkCircular(value, path ? `${path}.${key}` : key);
                }
                
                seen.delete(o);
            }
        };

        checkCircular(obj);

        // 性能建议
        const analysis = this.analyzeJsonStructure(obj);
        if (analysis.depth > 10) {
            validation.suggestions.push('JSON结构层次过深，建议简化以提高性能');
        }

        return validation;
    }

    // 格式化选项
    formatWithOptions(obj, options = {}) {
        const {
            indent = 2,
            maxLineLength = 80,
            sortKeys = false,
            removeComments = false
        } = options;

        let formatted = obj;

        if (sortKeys) {
            formatted = this.sortObjectKeys(formatted);
        }

        return JSON.stringify(formatted, null, indent);
    }

    sortObjectKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.keys(obj)
                .sort()
                .reduce((sorted, key) => {
                    sorted[key] = this.sortObjectKeys(obj[key]);
                    return sorted;
                }, {});
        }
        return obj;
    }

    // 导出为不同格式
    exportAs(format, data = null) {
        const jsonData = data || this.jsonData;
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
            case 'csv':
                content = this.jsonToCsv(jsonData);
                filename = 'data.csv';
                mimeType = 'text/csv';
                break;
            case 'xml':
                content = this.jsonToXml(jsonData);
                filename = 'data.xml';
                mimeType = 'application/xml';
                break;
            case 'yaml':
                content = this.jsonToYaml(jsonData);
                filename = 'data.yaml';
                mimeType = 'text/yaml';
                break;
            default:
                content = JSON.stringify(jsonData, null, 2);
                filename = 'data.json';
                mimeType = 'application/json';
        }

        this.downloadFile(content, filename, mimeType);
    }

    jsonToCsv(obj) {
        if (!Array.isArray(obj)) {
            throw new Error('CSV导出需要数组格式的JSON');
        }

        if (obj.length === 0) return '';

        const headers = Object.keys(obj[0]);
        const csvHeaders = headers.join(',');
        const csvRows = obj.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            }).join(',')
        );

        return [csvHeaders, ...csvRows].join('\n');
    }

    jsonToXml(obj, rootElement = 'root') {
        const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
        
        const convertToXml = (data, tagName) => {
            if (Array.isArray(data)) {
                return data.map(item => convertToXml(item, 'item')).join('');
            } else if (typeof data === 'object' && data !== null) {
                const elements = Object.entries(data)
                    .map(([key, value]) => convertToXml(value, key))
                    .join('');
                return `<${tagName}>${elements}</${tagName}>`;
            } else {
                return `<${tagName}>${data}</${tagName}>`;
            }
        };

        return xmlHeader + convertToXml(obj, rootElement);
    }

    jsonToYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        
        if (Array.isArray(obj)) {
            return obj.map(item => 
                spaces + '- ' + (typeof item === 'object' ? 
                    '\n' + this.jsonToYaml(item, indent + 1) : 
                    item)
            ).join('\n');
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj).map(([key, value]) => 
                spaces + key + ': ' + (typeof value === 'object' ? 
                    '\n' + this.jsonToYaml(value, indent + 1) : 
                    value)
            ).join('\n');
        } else {
            return String(obj);
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 全局实例
const jsonViewer = new JsonViewer();

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .drag-highlight {
        background: rgba(102, 126, 234, 0.1) !important;
        border: 2px dashed #667eea !important;
    }
    
    .notification {
        border-left: 4px solid currentColor;
        font-weight: 500;
    }
`;
document.head.appendChild(style);