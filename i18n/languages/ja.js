// 日本語 (ja-JP)
const ja = {
    // ページタイトルと説明
    title: "TuyaOpenシリアルツール ベータ版",
    subtitle: "Chrome Web Serial APIベースのワンストップ開発者ツール",
    
    // ブラウザ要件とベータ版通知
    browser_requirement: "このツールはChromeベースのブラウザが必要です。他のブラウザは正常に動作しません。Chrome、Edge、またはその他のChromiumベースのブラウザをご使用ください。",
    beta_notice: "現在の機能はベータ版です。問題が発生した場合は、まず関連ログを保存してから、リポジトリに問題を報告してください",
    repository_link: "TuyaOpen-Tools リポジトリ",
    
    // プロジェクト関連リンク
    project_info: "このプロジェクトはTuyaOpenの一部です。関連プロジェクトには以下が含まれます：",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // タブラベル
    tab_serial: "シリアルデバッグ",
    tab_flash: "ファームウェアダウンロード",
    
    // コントロールパネル
    control_title: "シリアル接続制御",
    flash_connection_control: "ファームウェアダウンロード用シリアル接続",
    connect: "シリアル接続",
    connect_flash: "ファームウェアダウンロード用シリアル接続",
    disconnect: "切断",
    disconnect_flash: "ファームウェアダウンロード接続を切断",
    status_disconnected: "未接続",
    status_connected: "接続済み",
    serial_target_device: "ターゲットデバイス:",
    custom_device: "カスタム",
    baud_rate: "ボーレート:",
    data_bits: "データビット:",
    stop_bits: "ストップビット:",
    parity: "パリティ:",
    parity_none: "なし",
    parity_even: "偶数",
    parity_odd: "奇数",
    
    // シリアルデバッグ
    receive_data: "受信データ",
    save_log: "ログ保存",
    auto_scroll: "自動スクロール",
    show_timestamp: "タイムスタンプ表示",
    waiting_data: "シリアルデータを待機中...",
    received: "RX",
    sent: "TX",
    bytes: "バイト",
    
    send_data: "データ送信",
    hex_mode: "HEXモード",
    add_newline: "改行追加",
    input_placeholder: "送信するデータを入力...",
    input_placeholder_hex: "16進データを入力 (例: FF 01 02 03)...",
    send: "送信",
    
    quick_send: "クイック送信:",
    manage: "コマンド管理",
    no_quick_commands: "クイックコマンドがありません。「コマンド管理」をクリックして、よく使うATコマンドやデバッグ命令などを追加し、デバッグ効率を向上させましょう",
    
    // ファームウェアフラッシュ
    flash_config: "ファームウェアダウンロード設定",
    target_device: "ターゲットデバイス:",
    select_file: "ファームウェアファイル選択",
    no_file_selected: "ファイル未選択",
    file_size: "ファイルサイズ",
    start_download: "ダウンロード開始",
    stop_download: "ダウンロード停止",
    preparing: "準備中...",
    downloaded: "ダウンロード済み",
    download_log: "ダウンロードログ",
    clear_log: "ログクリア",
    waiting_download: "ダウンロード操作を待機中...",
    
    // クイックコマンド管理
    quick_send_management: "クイック送信管理",
    add_new_command: "新しいコマンド追加",
    display_name: "表示名:",
    name_example: "例: リセット",
    send_content: "送信内容:",
    content_example: "例: AT+RST",
    add: "追加",
    existing_commands: "既存のコマンド",
    no_commands: "クイックコマンドなし",
    reset_default: "デフォルトに戻す",
    close: "閉じる",
    
    // エラーメッセージ
    error: "エラー",
    
    // システムメッセージ
    serial_connected: "シリアル接続成功！",
    serial_disconnected: "シリアル切断されました。",
    flash_serial_connected: "ファームウェアダウンロード用シリアル接続成功！",
    flash_serial_disconnected: "ファームウェアダウンロード用シリアルが切断されました。",
    switch_to_tab: "{0}に切り替え、シリアル接続を閉じました",
    tab_serial_name: "シリアルデバッグ",
    tab_flash_name: "ファームウェアダウンロード",
    
    // 確認ダイアログ
    switch_tab_confirm: "⚠️ シリアルミューテックス警告\n\n現在の{0}機能がシリアル接続を使用中です。\n{0}と{1}機能は同時にシリアルを使用できません。\n\n{1}に切り替えると:\n• 現在のシリアル接続を自動切断\n• 進行中の操作を停止\n\n切り替えてもよろしいですか？",
    delete_command_confirm: "このクイックコマンドを削除してもよろしいですか？",
    reset_commands_confirm: "デフォルトのクイックコマンドに戻してもよろしいですか？すべてのカスタムコマンドが削除されます。",
    
    // 検証メッセージ
    fill_complete_info: "コマンド名と内容を完全に入力してください",
    command_name_exists: "コマンド名が既に存在します、別の名前を使用してください",
    no_data_to_save: "保存するデータがありません",
    no_log_to_save: "保存するログがありません",
    please_select_file: "まずファームウェアファイルを選択してください",
    please_connect_serial: "まずシリアルに接続してください",
    please_connect_flash_serial: "まずファームウェアダウンロード用シリアルに接続してください",
    flash_serial_not_connected: "ファームウェアダウンロード用シリアルが接続されていません",
    
    // Web Serial API関連
    browser_not_supported: "お使いのブラウザはWeb Serial APIをサポートしていません。Chrome 89+またはEdge 89+をご使用ください。",
    connect_failed: "接続失敗: {0}",
    disconnect_failed: "切断失敗: {0}",
    read_error: "データ読み取りエラー: {0}",
    send_error: "データ送信エラー: {0}",
    hex_length_error: "HEX文字列の長さは偶数である必要があります",
    serial_not_connected: "シリアル未接続",
    download_failed: "ダウンロード失敗: {0}",
    
    // ファイル操作
    file_selected: "ファイル選択: {0} ({1} バイト)",
    start_download_to: "{0}へのファームウェアダウンロードを開始...",
    download_complete: "ファームウェアダウンロード完了！",
    user_cancelled: "ユーザーがダウンロードをキャンセル",
    
    // ファームウェアダウンロード進行メッセージ
    flash_handshaking: "ハンドシェイク接続中...",
    flash_handshake_success: "ハンドシェイク成功",
    flash_handshake_failed: "ハンドシェイク失敗、デバイス接続を確認してください",
    flash_download_cancelled: "ダウンロードキャンセル",
    waiting_reset: "デバイス再起動を待機中...",
    flash_setting_baudrate: "ボーレートを{0}に設定中...",
    flash_baudrate_set: "ボーレート設定完了",
    flash_erasing: "フラッシュ消去中...",
    flash_erase_progress: "消去進行: {0}/{1}",
    flash_erase_sector_failed: "セクター{0}の消去失敗: {1}",
    flash_erase_complete: "フラッシュ消去完了",
    flash_writing_data: "データ書き込み中...",
    flash_write_progress: "書き込み進行: {0}/{1}",
    flash_write_block_failed: "ブロック{0}書き込み失敗: {1}",
    flash_write_complete: "データ書き込み完了",
    flash_verifying_crc: "データ検証中...",
    flash_crc_passed: "CRC検証成功",
    flash_crc_failed_mismatch: "CRC検証失敗: ローカル={0}, デバイス={1}",
    flash_crc_failed: "CRC検証失敗: {0}",
    flash_rebooting: "デバイス再起動中...",
    flash_download_complete: "ダウンロード完了",
    flash_download_success: "ダウンロード成功完了！",
    flash_download_failed: "ダウンロード失敗: {0}",
    flash_downloading: "ダウンロード進行中、完了をお待ちください",
    flash_user_cancelled: "ユーザーが操作をキャンセル",
    
    // ログファイル名
    serial_log_filename: "シリアルログ_{0}.txt",
    flash_log_filename: "フラッシュログ_{0}.txt",
    
    // ツールチップ
    current_tab_connected: "現在の{0}機能がシリアルに接続",
    disconnect_tab_connection: "{0}機能のシリアル接続を切断",
    connect_for_tab: "{0}機能用にシリアル接続",
    
    // 版権情報
    powered_by: "提供元",
    all_rights_reserved: "全著作権所有",
    
    // デバッグ機能
    debug_mode: "デバッグモード",
    debug_basic: "基本",
    debug_detailed: "詳細",
    debug_verbose: "完全",
    export_debug: "デバッグログをエクスポート",
    debug_status: "デバッグ状態",
    debug_level: "デバッグレベル",
    packets_sent: "送信パケット数",
    packets_received: "受信パケット数",
    
    // 機能ボタンと操作
    fullscreen: "フルスクリーン",
    exit_fullscreen: "フルスクリーン終了",
    
    // 新規: デバッグモード状態
    debug_mode_enabled: "🔧 デバッグモード有効",
    debug_mode_disabled: "🔧 デバッグモード無効",
    enabled: "有効",
    disabled: "無効",
    
    // 新規: ボーレートリセット関連
    resetting_baudrate_115200: "シリアルポートのボーレートを115200にリセット中...",
    baudrate_reset_success: "✅ シリアルポートのボーレートを115200にリセットしました",
    direct_serial_reset_success: "✅ シリアルポートを115200に直接リセットしました",
    baudrate_reset_failed: "シリアルポートのボーレートリセットに失敗",
    direct_reset_failed: "シリアルポートの直接リセットも失敗",
    
    // 新規: ダウンローダマネージャ関連
    downloader_manager_not_initialized: "ダウンローダマネージャが初期化されていません",
    loaded_chip_types: "{0}種類のサポート対象チップタイプを読み込みました",
    using_default_chip_support: "デフォルトチップサポートを使用 (T5AI)",
    unsupported_device_type: "サポートされていないデバイスタイプ: {0}",
    unsupported_chip_type: "サポートされていないチップタイプ: {0}",
    
    // 新規: ファームウェアダウンロードプロセス関連
    starting_firmware_download_process: "ファームウェアダウンロードプロセスを開始中...",
    starting_device_download: "{0}デバイスダウンロードを開始、ファイルサイズ: {1}バイト",
    firmware_download_completed_time: "ファームウェアダウンロード完了! 総時間: {0}ms",
    device_firmware_download_completed: "{0}デバイスファームウェアダウンロード完了",
    initializing_downloader: "{0}ダウンローダを初期化中...",
    connecting_device: "{0}デバイスに接続中...",
    cannot_connect_device: "{0}デバイスに接続できません",
    downloading_firmware_to_device: "{0}デバイスにファームウェアをダウンロード中...",
    t5ai_firmware_download_completed: "T5AIファームウェアダウンロード完了",
    firmware_download_completed_device_restarted: "ファームウェアダウンロード完了、デバイスを再起動中...",
    serial_not_connected_connect_first: "シリアルが接続されていません、まずシリアルデバイスを接続してください",
    restoring_serial_reader_writer_failed: "シリアルreader/writerの復元に失敗",
    cleanup_reset_baudrate: "クリーンアップ: ボーレートをリセット中...",
    cleanup_baudrate_reset_success: "クリーンアップ: ボーレートのリセットに成功",
    cleanup_reset_failed: "クリーンアップ: リセットに失敗",
    flashdownloader_reset_baudrate: "FlashDownloader: ボーレートを115200にリセット中...",
    flashdownloader_baudrate_reset_success: "FlashDownloader: ✅ ボーレートを115200に正常にリセット",
    flashdownloader_direct_reset_success: "FlashDownloader: ✅ シリアルポートの直接リセットも成功",
    flashdownloader_reset_failed: "FlashDownloader: ボーレートリセット失敗",
    
    // 新規: シリアル接続状態メッセージ
    serial_connected_initial_switch: "初期接続、次に切り替えます",
    serial_connected_initial: "初期接続",
    bps: "bps",
    
    // システム情報関連
    system_info: "システム情報",
    system_info_os: "OS",
    system_info_browser: "ブラウザ",
    system_info_web_serial: "Web Serial",
    system_info_platform: "プラットフォーム",
    system_info_supported: "サポート",
    system_info_not_supported: "非サポート"
};

// グローバルにエクスポート
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.ja = ja;
}
