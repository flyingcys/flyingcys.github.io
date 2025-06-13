# 🌐 统一多语言系统使用说明

## 📋 系统概述

本项目已成功整合为**全站统一多语言系统**，基于TuyaOpen成熟的i18n架构，支持10种语言无缝切换。

### 🏗️ 架构设计

```
📁 i18n/
├── 🎯 global-i18n-loader.js      # 核心加载器
├── 📱 components/
│   ├── global-language-switcher.js   # 统一语言切换器
│   └── global-language-switcher.css  # 切换器样式
└── 🗣️ languages/
    ├── zh.js, en.js (主页面翻译)
    ├── zh-tw.js, ja.js (繁中+日语)
    ├── fr.js, de.js, es.js (欧语)
    └── ko.js, ru.js, pt.js (其他)
```

## 🚀 支持语言

| 语言代码 | 语言名称 | 本地名称 | 标志 |
|---------|---------|----------|------|
| `zh` | 中文 | 简体中文 | 🇨🇳 |
| `en` | 英语 | English | 🇺🇸 |
| `zh-tw` | 繁体中文 | 繁體中文 | 🇹🇼 |
| `ja` | 日语 | 日本語 | 🇯🇵 |
| `ko` | 韩语 | 한국어 | 🇰🇷 |
| `fr` | 法语 | Français | 🇫🇷 |
| `de` | 德语 | Deutsch | 🇩🇪 |
| `es` | 西班牙语 | Español | 🇪🇸 |
| `ru` | 俄语 | Русский | 🇷🇺 |
| `pt` | 葡萄牙语 | Português | 🇵🇹 |

## 🎯 核心功能

### ✅ 自动功能
- 🔍 **智能检测**：自动检测浏览器语言
- 💾 **记忆保存**：用户选择自动保存到localStorage
- 🔄 **状态同步**：页面间语言状态无缝传递
- 📱 **响应式UI**：所有设备上完美显示

### ✅ 手动功能
- 🎨 **可视化切换器**：右上角精美下拉菜单
- 🌐 **实时切换**：点击即时生效，无需刷新
- 🚀 **跨页面传递**：主页切换→子页面自动同步

## 📄 页面支持状态

| 页面 | 多语言状态 | 语言切换器 | 说明 |
|------|-----------|-----------|------|
| 🏠 主页面 | ✅ 完整支持 | ✅ 10语言 | 全功能完成 |
| 🛠️ TuyaOpen | ✅ 完整支持 | ✅ 10语言 | 原有系统保留 |
| 📄 JSON工具 | ✅ 基础支持 | ✅ 10语言 | 已添加框架 |
| 📄 XML工具 | ✅ 基础支持 | ✅ 10语言 | 已添加框架 |
| 🎵 MP3工具 | ✅ 基础支持 | ✅ 10语言 | 已添加框架 |

## 🧪 测试页面

访问 `/test-unified-i18n.html` 查看：
- 系统状态检查
- 语言切换演示
- 实时信息显示
- 功能完整性测试

## 💻 使用方法

### 对于新页面
```html
<!-- 加载统一系统 -->
<script src="../i18n/global-i18n-loader.js"></script>
<link rel="stylesheet" href="../i18n/components/global-language-switcher.css">
<script src="../i18n/components/global-language-switcher.js"></script>

<!-- 标记需要翻译的元素 -->
<h1 data-i18n="page_title">默认文本</h1>
<p data-i18n="description">描述文本</p>

<script>
// 初始化多语言系统
document.addEventListener('DOMContentLoaded', async function() {
    if (window.globalI18nLoader) {
        await window.globalI18nLoader.init();
        
        // 创建语言切换器
        new GlobalLanguageSwitcher({
            position: 'top-right',
            onLanguageChange: (langCode) => {
                console.log('语言已切换到:', langCode);
            }
        });
    }
});
</script>
```

### 语言优先级
1. **URL参数** (`?lang=en`)
2. **localStorage存储** (`selectedLanguage`)  
3. **浏览器检测** (`navigator.language`)
4. **默认语言** (`zh`)

## 🔄 语言传递机制

```javascript
// 主页面自动为所有工具链接添加语言参数
const toolLinks = document.querySelectorAll('.tool-card');
toolLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const currentLang = window.globalI18nLoader.getCurrentLanguage();
        const url = new URL(this.href);
        url.searchParams.set('lang', currentLang);
        this.href = url.toString();
    });
});
```

## 🛠️ 开发者接口

```javascript
// 获取当前语言
const currentLang = window.globalI18nLoader.getCurrentLanguage();

// 设置语言
await window.globalI18nLoader.setLanguage('en');

// 获取翻译
const text = window.globalI18nLoader.t('key_name');

// 获取可用语言列表
const languages = window.globalI18nLoader.getAvailableLanguages();

// 获取语言信息
const langInfo = window.globalI18nLoader.getLanguageInfo('en');
// 返回: { name: '英语', nativeName: 'English', flag: '🇺🇸' }
```

## 🎊 成功案例

### 主页面效果
- ✅ 右上角显示10语言切换器
- ✅ 所有工具描述完整翻译
- ✅ 语言选择自动保存
- ✅ 点击工具时自动传递语言参数

### TuyaOpen集成效果
- ✅ 从主页面带参数进入时自动切换语言
- ✅ 保持原有复杂的多语言功能
- ✅ 与全局系统完美兼容

### 其他工具效果
- ✅ 语言切换器正常显示
- ✅ 基础框架已搭建完成
- ✅ 可根据需要扩展具体翻译内容

## 🚀 下一步扩展

如需为具体工具页面添加更多翻译：

1. **扩展语言文件**：在对应语言文件中添加翻译键值
2. **标记元素**：为需要翻译的HTML元素添加`data-i18n`属性
3. **测试验证**：使用语言切换器测试效果

## 🎯 技术优势

- **🏗️ 架构统一**：避免重复开发，便于维护
- **⚡ 性能优化**：按需加载语言文件
- **🎨 用户友好**：精美的切换器UI
- **🔧 开发便利**：简单的API接口
- **📱 响应式**：全设备适配
- **🌐 国际化**：完整的i18n解决方案

---

**🎉 恭喜！您的网站现在拥有了企业级的多语言支持系统！** 