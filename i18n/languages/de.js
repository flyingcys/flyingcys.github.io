// Deutsch (de-DE)
const de = {
    // Seitentitel und Beschreibung
    title: "TuyaOpen Serial Tool Beta",
    subtitle: "All-in-One-Entwicklertool basierend auf Chrome Web Serial API",
    
    // Browser-Anforderungen und Beta-Version-Hinweis
    browser_requirement: "Dieses Tool erfordert Chrome-basierte Browser. Andere Browser können nicht ordnungsgemäß funktionieren. Verwenden Sie Chrome, Edge oder andere Chromium-basierte Browser.",
    beta_notice: "Die aktuelle Funktionalität befindet sich in der Beta-Version. Bei Problemen speichern Sie bitte zuerst die relevanten Logs und melden Sie dann Probleme im Repository unter",
    repository_link: "TuyaOpen-Tools Repository",
    
    // Projektbezogene Links
    project_info: "Dieses Projekt ist Teil von TuyaOpen. Verwandte Projekte umfassen:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Tab-Labels
    tab_serial: "Serial Debug",
    tab_flash: "Firmware-Download",
    
    // Bedienfeld
    control_title: "Serial-Verbindungssteuerung",
    flash_connection_control: "Firmware-Download Serial-Verbindung",
    connect: "Serial verbinden",
    connect_flash: "Firmware-Download Serial verbinden",
    disconnect: "Trennen",
    disconnect_flash: "Firmware-Download trennen",
    status_disconnected: "Getrennt",
    status_connected: "Verbunden",
    serial_target_device: "Zielgerät:",
    custom_device: "Benutzerdefiniert",
    baud_rate: "Baudrate:",
    data_bits: "Datenbits:",
    stop_bits: "Stoppbits:",
    parity: "Parität:",
    parity_none: "Keine",
    parity_even: "Gerade",
    parity_odd: "Ungerade",
    
    // Serial-Debug
    receive_data: "Empfangene Daten",
    save_log: "Log speichern",
    auto_scroll: "Auto-Scroll",
    show_timestamp: "Zeitstempel anzeigen",
    waiting_data: "Warten auf Serial-Daten...",
    received: "RX",
    sent: "TX",
    bytes: "Bytes",
    
    send_data: "Daten senden",
    hex_mode: "HEX-Modus",
    add_newline: "Neue Zeile hinzufügen",
    input_placeholder: "Zu sendende Daten eingeben...",
    input_placeholder_hex: "Hex-Daten eingeben (z.B.: FF 01 02 03)...",
    send: "Senden",
    
    quick_send: "Schnellsendung:",
    manage: "Befehle verwalten",
    no_quick_commands: "Keine Schnellbefehle vorhanden. Klicken Sie auf 'Befehle verwalten', um häufig verwendete AT-Befehle, Debug-Kommandos usw. hinzuzufügen und die Debug-Effizienz zu verbessern",
    
    // Firmware-Flash
    flash_config: "Firmware-Download-Konfiguration",
    target_device: "Zielgerät:",
    select_file: "Firmware-Datei auswählen",
    no_file_selected: "Keine Datei ausgewählt",
    file_size: "Dateigröße",
    start_download: "Download starten",
    stop_download: "Download stoppen",
    preparing: "Vorbereitung...",
    downloaded: "Heruntergeladen",
    download_log: "Download-Log",
    clear_log: "Log löschen",
    waiting_download: "Warten auf Download-Operation...",
    
    // Schnellbefehl-Verwaltung
    quick_send_management: "Schnellsendung-Verwaltung",
    add_new_command: "Neuen Befehl hinzufügen",
    display_name: "Anzeigename:",
    name_example: "z.B.: Reset",
    send_content: "Zu sendender Inhalt:",
    content_example: "z.B.: AT+RST",
    add: "Hinzufügen",
    existing_commands: "Vorhandene Befehle",
    no_commands: "Keine Schnellbefehle",
    reset_default: "Standard zurücksetzen",
    close: "Schließen",
    
    // Fehlermeldungen
    error: "Fehler",
    
    // Systemmeldungen
    serial_connected: "Serial erfolgreich verbunden!",
    serial_disconnected: "Serial getrennt.",
    flash_serial_connected: "Firmware-Download Serial-Verbindung erfolgreich!",
    flash_serial_disconnected: "Firmware-Download Serial getrennt.",
    switch_to_tab: "Zu {0} gewechselt, Serial-Verbindung geschlossen",
    tab_serial_name: "Serial Debug",
    tab_flash_name: "Firmware-Download",
    
    // Bestätigungsdialoge
    switch_tab_confirm: "⚠️ Serial Mutex Warnung\n\nDie aktuelle {0}-Funktion verwendet eine Serial-Verbindung.\n{0}- und {1}-Funktionen können nicht gleichzeitig Serial verwenden.\n\nWechsel zu {1} wird:\n• Automatisch die aktuelle Serial-Verbindung trennen\n• Laufende Operationen stoppen\n\nSind Sie sicher, dass Sie wechseln möchten?",
    delete_command_confirm: "Sind Sie sicher, dass Sie diesen Schnellbefehl löschen möchten?",
    reset_commands_confirm: "Sind Sie sicher, dass Sie auf Standard-Schnellbefehle zurücksetzen möchten? Dies löscht alle benutzerdefinierten Befehle.",
    
    // Validierungsmeldungen
    fill_complete_info: "Bitte füllen Sie vollständigen Befehlsnamen und Inhalt aus",
    command_name_exists: "Befehlsname existiert bereits, verwenden Sie einen anderen Namen",
    no_data_to_save: "Keine Daten zum Speichern",
    no_log_to_save: "Kein Log zum Speichern",
    please_select_file: "Wählen Sie zuerst eine Firmware-Datei aus",
    please_connect_serial: "Verbinden Sie zuerst Serial",
    please_connect_flash_serial: "Verbinden Sie zuerst Firmware-Download Serial",
    flash_serial_not_connected: "Firmware-Download Serial nicht verbunden",
    
    // Web Serial API bezogen
    browser_not_supported: "Ihr Browser unterstützt Web Serial API nicht. Verwenden Sie Chrome 89+ oder Edge 89+.",
    connect_failed: "Verbindung fehlgeschlagen: {0}",
    disconnect_failed: "Trennung fehlgeschlagen: {0}",
    read_error: "Datenlesefehler: {0}",
    send_error: "Datensendungsfehler: {0}",
    hex_length_error: "HEX-String-Länge muss gerade sein",
    serial_not_connected: "Serial nicht verbunden",
    download_failed: "Download fehlgeschlagen: {0}",
    
    // Dateioperationen
    file_selected: "Datei ausgewählt: {0} ({1} Bytes)",
    start_download_to: "Starte Firmware-Download zu {0}...",
    download_complete: "Firmware-Download abgeschlossen!",
    user_cancelled: "Benutzer hat Download abgebrochen",
    
    // Firmware-Download-Fortschrittsmeldungen
    flash_handshaking: "Handshake wird hergestellt...",
    flash_handshake_success: "Handshake erfolgreich",
    flash_handshake_failed: "Handshake fehlgeschlagen, überprüfen Sie die Geräteverbindung",
    flash_download_cancelled: "Download abgebrochen",
    waiting_reset: "Warten auf Geräte-Neustart...",
    flash_setting_baudrate: "Setze Baudrate auf {0}...",
    flash_baudrate_set: "Baudrate erfolgreich gesetzt",
    flash_erasing: "Flash wird gelöscht...",
    flash_erase_progress: "Löschfortschritt: {0}/{1}",
    flash_erase_sector_failed: "Fehler beim Löschen von Sektor {0}: {1}",
    flash_erase_complete: "Flash-Löschung abgeschlossen",
    flash_writing_data: "Daten werden geschrieben...",
    flash_write_progress: "Schreibfortschritt: {0}/{1}",
    flash_write_block_failed: "Fehler beim Schreiben von Block {0}: {1}",
    flash_write_complete: "Datenschreibung abgeschlossen",
    flash_verifying_crc: "Daten werden verifiziert...",
    flash_crc_passed: "CRC-Verifikation bestanden",
    flash_crc_failed_mismatch: "CRC-Verifikation fehlgeschlagen: lokal={0}, Gerät={1}",
    flash_crc_failed: "CRC-Verifikation fehlgeschlagen: {0}",
    flash_rebooting: "Gerät wird neu gestartet...",
    flash_download_complete: "Download abgeschlossen",
    flash_download_success: "Download erfolgreich abgeschlossen!",
    flash_download_failed: "Download fehlgeschlagen: {0}",
    flash_downloading: "Download läuft, bitte warten Sie auf Abschluss",
    flash_user_cancelled: "Benutzer hat Operation abgebrochen",
    
    // Log-Dateinamen
    serial_log_filename: "serial_log_{0}.txt",
    flash_log_filename: "flash_log_{0}.txt",
    
    // Tooltips
    current_tab_connected: "Aktuelle {0}-Funktion mit Serial verbunden",
    disconnect_tab_connection: "{0}-Funktion Serial-Verbindung trennen",
    connect_for_tab: "Serial für {0}-Funktion verbinden",
    
    // Copyright-Informationen
    powered_by: "Betrieben von",
    all_rights_reserved: "Alle Rechte vorbehalten",
    
    // Debug-Funktionen
    debug_mode: "Debug-Modus",
    debug_basic: "Grundlegend",
    debug_detailed: "Detailliert",
    debug_verbose: "Vollständig",
    export_debug: "Debug-Log exportieren",
    debug_status: "Debug-Status",
    debug_level: "Debug-Level",
    packets_sent: "Gesendete Pakete",
    packets_received: "Empfangene Pakete",
    
    // Funktionstasten und Operationen
    fullscreen: "Vollbild",
    exit_fullscreen: "Vollbild verlassen",
    
    // Neu: Debug-Modus-Status
    debug_mode_enabled: "🔧 Debug-Modus aktiviert",
    debug_mode_disabled: "🔧 Debug-Modus deaktiviert",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
    
    // Neu: Baudrate-Reset-bezogen
    resetting_baudrate_115200: "Setze Serial-Port-Baudrate auf 115200 zurück...",
    baudrate_reset_success: "✅ Serial-Port-Baudrate auf 115200 zurückgesetzt",
    direct_serial_reset_success: "✅ Serial-Port direkt auf 115200 zurückgesetzt",
    baudrate_reset_failed: "Zurücksetzen der Serial-Port-Baudrate fehlgeschlagen",
    direct_reset_failed: "Direktes Zurücksetzen des Serial-Ports ebenfalls fehlgeschlagen",
    
    // Neu: Download-Manager-bezogen
    downloader_manager_not_initialized: "Download-Manager nicht initialisiert",
    loaded_chip_types: "{0} unterstützte Chip-Typen geladen",
    using_default_chip_support: "Verwende Standard-Chip-Unterstützung (T5AI)",
    unsupported_device_type: "Nicht unterstützter Gerätetyp: {0}",
    unsupported_chip_type: "Nicht unterstützter Chip-Typ: {0}",
    
    // Neu: Firmware-Download-Prozess-bezogen
    starting_firmware_download_process: "Starte Firmware-Download-Prozess...",
    starting_device_download: "Starte {0}-Geräte-Download, Dateigröße: {1} Bytes",
    firmware_download_completed_time: "Firmware-Download abgeschlossen! Gesamtzeit: {0}ms",
    device_firmware_download_completed: "{0}-Geräte-Firmware-Download abgeschlossen",
    initializing_downloader: "Initialisiere {0}-Downloader...",
    connecting_device: "Verbinde mit {0}-Gerät...",
    cannot_connect_device: "Kann nicht mit {0}-Gerät verbinden",
    downloading_firmware_to_device: "Lade Firmware auf {0}-Gerät herunter...",
    t5ai_firmware_download_completed: "T5AI-Firmware-Download abgeschlossen",
    firmware_download_completed_device_restarted: "Firmware-Download abgeschlossen, Gerät wird neu gestartet...",
    serial_not_connected_connect_first: "Serial nicht verbunden, bitte verbinden Sie zuerst das Serial-Gerät",
    restoring_serial_reader_writer_failed: "Wiederherstellung von Serial-Reader/Writer fehlgeschlagen",
    cleanup_reset_baudrate: "Cleanup: Setze Baudrate zurück...",
    cleanup_baudrate_reset_success: "Cleanup: Baudrate erfolgreich zurückgesetzt",
    cleanup_reset_failed: "Cleanup: Reset fehlgeschlagen",
    flashdownloader_reset_baudrate: "FlashDownloader: Setze Baudrate auf 115200 zurück...",
    flashdownloader_baudrate_reset_success: "FlashDownloader: ✅ Baudrate erfolgreich auf 115200 zurückgesetzt",
    flashdownloader_direct_reset_success: "FlashDownloader: ✅ Direkter Serial-Reset ebenfalls erfolgreich",
    flashdownloader_reset_failed: "FlashDownloader: Baudrate-Reset fehlgeschlagen",
    
    // Neu: Serial-Verbindungsstatusmeldungen
    serial_connected_initial_switch: "Erste Verbindung, wird gewechselt zu",
    serial_connected_initial: "Erste Verbindung",
    bps: "bps",
    
    // Systeminformationen
    system_info: "System Info",
    system_info_os: "Betriebssystem",
    system_info_browser: "Browser",
    system_info_web_serial: "Web Serial",
    system_info_platform: "Plattform",
    system_info_supported: "Unterstützt",
    system_info_not_supported: "Nicht unterstützt"
};

// In globalen Bereich exportieren
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.de = de;
} 