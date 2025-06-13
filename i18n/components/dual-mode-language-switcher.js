/**
 * 双模式全局语言切换器组件
 * 支持自动检测和手动选择两种模式
 */

// 双模式语言切换器 - 生产版本
// 如需调试，请使用 debug-language-switcher.html 页面
class DualModeLanguageSwitcher {
    constructor(options = {}) {
        // 生产版本 - 简化日志
        try {
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
                storageKey: 'dual-mode-language-preference',
                modeStorageKey: 'language-detection-mode',
                showModeToggle: true,
                onLanguageChange: null,
                onModeChange: null,
                ...options
            };
            console.log('  - 选项设置完成');
            
            this.mode = this.getDetectionMode(); // 'auto' or 'manual'
            console.log('  - 检测模式:', this.mode);
            
            this.currentLanguage = this.getCurrentLanguage();
            console.log('  - 当前语言:', this.currentLanguage);
            
            this.isOpen = false;
            this.element = null;
            
            console.log('  - 开始初始化...');
            this.init();
            console.log('✅ DualModeLanguageSwitcher构造完成');
            
        } catch (error) {
            console.error('❌ DualModeLanguageSwitcher构造失败:', error);
            throw error;
        }
    }
    
    init() {
        try {
            console.log('  - 创建切换器界面...');
            this.createSwitcher();
            console.log('  - 界面创建完成');
            
            console.log('  - 绑定事件...');
            this.bindEvents();
            console.log('  - 事件绑定完成');
            
            console.log('  - 加载语言文件...');
            this.loadLanguage(this.currentLanguage);
            console.log('  - 语言加载开始');
            
            // 如果是自动模式，监听语言变化
            if (this.mode === 'auto') {
                console.log('  - 设置自动检测...');
                this.setupAutoDetection();
                console.log('  - 自动检测设置完成');
            }
        } catch (error) {
            console.error('❌ init()方法失败:', error);
            throw error;
        }
    }
    
    getDetectionMode() {
        const storedMode = localStorage.getItem(this.options.modeStorageKey);
        return storedMode === 'manual' ? 'manual' : 'auto';
    }
    
    setDetectionMode(mode) {
        this.mode = mode;
        localStorage.setItem(this.options.modeStorageKey, mode);
        
        if (mode === 'auto') {
            this.setupAutoDetection();
            // 重新检测并应用系统语言
            const detectedLang = this.detectSystemLanguage();
            this.changeLanguage(detectedLang);
        }
        
        this.updateModeDisplay();
        
        // 触发模式变更回调
        if (this.options.onModeChange) {
            this.options.onModeChange(mode);
        }
    }
    
    getCurrentLanguage() {
        // 优先级：URL参数 > 手动模式的localStorage > 自动检测 > 默认语言
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isValidLanguage(urlLang)) {
            return urlLang;
        }
        
        if (this.mode === 'manual') {
            const storedLang = localStorage.getItem(this.options.storageKey);
            if (storedLang && this.isValidLanguage(storedLang)) {
                return storedLang;
            }
        }
        
        // 自动模式或无手动设置时，检测系统语言
        return this.detectSystemLanguage();
    }
    
    detectSystemLanguage() {
        const browserLang = navigator.language.toLowerCase();
        console.log('检测到系统语言:', browserLang);
        
        // 语言映射表
        const languageMap = {
            'zh': 'zh', 'zh-cn': 'zh', 'zh-hans': 'zh',
            'zh-tw': 'zh-tw', 'zh-hk': 'zh-tw', 'zh-hant': 'zh-tw',
            'en': 'en', 'en-us': 'en', 'en-gb': 'en',
            'ja': 'ja', 'ja-jp': 'ja',
            'ko': 'ko', 'ko-kr': 'ko',
            'fr': 'fr', 'fr-fr': 'fr',
            'de': 'de', 'de-de': 'de',
            'es': 'es', 'es-es': 'es',
            'pt': 'pt', 'pt-br': 'pt', 'pt-pt': 'pt',
            'ru': 'ru', 'ru-ru': 'ru'
        };
        
        // 完整匹配
        let detectedLang = languageMap[browserLang];
        
        // 前缀匹配
        if (!detectedLang) {
            const langPrefix = browserLang.split('-')[0];
            detectedLang = languageMap[langPrefix];
        }
        
        // 回退到默认语言
        const finalLang = detectedLang || this.options.defaultLanguage;
        console.log('映射后的语言:', finalLang);
        return finalLang;
    }
    
    setupAutoDetection() {
        // 监听语言变化事件（某些浏览器支持）
        if ('onlanguagechange' in window) {
            window.addEventListener('languagechange', () => {
                if (this.mode === 'auto') {
                    const newLang = this.detectSystemLanguage();
                    if (newLang !== this.currentLanguage) {
                        this.changeLanguage(newLang);
                    }
                }
            });
        }
    }
    
    isValidLanguage(code) {
        return this.options.languages.some(lang => lang.code === code);
    }
    
    createSwitcher() {
        const currentLang = this.options.languages.find(lang => lang.code === this.currentLanguage);
        
        // 如果找不到当前语言，使用默认语言
        if (!currentLang) {
            console.warn('当前语言未找到:', this.currentLanguage, '使用默认语言:', this.options.defaultLanguage);
            this.currentLanguage = this.options.defaultLanguage;
            const defaultLang = this.options.languages.find(lang => lang.code === this.options.defaultLanguage);
            if (!defaultLang) {
                throw new Error(`默认语言 ${this.options.defaultLanguage} 在语言列表中不存在`);
            }
        }
        
        const finalLang = currentLang || this.options.languages.find(lang => lang.code === this.currentLanguage);
        
        this.element = document.createElement('div');
        this.element.className = 'dual-mode-language-switcher';
        this.element.innerHTML = `
            <div class="lang-switcher-container">
                <div class="lang-dropdown" id="dualLangDropdown">
                    <button class="lang-dropdown-btn" id="dualLangDropdownBtn" 
                            title="切换语言 / Switch Language" aria-label="Language Switcher">
                        <span class="lang-flag" id="dualCurrentLangFlag">${finalLang.flag}</span>
                        <span class="lang-name" id="dualCurrentLangName">${finalLang.name}</span>
                        <span class="lang-arrow">▼</span>
                    </button>
                    <div class="lang-dropdown-menu" id="dualLangDropdownMenu">
                        <div class="lang-mode-section">
                            <div class="mode-toggle" id="dualModeToggle">
                                <button class="mode-btn ${this.mode === 'auto' ? 'active' : ''}" 
                                        data-mode="auto" title="自动检测语言">
                                    🔄 自动
                                </button>
                                <button class="mode-btn ${this.mode === 'manual' ? 'active' : ''}" 
                                        data-mode="manual" title="手动选择语言">
                                    👤 手动
                                </button>
                            </div>
                        </div>
                        <div class="lang-options-section">
                            ${this.options.languages.map(lang => `
                                <div class="lang-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                                     data-lang="${lang.code}">
                                    <span class="lang-flag">${lang.flag}</span>
                                    <span class="lang-name">${lang.name}</span>
                                    ${this.mode === 'auto' && lang.code === this.currentLanguage ? 
                                        '<span class="auto-indicator">自动</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ${this.mode === 'auto' ? 
                    '<div class="mode-indicator" title="自动检测模式">🔄</div>' : 
                    '<div class="mode-indicator" title="手动选择模式">👤</div>'
                }
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
        const dropdown = this.element.querySelector('#dualLangDropdown');
        const btn = this.element.querySelector('#dualLangDropdownBtn');
        const menu = this.element.querySelector('#dualLangDropdownMenu');
        const modeToggle = this.element.querySelector('#dualModeToggle');
        
        // 点击按钮切换下拉菜单
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // 模式切换
        modeToggle.addEventListener('click', (e) => {
            const modeBtn = e.target.closest('.mode-btn');
            if (modeBtn) {
                const newMode = modeBtn.dataset.mode;
                this.setDetectionMode(newMode);
            }
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
        const dropdown = this.element.querySelector('#dualLangDropdown');
        dropdown.classList.add('active');
        this.isOpen = true;
    }
    
    closeDropdown() {
        const dropdown = this.element.querySelector('#dualLangDropdown');
        dropdown.classList.remove('active');
        this.isOpen = false;
    }
    
    async changeLanguage(langCode) {
        if (langCode === this.currentLanguage) {
            this.closeDropdown();
            return;
        }
        
        this.currentLanguage = langCode;
        
        // 只有在手动模式下才保存到localStorage
        if (this.mode === 'manual') {
            localStorage.setItem(this.options.storageKey, langCode);
        }
        
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
        this.element.querySelector('#dualCurrentLangFlag').textContent = currentLang.flag;
        this.element.querySelector('#dualCurrentLangName').textContent = currentLang.name;
        
        // 更新选项状态
        this.element.querySelectorAll('.lang-option').forEach(option => {
            const isActive = option.dataset.lang === this.currentLanguage;
            option.classList.toggle('active', isActive);
            
            // 更新自动指示器
            const autoIndicator = option.querySelector('.auto-indicator');
            if (autoIndicator) {
                autoIndicator.remove();
            }
            if (this.mode === 'auto' && isActive) {
                const indicator = document.createElement('span');
                indicator.className = 'auto-indicator';
                indicator.textContent = '自动';
                option.appendChild(indicator);
            }
        });
        
        this.updateModeDisplay();
    }
    
    updateModeDisplay() {
        // 更新模式按钮状态
        this.element.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.mode);
        });
        
        // 更新模式指示器
        const modeIndicator = this.element.querySelector('.mode-indicator');
        if (modeIndicator) {
            modeIndicator.textContent = this.mode === 'auto' ? '🔄' : '👤';
            modeIndicator.title = this.mode === 'auto' ? '自动检测模式' : '手动选择模式';
        }
    }
    
    async loadLanguage(langCode) {
        try {
            console.log(`🌐 开始加载语言文件: ${langCode}`);
            
            // 动态加载语言文件
            const basePath = this.getBasePath();
            const url = `${basePath}/i18n/languages/${langCode}.js`;
            console.log(`  - 请求URL: ${url}`);
            
            const response = await fetch(url);
            console.log(`  - 响应状态: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${langCode} (${response.status})`);
            }
            
            const scriptText = await response.text();
            console.log(`  - 脚本长度: ${scriptText.length} 字符`);
            
            // 创建临时script标签执行语言文件
            const script = document.createElement('script');
            script.textContent = scriptText;
            document.head.appendChild(script);
            document.head.removeChild(script);
            console.log(`  - 脚本已执行`);
            
            // 检查语言数据加载
            console.log(`  - 检查全局变量:`);
            console.log(`    • window.i18nLanguages存在:`, !!window.i18nLanguages);
            console.log(`    • window.i18nLanguages[${langCode}]存在:`, !!(window.i18nLanguages && window.i18nLanguages[langCode]));
            console.log(`    • window.LANGUAGE_DATA存在:`, !!window.LANGUAGE_DATA);
            console.log(`    • window.LANGUAGE_DATA[${langCode}]存在:`, !!(window.LANGUAGE_DATA && window.LANGUAGE_DATA[langCode]));
            
            // 优先使用新的全局语言系统
            let translations = null;
            if (window.LANGUAGE_DATA && window.LANGUAGE_DATA[langCode]) {
                translations = window.LANGUAGE_DATA[langCode];
                console.log(`  - 使用 LANGUAGE_DATA.${langCode}，翻译数量:`, Object.keys(translations).length);
            } else if (window.i18nLanguages && window.i18nLanguages[langCode]) {
                translations = window.i18nLanguages[langCode];
                console.log(`  - 使用 i18nLanguages.${langCode}，翻译数量:`, Object.keys(translations).length);
            }
            
            if (translations) {
                console.log(`  - 应用翻译...`);
                this.applyTranslations(translations);
                console.log(`✅ 语言文件 ${langCode} 加载并应用成功`);
            } else {
                console.warn(`⚠️ 语言数据 ${langCode} 未找到`);
            }
            
        } catch (error) {
            console.error(`❌ 加载语言文件失败 ${langCode}:`, error);
            // 回退到默认语言
            if (langCode !== this.options.defaultLanguage) {
                console.log(`🔄 回退到默认语言: ${this.options.defaultLanguage}`);
                this.loadLanguage(this.options.defaultLanguage);
            }
        }
    }
    
    getBasePath() {
        // 自动检测基础路径
        const currentPath = window.location.pathname;
        const depth = (currentPath.match(/\//g) || []).length - 1;
        return depth > 0 ? '../'.repeat(depth) : '.';
    }
    
    applyTranslations(translations) {
        console.log(`🔤 开始应用翻译，翻译对象键数量:`, Object.keys(translations).length);
        console.log(`  - 翻译键示例:`, Object.keys(translations).slice(0, 5));
        
        // 查找页面中的翻译元素
        const i18nElements = document.querySelectorAll('[data-i18n]');
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        
        console.log(`  - 找到 data-i18n 元素: ${i18nElements.length}`);
        console.log(`  - 找到 data-i18n-title 元素: ${titleElements.length}`);
        console.log(`  - 找到 data-i18n-placeholder 元素: ${placeholderElements.length}`);
        
        let translatedCount = 0;
        
        // 应用翻译到页面元素
        i18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            console.log(`    • 处理元素: ${element.tagName}[data-i18n="${key}"]`);
            
            if (translations[key]) {
                const translation = translations[key];
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                    console.log(`      ✅ 已更新placeholder: "${translation}"`);
                } else {
                    element.textContent = translation;
                    console.log(`      ✅ 已更新textContent: "${translation}"`);
                }
                translatedCount++;
            } else {
                console.log(`      ⚠️ 未找到翻译键: "${key}"`);
            }
        });
        
        // 应用翻译到属性
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (translations[key]) {
                element.title = translations[key];
                console.log(`    • 已更新title属性: ${key} -> "${translations[key]}"`);
                translatedCount++;
            }
        });
        
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
                console.log(`    • 已更新placeholder属性: ${key} -> "${translations[key]}"`);
                translatedCount++;
            }
        });
        
        // 更新页面标题
        const titleElement = document.querySelector('[data-i18n="page_title"]');
        if (titleElement && translations[titleElement.getAttribute('data-i18n')]) {
            document.title = translations[titleElement.getAttribute('data-i18n')];
            console.log(`    • 已更新页面标题: "${document.title}"`);
        }
        
        // 更新HTML lang属性
        document.documentElement.lang = this.currentLanguage;
        console.log(`    • 已更新HTML lang属性: "${this.currentLanguage}"`);
        
        console.log(`✅ 翻译应用完成，共更新 ${translatedCount} 个元素`);
    }
    
    // 公共API
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getCurrentMode() {
        return this.mode;
    }
    
    setLanguage(langCode) {
        this.changeLanguage(langCode);
    }
    
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

