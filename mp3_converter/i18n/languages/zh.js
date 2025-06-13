// MP3转换器 - 中文语言包
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['zh'] = {
        // 页面标题和基本信息
        'mp3_tool_title': 'MP3 到 C 数组转换器',
        'page_title': 'MP3 到 C 数组转换器',
        'home_btn': '返回首页',
        
        // 主标题和说明
        'main_title': '🎵 MP3 到 C 数组转换器',
        'main_subtitle': '将MP3音频文件转换为C语言数组，适用于嵌入式开发',
        
        // 上传区域
        'upload_area_title': '选择 MP3 文件',
        'upload_area_desc': '点击这里选择文件或拖拽文件到此区域',
        'drag_drop_text': '拖拽文件到此处或点击选择',
        'file_types': '支持的文件类型：MP3',
        'max_file_size': '最大文件大小：10MB',
        
        // 转换设置
        'settings_title': '转换设置',
        'array_name_label': '数组名称：',
        'array_name_placeholder': '输入C数组变量名',
        'sample_rate_label': '采样率：',
        'bit_depth_label': '位深度：',
        'format_label': '输出格式：',
        
        // 转换按钮和状态
        'convert_btn': '🔄 开始转换',
        'converting_text': '转换中...',
        'download_btn': '💾 下载 C 文件',
        'copy_btn': '📋 复制代码',
        'clear_btn': '🗑️ 清空',
        
        // 进度和状态信息
        'file_info_title': '文件信息',
        'file_name': '文件名：',
        'file_size': '文件大小：',
        'duration': '时长：',
        'conversion_progress': '转换进度：',
        'status_ready': '准备就绪',
        'status_processing': '处理中...',
        'status_completed': '转换完成',
        'status_error': '转换失败',
        
        // 预览区域
        'preview_title': '代码预览',
        'preview_placeholder': '转换后的C代码将在此处显示...',
        
        // 错误和提示信息
        'error_no_file': '请先选择一个MP3文件',
        'error_invalid_file': '请选择有效的MP3文件',
        'error_file_too_large': '文件太大，请选择小于10MB的文件',
        'error_conversion_failed': '转换失败，请检查文件格式',
        'success_converted': 'MP3文件转换成功！',
        'success_copied': '代码已复制到剪贴板',
        'success_downloaded': '文件下载成功',
        
        // 使用说明
        'instructions_title': '使用说明',
        'instructions': [
            '1. 选择或拖拽MP3文件到上传区域',
            '2. 设置数组名称和转换参数',
            '3. 点击"开始转换"按钮',
            '4. 转换完成后可以下载或复制代码',
            '5. 将生成的C代码集成到您的项目中'
        ],
        
        // 技术说明
        'tech_notes_title': '技术说明',
        'tech_notes': [
            '• 支持标准MP3格式文件',
            '• 输出为标准C语言数组格式',
            '• 适用于Arduino、ESP32等嵌入式平台',
            '• 生成的数组包含音频数据和长度信息',
            '• 建议使用较短的音频片段以节省存储空间'
        ]
    };
    
    // 兼容性
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['zh'] = window.LANGUAGE_DATA['zh'];
})(); 