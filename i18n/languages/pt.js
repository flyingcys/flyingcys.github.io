// Português (pt-PT)
const pt = {
    // Título da página e descrição
    title: "Ferramenta Serial TuyaOpen Beta",
    subtitle: "Ferramenta de desenvolvedor tudo-em-um baseada na API Chrome Web Serial",
    
    // Requisitos do navegador e aviso de versão beta
    browser_requirement: "Esta ferramenta requer navegadores baseados no Chrome. Outros navegadores não podem funcionar corretamente. Use Chrome, Edge ou outros navegadores baseados no Chromium.",
    beta_notice: "A funcionalidade atual está em versão beta. Se encontrar problemas, por favor salve primeiro os logs relevantes, depois reporte problemas no repositório em",
    repository_link: "Repositório TuyaOpen-Tools",
    
    // Links relacionados ao projeto
    project_info: "Este projeto faz parte do TuyaOpen. Projetos relacionados incluem:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Rótulos das abas
    tab_serial: "Debug Serial",
    tab_flash: "Download de Firmware",
    
    // Painel de controle
    control_title: "Controle de Conexão Serial",
    flash_connection_control: "Conexão Serial de Download de Firmware",
    connect: "Conectar Serial",
    connect_flash: "Conectar Serial de Download de Firmware",
    disconnect: "Desconectar",
    disconnect_flash: "Desconectar Download de Firmware",
    status_disconnected: "Desconectado",
    status_connected: "Conectado",
    serial_target_device: "Dispositivo-alvo:",
    custom_device: "Personalizado",
    baud_rate: "Taxa de baud:",
    data_bits: "Bits de Dados:",
    stop_bits: "Bits de Parada:",
    parity: "Paridade:",
    parity_none: "Nenhuma",
    parity_even: "Par",
    parity_odd: "Ímpar",
    
    // Debug serial
    receive_data: "Dados Recebidos",
    save_log: "Salvar Log",
    auto_scroll: "Rolagem Automática",
    show_timestamp: "Mostrar Timestamp",
    waiting_data: "Aguardando dados seriais...",
    received: "RX",
    sent: "TX",
    bytes: "bytes",
    
    send_data: "Enviar Dados",
    hex_mode: "Modo HEX",
    add_newline: "Adicionar Nova Linha",
    input_placeholder: "Digite dados para enviar...",
    input_placeholder_hex: "Digite dados hex (ex.: FF 01 02 03)...",
    send: "Enviar",
    
    quick_send: "Envio Rápido:",
    manage: "Gerenciar Comandos",
    no_quick_commands: "Ainda não há comandos rápidos. Clique em 'Gerenciar Comandos' para adicionar comandos AT comuns, instruções de debug, etc. e melhorar a eficiência de depuração",
    
    // Flash de firmware
    flash_config: "Configuração de Download de Firmware",
    target_device: "Dispositivo Alvo:",
    select_file: "Selecionar Arquivo de Firmware",
    no_file_selected: "Nenhum arquivo selecionado",
    file_size: "Tamanho do Arquivo",
    start_download: "Iniciar Download",
    stop_download: "Parar Download",
    preparing: "Preparando...",
    downloaded: "Baixado",
    download_log: "Log de Download",
    clear_log: "Limpar Log",
    waiting_download: "Aguardando operação de download...",
    
    // Gerenciamento de comandos rápidos
    quick_send_management: "Gerenciamento de Envio Rápido",
    add_new_command: "Adicionar Novo Comando",
    display_name: "Nome de Exibição:",
    name_example: "ex.: Reset",
    send_content: "Conteúdo a Enviar:",
    content_example: "ex.: AT+RST",
    add: "Adicionar",
    existing_commands: "Comandos Existentes",
    no_commands: "Nenhum comando rápido",
    reset_default: "Redefinir Padrão",
    close: "Fechar",
    
    // Mensagens de erro
    error: "Erro",
    
    // Mensagens do sistema
    serial_connected: "Serial conectado com sucesso!",
    serial_disconnected: "Serial desconectado.",
    flash_serial_connected: "Conexão Serial de Download de Firmware Bem-sucedida!",
    flash_serial_disconnected: "Serial de Download de Firmware Desconectado.",
    switch_to_tab: "Mudou para {0}, conexão serial fechada",
    tab_serial_name: "Debug Serial",
    tab_flash_name: "Download de Firmware",
    
    // Diálogos de confirmação
    switch_tab_confirm: "⚠️ Aviso de Mutex Serial\n\nA função {0} atual está usando conexão serial.\nAs funções {0} e {1} não podem usar serial simultaneamente.\n\nMudar para {1} irá:\n• Desconectar automaticamente a conexão serial atual\n• Parar operações em andamento\n\nTem certeza de que deseja mudar?",
    delete_command_confirm: "Tem certeza de que deseja excluir este comando rápido?",
    reset_commands_confirm: "Tem certeza de que deseja redefinir para os comandos rápidos padrão? Isso excluirá todos os comandos personalizados.",
    
    // Mensagens de validação
    fill_complete_info: "Por favor, preencha o nome completo do comando e o conteúdo",
    command_name_exists: "Nome do comando já existe, use outro nome",
    no_data_to_save: "Nenhum dado para salvar",
    no_log_to_save: "Nenhum log para salvar",
    please_select_file: "Selecione primeiro o arquivo de firmware",
    please_connect_serial: "Conecte primeiro o serial",
    please_connect_flash_serial: "Conecte primeiro o serial de download de firmware",
    flash_serial_not_connected: "Serial de Download de Firmware não conectado",
    
    // Relacionado à Web Serial API
    browser_not_supported: "Seu navegador não suporta Web Serial API. Use Chrome 89+ ou Edge 89+.",
    connect_failed: "Falha na conexão: {0}",
    disconnect_failed: "Falha na desconexão: {0}",
    read_error: "Erro de leitura de dados: {0}",
    send_error: "Erro de envio de dados: {0}",
    hex_length_error: "O comprimento da string HEX deve ser par",
    serial_not_connected: "Serial não conectado",
    download_failed: "Falha no download: {0}",
    
    // Operações de arquivo
    file_selected: "Arquivo selecionado: {0} ({1} bytes)",
    start_download_to: "Iniciando download de firmware para {0}...",
    download_complete: "Download de firmware concluído!",
    user_cancelled: "Usuário cancelou o download",
    
    // Mensagens de progresso de download de firmware
    flash_handshaking: "Estabelecendo handshake...",
    flash_handshake_success: "Handshake bem-sucedido",
    flash_handshake_failed: "Falha no handshake, verifique a conexão do dispositivo",
    flash_download_cancelled: "Download cancelado",
    waiting_reset: "Aguardando reinicialização do dispositivo...",
    flash_setting_baudrate: "Definindo taxa de baud para {0}...",
    flash_baudrate_set: "Taxa de baud definida com sucesso",
    flash_erasing: "Apagando Flash...",
    flash_erase_progress: "Progresso de apagamento: {0}/{1}",
    flash_erase_sector_failed: "Falha ao apagar setor {0}: {1}",
    flash_erase_complete: "Apagamento de Flash concluído",
    flash_writing_data: "Escrevendo dados...",
    flash_write_progress: "Progresso de escrita: {0}/{1}",
    flash_write_block_failed: "Falha ao escrever bloco {0}: {1}",
    flash_write_complete: "Escrita de dados concluída",
    flash_verifying_crc: "Verificando dados...",
    flash_crc_passed: "Verificação CRC passou",
    flash_crc_failed_mismatch: "Falha na verificação CRC: local={0}, dispositivo={1}",
    flash_crc_failed: "Falha na verificação CRC: {0}",
    flash_rebooting: "Reinicializando dispositivo...",
    flash_download_complete: "Download concluído",
    flash_download_success: "Download concluído com sucesso!",
    flash_download_failed: "Falha no download: {0}",
    flash_downloading: "Download em progresso, aguarde a conclusão",
    flash_user_cancelled: "Usuário cancelou a operação",
    
    // Nomes de arquivos de log
    serial_log_filename: "log_serial_{0}.txt",
    flash_log_filename: "log_flash_{0}.txt",
    
    // Tooltips
    current_tab_connected: "Função {0} atual conectada ao serial",
    disconnect_tab_connection: "Desconectar conexão serial da função {0}",
    connect_for_tab: "Conectar serial para função {0}",
    
    // Informações de copyright
    powered_by: "Desenvolvido por",
    all_rights_reserved: "Todos os direitos reservados",
    
    // Funções de debug
    debug_mode: "Modo Debug",
    debug_basic: "Básico",
    debug_detailed: "Detalhado",
    debug_verbose: "Completo",
    export_debug: "Exportar Log de Debug",
    debug_status: "Status de Debug",
    debug_level: "Nível de Debug",
    packets_sent: "Pacotes Enviados",
    packets_received: "Pacotes Recebidos",
    
    // Botões de função e operações
    fullscreen: "Tela Cheia",
    exit_fullscreen: "Sair da Tela Cheia",
    
    // Novo: Estado do modo debug
    debug_mode_enabled: "🔧 Modo debug ativado",
    debug_mode_disabled: "🔧 Modo debug desativado",
    enabled: "Ativado",
    disabled: "Desativado",
    
    // Novo: Relacionado ao reset de baudrate
    resetting_baudrate_115200: "Redefinindo baudrate da porta serial para 115200...",
    baudrate_reset_success: "✅ Baudrate da porta serial redefinido para 115200",
    direct_serial_reset_success: "✅ Porta serial redefinida diretamente para 115200",
    baudrate_reset_failed: "Falha ao redefinir baudrate da porta serial",
    direct_reset_failed: "Falha na redefinição direta da porta serial também",
    
    // Novo: Relacionado ao gerenciador de download
    downloader_manager_not_initialized: "Gerenciador de download não inicializado",
    loaded_chip_types: "Carregados {0} tipos de chip suportados",
    using_default_chip_support: "Usando suporte de chip padrão (T5AI)",
    unsupported_device_type: "Tipo de dispositivo não suportado: {0}",
    unsupported_chip_type: "Tipo de chip não suportado: {0}",
    
    // Novo: Relacionado ao processo de download de firmware
    starting_firmware_download_process: "Iniciando processo de download de firmware...",
    starting_device_download: "Iniciando download do dispositivo {0}, tamanho do arquivo: {1} bytes",
    firmware_download_completed_time: "Download de firmware concluído! Tempo total: {0}ms",
    device_firmware_download_completed: "Download de firmware do dispositivo {0} concluído",
    initializing_downloader: "Inicializando downloader {0}...",
    connecting_device: "Conectando ao dispositivo {0}...",
    cannot_connect_device: "Não é possível conectar ao dispositivo {0}",
    downloading_firmware_to_device: "Baixando firmware para o dispositivo {0}...",
    t5ai_firmware_download_completed: "Download de firmware T5AI concluído",
    firmware_download_completed_device_restarted: "Download de firmware concluído, dispositivo reiniciando...",
    serial_not_connected_connect_first: "Porta serial não conectada, por favor conecte primeiro o dispositivo serial",
    restoring_serial_reader_writer_failed: "Falha ao restaurar reader/writer da porta serial",
    cleanup_reset_baudrate: "Limpeza: Redefinindo baudrate...",
    cleanup_baudrate_reset_success: "Limpeza: Baudrate redefinido com sucesso",
    cleanup_reset_failed: "Limpeza: Falha na redefinição",
    flashdownloader_reset_baudrate: "FlashDownloader: Redefinindo baudrate para 115200...",
    flashdownloader_baudrate_reset_success: "FlashDownloader: ✅ Baudrate redefinido com sucesso para 115200",
    flashdownloader_direct_reset_success: "FlashDownloader: ✅ Reset direto da porta serial também bem-sucedido",
    flashdownloader_reset_failed: "FlashDownloader: Falha na redefinição de baudrate",
    
    // Novo: Mensagens de status de conexão serial
    serial_connected_initial_switch: "conexão inicial, mudará para",
    serial_connected_initial: "conexão inicial",
    bps: "bps"
};

// Exportar para global
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.pt = pt;
} 