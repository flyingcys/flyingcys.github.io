// 多语言加载器
class I18nLoader {
    constructor() {
        this.loadedLanguages = new Set();
        this.availableLanguages = {
            'zh': 'i18n/languages/zh.js',
            'en': 'i18n/languages/en.js', 
            'ja': 'i18n/languages/ja.js',
            'zh-tw': 'i18n/languages/zh-tw.js',
            'ko': 'i18n/languages/ko.js',
            'ru': 'i18n/languages/ru.js',
            'pt': 'i18n/languages/pt.js',
            'es': 'i18n/languages/es.js',
            'de': 'i18n/languages/de.js',
            'fr': 'i18n/languages/fr.js'
        };
        this.currentLanguage = 'zh';
        
        // 初始化全局语言存储
        window.i18nLanguages = window.i18nLanguages || {};
    }
    
    // 异步加载语言文件
    async loadLanguage(langCode) {
        if (this.loadedLanguages.has(langCode)) {
            return true; // 已加载
        }
        
        const scriptPath = this.availableLanguages[langCode];
        if (!scriptPath) {
            console.warn(`Language ${langCode} not available`);
            return false;
        }
        
        try {
            await this.loadScript(scriptPath);
            this.loadedLanguages.add(langCode);
            console.log(`Language ${langCode} loaded successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to load language ${langCode}:`, error);
            return false;
        }
    }
    
    // 动态加载脚本
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // 获取翻译文本
    t(key, ...args) {
        const langData = window.i18nLanguages[this.currentLanguage];
        if (!langData) {
            console.warn(`Language ${this.currentLanguage} not loaded`);
            return key;
        }
        
        let text = langData[key];
        if (!text) {
            // 回退到中文
            const fallbackData = window.i18nLanguages['zh'];
            text = fallbackData ? fallbackData[key] : key;
        }
        
        // 处理占位符替换
        if (text && args.length > 0) {
            args.forEach((arg, index) => {
                text = text.replace(`{${index}}`, arg);
            });
        }
        
        return text || key;
    }
    
    // 切换语言
    async setLanguage(langCode) {
        // 加载语言文件
        const loaded = await this.loadLanguage(langCode);
        if (loaded) {
            this.currentLanguage = langCode;
            localStorage.setItem('language', langCode);
            this.updatePageText();
            return true;
        }
        return false;
    }
    
    // 更新页面文本
    updatePageText() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            element.textContent = text;
        });
        
        // 更新所有带有 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // 更新所有带有 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // 更新document title
        document.title = this.t('title');
    }
    
    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    // 预加载常用语言
    async preloadLanguages(languages = ['zh', 'en']) {
        const promises = languages.map(lang => this.loadLanguage(lang));
        await Promise.all(promises);
    }
    
    // 获取已加载的语言列表
    getLoadedLanguages() {
        return Array.from(this.loadedLanguages);
    }
    
    // 获取可用语言列表
    getAvailableLanguages() {
        return Object.keys(this.availableLanguages);
    }
    
    // 检查语言是否已加载
    isLanguageLoaded(langCode) {
        return this.loadedLanguages.has(langCode);
    }
    
    // 初始化
    async init() {
        // 从localStorage读取用户偏好语言
        const savedLang = localStorage.getItem('language') || 'zh';
        
        // 预加载中文（默认语言）
        await this.loadLanguage('zh');
        
        // 如果保存的语言不是中文，也加载它
        if (savedLang !== 'zh') {
            await this.loadLanguage(savedLang);
        }
        
        // 设置当前语言
        this.currentLanguage = savedLang;
        
        // 更新页面文本
        this.updatePageText();
        
        // 触发语言设置完成事件，通知UI更新
        const event = new CustomEvent('i18nReady', { 
            detail: { language: savedLang } 
        });
        window.dispatchEvent(event);
        
        console.log('I18n system initialized with language:', savedLang);
    }
}

// 创建全局实例
window.i18nLoader = new I18nLoader();

// 为了兼容现有代码，创建简化的i18n对象
window.i18n = {
    t: (...args) => window.i18nLoader.t(...args),
    setLanguage: (lang) => window.i18nLoader.setLanguage(lang),
    getCurrentLanguage: () => window.i18nLoader.getCurrentLanguage(),
    updatePageText: () => window.i18nLoader.updatePageText()
}; 