// 确保全局暴露
console.log('🔧 暴露DualModeLanguageSwitcher到全局作用域');
if (typeof window !== 'undefined') {
    window.DualModeLanguageSwitcher = DualModeLanguageSwitcher;
    console.log('✅ 已暴露到window.DualModeLanguageSwitcher');
} else {
    console.warn('⚠️ window对象不存在，无法暴露到全局');
}

// 验证暴露是否成功
if (typeof window !== 'undefined' && window.DualModeLanguageSwitcher) {
    console.log('✅ 全局暴露验证成功');
} else {
    console.error('❌ 全局暴露验证失败');
}

// 自动初始化（如果页面包含了CSS文件）
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已经有语言切换器
    if (!document.querySelector('.dual-mode-language-switcher') && 
        !document.querySelector('.global-language-switcher') &&
        !document.querySelector('.language-switcher')) {
        
        // 自动创建双模式语言切换器
        window.dualModeLanguageSwitcher = new DualModeLanguageSwitcher({
            onLanguageChange: (langCode) => {
                console.log('Language changed to:', langCode);
                
                // 触发自定义事件
                window.dispatchEvent(new CustomEvent('languageChanged', {
                    detail: { language: langCode }
                }));
            },
            onModeChange: (mode) => {
                console.log('Detection mode changed to:', mode);
                
                // 触发自定义事件
                window.dispatchEvent(new CustomEvent('languageModeChanged', {
                    detail: { mode: mode }
                }));
            }
        });
    }
}); 