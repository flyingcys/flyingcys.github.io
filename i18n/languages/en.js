// 英文语言包 (English)
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['en'] = {
        // 主页面翻译
        'page_title': 'Toolbox - Tools',
        'main_title': 'Toolbox',
        'main_subtitle': 'Practical Tool Collection - Boost Your Productivity',
        'footer_text': 'Select a tool above to get started | All tools run directly in your browser',
        
        // 工具翻译 - 对应您页面上的实际工具
        'tuya_tool_title': 'TuyaOpen',
        'tuya_tool_desc': 'Web Serial API-based serial communication tool that supports device debugging, firmware flashing, and more without installing additional software.',
        
        'mp3_tool_title': 'MP3 Converter Tool',
        'mp3_tool_desc': 'Convert MP3 files to C arrays for embedded development use. Supports online conversion without installing additional software.',
        
        'json_tool_title': 'JSON Visualization Tool',
        'json_tool_desc': 'Powerful JSON visualization editor supporting tree structure display, node collapse/expand, CRUD operations for clear JSON data visualization.',
        
        'xml_tool_title': 'XML Visualization Tool',
        'xml_tool_desc': 'Professional XML document visualization editor supporting element attribute editing, CDATA processing, namespace display for complete XML operation experience.',
        
        // JSON 工具页面翻译
        'json_page_title': 'JSON Visualization Tool',
        'json_editor': 'JSON Editor',
        'json_viewer': 'JSON Viewer',
        'format_json': 'Format',
        'minify_json': 'Minify',
        'validate_json': 'Validate',
        'clear_json': 'Clear',
        'home_btn': 'Back to Home',
        'collapse_editor': 'Collapse Editor',
        'collapse_viewer': 'Collapse Viewer',
        
        // 测试用翻译
        'test_title': 'Language Switcher Test Page',
        'test_content': 'This is English test content. Language switcher is working properly.',
        'test_button': 'English Button',
        'test_placeholder': 'English placeholder',
        
        // 调试用
        'debug_title': 'Language Switcher Debug Page (English)',
        'debug_subtitle': 'For testing and debugging multilingual functionality'
    };
    
    // 兼容旧版本系统
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['en'] = window.LANGUAGE_DATA['en'];
})(); 