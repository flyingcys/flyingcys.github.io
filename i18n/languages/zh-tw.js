// 繁體中文 (zh-TW)
const zhTw = {
    // ========== 通用頁面翻譯 ==========
    
    // 根目錄首頁
    home_title: "開發者工具集合",
    home_subtitle: "一站式開發工具平台",
    home_description: "提供多種實用的開發工具，包括串口調試、JSON處理、XML轉換、音頻處理等功能",
    home_footer: "© 2024 開發者工具集合. All rights reserved.",
    
    // 工具卡片
    tools_title: "工具列表",
    tuya_open_tool: "TuyaOpen串口工具",
    tuya_open_desc: "基於Web Serial API的串口調試和固件下載工具",
    json_tool: "JSON可視化工具",
    json_desc: "JSON資料格式化、驗證和可視化編輯器",
    xml_tool: "XML處理工具",
    xml_desc: "XML資料解析、格式化和轉換工具",
    mp3_tool: "MP3轉換工具",
    mp3_desc: "音頻文件轉換為C語言數組的開發工具",
    protobuf_tool: "Protobuf工具",
    protobuf_desc: "Protocol Buffers資料序列化工具",
    
    // 通用按鈕
    open_tool: "打開工具",
    back_home: "返回首頁",
    
    // JSON工具頁面
    json_title: "JSON 可視化工具",
    json_editor: "JSON 編輯器",
    json_viewer: "JSON 預覽",
    format_json: "格式化",
    minify_json: "壓縮",
    validate_json: "驗證",
    clear_json: "清空",
    
    // XML工具頁面
    xml_title: "XML 處理工具",
    xml_editor: "XML 編輯器",
    xml_viewer: "XML 預覽",
    format_xml: "格式化",
    validate_xml: "驗證",
    clear_xml: "清空",
    
    // MP3工具頁面
    mp3_title: "MP3 轉 C 數組工具",
    mp3_upload: "上傳MP3文件",
    mp3_convert: "轉換",
    mp3_download: "下載C文件",
    
    // Protobuf工具頁面
    protobuf_title: "Protobuf 工具",
    
    // ========== TuyaOpen工具翻譯 ==========
    
    // 頁面標題和描述
    title: "TuyaOpen串口工具(內測版)",
    subtitle: "基於Chrome Web Serial API的一站式開發者工具",
    
    // 瀏覽器要求和測試版本說明
    browser_requirement: "此工具需要Chrome內核瀏覽器支持，其他瀏覽器無法正常工作。請使用Chrome、Edge或其他基於Chromium的瀏覽器。",
    beta_notice: "當前功能屬於測試版本，遇到問題請先保存相關日誌，然後提交issue到",
    repository_link: "TuyaOpen-Tools 倉庫",
    
    // 項目相關連結
    project_info: "這個項目是TuyaOpen的一部分，相關項目包括：",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Tab標籤
    tab_serial: "串口調試",
    tab_flash: "固件下載",
    tab_tuya_auth: "TuyaOpen授權",
    
    // 控制面板
    control_title: "串口連接控制",
    flash_connection_control: "固件下載串口連接",
    connect: "連接串口",
    connect_flash: "連接固件下載串口",
    disconnect: "斷開連接",
    disconnect_flash: "斷開固件下載連接",
    status_disconnected: "未連接",
    status_connected: "已連接",
    serial_target_device: "目標設備:",
    custom_device: "自定義",
    baud_rate: "波特率:",
    data_bits: "資料位:",
    stop_bits: "停止位:",
    parity: "校驗位:",
    parity_none: "無",
    parity_even: "偶校驗",
    parity_odd: "奇校驗",
    
    // 串口調試
    receive_data: "接收資料",
    save_log: "保存日誌",
    auto_scroll: "自動滾動",
    show_timestamp: "顯示時間戳",
    waiting_data: "等待串口資料...",
    received: "接收",
    sent: "發送",
    bytes: "字節",
    
    // 錯誤分析相關
    error_analysis: "錯誤日誌分析",
    clear_analysis: "清空分析（重置檢測）",
    auto_analysis: "自動分析",
    no_errors_detected: "暫未檢測到錯誤...",
    test_error_analysis: "測試錯誤分析",
    
    send_data: "發送資料",
    hex_mode: "HEX模式",
    add_newline: "添加換行符",
    input_placeholder: "輸入要發送的資料...",
    input_placeholder_hex: "輸入十六進制資料 (例如: FF 01 02 03)...",
    send: "發送",
    
    quick_send: "快捷發送:",
    manage: "管理命令",
    no_quick_commands: "暫無快捷命令。點擊\"管理命令\"按鈕可添加常用AT指令、調試命令等，提高調試效率",
    
    // ========== 雙模式語言選擇器測試頁面 ==========
    test_page_title: "雙模式語言選擇器測試頁面",
    basic_function_test: "基本功能測試",
    current_language: "當前語言",
    current_mode: "當前模式",
    browser_language: "瀏覽器語言",
    status_active: "激活",
    status_working: "工作中",
    
    feature_showcase: "功能特性展示",
    auto_mode_title: "自動模式",
    auto_mode_desc: "根據瀏覽器語言自動檢測和切換，支援地區語言映射",
    auto_feature_1: "自動檢測瀏覽器語言",
    auto_feature_2: "智能語言映射",
    auto_feature_3: "首次訪問自動設置",
    
    manual_mode_title: "手動模式",
    manual_mode_desc: "用戶完全控制語言選擇，設置永久保存",
    manual_feature_1: "用戶完全控制",
    manual_feature_2: "設置永久保存",
    manual_feature_3: "不受瀏覽器語言影響",
    
    smart_features_title: "智能特性",
    smart_features_desc: "多種高級功能確保最佳用戶體驗",
    smart_feature_1: "URL參數支援",
    smart_feature_2: "錯誤回退機制",
    smart_feature_3: "路徑自動適配",
    
    ui_features_title: "界面特性",
    ui_features_desc: "美觀現代的界面設計和交互體驗",
    ui_feature_1: "雙按鈕設計",
    ui_feature_2: "模式指示器",
    ui_feature_3: "響應式設計",
    
    test_controls: "測試控制",
    test_switch_en: "切換到英文",
    test_switch_ja: "切換到日文",
    test_switch_zh: "切換到中文",
    test_auto_mode: "測試自動模式",
    test_manual_mode: "測試手動模式",
    check_status: "檢查狀態",
    
    real_time_status: "實時狀態",
    detection_mode: "檢測模式",
    selected_language: "選擇的語言",
    mode_tip: "(自動模式會檢測瀏覽器語言)",
    language_tip: "(當前頁面顯示的語言)",
    
    test_elements: "測試元素",
    text_content: "文本內容",
    button_text: "按鈕文本",
    input_placeholder: "輸入框占位符",
    sample_text: "這是一段示例文本",
    sample_button: "示例按鈕",
    sample_placeholder: "請輸入內容",
    
    technical_info: "技術信息",
    storage_info: "存儲信息",
    url_params: "URL參數",
    
    // 錯誤資訊
    error: "錯誤",
    
    // 系統訊息
    serial_connected: "串口連接成功！",
    serial_disconnected: "串口已斷開連接。",
    flash_serial_connected: "固件下載串口連接成功！",
    flash_serial_disconnected: "固件下載串口已斷開連接。",
    switch_to_tab: "切換到{0}功能，串口連接已斷開",
    tab_serial_name: "串口調試",
    tab_flash_name: "固件下載",
    
    // 確認對話方塊
    switch_tab_confirm: "⚠️ 串口互斥提醒\n\n當前{0}功能正在使用串口連接。\n{0}和{1}功能不能同時使用串口。\n\n切換到{1}功能將：\n• 自動斷開當前串口連接\n• 停止正在進行的操作\n\n確定要切換嗎？",
    delete_command_confirm: "確定要刪除這個快捷命令嗎？",
    reset_commands_confirm: "確定要恢復預設的快捷命令嗎？這將刪除所有自訂命令。",
    
    // 驗證訊息
    fill_complete_info: "請填寫完整的命令名稱和內容",
    command_name_exists: "命令名稱已存在，請使用其他名稱",
    no_data_to_save: "沒有資料可儲存",
    no_log_to_save: "沒有日誌可儲存",
    please_select_file: "請先選擇固件檔案",
    please_connect_serial: "請先連接串口",
    please_connect_flash_serial: "請先連接固件下載串口",
    flash_serial_not_connected: "固件下載串口未連接",
    
    // Web Serial API 相關
    browser_not_supported: "您的瀏覽器不支援Web Serial API。請使用Chrome 89+或Edge 89+瀏覽器。",
    connect_failed: "連接失敗: {0}",
    disconnect_failed: "斷開連接失敗: {0}",
    read_error: "讀取資料錯誤: {0}",
    send_error: "發送資料錯誤: {0}",
    hex_length_error: "HEX字串長度必須是偶數",
    serial_not_connected: "串口未連接",
    download_failed: "下載失敗: {0}",
    
    // 檔案操作
    file_selected: "選擇檔案: {0} ({1} 位元組)",
    start_download_to: "開始下載固件到 {0}...",
    download_complete: "固件下載完成！",
    user_cancelled: "使用者取消下載",
    
    // 韌體下載進度訊息
    flash_handshaking: "正在握手連接...",
    flash_handshake_success: "握手成功",
    flash_handshake_failed: "握手失敗，請檢查裝置連接",
    flash_download_cancelled: "下載已取消",
    waiting_reset: "等待裝置重啟...",
    flash_setting_baudrate: "設定波特率到 {0}...",
    flash_baudrate_set: "波特率設定完成",
    flash_erasing: "正在擦除Flash...",
    flash_erase_progress: "擦除進度: {0}/{1}",
    flash_erase_sector_failed: "擦除扇區 {0} 失敗: {1}",
    flash_erase_complete: "Flash擦除完成",
    flash_writing_data: "正在寫入資料...",
    flash_write_progress: "寫入進度: {0}/{1}",
    flash_write_block_failed: "寫入區塊 {0} 失敗: {1}",
    flash_write_complete: "資料寫入完成",
    flash_verifying_crc: "正在校驗資料...",
    flash_crc_passed: "CRC校驗通過",
    flash_crc_failed_mismatch: "CRC校驗失敗: 本地={0}, 裝置={1}",
    flash_crc_failed: "CRC校驗失敗: {0}",
    flash_rebooting: "正在重啟裝置...",
    flash_download_complete: "下載完成",
    flash_download_success: "下載成功完成！",
    flash_download_failed: "下載失敗: {0}",
    flash_downloading: "正在下載中，請等待完成",
    flash_user_cancelled: "使用者取消操作",
    
    // 日誌檔案名
    serial_log_filename: "串口日誌_{0}.txt",
    flash_log_filename: "固件日誌_{0}.txt",
    
    // 工具提示
    current_tab_connected: "當前{0}功能已連接串口",
    disconnect_tab_connection: "斷開{0}功能的串口連接",
    connect_for_tab: "連接串口用於{0}功能",
    
    // 版權資訊
    powered_by: "基於",
    all_rights_reserved: "保留所有權利",
    
    // 調試功能
    debug_mode: "調試模式",
    debug_basic: "基礎",
    debug_detailed: "詳細",
    debug_verbose: "完整",
    export_debug: "匯出調試日誌",
    debug_status: "調試狀態",
    debug_level: "調試級別",
    packets_sent: "發送包數",
    packets_received: "接收包數",
    
    // 功能按鈕和操作
    fullscreen: "全螢幕顯示",
    exit_fullscreen: "退出全螢幕",
    
    // 新增：除錯模式狀態
    debug_mode_enabled: "🔧 除錯模式已啟用",
    debug_mode_disabled: "🔧 除錯模式已停用",
    enabled: "啟用",
    disabled: "停用",
    
    // 新增：波特率重置相關
    resetting_baudrate_115200: "重置串口波特率到115200...",
    baudrate_reset_success: "✅ 串口波特率已重置到115200",
    direct_serial_reset_success: "✅ 串口已直接重置到115200",
    baudrate_reset_failed: "重置串口波特率失敗",
    direct_reset_failed: "直接重置串口也失敗",
    
    // 新增：下載管理器相關
    downloader_manager_not_initialized: "下載管理器未初始化",
    loaded_chip_types: "已載入{0}種支援的晶片類型",
    using_default_chip_support: "使用預設晶片支援 (T5AI, T3)",
    unsupported_device_type: "不支援的裝置類型: {0}",
    unsupported_chip_type: "不支援的晶片類型: {0}",
    
    // 新增：韌體下載程序相關
    starting_firmware_download_process: "開始韌體下載程序...",
    starting_device_download: "開始{0}裝置下載，檔案大小: {1} 位元組",
    firmware_download_completed_time: "韌體下載完成！總時間: {0}毫秒",
    device_firmware_download_completed: "{0}裝置韌體下載完成",
    initializing_downloader: "初始化{0}下載器...",
    connecting_device: "連接{0}裝置...",
    cannot_connect_device: "無法連接{0}裝置",
    downloading_firmware_to_device: "下載韌體到{0}裝置...",
    t5ai_firmware_download_completed: "T5AI韌體下載完成",
    firmware_download_completed_device_restarted: "韌體下載完成，裝置重新啟動...",
    serial_not_connected_connect_first: "串口埠未連接，請先連接串口裝置",
    restoring_serial_reader_writer_failed: "恢復串口埠reader/writer失敗",
    cleanup_reset_baudrate: "清理：重置波特率...",
    cleanup_baudrate_reset_success: "清理：波特率重置成功",
    cleanup_reset_failed: "清理：重置失敗",
    flashdownloader_reset_baudrate: "FlashDownloader：重置波特率到115200...",
    flashdownloader_baudrate_reset_success: "FlashDownloader：✅ 波特率成功重置到115200",
    flashdownloader_direct_reset_success: "FlashDownloader：✅ 串口埠直接重置也成功",
    flashdownloader_reset_failed: "FlashDownloader：波特率重置失敗",
    
    // 新增：串口連接狀態訊息
    serial_connected_initial_switch: "初始連接，將切換到",
    serial_connected_initial: "初始連接",
    bps: "bps",
    
    // 系統資訊
    system_info: "系統資訊",
    system_info_os: "作業系統",
    system_info_browser: "瀏覽器",
    system_info_web_serial: "Web Serial",
    system_info_platform: "平台",
    system_info_supported: "支援",
    system_info_not_supported: "不支援",
    
    // 串口斷線處理
    serial_disconnected_unexpectedly: "串口連接意外斷開: {0}",
    
    // 串口埠故障排除頁面
    troubleshooting_title: "串口埠故障排除指南",
    troubleshooting_subtitle: "解決串口連接問題的完整指南",
    back_to_main: "返回主頁",
    no_serial_ports_found: "沒有找到串口埠？",
    serial_troubleshooting_guide: "串口埠連接問題？查看故障排除指南",
    serial_troubleshooting: "串口埠故障排除",
    
    // 快速檢查清單
    quick_check_title: "快速檢查清單",
    basic_checks: "基本檢查項目",
    check_browser: "使用Chrome、Edge或其他基於Chromium的瀏覽器",
    check_cable: "USB資料線正確連接（非充電線）",
    check_device_power: "裝置正確供電",
    check_other_software: "關閉其他佔用串口埠的軟體",
    
    // 常見問題
    common_issues_title: "常見問題與解決方案",
    issue_no_ports: "問題1：沒有可用的串口裝置",
    issue_no_ports_desc: "點選「連接串口」後裝置清單為空",
    issue_connection_failed: "問題2：連接失敗",
    issue_connection_failed_desc: "裝置可見但連接時發生錯誤",
    issue_no_data: "問題3：連接成功但無資料",
    issue_no_data_desc: "串口連接成功但未接收到資料或資料顯示異常",
    
    possible_causes: "可能原因：",
    cause_driver_missing: "裝置驅動程式未安裝或安裝不正確",
    cause_cable_issue: "USB線材問題（使用充電線而非資料線）",
    cause_device_not_recognized: "裝置未被系統識別",
    cause_port_occupied: "串口埠被其他程式佔用",
    cause_permission_denied: "權限不足（Linux/macOS）",
    cause_device_busy: "裝置被其他應用程式使用",
    cause_driver_conflict: "驅動程式衝突或不相容",
    cause_baud_rate_mismatch: "波特率設定不匹配",
    cause_serial_params_wrong: "資料位、停止位、校驗位設定錯誤",
    cause_device_not_sending: "裝置未發送資料",
    cause_flow_control: "流量控制設定問題",
    cause_cable_quality: "資料線品質問題或接觸不良",
    
    // 驅動程式問題診斷
    driver_diagnosis_title: "驅動程式問題診斷",
    driver_diagnosis_desc: "大部分串口埠問題都與驅動程式有關，請按照以下步驟進行診斷",
    
    // 作業系統
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    
    // Windows相關
    windows_check_device_manager: "步驟1：檢查裝置管理員",
    windows_step1_title: "開啟裝置管理員",
    windows_step1_desc: "右鍵點選「本機」→「內容」→「裝置管理員」，或按Win+X選擇「裝置管理員」",
    windows_step2_title: "尋找串口裝置",
    windows_step2_desc: "在裝置管理員中尋找以下類別：",
    windows_step3_title: "識別裝置狀態",
    windows_step3_desc: "檢查裝置圖示狀態：",
    
    ports_com_lpt: "連接埠 (COM 和 LPT)",
    universal_serial_bus: "通用序列匯流排控制器",
    other_devices: "其他裝置",
    
    device_normal: "✅ 正常：裝置名稱正常顯示",
    device_warning: "⚠️ 警告：黃色驚嘆號，驅動程式問題",
    device_error: "❌ 錯誤：紅色X，裝置已停用",
    device_unknown: "❓ 未知：在「其他裝置」中，驅動程式未安裝",
    
    windows_driver_install: "步驟2：安裝驅動程式",
    windows_manual_install: "步驟3：手動安裝驅動程式",
    
    // 驅動程式說明
    ch340_desc: "最常見的USB轉串口晶片",
    cp210x_desc: "Silicon Labs USB轉串口晶片",
    ftdi_desc: "FTDI USB轉串口晶片",
    
    download_driver: "下載對應驅動程式",
    download_driver_desc: "根據裝置晶片型號下載對應驅動程式",
    run_installer: "執行安裝程式",
    run_installer_desc: "以管理員身分執行下載的驅動程式安裝程式",
    restart_computer: "重新啟動電腦",
    restart_computer_desc: "安裝完成後重新啟動電腦以啟用驅動程式",
    verify_installation: "驗證安裝",
    verify_installation_desc: "重新連接裝置並檢查是否在裝置管理員中正常顯示",
    
    screenshot_device_manager: "裝置管理員截圖位置",
    
    // macOS相關
    macos_check_system: "步驟1：檢查系統資訊",
    macos_step1_title: "開啟系統資訊",
    macos_step1_desc: "按住Option鍵並點選Apple選單→「系統資訊」",
    macos_step2_title: "檢視USB裝置",
    macos_step2_desc: "在左側選擇「USB」以檢視已連接的USB裝置",
    macos_step3_title: "檢查串口裝置",
    macos_step3_desc: "開啟終端機並輸入指令檢視串口裝置：",
    
    macos_driver_install: "步驟2：安裝驅動程式",
    macos_driver_note: "macOS通常內建大部分USB轉串口驅動程式，但某些晶片仍需手動安裝",
    
    ch340_mac_desc: "macOS用CH340驅動程式",
    cp210x_mac_desc: "macOS用CP210x驅動程式",
    
    // Linux相關
    linux_check_system: "步驟1：檢查系統識別",
    linux_step1_title: "檢查USB裝置",
    linux_step1_desc: "開啟終端機並輸入以下指令：",
    linux_step2_title: "檢查串口裝置",
    linux_step2_desc: "檢視可用的串口裝置：",
    linux_step3_title: "檢查核心訊息",
    linux_step3_desc: "檢視連接裝置時的核心訊息：",
    
    linux_permissions: "步驟2：設定權限",
    linux_add_user_group: "將使用者加入dialout群組",
    linux_add_user_desc: "執行以下指令並重新登入：",
    linux_check_permissions: "檢查裝置權限",
    linux_check_permissions_desc: "確認裝置權限設定：",
    
    // 進階故障排除
    advanced_troubleshooting: "進階故障排除",
    hardware_issues: "硬體問題排查",
    software_conflicts: "軟體衝突解決",
    
    try_different_cable: "嘗試不同的USB資料線",
    try_different_port: "嘗試不同的USB連接埠",
    try_different_computer: "在其他電腦上測試裝置",
    check_device_power: "檢查裝置供電是否正常",
    
    close_other_serial_software: "關閉其他串口調試軟體",
    disable_antivirus: "暫時停用防毒軟體",
    update_browser: "更新瀏覽器到最新版本",
    clear_browser_cache: "清除瀏覽器快取和資料",
    
    // 取得協助
    get_help_title: "取得協助",
    get_help_desc: "如果以上方法都無法解決問題，請收集以下資訊並聯絡技術支援：",
    
    help_info_os: "作業系統版本",
    help_info_browser: "瀏覽器版本",
    help_info_device: "裝置型號和晶片資訊",
    help_info_error: "具體錯誤訊息截圖",
    help_info_device_manager: "裝置管理員截圖（Windows）",
    
    github_support_desc: "在GitHub上提交問題報告",
    
    // 新增：TuyaOpen授權碼指南相關
    tuya_auth_title: "TuyaOpen授權碼寫入",
    tuya_auth_subtitle: "向裝置寫入TuyaOpen專案授權資訊",
    uuid_label: "UUID (20字元):",
    auth_key_label: "AUTH_KEY (32字元):",
    uuid_placeholder: "請輸入20字元的UUID...",
    auth_key_placeholder: "請輸入32字元的AUTH_KEY...",
    authorize_btn: "寫入授權",
    tuya_auth_notice_title: "⚠️ 重要提示",
    tuya_auth_notice_content: "目前授權功能僅適用於TuyaOpen工程的授權碼寫入，非TuyaOpen工程無法使用。",
    tuya_auth_additional_info: "請確保裝置已進入授權模式，並正確連接串口埠後再進行授權操作。",
    uuid_length_error: "UUID長度錯誤！請輸入20字元的UUID",
    auth_key_length_error: "AUTH_KEY長度錯誤！請輸入32字元的AUTH_KEY",
    uuid_empty_error: "請輸入UUID",
    auth_key_empty_error: "請輸入AUTH_KEY",
    tuya_auth_success: "✅ TuyaOpen授權資訊寫入成功！",
    tuya_auth_failed: "❌ TuyaOpen授權資訊寫入失敗: {0}",
    tuya_auth_sending: "正在發送授權資訊...",
    tuya_auth_command_sent: "授權指令已發送: auth {0} {1}",
    
    // 授權相關狀態資訊
    tuya_auth_waiting: "等待授權操作...",
    tuya_auth_connected: "授權串口埠已連接",
    tuya_auth_disconnected: "授權串口埠已斷開",
    connect_tuya_auth: "連接授權串口埠",
    disconnect_tuya_auth: "斷開授權串口埠",
    tuya_auth_serial_connected: "TuyaOpen授權串口埠連接成功！",
    tuya_auth_serial_disconnected: "TuyaOpen授權串口埠已斷開連接。",
    tab_tuya_auth_name: "TuyaOpen授權",
    
    // TuyaOpen授權碼指南相關
    license_guide: "授權碼取得指南",
    license_guide_title: "TuyaOpen授權碼取得指南",
    license_guide_subtitle: "了解TuyaOpen授權碼及取得方式",
    
    // 什麼是TuyaOpen專用授權碼
    what_is_license: "什麼是TuyaOpen專用授權碼",
    license_info: "TuyaOpen Framework的所有版本均需要專用授權碼才能正常連接塗鴉雲，使用其他授權碼無法正常工作。",
    supported_frameworks: "支援的TuyaOpen框架",
    c_version: "C 版 TuyaOpen",
    arduino_version: "Arduino 版 TuyaOpen", 
    lua_version: "Luanode 版 TuyaOpen",
    
    // 如何取得授權碼
    how_to_get: "如何取得授權碼",
    method1_title: "方式1：購買預燒錄模組",
    method1_desc: "通過涂鴉開發者平台購買已燒錄 TuyaOpen 授權碼模組。該授權碼已經在出廠時燒錄在對應模組中，且不會丟失。TuyaOpen 在啟動時通過 `tuya_iot_license_read()` 接口讀取授權碼。請確認當前設備是否為燒錄了 TuyaOpen 授權碼。",
    method1_advantage: "優勢：隨插即用，無需手動操作",
    
    method2_title: "方式2：涂鴉平台購買",
    method2_desc: "通過涂鴉開發者平台購買TuyaOpen授權碼，然後通過串口工具寫入到模組中。",
    method2_advantage: "優勢：官方平台，支援批量購買",
    visit_platform: "訪問平台",
    visit_platform_preburn: "購買預燒錄模組",
    
    method3_title: "方式3：淘寶購買",
    method3_desc: "通過淘寶店鋪購買TuyaOpen授權碼，然後通過串口工具寫入到模組中。",
    method3_advantage: "優勢：購買便捷，支付方式靈活",
    visit_taobao: "訪問淘寶",
    
    // 使用指南
    usage_guide: "使用指南",
    check_existing: "步驟1：檢查現有授權碼",
    check_warning: "請先確認當前設備是否已經燒錄了TuyaOpen授權碼，避免重複購買。",
    write_license: "步驟2：寫入授權碼",
    write_desc: "如果設備未燒錄授權碼，可以使用本工具的「TuyaOpen授權」功能進行寫入：",
    write_step1: "連接設備到電腦",
    write_step2: "切換到「TuyaOpen授權」標籤頁",
    write_step3: "連接串口",
    write_step4: "輸入購買的UUID和AUTH_KEY",
    write_step5: "點擊「寫入授權」按鈕",
    write_success: "授權碼寫入成功後，設備就可以正常使用TuyaOpen框架連接塗鴉雲了。",
    
    // 常見問題
    faq_title: "常見問題",
    q1: "Q: 其他類型的授權碼可以用嗎？",
    a1: "A: 不可以。TuyaOpen框架只能使用TuyaOpen專用授權碼，其他授權碼無法正常連接塗鴉雲。",
    q2: "Q: 授權碼會遺失嗎？",
    a2: "A: 正常情況下授權碼不會遺失。預燒錄模組的授權碼是出廠燒錄的，手動寫入的授權碼會保存在模組的非易失性存儲區域。",
    q3: "Q: 如何檢查設備是否已有授權碼？",
    a3: "A: 可以通過TuyaOpen程序調用 `tuya_iot_license_read()` 接口來檢查。",
    
    // 技術支援
    support_title: "技術支援",
    support_desc: "如果在使用過程中遇到問題，請通過以下方式獲取幫助：",
    github_support: "提交問題報告",
    
    error_unknown: "未知錯誤",
    
    // 工具页面特定翻译
    tool_json_desc: "JSON 格式化和驗證工具",
    tool_xml_desc: "XML 格式化和驗證工具", 
    tool_mp3_desc: "MP3 轉 C 陣列轉換器",
    tool_protobuf_desc: "Protocol Buffers 視覺化工具",
    
    // 主頁面翻譯
    'home_title': '開發者工具集合',
    'home_subtitle': '一站式開發工具平台',
    'home_footer': '© 2024 開發者工具集合. All rights reserved.',
    
    // 工具標題和描述
    'color_converter_title': '顏色轉換器',
    'color_converter_desc': '支援RGB、HEX、HSL、HSV等多種顏色格式之間的相互轉換',
    
    'ascii_tree_title': 'ASCII樹生成器',
    'ascii_tree_desc': '將目錄結構轉換為ASCII樹形圖，便於文檔展示',
    
    'timestamp_converter_title': '時間戳轉換器',
    'timestamp_converter_desc': 'Unix時間戳與人類可讀時間格式的雙向轉換工具',
    
    'url_encoder_title': 'URL編碼解碼器',
    'url_encoder_desc': 'URL編碼和解碼工具，支援批量處理和多種字符集',
    
    'json_formatter_title': 'JSON格式化器',
    'json_formatter_desc': 'JSON數據的格式化、壓縮、驗證和美化工具',
    
    'base64_encoder_title': 'Base64編碼解碼',
    'base64_encoder_desc': 'Base64編碼和解碼工具，支援文本和文件處理',
    
    'hash_generator_title': '哈希生成器',
    'hash_generator_desc': '支援MD5、SHA-1、SHA-256等多種哈希算法',
    
    'qr_generator_title': '二維碼生成器',
    'qr_generator_desc': '生成各種類型的二維碼，支援自定義樣式和尺寸',
    
    'password_generator_title': '密碼生成器',
    'password_generator_desc': '生成安全的隨機密碼，可自定義長度和字符集',
    
    'lorem_generator_title': '文本生成器',
    'lorem_generator_desc': '生成Lorem Ipsum佔位文本，支援多種語言',
    
    'markdown_editor_title': 'Markdown編輯器',
    'markdown_editor_desc': '在線Markdown編輯器，實時預覽和導出功能',
    
    'regex_tester_title': '正則表達式測試器',
    'regex_tester_desc': '測試和驗證正則表達式，支援多種編程語言語法',
    
    // 測試用翻譯
    'test_title': '語言切換測試（繁體中文）',
    'test_content': '這是繁體中文測試內容。語言切換器運行正常。',
    'test_button': '繁體中文按鈕',
    'test_placeholder': '繁體中文佔位符',
    
    // 調試用
    'debug_title': '語言切換器調試頁面（繁體中文）',
    'debug_subtitle': '用於測試和調試多語言功能'
};

// 導出到全局 - 兼容新的全局語言系統
if (typeof window !== 'undefined') {
    // 兼容舊系統
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages['zh-tw'] = zhTw;
    
    // 新的全局語言系統
    window.LANGUAGE_DATA = window.LANGUAGE_DATA || {};
    window.LANGUAGE_DATA['zh-tw'] = zhTw;
} 

// 模块导出兼容性
if (typeof module !== 'undefined' && module.exports) {
    module.exports = zhTw;
} else if (typeof exports !== 'undefined') {
    exports.default = zhTw;
} 