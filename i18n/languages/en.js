// English (en-US)
const en = {
    // Page title and description
    title: "TuyaOpen Serial Tool Beta",
    subtitle: "One-stop developer tool based on Chrome Web Serial API",
    
    // Browser requirements and beta version notice
    browser_requirement: "This tool requires Chrome-based browsers. Other browsers cannot work properly. Please use Chrome, Edge, or other Chromium-based browsers.",
    beta_notice: "Current functionality is in beta version. If you encounter issues, please save relevant logs first, then submit issues to the repository at",
    repository_link: "TuyaOpen-Tools Repository",
    
    // Project related links
    project_info: "This project is part of TuyaOpen. Related projects include:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Tab labels
    tab_serial: "Serial Debug",
    tab_flash: "Firmware Flash",
    
    // Control panel
    control_title: "Serial Connection Control",
    flash_connection_control: "Firmware Download Serial Connection",
    connect: "Connect Serial",
    connect_flash: "Connect Firmware Download Serial",
    disconnect: "Disconnect",
    disconnect_flash: "Disconnect Firmware Download Connection",
    status_disconnected: "Disconnected",
    status_connected: "Connected",
    serial_target_device: "Target Device:",
    custom_device: "Custom",
    baud_rate: "Baud Rate:",
    data_bits: "Data Bits:",
    stop_bits: "Stop Bits:",
    parity: "Parity:",
    parity_none: "None",
    parity_even: "Even",
    parity_odd: "Odd",
    
    // Serial debugging
    receive_data: "Received Data",
    save_log: "Save Log",
    auto_scroll: "Auto Scroll",
    show_timestamp: "Show Timestamp",
    waiting_data: "Waiting for serial data...",
    received: "RX",
    sent: "TX",
    bytes: "bytes",
    
    send_data: "Send Data",
    hex_mode: "HEX Mode",
    add_newline: "Add Newline",
    input_placeholder: "Enter data to send...",
    input_placeholder_hex: "Enter hex data (e.g.: FF 01 02 03)...",
    send: "Send",
    
    quick_send: "Quick Send:",
    manage: "Manage Commands",
    no_quick_commands: "No quick commands yet. Click 'Manage Commands' to add common AT commands, debug instructions, etc. to improve debugging efficiency",
    
    // Firmware flash
    flash_config: "Firmware Flash Configuration",
    target_device: "Target Device:",
    select_file: "Select Firmware File",
    no_file_selected: "No file selected",
    file_size: "File Size",
    start_download: "Start Download",
    stop_download: "Stop Download",
    preparing: "Preparing...",
    downloaded: "Downloaded",
    download_log: "Download Log",
    clear_log: "Clear Log",
    waiting_download: "Waiting for download operation...",
    
    // Quick command management
    quick_send_management: "Quick Send Management",
    add_new_command: "Add New Command",
    display_name: "Display Name:",
    name_example: "e.g.: Reset",
    send_content: "Send Content:",
    content_example: "e.g.: AT+RST",
    add: "Add",
    existing_commands: "Existing Commands",
    no_commands: "No quick commands",
    reset_default: "Reset Default",
    close: "Close",
    
    // Error messages
    error: "Error",
    
    // System messages
    serial_connected: "Serial connected successfully!",
    serial_disconnected: "Serial disconnected.",
    flash_serial_connected: "Firmware Download Serial Connection Successful!",
    flash_serial_disconnected: "Firmware Download Serial Disconnected.",
    switch_to_tab: "Switched to {0}, serial connection closed",
    tab_serial_name: "Serial Debug",
    tab_flash_name: "Firmware Flash",
    
    // Confirmation dialogs
    switch_tab_confirm: "⚠️ Serial Mutex Warning\n\nCurrent {0} function is using serial connection.\n{0} and {1} functions cannot use serial simultaneously.\n\nSwitching to {1} will:\n• Automatically disconnect current serial connection\n• Stop ongoing operations\n\nAre you sure to switch?",
    delete_command_confirm: "Are you sure to delete this quick command?",
    reset_commands_confirm: "Are you sure to reset to default quick commands? This will delete all custom commands.",
    
    // Validation messages
    fill_complete_info: "Please fill in complete command name and content",
    command_name_exists: "Command name already exists, please use another name",
    no_data_to_save: "No data to save",
    no_log_to_save: "No log to save",
    please_select_file: "Please select firmware file first",
    please_connect_serial: "Please connect serial first",
    please_connect_flash_serial: "Please connect firmware download serial first",
    flash_serial_not_connected: "Firmware Download Serial not connected",
    
    // Web Serial API related
    browser_not_supported: "Your browser does not support Web Serial API. Please use Chrome 89+ or Edge 89+ browser.",
    connect_failed: "Connection failed: {0}",
    disconnect_failed: "Disconnection failed: {0}",
    read_error: "Data reading error: {0}",
    send_error: "Data sending error: {0}",
    hex_length_error: "HEX string length must be even",
    serial_not_connected: "Serial not connected",
    download_failed: "Download failed: {0}",
    
    // File operations
    file_selected: "File selected: {0} ({1} bytes)",
    start_download_to: "Start downloading firmware to {0}...",
    download_complete: "Firmware download completed!",
    user_cancelled: "User cancelled download",
    
    // Firmware download progress messages
    flash_handshaking: "Handshaking connection...",
    flash_handshake_success: "Handshake successful",
    flash_handshake_failed: "Handshake failed, please check device connection",
    flash_download_cancelled: "Download cancelled",
    waiting_reset: "Waiting for device reboot...",
    flash_setting_baudrate: "Setting baud rate to {0}...",
    flash_baudrate_set: "Baud rate set successfully",
    flash_erasing: "Erasing Flash...",
    flash_erase_progress: "Erase progress: {0}/{1}",
    flash_erase_sector_failed: "Failed to erase sector {0}: {1}",
    flash_erase_complete: "Flash erase complete",
    flash_writing_data: "Writing data...",
    flash_write_progress: "Write progress: {0}/{1}",
    flash_write_block_failed: "Failed to write block {0}: {1}",
    flash_write_complete: "Data write complete",
    flash_verifying_crc: "Verifying data...",
    flash_crc_passed: "CRC verification passed",
    flash_crc_failed_mismatch: "CRC verification failed: local={0}, device={1}",
    flash_crc_failed: "CRC verification failed: {0}",
    flash_rebooting: "Rebooting device...",
    flash_download_complete: "Download complete",
    flash_download_success: "Download completed successfully!",
    flash_download_failed: "Download failed: {0}",
    flash_downloading: "Download in progress, please wait for completion",
    flash_user_cancelled: "User cancelled operation",
    
    // Log file names
    serial_log_filename: "serial_log_{0}.txt",
    flash_log_filename: "flash_log_{0}.txt",
    
    // Tooltips
    current_tab_connected: "Current {0} function connected to serial",
    disconnect_tab_connection: "Disconnect {0} function serial connection",
    connect_for_tab: "Connect serial for {0} function",
    
    // Copyright information
    powered_by: "Powered by",
    all_rights_reserved: "All rights reserved",
    
    // Debug functions
    debug_mode: "Debug Mode",
    debug_basic: "Basic",
    debug_detailed: "Detailed",
    debug_verbose: "Full",
    export_debug: "Export Debug Log",
    debug_status: "Debug Status",
    debug_level: "Debug Level",
    packets_sent: "Packets Sent",
    packets_received: "Packets Received",
    
    // Function buttons and operations
    fullscreen: "Fullscreen",
    exit_fullscreen: "Exit Fullscreen",
    
    // New: Debug mode status
    debug_mode_enabled: "🔧 Debug mode enabled",
    debug_mode_disabled: "🔧 Debug mode disabled",
    enabled: "Enabled",
    disabled: "Disabled",
    
    // New: Baudrate reset related
    resetting_baudrate_115200: "Resetting serial port baudrate to 115200...",
    baudrate_reset_success: "✅ Serial port baudrate reset to 115200",
    direct_serial_reset_success: "✅ Serial port directly reset to 115200",
    baudrate_reset_failed: "Failed to reset serial port baudrate",
    direct_reset_failed: "Direct serial port reset also failed",
    
    // New: Downloader manager related
    downloader_manager_not_initialized: "Downloader manager not initialized",
    loaded_chip_types: "Loaded {0} supported chip types",
    using_default_chip_support: "Using default chip support (T5AI)",
    unsupported_device_type: "Unsupported device type: {0}",
    unsupported_chip_type: "Unsupported chip type: {0}",
    
    // New: Firmware download process related
    starting_firmware_download_process: "Starting firmware download process...",
    starting_device_download: "Starting {0} firmware download, file size: {1} bytes",
    firmware_download_completed_time: "Firmware download completed, total time: {0} seconds",
    device_firmware_download_completed: "{0} firmware download completed",
    initializing_downloader: "Initializing {0} downloader...",
    connecting_device: "Connecting to {0} device...",
    cannot_connect_device: "Cannot connect to {0} device",
    downloading_firmware_to_device: "Starting firmware download to {0} device...",
    t5ai_firmware_download_completed: "✅ T5AI firmware download completed",
    firmware_download_completed_device_restarted: "Firmware download completed, device restarted",
    
    // New: Serial connection related
    serial_not_connected_connect_first: "Serial port not connected, please connect serial device first",
    restoring_serial_reader_writer_failed: "Failed to restore serial reader/writer",
    
    // New: Cleanup and reset related
    cleanup_reset_baudrate: "Cleanup: Resetting serial port baudrate to 115200...",
    cleanup_baudrate_reset_success: "Cleanup: ✅ Serial port baudrate reset to 115200",
    cleanup_reset_failed: "Cleanup: Failed to reset serial port baudrate",
    flashdownloader_reset_baudrate: "FlashDownloader: Resetting serial port baudrate to 115200...",
    flashdownloader_baudrate_reset_success: "FlashDownloader: ✅ Serial port baudrate reset to 115200",
    flashdownloader_direct_reset_success: "FlashDownloader: ✅ Serial port directly reset to 115200",
    flashdownloader_reset_failed: "FlashDownloader: Baudrate reset failed",
    flashdownloader_direct_reset_failed: "FlashDownloader: Direct serial port reset also failed",
    
    // New: Serial connection status messages
    serial_connected_initial_switch: "initial connection, will switch to",
    serial_connected_initial: "initial connection",
    bps: "bps",
    
    // New: Console debug messages (only essential ones for demo)
    console_flash_connect_success: "Firmware download connected successfully (115200), serial debug connection status:",
    console_flash_connect_failed: "Firmware download connection failed:",
    console_flash_independent_success: "Firmware download independent connection successful (115200), serial debug connection status:",
    console_filtered_null_chars: "Filtered {0} 0x00 characters",
    console_language_switched: "Language switched to:",
    console_language_display_updated: "Language display updated to:",
    console_serial_target_device: "Serial target device selection:",
    
    // Serial disconnection handling
    serial_disconnected_unexpectedly: "Serial connection unexpectedly disconnected: {0}"
};

// Export to global
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.en = en;
} 