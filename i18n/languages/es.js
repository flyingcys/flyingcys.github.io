// Español (es-ES)
const es = {
    // Título de página y descripción
    title: "Herramienta Serial TuyaOpen Beta",
    subtitle: "Herramienta de desarrollador todo-en-uno basada en la API Chrome Web Serial",
    
    // Requisitos del navegador y aviso de versión beta
    browser_requirement: "Esta herramienta requiere navegadores basados en Chrome. Otros navegadores no pueden funcionar correctamente. Use Chrome, Edge u otros navegadores basados en Chromium.",
    beta_notice: "La funcionalidad actual está en versión beta. Si encuentra problemas, por favor guarde primero los logs relevantes, luego reporte problemas en el repositorio en",
    repository_link: "Repositorio TuyaOpen-Tools",
    
    // Enlaces relacionados con el proyecto
    project_info: "Este proyecto es parte de TuyaOpen. Los proyectos relacionados incluyen:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Etiquetas de pestañas
    tab_serial: "Debug Serial",
    tab_flash: "Descarga de Firmware",
    
    // Panel de control
    control_title: "Control de Conexión Serial",
    flash_connection_control: "Conexión Serial de Descarga de Firmware",
    connect: "Conectar Serial",
    connect_flash: "Conectar Serial de Descarga de Firmware",
    disconnect: "Desconectar",
    disconnect_flash: "Desconectar Descarga de Firmware",
    status_disconnected: "Desconectado",
    status_connected: "Conectado",
    baud_rate: "Velocidad de Baudios:",
    data_bits: "Bits de Datos:",
    stop_bits: "Bits de Parada:",
    parity: "Paridad:",
    parity_none: "Ninguna",
    parity_even: "Par",
    parity_odd: "Impar",
    
    // Debug serial
    receive_data: "Datos Recibidos",
    save_log: "Guardar Registro",
    auto_scroll: "Desplazamiento Automático",
    show_timestamp: "Mostrar Marca de Tiempo",
    waiting_data: "Esperando datos seriales...",
    received: "RX",
    sent: "TX",
    bytes: "bytes",
    
    send_data: "Enviar Datos",
    hex_mode: "Modo HEX",
    add_newline: "Agregar Nueva Línea",
    input_placeholder: "Ingrese datos para enviar...",
    input_placeholder_hex: "Ingrese datos hex (ej.: FF 01 02 03)...",
    send: "Enviar",
    
    quick_send: "Envío Rápido:",
    manage: "Gestionar Comandos",
    no_quick_commands: "No hay comandos rápidos aún. Haga clic en 'Gestionar Comandos' para agregar comandos AT comunes, instrucciones de depuración, etc. y mejorar la eficiencia de depuración",
    
    // Flash de firmware
    flash_config: "Configuración de Descarga de Firmware",
    target_device: "Dispositivo Objetivo:",
    select_file: "Seleccionar Archivo de Firmware",
    no_file_selected: "No se ha seleccionado archivo",
    file_size: "Tamaño del Archivo",
    start_download: "Iniciar Descarga",
    stop_download: "Detener Descarga",
    preparing: "Preparando...",
    downloaded: "Descargado",
    download_log: "Registro de Descarga",
    clear_log: "Limpiar Registro",
    waiting_download: "Esperando operación de descarga...",
    
    // Gestión de comandos rápidos
    quick_send_management: "Gestión de Envío Rápido",
    add_new_command: "Agregar Nuevo Comando",
    display_name: "Nombre a Mostrar:",
    name_example: "ej.: Reiniciar",
    send_content: "Contenido a Enviar:",
    content_example: "ej.: AT+RST",
    add: "Agregar",
    existing_commands: "Comandos Existentes",
    no_commands: "No hay comandos rápidos",
    reset_default: "Restablecer Predeterminado",
    close: "Cerrar",
    
    // Mensajes de error
    error: "Error",
    
    // Mensajes del sistema
    serial_connected: "¡Serial conectado exitosamente!",
    serial_disconnected: "Serial desconectado.",
    flash_serial_connected: "¡Conexión Serial de Descarga de Firmware Exitosa!",
    flash_serial_disconnected: "Serial de Descarga de Firmware Desconectado.",
    switch_to_tab: "Cambiado a {0}, conexión serial cerrada",
    tab_serial_name: "Debug Serial",
    tab_flash_name: "Descarga de Firmware",
    
    // Diálogos de confirmación
    switch_tab_confirm: "⚠️ Advertencia de Mutex Serial\n\nLa función {0} actual está usando conexión serial.\nLas funciones {0} y {1} no pueden usar serial simultáneamente.\n\nCambiar a {1} hará:\n• Desconectar automáticamente la conexión serial actual\n• Detener operaciones en curso\n\n¿Está seguro de cambiar?",
    delete_command_confirm: "¿Está seguro de eliminar este comando rápido?",
    reset_commands_confirm: "¿Está seguro de restablecer a los comandos rápidos predeterminados? Esto eliminará todos los comandos personalizados.",
    
    // Mensajes de validación
    fill_complete_info: "Por favor complete el nombre del comando y el contenido",
    command_name_exists: "El nombre del comando ya existe, por favor use otro nombre",
    no_data_to_save: "No hay datos para guardar",
    no_log_to_save: "No hay registro para guardar",
    please_select_file: "Por favor seleccione primero el archivo de firmware",
    please_connect_serial: "Por favor conecte primero el serial",
    please_connect_flash_serial: "Por favor conecte primero el serial de descarga de firmware",
    flash_serial_not_connected: "Serial de Descarga de Firmware no conectado",
    
    // Relacionado con Web Serial API
    browser_not_supported: "Su navegador no soporta Web Serial API. Por favor use Chrome 89+ o Edge 89+.",
    connect_failed: "Falló la conexión: {0}",
    disconnect_failed: "Falló la desconexión: {0}",
    read_error: "Error de lectura de datos: {0}",
    send_error: "Error de envío de datos: {0}",
    hex_length_error: "La longitud de la cadena HEX debe ser par",
    serial_not_connected: "Serial no conectado",
    download_failed: "Falló la descarga: {0}",
    
    // Operaciones de archivo
    file_selected: "Archivo seleccionado: {0} ({1} bytes)",
    start_download_to: "Iniciando descarga de firmware a {0}...",
    download_complete: "¡Descarga de firmware completada!",
    user_cancelled: "Usuario canceló la descarga",
    
    // Mensajes de progreso de descarga de firmware
    flash_handshaking: "Estableciendo handshake...",
    flash_handshake_success: "Handshake exitoso",
    flash_handshake_failed: "Falló el handshake, por favor verifique la conexión del dispositivo",
    flash_download_cancelled: "Descarga cancelada",
    waiting_reset: "Esperando reinicio del dispositivo...",
    flash_setting_baudrate: "Estableciendo velocidad de baudios a {0}...",
    flash_baudrate_set: "Velocidad de baudios establecida exitosamente",
    flash_erasing: "Borrando Flash...",
    flash_erase_progress: "Progreso de borrado: {0}/{1}",
    flash_erase_sector_failed: "Falló el borrado del sector {0}: {1}",
    flash_erase_complete: "Borrado de Flash completo",
    flash_writing_data: "Escribiendo datos...",
    flash_write_progress: "Progreso de escritura: {0}/{1}",
    flash_write_block_failed: "Falló la escritura del bloque {0}: {1}",
    flash_write_complete: "Escritura de datos completa",
    flash_verifying_crc: "Verificando datos...",
    flash_crc_passed: "Verificación CRC pasada",
    flash_crc_failed_mismatch: "Falló la verificación CRC: local={0}, dispositivo={1}",
    flash_crc_failed: "Falló la verificación CRC: {0}",
    flash_rebooting: "Reiniciando dispositivo...",
    flash_download_complete: "Descarga completa",
    flash_download_success: "¡Descarga completada exitosamente!",
    flash_download_failed: "Falló la descarga: {0}",
    flash_downloading: "Descarga en progreso, por favor espere hasta completar",
    flash_user_cancelled: "Usuario canceló la operación",
    
    // Nombres de archivos de registro
    serial_log_filename: "registro_serial_{0}.txt",
    flash_log_filename: "registro_flash_{0}.txt",
    
    // Tooltips
    current_tab_connected: "Función {0} actual conectada al serial",
    disconnect_tab_connection: "Desconectar conexión serial de función {0}",
    connect_for_tab: "Conectar serial para función {0}",
    
    // Información de copyright
    powered_by: "Desarrollado por",
    all_rights_reserved: "Todos los derechos reservados",
    
    // Funciones de debug
    debug_mode: "Modo Debug",
    debug_basic: "Básico",
    debug_detailed: "Detallado",
    debug_verbose: "Completo",
    export_debug: "Exportar Registro de Debug",
    debug_status: "Estado de Debug",
    debug_level: "Nivel de Debug",
    packets_sent: "Paquetes Enviados",
    packets_received: "Paquetes Recibidos",
    
    // Botones de función y operaciones
    fullscreen: "Pantalla Completa",
    exit_fullscreen: "Salir de Pantalla Completa"
};

// Exportar a global
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.es = es;
} 