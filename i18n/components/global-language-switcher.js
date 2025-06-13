// 全站通用语言切换器 - 支持10种语言，类似TuyaOpen的UI
class GlobalLanguageSwitcher {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'top-right',
            showFlags: options.showFlags !== false,
            showNames: options.showNames !== false,
            onLanguageChange: options.onLanguageChange || null,
            ...options
        };
        
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createSwitcher();
        this.bindEvents();
        
        // 监听全局i18n系统初始化完成
        window.addEventListener('globalI18nReady', (e) => {
            this.updateCurrentLanguage(e.detail.language);
        });
        
        // 监听语言变化事件
        window.addEventListener('languageChanged', (e) => {
            this.updateCurrentLanguage(e.detail.language);
        });
    }

    createSwitcher() {
        const switcherHTML = `
            <div class="global-lang-switcher" data-position="${this.options.position}">
                <div class="lang-dropdown" id="globalLangDropdown">
                    <button class="lang-dropdown-btn" id="globalLangDropdownBtn" title="切换语言 / Switch Language">
                        <span class="lang-flag" id="globalCurrentLangFlag">🇨🇳</span>
                        <span class="lang-name" id="globalCurrentLangName">简体中文</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="lang-dropdown-menu" id="globalLangDropdownMenu">
                        <div class="lang-option" data-lang="zh">
                            <span class="lang-flag">🇨🇳</span>
                            <span class="lang-name">简体中文</span>
                        </div>
                        <div class="lang-option" data-lang="zh-tw">
                            <span class="lang-flag">🇹🇼</span>
                            <span class="lang-name">繁體中文</span>
                        </div>
                        <div class="lang-option" data-lang="en">
                            <span class="lang-flag">🇺🇸</span>
                            <span class="lang-name">English</span>
                        </div>
                        <div class="lang-option" data-lang="fr">
                            <span class="lang-flag">🇫🇷</span>
                            <span class="lang-name">Français</span>
                        </div>
                        <div class="lang-option" data-lang="de">
                            <span class="lang-flag">🇩🇪</span>
                            <span class="lang-name">Deutsch</span>
                        </div>
                        <div class="lang-option" data-lang="es">
                            <span class="lang-flag">🇪🇸</span>
                            <span class="lang-name">Español</span>
                        </div>
                        <div class="lang-option" data-lang="ja">
                            <span class="lang-flag">🇯🇵</span>
                            <span class="lang-name">日本語</span>
                        </div>
                        <div class="lang-option" data-lang="ko">
                            <span class="lang-flag">🇰🇷</span>
                            <span class="lang-name">한국어</span>
                        </div>
                        <div class="lang-option" data-lang="ru">
                            <span class="lang-flag">🇷🇺</span>
                            <span class="lang-name">Русский</span>
                        </div>
                        <div class="lang-option" data-lang="pt">
                            <span class="lang-flag">🇵🇹</span>
                            <span class="lang-name">Português</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', switcherHTML);
        
        // 获取元素引用
        this.switcher = document.querySelector('.global-lang-switcher');
        this.dropdownBtn = document.getElementById('globalLangDropdownBtn');
        this.dropdownMenu = document.getElementById('globalLangDropdownMenu');
        this.currentLangFlag = document.getElementById('globalCurrentLangFlag');
        this.currentLangName = document.getElementById('globalCurrentLangName');
    }

    bindEvents() {
        // 下拉按钮点击事件
        this.dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // 语言选项点击事件
        this.dropdownMenu.addEventListener('click', (e) => {
            const langOption = e.target.closest('.lang-option');
            if (langOption) {
                const langCode = langOption.dataset.lang;
                this.selectLanguage(langCode);
            }
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.switcher.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // ESC键关闭下拉菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
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
        this.dropdownMenu.classList.add('show');
        this.dropdownBtn.classList.add('active');
        this.isOpen = true;
    }

    closeDropdown() {
        this.dropdownMenu.classList.remove('show');
        this.dropdownBtn.classList.remove('active');
        this.isOpen = false;
    }

    async selectLanguage(langCode) {
        this.closeDropdown();
        
        // 使用全局i18n系统切换语言
        if (window.globalI18nLoader) {
            const success = await window.globalI18nLoader.setLanguage(langCode);
            if (success) {
                this.updateCurrentLanguage(langCode);
                
                // 调用回调函数
                if (this.options.onLanguageChange) {
                    this.options.onLanguageChange(langCode);
                }
            }
        }
    }

    updateCurrentLanguage(langCode) {
        const langInfo = window.globalI18nLoader ? window.globalI18nLoader.getLanguageInfo(langCode) : null;
        
        if (langInfo) {
            this.currentLangFlag.textContent = langInfo.flag;
            this.currentLangName.textContent = langInfo.nativeName;
        }
        
        // 更新选中状态
        this.dropdownMenu.querySelectorAll('.lang-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.lang === langCode);
        });
    }

    getCurrentLanguage() {
        return window.globalI18nLoader ? window.globalI18nLoader.getCurrentLanguage() : 'zh';
    }
} 