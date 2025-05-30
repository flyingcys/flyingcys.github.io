// 简体中文 (zh-CN)
const zh = {
    // 页面标题和描述
    title: "TuyaOpen串口工具(内测版)",
    subtitle: "基于Chrome Web Serial API的一站式开发者工具",
    
    // 浏览器要求和测试版本说明
    browser_requirement: "此工具需要Chrome内核浏览器支持，其他浏览器无法正常工作。请使用Chrome、Edge或其他基于Chromium的浏览器。",
    beta_notice: "当前功能属于测试版本，遇到问题请先保存相关日志，然后提交issue到",
    repository_link: "TuyaOpen-Tools 仓库",
    
    // 项目相关链接
    project_info: "这个项目是TuyaOpen的一部分，相关项目包括：",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Tab标签
    tab_serial: "串口调试",
    tab_flash: "固件下载",
    
    // 控制面板
    control_title: "串口连接控制",
    flash_connection_control: "固件下载串口连接",
    connect: "连接串口",
    connect_flash: "连接固件下载串口",
    disconnect: "断开连接",
    disconnect_flash: "断开固件下载连接",
    status_disconnected: "未连接",
    status_connected: "已连接",
    serial_target_device: "目标设备:",
    custom_device: "自定义",
    baud_rate: "波特率:",
    data_bits: "数据位:",
    stop_bits: "停止位:",
    parity: "校验位:",
    parity_none: "无",
    parity_even: "偶校验",
    parity_odd: "奇校验",
    
    // 串口调试
    receive_data: "接收数据",
    save_log: "保存日志",
    auto_scroll: "自动滚动",
    show_timestamp: "显示时间戳",
    waiting_data: "等待串口数据...",
    received: "接收",
    sent: "发送",
    bytes: "字节",
    
    send_data: "发送数据",
    hex_mode: "HEX模式",
    add_newline: "添加换行符",
    input_placeholder: "输入要发送的数据...",
    input_placeholder_hex: "输入十六进制数据 (例如: FF 01 02 03)...",
    send: "发送",
    
    quick_send: "快捷发送:",
    manage: "管理命令",
    no_quick_commands: "暂无快捷命令。点击\"管理命令\"按钮可添加常用AT指令、调试命令等，提高调试效率",
    
    // 固件下载
    flash_config: "固件下载配置",
    target_device: "目标设备:",
    select_file: "选择固件文件",
    no_file_selected: "未选择文件",
    file_size: "文件大小",
    start_download: "开始下载",
    stop_download: "停止下载",
    preparing: "准备中...",
    downloaded: "已下载",
    download_log: "下载日志",
    clear_log: "清空日志",
    waiting_download: "等待下载操作...",
    
    // 快捷命令管理
    quick_send_management: "快捷发送管理",
    add_new_command: "添加新命令",
    display_name: "显示名称:",
    name_example: "例如: 复位",
    send_content: "发送内容:",
    content_example: "例如: AT+RST",
    add: "添加",
    existing_commands: "已有命令",
    no_commands: "暂无快捷命令",
    reset_default: "恢复默认",
    close: "关闭",
    
    // 错误信息
    error: "错误",
    
    // 系统消息
    serial_connected: "串口连接成功！",
    serial_disconnected: "串口已断开连接。",
    flash_serial_connected: "固件下载串口连接成功！",
    flash_serial_disconnected: "固件下载串口已断开连接。",
    switch_to_tab: "切换到{0}功能，串口连接已断开",
    tab_serial_name: "串口调试",
    tab_flash_name: "固件下载",
    
    // 确认对话框
    switch_tab_confirm: "⚠️ 串口互斥提醒\n\n当前{0}功能正在使用串口连接。\n{0}和{1}功能不能同时使用串口。\n\n切换到{1}功能将：\n• 自动断开当前串口连接\n• 停止正在进行的操作\n\n确定要切换吗？",
    delete_command_confirm: "确定要删除这个快捷命令吗？",
    reset_commands_confirm: "确定要恢复默认的快捷命令吗？这将删除所有自定义命令。",
    
    // 验证消息
    fill_complete_info: "请填写完整的命令名称和内容",
    command_name_exists: "命令名称已存在，请使用其他名称",
    no_data_to_save: "没有数据可保存",
    no_log_to_save: "没有日志可保存",
    please_select_file: "请先选择固件文件",
    please_connect_serial: "请先连接串口",
    please_connect_flash_serial: "请先连接固件下载串口",
    flash_serial_not_connected: "固件下载串口未连接",
    
    // Web Serial API 相关
    browser_not_supported: "您的浏览器不支持Web Serial API。请使用Chrome 89+或Edge 89+浏览器。",
    connect_failed: "连接失败: {0}",
    disconnect_failed: "断开连接失败: {0}",
    read_error: "读取数据错误: {0}",
    send_error: "发送数据错误: {0}",
    hex_length_error: "HEX字符串长度必须是偶数",
    serial_not_connected: "串口未连接",
    download_failed: "下载失败: {0}",
    
    // 文件操作
    file_selected: "选择文件: {0} ({1} 字节)",
    start_download_to: "开始下载固件到 {0}...",
    download_complete: "固件下载完成！",
    user_cancelled: "用户取消下载",
    
    // 固件下载进度消息
    flash_handshaking: "正在握手连接...",
    flash_handshake_success: "握手成功",
    flash_handshake_failed: "握手失败，请检查设备连接",
    flash_download_cancelled: "下载已取消",
    waiting_reset: "等待设备重启...",
    flash_setting_baudrate: "设置波特率到 {0}...",
    flash_baudrate_set: "波特率设置完成",
    flash_erasing: "正在擦除Flash...",
    flash_erase_progress: "擦除进度: {0}/{1}",
    flash_erase_sector_failed: "擦除扇区 {0} 失败: {1}",
    flash_erase_complete: "Flash擦除完成",
    flash_writing_data: "正在写入数据...",
    flash_write_progress: "写入进度: {0}/{1}",
    flash_write_block_failed: "写入块 {0} 失败: {1}",
    flash_write_complete: "数据写入完成",
    flash_verifying_crc: "正在校验数据...",
    flash_crc_passed: "CRC校验通过",
    flash_crc_failed_mismatch: "CRC校验失败: 本地={0}, 设备={1}",
    flash_crc_failed: "CRC校验失败: {0}",
    flash_rebooting: "正在重启设备...",
    flash_download_complete: "下载完成",
    flash_download_success: "下载成功完成！",
    flash_download_failed: "下载失败: {0}",
    flash_downloading: "正在下载中，请等待完成",
    flash_user_cancelled: "用户取消操作",
    
    // 日志文件名
    serial_log_filename: "串口日志_{0}.txt",
    flash_log_filename: "固件日志_{0}.txt",
    
    // 工具提示
    current_tab_connected: "当前{0}功能已连接串口",
    disconnect_tab_connection: "断开{0}功能的串口连接",
    connect_for_tab: "连接串口用于{0}功能",
    
    // 版权信息
    powered_by: "基于",
    all_rights_reserved: "保留所有权利",
    
    // 调试功能
    debug_mode: "调试模式",
    debug_basic: "基础",
    debug_detailed: "详细",
    debug_verbose: "完整",
    export_debug: "导出调试日志",
    debug_status: "调试状态",
    debug_level: "调试级别",
    packets_sent: "发送包数",
    packets_received: "接收包数",
    
    // 功能按钮和操作
    fullscreen: "全屏显示",
    exit_fullscreen: "退出全屏",
    
    // 新增：调试模式状态
    debug_mode_enabled: "🔧 调试模式已启用",
    debug_mode_disabled: "🔧 调试模式已禁用",
    enabled: "启用",
    disabled: "禁用",
    
    // 新增：波特率重置相关
    resetting_baudrate_115200: "重置串口波特率到115200...",
    baudrate_reset_success: "✅ 串口波特率已重置到115200",
    direct_serial_reset_success: "✅ 串口已直接重置到115200",
    baudrate_reset_failed: "重置串口波特率失败",
    direct_reset_failed: "直接重置串口也失败",
    
    // 新增：下载器管理相关
    downloader_manager_not_initialized: "下载器管理器未初始化",
    loaded_chip_types: "已加载 {0} 种支持的芯片类型",
    using_default_chip_support: "使用默认芯片支持 (T5AI)",
    unsupported_device_type: "不支持的设备类型: {0}",
    unsupported_chip_type: "不支持的芯片类型: {0}",
    
    // 新增：固件下载流程相关
    starting_firmware_download_process: "开始固件下载流程...",
    starting_device_download: "开始{0}固件下载，文件大小: {1} 字节",
    firmware_download_completed_time: "固件下载完成，总耗时: {0} 秒",
    device_firmware_download_completed: "{0}固件下载完成",
    initializing_downloader: "正在初始化{0}下载器...",
    connecting_device: "正在连接{0}设备...",
    cannot_connect_device: "无法连接到{0}设备",
    downloading_firmware_to_device: "开始下载固件到{0}设备...",
    t5ai_firmware_download_completed: "✅ T5AI固件下载完成",
    firmware_download_completed_device_restarted: "固件下载完成，设备已重启",
    
    // 新增：串口连接相关
    serial_not_connected_connect_first: "串口未连接，请先连接串口设备",
    restoring_serial_reader_writer_failed: "恢复串口reader/writer失败",
    
    // 新增：清理和重置相关
    cleanup_reset_baudrate: "Cleanup: 重置串口波特率到115200...",
    cleanup_baudrate_reset_success: "Cleanup: ✅ 串口波特率已重置到115200",
    cleanup_reset_failed: "Cleanup: 重置串口波特率失败",
    flashdownloader_reset_baudrate: "FlashDownloader：重置波特率到115200...",
    flashdownloader_baudrate_reset_success: "FlashDownloader：✅ 波特率成功重置到115200",
    flashdownloader_direct_reset_success: "FlashDownloader：✅ 串口直接重置也成功",
    flashdownloader_reset_failed: "FlashDownloader：波特率重置失败",
    
    // 新增：串口连接状态消息
    serial_connected_initial_switch: "初始连接，将切换到",
    serial_connected_initial: "初始连接",
    bps: "bps",
    
    // 新增：控制台调试消息
    console_flash_connect_success: "固件下载连接成功（115200），串口调试连接状态:",
    console_flash_connect_failed: "固件下载连接失败:",
    console_flash_disconnect_failed: "固件下载断开连接失败:",
    console_flash_independent_success: "固件下载独立连接成功（115200），串口调试连接状态:",
    console_filtered_null_chars: "过滤了 {0} 个0x00字符",
    console_raw_received_data: "原始接收数据:",
    console_data_char_codes: "数据字符码:",
    console_contains_ansi_escape: "包含ANSI转义序列:",
    console_contains_missing_escape: "包含缺少转义字符的ANSI:",
    console_processed_safe_text: "处理后的安全文本:",
    console_apply_ansi_colors: "应用ANSI颜色样式:",
    console_sanitize_input: "sanitizeDisplayText输入:",
    console_ansi_detection_result: "ANSI检测结果:",
    console_call_parse_ansi: "调用parseAnsiColors处理",
    console_treat_as_plain: "作为普通文本处理",
    console_parse_ansi_input: "parseAnsiColors输入:",
    console_using_regex: "使用正则表达式:",
    console_found_ansi_match: "找到ANSI匹配:",
    console_parsed_codes: "解析的代码:",
    console_processing_code: "处理代码:",
    console_reset_style: "重置样式",
    console_set_bold: "设置粗体",
    console_close_bold: "关闭粗体",
    console_reset_foreground: "重置前景色",
    console_reset_background: "重置背景色",
    console_set_foreground: "设置前景色:",
    console_set_background: "设置背景色:",
    console_cleaned_text: "清理后的文本:",
    console_parse_ansi_final: "parseAnsiColors最终结果:",
    console_language_ui_initialized: "Language UI initialized for:",
    console_language_switched: "语言已切换到:",
    console_language_display_updated: "语言显示已更新为:",
    console_serial_target_device: "串口目标设备选择:",
    
    // 串口异常处理相关
    serial_disconnected_unexpectedly: "串口连接异常断开: {0}",
    
    // 系统信息相关
    system_info: "系统信息",
    system_info_os: "操作系统",
    system_info_browser: "浏览器",
    system_info_web_serial: "Web Serial",
    system_info_platform: "平台",
    system_info_supported: "支持",
    system_info_not_supported: "不支持"
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.zh = zh;
} 