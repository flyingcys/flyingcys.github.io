/**
 * 全局语言切换器组件
 * 支持所有页面的统一语言切换
 */
class GlobalLanguageSwitcher {
    constructor(options = {}) {
        this.options = {
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left
            languages: [
                { code: 'zh', name: '简体中文', flag: '🇨🇳' },
                { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼' },
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'ja', name: '日本語', flag: '🇯🇵' },
                { code: 'ko', name: '한국어', flag: '🇰🇷' },
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                { code: 'pt', name: 'Português', flag: '🇵🇹' }
            ],
            defaultLanguage: 'zh',
            storageKey: 'global-language-preference',
            onLanguageChange: null,
            ...options
        };
        
        this.currentLanguage = this.getCurrentLanguage();
        this.isOpen = false;
        this.element = null;
        
        this.init();
    }
    
    init() {
        this.createSwitcher();
        this.bindEvents();
        this.loadLanguage(this.currentLanguage);
    }
    
    getCurrentLanguage() {
        // 优先级：URL参数 > localStorage > 浏览器语言 > 默认语言
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isValidLanguage(urlLang)) {
            return urlLang;
        }
        
        const storedLang = localStorage.getItem(this.options.storageKey);
        if (storedLang && this.isValidLanguage(storedLang)) {
            return storedLang;
        }
        
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hk')) {
            return 'zh-tw';
        } else if (browserLang.startsWith('zh')) {
            return 'zh';
        }
        
        const langCode = browserLang.split('-')[0];
        if (this.isValidLanguage(langCode)) {
            return langCode;
        }
        
        return this.options.defaultLanguage;
    }
    
    isValidLanguage(code) {
        return this.options.languages.some(lang => lang.code === code);
    }
    
    createSwitcher() {
        const currentLang = this.options.languages.find(lang => lang.code === this.currentLanguage);
        
        this.element = document.createElement('div');
        this.element.className = 'global-language-switcher';
        this.element.innerHTML = `
            <div class="lang-dropdown" id="globalLangDropdown">
                <button class="lang-dropdown-btn" id="globalLangDropdownBtn" 
                        title="切换语言 / Switch Language" aria-label="Language Switcher">
                    <span class="lang-flag" id="globalCurrentLangFlag">${currentLang.flag}</span>
                    <span class="lang-name" id="globalCurrentLangName">${currentLang.name}</span>
                    <span class="lang-arrow">▼</span>
                </button>
                <div class="lang-dropdown-menu" id="globalLangDropdownMenu">
                    ${this.options.languages.map(lang => `
                        <div class="lang-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                             data-lang="${lang.code}">
                            <span class="lang-flag">${lang.flag}</span>
                            <span class="lang-name">${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // 设置位置
        this.setPosition();
        
        document.body.appendChild(this.element);
    }
    
    setPosition() {
        const positions = {
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' }
        };
        
        const pos = positions[this.options.position] || positions['top-right'];
        Object.assign(this.element.style, pos);
    }
    
    bindEvents() {
        const dropdown = this.element.querySelector('#globalLangDropdown');
        const btn = this.element.querySelector('#globalLangDropdownBtn');
        const menu = this.element.querySelector('#globalLangDropdownMenu');
        
        // 点击按钮切换下拉菜单
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // 点击语言选项
        menu.addEventListener('click', (e) => {
            const option = e.target.closest('.lang-option');
            if (option) {
                const langCode = option.dataset.lang;
                this.changeLanguage(langCode);
            }
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // ESC键关闭下拉菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
            }
        });
    }
    
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        const dropdown = this.element.querySelector('#globalLangDropdown');
        dropdown.classList.add('active');
        this.isOpen = true;
    }
    
    closeDropdown() {
        const dropdown = this.element.querySelector('#globalLangDropdown');
        dropdown.classList.remove('active');
        this.isOpen = false;
    }
    
    async changeLanguage(langCode) {
        if (langCode === this.currentLanguage) {
            this.closeDropdown();
            return;
        }
        
        this.currentLanguage = langCode;
        
        // 保存到localStorage
        localStorage.setItem(this.options.storageKey, langCode);
        
        // 更新URL参数（不刷新页面）
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        window.history.replaceState({}, '', url);
        
        // 更新UI
        this.updateUI();
        
        // 加载语言
        await this.loadLanguage(langCode);
        
        // 触发回调
        if (this.options.onLanguageChange) {
            this.options.onLanguageChange(langCode);
        }
        
        this.closeDropdown();
    }
    
    updateUI() {
        const currentLang = this.options.languages.find(lang => lang.code === this.currentLanguage);
        
        // 更新按钮显示
        this.element.querySelector('#globalCurrentLangFlag').textContent = currentLang.flag;
        this.element.querySelector('#globalCurrentLangName').textContent = currentLang.name;
        
        // 更新选项状态
        this.element.querySelectorAll('.lang-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
        });
    }
    
    async loadLanguage(langCode) {
        try {
            // 动态加载语言文件
            const response = await fetch(`/i18n/languages/${langCode}.js`);
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${langCode}`);
            }
            
            const scriptText = await response.text();
            
            // 创建临时script标签执行语言文件
            const script = document.createElement('script');
            script.textContent = scriptText;
            document.head.appendChild(script);
            document.head.removeChild(script);
            
            // 等待语言数据加载
            if (window.LANGUAGE_DATA && window.LANGUAGE_DATA[langCode]) {
                this.applyTranslations(window.LANGUAGE_DATA[langCode]);
            }
            
        } catch (error) {
            console.error('Failed to load language:', error);
            // 回退到默认语言
            if (langCode !== this.options.defaultLanguage) {
                this.loadLanguage(this.options.defaultLanguage);
            }
        }
    }
    
    applyTranslations(translations) {
        // 应用翻译到页面元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // 应用翻译到属性
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (translations[key]) {
                element.title = translations[key];
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
        
        // 更新页面标题
        if (translations.title) {
            document.title = translations.title;
        }
        
        // 更新HTML lang属性
        document.documentElement.lang = this.currentLanguage;
    }
    
    // 公共API
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    setLanguage(langCode) {
        if (this.isValidLanguage(langCode)) {
            this.changeLanguage(langCode);
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// 全局实例
window.GlobalLanguageSwitcher = GlobalLanguageSwitcher;

// 自动初始化（如果页面包含了CSS文件）
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已经有语言切换器
    if (!document.querySelector('.global-language-switcher') && 
        !document.querySelector('.language-switcher')) {
        
        // 自动创建全局语言切换器
        window.globalLanguageSwitcher = new GlobalLanguageSwitcher({
            onLanguageChange: (langCode) => {
                console.log('Language changed to:', langCode);
                
                // 触发自定义事件
                window.dispatchEvent(new CustomEvent('languageChanged', {
                    detail: { language: langCode }
                }));
            }
        });
    }
}); 