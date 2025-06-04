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
    
    // Fehleranalyse-bezogen
    error_analysis: "🔍 Fehlerprotokoll-Analyse",
    clear_analysis: "Analyse löschen (Erkennung zurücksetzen)",
    auto_analysis: "Automatische Analyse",
    no_errors_detected: "Keine Fehler erkannt...",
    test_error_analysis: "Fehleranalyse-Test",
    
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
    using_default_chip_support: "Verwende Standard-Chip-Unterstützung (T5AI, T3)",
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
    system_info: "Systeminfo",
    system_info_os: "Betriebssystem",
    system_info_browser: "Browser",
    system_info_web_serial: "Web Serial",
    system_info_platform: "Plattform",
    system_info_supported: "Unterstützt",
    system_info_not_supported: "Nicht unterstützt",
    
    // Serielle Verbindungsunterbrechung
    serial_disconnected_unexpectedly: "Serielle Verbindung unerwartet getrennt: {0}",
    
    // Serieller Port Fehlerbehebungsseite
    troubleshooting_title: "Serieller Port Fehlerbehebungsleitfaden",
    troubleshooting_subtitle: "Vollständiger Leitfaden zur Lösung serieller Verbindungsprobleme",
    back_to_main: "Zurück zur Hauptseite",
    no_serial_ports_found: "Keine seriellen Ports gefunden?",
    serial_troubleshooting_guide: "Probleme mit der seriellen Verbindung? Siehe Fehlerbehebungsanleitung",
    serial_troubleshooting: "Serielle Fehlerbehebung",
    
    // Schnelle Checkliste
    quick_check_title: "Schnelle Checkliste",
    basic_checks: "Grundlegende Prüfpunkte",
    check_browser: "Chrome, Edge oder andere Chromium-basierte Browser verwenden",
    check_cable: "USB-Datenkabel ordnungsgemäß angeschlossen (kein Ladekabel)",
    check_device_power: "Gerät ist ordnungsgemäß eingeschaltet",
    check_other_software: "Andere Software schließen, die serielle Ports belegt",
    
    // Häufige Probleme
    common_issues_title: "Häufige Probleme und Lösungen",
    issue_no_ports: "Problem 1: Keine verfügbaren seriellen Geräte",
    issue_no_ports_desc: "Geräteliste ist leer nach Klick auf \"Seriell verbinden\"",
    issue_connection_failed: "Problem 2: Verbindung fehlgeschlagen",
    issue_connection_failed_desc: "Gerät ist sichtbar, aber Fehler beim Verbinden",
    issue_no_data: "Problem 3: Verbunden aber keine Daten",
    issue_no_data_desc: "Serielle Verbindung erfolgreich, aber keine Daten empfangen oder abnormale Datenanzeige",
    
    possible_causes: "Mögliche Ursachen:",
    cause_driver_missing: "Gerätetreiber nicht installiert oder falsch installiert",
    cause_cable_issue: "USB-Kabelproblem (Ladekabel statt Datenkabel verwendet)",
    cause_device_not_recognized: "Gerät vom System nicht erkannt",
    cause_port_occupied: "Serieller Port von anderen Programmen belegt",
    cause_permission_denied: "Unzureichende Berechtigungen (Linux/macOS)",
    cause_device_busy: "Gerät wird von anderen Anwendungen verwendet",
    cause_driver_conflict: "Treiberkonflikt oder Inkompatibilität",
    cause_baud_rate_mismatch: "Baudrate-Einstellung stimmt nicht überein",
    cause_serial_params_wrong: "Falsche Datenbits-, Stoppbits- oder Paritätseinstellungen",
    cause_device_not_sending: "Gerät sendet keine Daten",
    cause_flow_control: "Flusskontroll-Einstellungsprobleme",
    cause_cable_quality: "Datenkabel-Qualitätsprobleme oder schlechter Kontakt",
    
    // Treiberprobleme-Diagnose
    driver_diagnosis_title: "Treiberprobleme-Diagnose",
    driver_diagnosis_desc: "Die meisten seriellen Port-Probleme sind treiberbezogen, bitte folgen Sie diesen Schritten zur Diagnose",
    
    // Betriebssysteme
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    
    // Windows-bezogen
    windows_check_device_manager: "Schritt 1: Geräte-Manager überprüfen",
    windows_step1_title: "Geräte-Manager öffnen",
    windows_step1_desc: "Rechtsklick auf \"Dieser PC\" → \"Eigenschaften\" → \"Geräte-Manager\", oder Win+X drücken und \"Geräte-Manager\" auswählen",
    windows_step2_title: "Serielle Geräte finden",
    windows_step2_desc: "Folgende Kategorien im Geräte-Manager suchen:",
    windows_step3_title: "Gerätestatus identifizieren",
    windows_step3_desc: "Geräte-Icon-Status überprüfen:",
    
    ports_com_lpt: "Anschlüsse (COM & LPT)",
    universal_serial_bus: "USB-Controller",
    other_devices: "Andere Geräte",
    
    device_normal: "✅ Normal: Gerätename wird normal angezeigt",
    device_warning: "⚠️ Warnung: Gelbes Ausrufezeichen, Treiberproblem",
    device_error: "❌ Fehler: Rotes X, Gerät deaktiviert",
    device_unknown: "❓ Unbekannt: In \"Andere Geräte\", Treiber nicht installiert",
    
    windows_driver_install: "Schritt 2: Treiber installieren",
    windows_manual_install: "Schritt 3: Manuelle Treiberinstallation",
    
    // Treiberbeschreibungen
    ch340_desc: "Häufigster USB-zu-Seriell-Chip",
    cp210x_desc: "Silicon Labs USB-zu-Seriell-Chip",
    ftdi_desc: "FTDI USB-zu-Seriell-Chip",
    
    download_driver: "Entsprechenden Treiber herunterladen",
    download_driver_desc: "Entsprechenden Treiber nach Geräte-Chip-Modell herunterladen",
    run_installer: "Installer ausführen",
    run_installer_desc: "Heruntergeladenen Treiber-Installer als Administrator ausführen",
    restart_computer: "Computer neu starten",
    restart_computer_desc: "Computer nach Installation neu starten, um Treiber zu aktivieren",
    verify_installation: "Installation überprüfen",
    verify_installation_desc: "Gerät wieder anschließen und prüfen, ob es normal im Geräte-Manager angezeigt wird",
    
    screenshot_device_manager: "Geräte-Manager Screenshot-Position",
    
    // macOS-bezogen
    macos_check_system: "Schritt 1: Systeminformationen überprüfen",
    macos_step1_title: "Systeminformationen öffnen",
    macos_step1_desc: "Option-Taste gedrückt halten und Apple-Menü klicken → \"Systeminformationen\"",
    macos_step2_title: "USB-Geräte anzeigen",
    macos_step2_desc: "\"USB\" links auswählen, um angeschlossene USB-Geräte anzuzeigen",
    macos_step3_title: "Serielle Geräte überprüfen",
    macos_step3_desc: "Terminal öffnen und Befehl eingeben, um serielle Geräte anzuzeigen:",
    
    macos_driver_install: "Schritt 2: Treiber installieren",
    macos_driver_note: "macOS hat normalerweise die meisten USB-zu-Seriell-Treiber eingebaut, aber einige Chips benötigen noch manuelle Installation",
    
    ch340_mac_desc: "CH340-Treiber für macOS",
    cp210x_mac_desc: "CP210x-Treiber für macOS",
    
    // Linux-bezogen
    linux_check_system: "Schritt 1: Systemerkennung überprüfen",
    linux_step1_title: "USB-Geräte überprüfen",
    linux_step1_desc: "Terminal öffnen und folgenden Befehl eingeben:",
    linux_step2_title: "Serielle Geräte überprüfen",
    linux_step2_desc: "Verfügbare serielle Geräte anzeigen:",
    linux_step3_title: "Kernel-Nachrichten überprüfen",
    linux_step3_desc: "Kernel-Nachrichten beim Anschließen des Geräts anzeigen:",
    
    linux_permissions: "Schritt 2: Berechtigungen setzen",
    linux_add_user_group: "Benutzer zur dialout-Gruppe hinzufügen",
    linux_add_user_desc: "Folgenden Befehl ausführen und neu anmelden:",
    linux_check_permissions: "Geräteberechtigungen überprüfen",
    linux_check_permissions_desc: "Geräteberechtigungseinstellungen bestätigen:",
    
    // Erweiterte Fehlerbehebung
    advanced_troubleshooting: "Erweiterte Fehlerbehebung",
    hardware_issues: "Hardware-Problemuntersuchung",
    software_conflicts: "Software-Konfliktlösung",
    
    try_different_cable: "Anderes USB-Datenkabel versuchen",
    try_different_port: "Anderen USB-Port versuchen",
    try_different_computer: "Gerät an anderen Computern testen",
    check_device_power: "Prüfen, ob Gerätestromversorgung normal ist",
    
    close_other_serial_software: "Andere serielle Debug-Software schließen",
    disable_antivirus: "Antivirus-Software vorübergehend deaktivieren",
    update_browser: "Browser auf neueste Version aktualisieren",
    clear_browser_cache: "Browser-Cache und -Daten löschen",
    
    // Hilfe erhalten
    get_help_title: "Hilfe erhalten",
    get_help_desc: "Wenn keine der oben genannten Methoden das Problem lösen kann, sammeln Sie bitte die folgenden Informationen und wenden Sie sich an den technischen Support:",
    
    help_info_os: "Betriebssystemversion",
    help_info_browser: "Browserversion",
    help_info_device: "Gerätemodell und Chip-Informationen",
    help_info_error: "Spezifische Fehlermeldungs-Screenshots",
    help_info_device_manager: "Geräte-Manager Screenshots (Windows)",
    
    github_support_desc: "Problembericht auf GitHub einreichen",
    
    // Neu: TuyaOpen Authorization related
    tab_tuya_auth: "TuyaOpen Autorisierung",
    tuya_auth_title: "TuyaOpen Autorisierungscode Schreiben",
    tuya_auth_subtitle: "TuyaOpen Projekt-Autorisierungsinformationen auf Gerät schreiben",
    uuid_label: "UUID (20 Zeichen):",
    auth_key_label: "AUTH_KEY (32 Zeichen):",
    uuid_placeholder: "Geben Sie eine 20-stellige UUID ein...",
    auth_key_placeholder: "Geben Sie einen 32-stelligen AUTH_KEY ein...",
    authorize_btn: "Autorisierung Schreiben",
    tuya_auth_notice_title: "⚠️ Wichtiger Hinweis",
    tuya_auth_notice_content: "Diese Autorisierungsfunktion ist nur für das Schreiben von Autorisierungscodes für TuyaOpen-Projekte anwendbar und kann nicht für Nicht-TuyaOpen-Projekte verwendet werden.",
    tuya_auth_additional_info: "Bitte stellen Sie sicher, dass sich das Gerät im Autorisierungsmodus befindet und der serielle Port korrekt angeschlossen ist, bevor Sie mit der Autorisierungsoperation fortfahren.",
    uuid_length_error: "UUID-Längenfehler! Bitte geben Sie eine 20-stellige UUID ein",
    auth_key_length_error: "AUTH_KEY-Längenfehler! Bitte geben Sie einen 32-stelligen AUTH_KEY ein",
    uuid_empty_error: "Bitte geben Sie die UUID ein",
    auth_key_empty_error: "Bitte geben Sie den AUTH_KEY ein",
    tuya_auth_success: "✅ TuyaOpen Autorisierungsinformationen erfolgreich geschrieben!",
    tuya_auth_failed: "❌ Fehler beim Schreiben der TuyaOpen Autorisierungsinformationen: {0}",
    tuya_auth_sending: "Autorisierungsinformationen werden gesendet...",
    tuya_auth_command_sent: "Autorisierungsbefehl gesendet: auth {0} {1}",
    
    // Autorisierungsbezogene Statusinformationen
    tuya_auth_waiting: "Warten auf Autorisierungsoperation...",
    tuya_auth_connected: "Autorisierungsport verbunden",
    tuya_auth_disconnected: "Autorisierungsport getrennt",
    connect_tuya_auth: "Autorisierungsport Verbinden",
    disconnect_tuya_auth: "Autorisierungsport Trennen",
    tuya_auth_serial_connected: "TuyaOpen Autorisierungsport erfolgreich verbunden!",
    tuya_auth_serial_disconnected: "TuyaOpen Autorisierungsport getrennt.",
    tab_tuya_auth_name: "TuyaOpen Auth",
    
    // TuyaOpen Lizenz-Leitfaden
    license_guide: "Lizenz-Leitfaden",
    license_guide_title: "TuyaOpen Lizenz-Leitfaden",
    license_guide_subtitle: "Erfahren Sie mehr über TuyaOpen-Lizenzen und deren Beschaffung",
    
    what_is_license: "Was ist eine exklusive TuyaOpen-Lizenz",
    license_info: "Alle Versionen des TuyaOpen Framework benötigen exklusive Lizenzen für die ordnungsgemäße Verbindung zur Tuya Cloud.",
    supported_frameworks: "Unterstützte TuyaOpen Frameworks",
    c_version: "C Version TuyaOpen",
    arduino_version: "Arduino Version TuyaOpen", 
    lua_version: "Luanode Version TuyaOpen",
    
    how_to_get: "Wie man eine Lizenz erhält",
    method1_title: "Methode 1: Vorgebrannte Module kaufen",
    method1_desc: "Kaufen Sie vorgebrannte TuyaOpen-Lizenzmodule über die Tuya-Entwicklerplattform. Die Lizenz ist während der Herstellung im entsprechenden Modul vorgebrannt und geht nicht verloren. TuyaOpen liest die Lizenz beim Start über die `tuya_iot_license_read()` Schnittstelle. Bitte bestätigen Sie, ob das aktuelle Gerät eine TuyaOpen-Lizenz gebrannt hat.",
    
    method2_title: "Methode 2: Tuya Platform Kauf",
    method2_desc: "Kaufen Sie TuyaOpen-Lizenzen über die Tuya Developer Platform.",
    method2_advantage: "Vorteil: Offizielle Plattform, unterstützt Großeinkäufe",
    visit_platform: "Plattform Besuchen",
    visit_platform_preburn: "Vorgebranntes Modul Kaufen",
    visit_taobao: "Taobao Besuchen",
    
    method3_title: "Methode 3: Taobao Kauf",
    method3_desc: "Kaufen Sie TuyaOpen-Lizenzen über den Taobao Store.",
    method3_advantage: "Vorteil: Bequemer Einkauf, flexible Zahlungsoptionen",
    
    // Nutzungsanleitung
    usage_guide: "Nutzungsanleitung",
    check_existing: "Schritt 1: Vorhandene Lizenz überprüfen",
    check_warning: "Bitte bestätigen Sie, ob das aktuelle Gerät bereits eine TuyaOpen-Lizenz gebrannt hat.",
    write_license: "Schritt 2: Lizenz schreiben",
    write_desc: "Wenn das Gerät keine gebrannte Lizenz hat, verwenden Sie die \"TuyaOpen Auth\" Funktion:",
    write_step1: "Gerät mit Computer verbinden",
    write_step2: "Zum \"TuyaOpen Auth\" Tab wechseln",
    write_step3: "Seriellen Port verbinden",
    write_step4: "Gekaufte UUID und AUTH_KEY eingeben",
    write_step5: "\"Auth schreiben\" Button klicken",
    write_success: "Nach erfolgreichem Schreiben der Lizenz kann das Gerät das TuyaOpen Framework normal verwenden.",
    
    faq_title: "Häufig gestellte Fragen",
    q1: "Q: Können andere Lizenztypen verwendet werden?",
    a1: "A: Nein. Das TuyaOpen Framework kann nur exklusive TuyaOpen-Lizenzen verwenden.",
    q2: "Q: Geht die Lizenz verloren?",
    a2: "A: Unter normalen Umständen geht die Lizenz nicht verloren.",
    q3: "Q: Wie überprüft man, ob das Gerät bereits einen Autorisierungscode hat?",
    a3: "A: Sie können dies überprüfen, indem Sie die `tuya_iot_license_read()` Schnittstelle im TuyaOpen-Programm aufrufen.",
    
    support_title: "Technischer Support",
    support_desc: "Wenn Sie während der Nutzung auf Probleme stoßen, erhalten Sie Hilfe über folgende Wege:",
    github_support: "Problem-Bericht einreichen"
};

// In globalen Bereich exportieren
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.de = de;
} 