// 中文语言包 (Simplified Chinese)
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['zh'] = {
        // 主页面翻译
        'page_title': '工具箱 - Tools',
        'main_title': '工具箱',
        'main_subtitle': '实用工具集合 - 提升您的工作效率',
        'footer_text': '选择上方工具开始使用 | 所有工具均可在浏览器中直接运行',
        
        // 工具翻译 - 对应您页面上的实际工具
        'tuya_tool_title': 'TuyaOpen',
        'tuya_tool_desc': '基于 Web Serial API 的串口通信工具，支持设备调试、固件烧录等功能，无需安装额外软件。',
        
        'mp3_tool_title': 'MP3 转换工具',
        'mp3_tool_desc': '将MP3文件转换为C语言数组，方便嵌入式开发使用，支持在线转换，无需安装额外软件。',
        
        'json_tool_title': 'JSON 可视化工具',
        'json_tool_desc': '功能强大的JSON可视化编辑器，支持树形结构显示、节点折叠展开、增删改查操作，让JSON数据一目了然。',
        
        'xml_tool_title': 'XML 可视化工具',
        'xml_tool_desc': '专业的XML文档可视化编辑器，支持元素属性编辑、CDATA处理、命名空间显示，完整的XML操作体验。',
        
        // JSON 工具页面翻译
        'json_page_title': 'JSON 可视化工具',
        'json_editor': 'JSON 编辑器',
        'json_viewer': 'JSON 预览',
        'format_json': '格式化',
        'minify_json': '压缩',
        'validate_json': '验证',
        'clear_json': '清空',
        'home_btn': '返回首页',
        'collapse_editor': '折叠编辑器',
        'collapse_viewer': '折叠预览',
        
        // 测试用翻译
        'test_title': '语言切换测试页面',
        'test_content': '这是中文测试内容。语言切换器运行正常。',
        'test_button': '中文按钮',
        'test_placeholder': '中文占位符',
        
        // 调试用
        'debug_title': '语言切换器调试页面（中文）',
        'debug_subtitle': '用于测试和调试多语言功能'
    };
    
    // 兼容旧版本系统
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['zh'] = window.LANGUAGE_DATA['zh'];
})(); 