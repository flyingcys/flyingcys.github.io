// 繁體中文 (zh-TW)
const zhTw = {
    // 頁面標題和描述
    title: "TuyaOpen串列工具(內測版)",
    subtitle: "基於Chrome Web Serial API的一站式開發者工具",
    
    // 瀏覽器要求和測試版本說明
    browser_requirement: "此工具需要Chrome內核瀏覽器支援，其他瀏覽器無法正常工作。請使用Chrome、Edge或其他基於Chromium的瀏覽器。",
    beta_notice: "當前功能屬於測試版本，遇到問題請先保存相關日誌，然後提交issue到",
    repository_link: "TuyaOpen-Tools 倉庫",
    
    // 專案相關連結
    project_info: "這個專案是TuyaOpen的一部分，相關專案包括：",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Tab標籤
    tab_serial: "串列除錯",
    tab_flash: "韌體下載",
    
    // 控制面板
    control_title: "串列連接控制",
    flash_connection_control: "韌體下載串列連接",
    connect: "連接串列",
    connect_flash: "連接韌體下載串列",
    disconnect: "斷開連接",
    disconnect_flash: "斷開韌體下載連接",
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
    receive_data: "接收數據",
    save_log: "保存日誌",
    auto_scroll: "自動滾動",
    show_timestamp: "顯示時間戳",
    waiting_data: "等待串列資料...",
    received: "接收",
    sent: "發送",
    bytes: "位元組",
    
    send_data: "發送資料",
    hex_mode: "HEX模式",
    add_newline: "新增換行符",
    input_placeholder: "輸入要發送的資料...",
    input_placeholder_hex: "輸入十六進位資料 (例如: FF 01 02 03)...",
    send: "發送",
    
    quick_send: "快捷發送:",
    manage: "管理命令",
    no_quick_commands: "暫無快捷命令。點選\"管理命令\"按鈕可新增常用AT指令、調試命令等，提高調試效率",
    
    // 韌體下載
    flash_config: "韌體下載設定",
    target_device: "目標裝置:",
    select_file: "選擇韌體檔案",
    no_file_selected: "未選擇檔案",
    file_size: "檔案大小",
    start_download: "開始下載",
    stop_download: "停止下載",
    preparing: "準備中...",
    downloaded: "已下載",
    download_log: "下載日誌",
    clear_log: "清空日誌",
    waiting_download: "等待下載操作...",
    
    // 快捷命令管理
    quick_send_management: "快捷發送管理",
    add_new_command: "新增新命令",
    display_name: "顯示名稱:",
    name_example: "例如: 復位",
    send_content: "發送內容:",
    content_example: "例如: AT+RST",
    add: "新增",
    existing_commands: "已有命令",
    no_commands: "暫無快捷命令",
    reset_default: "恢復預設",
    close: "關閉",
    
    // 錯誤資訊
    error: "錯誤",
    
    // 系統訊息
    serial_connected: "串列連接成功！",
    serial_disconnected: "串列已斷開連接。",
    flash_serial_connected: "韌體下載串列連接成功！",
    flash_serial_disconnected: "韌體下載串列已斷開連接。",
    switch_to_tab: "切換到{0}功能，串列連接已斷開",
    tab_serial_name: "串列除錯",
    tab_flash_name: "韌體下載",
    
    // 確認對話方塊
    switch_tab_confirm: "⚠️ 串列互斥提醒\n\n當前{0}功能正在使用串列連接。\n{0}和{1}功能不能同時使用串列。\n\n切換到{1}功能將：\n• 自動斷開當前串列連接\n• 停止正在進行的操作\n\n確定要切換嗎？",
    delete_command_confirm: "確定要刪除這個快捷命令嗎？",
    reset_commands_confirm: "確定要恢復預設的快捷命令嗎？這將刪除所有自訂命令。",
    
    // 驗證訊息
    fill_complete_info: "請填寫完整的命令名稱和內容",
    command_name_exists: "命令名稱已存在，請使用其他名稱",
    no_data_to_save: "沒有資料可儲存",
    no_log_to_save: "沒有日誌可儲存",
    please_select_file: "請先選擇韌體檔案",
    please_connect_serial: "請先連接串列",
    please_connect_flash_serial: "請先連接韌體下載串列",
    flash_serial_not_connected: "韌體下載串列未連接",
    
    // Web Serial API 相關
    browser_not_supported: "您的瀏覽器不支援Web Serial API。請使用Chrome 89+或Edge 89+瀏覽器。",
    connect_failed: "連接失敗: {0}",
    disconnect_failed: "斷開連接失敗: {0}",
    read_error: "讀取資料錯誤: {0}",
    send_error: "發送資料錯誤: {0}",
    hex_length_error: "HEX字串長度必須是偶數",
    serial_not_connected: "串列未連接",
    download_failed: "下載失敗: {0}",
    
    // 檔案操作
    file_selected: "選擇檔案: {0} ({1} 位元組)",
    start_download_to: "開始下載韌體到 {0}...",
    download_complete: "韌體下載完成！",
    user_cancelled: "使用者取消下載",
    
    // 韌體下載進度訊息
    flash_handshaking: "正在握手連接...",
    flash_handshake_success: "握手成功",
    flash_handshake_failed: "握手失敗，請檢查裝置連接",
    flash_download_cancelled: "下載已取消",
    waiting_reset: "等待裝置重啟...",
    flash_setting_baudrate: "設定鮑率到 {0}...",
    flash_baudrate_set: "鮑率設定完成",
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
    serial_log_filename: "串列日誌_{0}.txt",
    flash_log_filename: "韌體日誌_{0}.txt",
    
    // 工具提示
    current_tab_connected: "當前{0}功能已連接串列",
    disconnect_tab_connection: "斷開{0}功能的串列連接",
    connect_for_tab: "連接串列用於{0}功能",
    
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
    
    // 新增：下載器管理器相關
    downloader_manager_not_initialized: "下載器管理器未初始化",
    loaded_chip_types: "已載入 {0} 種支援的晶片類型",
    using_default_chip_support: "使用預設晶片支援 (T5AI)",
    unsupported_device_type: "不支援的設備類型: {0}",
    unsupported_chip_type: "不支援的晶片類型: {0}",
    
    // 新增：韌體下載流程相關
    starting_firmware_download_process: "開始韌體下載流程...",
    starting_device_download: "開始 {0} 設備下載，檔案大小: {1} 位元組",
    firmware_download_completed_time: "韌體下載完成！總時間: {0}ms",
    device_firmware_download_completed: "{0} 設備韌體下載完成",
    initializing_downloader: "正在初始化 {0} 下載器...",
    connecting_device: "正在連接 {0} 設備...",
    cannot_connect_device: "無法連接 {0} 設備",
    downloading_firmware_to_device: "正在下載韌體到 {0} 設備...",
    t5ai_firmware_download_completed: "T5AI 韌體下載完成",
    firmware_download_completed_device_restarted: "韌體下載完成，設備重新啟動中...",
    serial_not_connected_connect_first: "串口未連接，請先連接串口設備",
    restoring_serial_reader_writer_failed: "恢復串口 reader/writer 失敗",
    cleanup_reset_baudrate: "清理：重置波特率中...",
    cleanup_baudrate_reset_success: "清理：波特率重置成功",
    cleanup_reset_failed: "清理：重置失敗",
    flashdownloader_reset_baudrate: "FlashDownloader：重置波特率到115200...",
    flashdownloader_baudrate_reset_success: "FlashDownloader：✅ 波特率成功重置到115200",
    flashdownloader_direct_reset_success: "FlashDownloader：✅ 串口直接重置也成功",
    flashdownloader_reset_failed: "FlashDownloader：波特率重置失敗",
    
    // 新增：串口連接狀態訊息
    serial_connected_initial_switch: "初始連接，將切換到",
    serial_connected_initial: "初始連接",
    bps: "bps"
};

// 導出到全局
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages['zh-tw'] = zhTw;
} 