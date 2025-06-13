// XML工具 - 中文语言包
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['zh'] = {
        // 页面标题和基本信息
        'xml_tool_title': 'XML 可视化工具',
        'page_title': 'XML 可视化工具',
        'home_btn': '返回首页',
        
        // 工具栏按钮
        'format_btn': '✨ 格式化',
        'compress_btn': '🗜️ 压缩', 
        'validate_btn': '✅ 验证',
        'clear_btn': '🗑️ 清空',
        'import_btn': '📁 导入',
        'export_btn': '💾 导出',
        'expand_all_btn': '📖 展开全部',
        'collapse_all_btn': '📕 收起全部',
        
        // 面板标题
        'editor_panel_title': '📝 XML 编辑器',
        'viewer_panel_title': '🔍 XML 预览',
        
        // 面板控制按钮
        'collapse_editor': '折叠编辑器',
        'collapse_viewer': '折叠预览',
        'expand_editor': '展开编辑器', 
        'expand_viewer': '展开预览',
        
        // 输入框和占位符
        'editor_placeholder': '在此输入或粘贴您的XML数据...',
        'search_placeholder': '搜索...',
        'edit_value_placeholder': '输入XML元素或属性值',
        
        // 状态和统计信息
        'status_valid': '✅ XML 格式正确',
        'status_invalid': '❌ XML 格式错误', 
        'stats_template': '行数: {lines} | 字符数: {chars}',
        'xml_empty': '<!-- XML视图将在这里渲染 -->',
        
        // 错误和提示信息
        'format_error': '格式化失败：XML 格式不正确',
        'compress_error': '压缩失败：XML 格式不正确',
        'export_error': '导出失败：XML 格式不正确',
        'import_success': 'XML 文件导入成功',
        'import_error': '文件导入失败',
        'clear_confirm': '确定要清空编辑器内容吗？',
        
        // XML 节点类型标签
        'xml_element': '元素',
        'xml_attribute': '属性',
        'xml_text': '文本',
        'xml_comment': '注释',
        'xml_cdata': 'CDATA',
        
        // 操作按钮
        'add_element': '添加元素',
        'add_attribute': '添加属性',
        'delete_node': '删除节点',
        'edit_value': '编辑值',
        'copy_xpath': '复制 XPath',
        
        // 弹窗标题
        'edit_dialog_title': '编辑值',
        'confirm_dialog_title': '确认操作',
        'add_dialog_title': '添加新节点'
    };
    
    // 兼容性
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['zh'] = window.LANGUAGE_DATA['zh'];
})(); 