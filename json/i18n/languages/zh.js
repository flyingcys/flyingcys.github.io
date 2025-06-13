// JSON工具 - 中文语言包
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['zh'] = {
        // 页面标题和基本信息
        'json_tool_title': 'JSON 可视化工具',
        'page_title': 'JSON 可视化工具',
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
        'editor_panel_title': '📝 JSON 编辑器',
        'viewer_panel_title': '🔍 JSON 预览',
        
        // 面板控制按钮
        'collapse_editor': '折叠编辑器',
        'collapse_viewer': '折叠预览',
        'expand_editor': '展开编辑器', 
        'expand_viewer': '展开预览',
        
        // 输入框和占位符
        'editor_placeholder': '在此输入或粘贴您的JSON数据...',
        'search_placeholder': '搜索...',
        'edit_value_placeholder': '输入JSON对象或数组',
        
        // 状态和统计信息
        'status_valid': '✅ JSON 格式正确',
        'status_invalid': '❌ JSON 格式错误', 
        'stats_template': '行数: {lines} | 字符数: {chars}',
        'json_empty': '<!-- JSON视图将在这里渲染 -->',
        
        // 错误和提示信息
        'format_error': '格式化失败：JSON 格式不正确',
        'compress_error': '压缩失败：JSON 格式不正确',
        'export_error': '导出失败：JSON 格式不正确',
        'import_success': 'JSON 文件导入成功',
        'import_error': '文件导入失败',
        'clear_confirm': '确定要清空编辑器内容吗？',
        
        // JSON 节点类型标签
        'json_null': 'null',
        'json_empty_array': '[]',
        'json_empty_object': '{}',
        'json_array_label': '[{count}]',
        'json_object_label': '{{count}}',
        
        // 操作按钮
        'add_item': '添加项目',
        'delete_item': '删除项目',
        'edit_value': '编辑值',
        'copy_path': '复制路径',
        
        // 弹窗标题
        'edit_dialog_title': '编辑值',
        'confirm_dialog_title': '确认操作',
        'add_dialog_title': '添加新项目'
    };
    
    // 兼容性
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['zh'] = window.LANGUAGE_DATA['zh'];
})(); 