// 全站通用多语言加载器 - 基于TuyaOpen的成熟系统
class GlobalI18nLoader {
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
        this.storageKey = 'selectedLanguage';
        
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
            localStorage.setItem(this.storageKey, langCode);
            this.updatePageText();
            this.updatePageTitle();
            
            // 触发语言变更事件
            const event = new CustomEvent('languageChanged', { 
                detail: { 
                    language: langCode,
                    languageInfo: this.getLanguageInfo(langCode)
                } 
            });
            window.dispatchEvent(event);
            
            return true;
        }
        return false;
    }
    
    // 获取语言信息
    getLanguageInfo(langCode) {
        const languageMap = {
            'zh': { name: '简体中文', nativeName: '简体中文', flag: '🇨🇳' },
            'zh-tw': { name: '繁体中文', nativeName: '繁體中文', flag: '🇹🇼' },
            'en': { name: '英语', nativeName: 'English', flag: '🇺🇸' },
            'ja': { name: '日语', nativeName: '日本語', flag: '🇯🇵' },
            'ko': { name: '韩语', nativeName: '한국어', flag: '🇰🇷' },
            'ru': { name: '俄语', nativeName: 'Русский', flag: '🇷🇺' },
            'pt': { name: '葡萄牙语', nativeName: 'Português', flag: '🇵🇹' },
            'es': { name: '西班牙语', nativeName: 'Español', flag: '🇪🇸' },
            'de': { name: '德语', nativeName: 'Deutsch', flag: '🇩🇪' },
            'fr': { name: '法语', nativeName: 'Français', flag: '🇫🇷' }
        };
        
        return languageMap[langCode] || { name: langCode, nativeName: langCode, flag: '🌐' };
    }
    
    // 更新页面文本
    updatePageText() {
        this.updateElements();
        
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
        
        this.updatePageTitle();
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
    
    // 检测系统默认语言
    detectSystemLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        console.log('检测到系统语言:', browserLang);
        
        // 语言映射表
        const languageMap = {
            'zh': 'zh',           'zh-CN': 'zh',        'zh-Hans': 'zh',      
            'zh-TW': 'zh-tw',     'zh-Hant': 'zh-tw',   
            'en': 'en',           'en-US': 'en',        'en-GB': 'en',        
            'ja': 'ja',           'ja-JP': 'ja',        
            'ko': 'ko',           'ko-KR': 'ko',        
            'fr': 'fr',           'fr-FR': 'fr',        
            'de': 'de',           'de-DE': 'de',        
            'es': 'es',           'es-ES': 'es',        
            'pt': 'pt',           'pt-BR': 'pt',        'pt-PT': 'pt',        
            'ru': 'ru',           'ru-RU': 'ru'         
        };
        
        let detectedLang = languageMap[browserLang];
        
        if (!detectedLang) {
            const langPrefix = browserLang.split('-')[0];
            detectedLang = languageMap[langPrefix];
        }
        
        if (!detectedLang) {
            console.log('系统语言不支持，回退到中文');
            detectedLang = 'zh';
        }
        
        console.log('映射后的语言:', detectedLang);
        return detectedLang;
    }

    // 初始化
    async init() {
        // 检查URL参数中的语言设置
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get('lang');
        
        // 从localStorage读取用户偏好语言
        const savedLang = localStorage.getItem(this.storageKey);
        
        // 检测系统默认语言
        const systemLang = this.detectSystemLanguage();
        
        // 确定要使用的语言（优先级：URL参数 > 用户保存的偏好 > 系统语言）
        const targetLang = langFromUrl || savedLang || systemLang;
        
        console.log('全站语言选择过程:', {
            urlParam: langFromUrl,
            savedPreference: savedLang,
            systemDetected: systemLang,
            finalChoice: targetLang
        });
        
        // 预加载中文（作为回退语言）
        await this.loadLanguage('zh');
        
        // 预加载英文（常用语言）
        await this.loadLanguage('en');
        
        // 如果目标语言不是中文或英文，也加载它
        if (targetLang !== 'zh' && targetLang !== 'en') {
            const loaded = await this.loadLanguage(targetLang);
            if (!loaded) {
                console.warn(`语言 ${targetLang} 加载失败，回退到中文`);
                this.currentLanguage = 'zh';
            } else {
                this.currentLanguage = targetLang;
            }
        } else {
            this.currentLanguage = targetLang;
        }
        
        // 保存当前语言设置
        localStorage.setItem(this.storageKey, this.currentLanguage);
        
        // 更新页面文本
        this.updatePageText();
        
        // 触发语言设置完成事件
        const event = new CustomEvent('globalI18nReady', { 
            detail: { 
                language: this.currentLanguage,
                availableLanguages: this.availableLanguages 
            } 
        });
        window.dispatchEvent(event);
        
        console.log('全站多语言系统初始化完成，当前语言:', this.currentLanguage);
    }

    updatePageTitle() {
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement && titleElement.dataset.i18n) {
            const translatedTitle = this.t(titleElement.dataset.i18n);
            document.title = translatedTitle;
        }
    }

    updateElements() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.tagName.toLowerCase() === 'option') {
                element.textContent = text;
            } else {
                element.textContent = text;
            }
        });
    }
    
    // 获取可用语言列表
    getAvailableLanguages() {
        return Object.keys(this.availableLanguages);
    }
    
    // 检查语言是否已加载
    isLanguageLoaded(langCode) {
        return this.loadedLanguages.has(langCode);
    }
}

// 创建全局实例
window.globalI18nLoader = new GlobalI18nLoader();

// 兼容性接口
window.i18n = {
    t: (...args) => window.globalI18nLoader.t(...args),
    setLanguage: (lang) => window.globalI18nLoader.setLanguage(lang),
    getCurrentLanguage: () => window.globalI18nLoader.getCurrentLanguage(),
    updatePageText: () => window.globalI18nLoader.updatePageText(),
    getAvailableLanguages: () => window.globalI18nLoader.getAvailableLanguages(),
    getLanguageInfo: (lang) => window.globalI18nLoader.getLanguageInfo(lang)
}; 