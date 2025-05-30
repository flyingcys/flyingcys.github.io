// Русский (ru-RU)
const ru = {
    // Заголовок страницы и описание
    title: "Инструмент TuyaOpen Serial Beta",
    subtitle: "Универсальный инструмент разработчика на основе Chrome Web Serial API",
    
    // Требования к браузеру и уведомление о бета-версии
    browser_requirement: "Этот инструмент требует браузеры на основе Chrome. Другие браузеры не могут работать правильно. Используйте Chrome, Edge или другие браузеры на основе Chromium.",
    beta_notice: "Текущая функциональность находится в бета-версии. При возникновении проблем сначала сохраните соответствующие логи, затем сообщайте о проблемах в репозиторий по адресу",
    repository_link: "Репозиторий TuyaOpen-Tools",
    
    // Ссылки, связанные с проектом
    project_info: "Этот проект является частью TuyaOpen. Связанные проекты включают:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Метки вкладок
    tab_serial: "Отладка Serial",
    tab_flash: "Загрузка прошивки",
    
    // Панель управления
    control_title: "Управление подключением Serial",
    flash_connection_control: "Подключение Serial для загрузки прошивки",
    connect: "Подключить Serial",
    connect_flash: "Подключить Serial для загрузки прошивки",
    disconnect: "Отключить",
    disconnect_flash: "Отключить загрузку прошивки",
    status_disconnected: "Отключено",
    status_connected: "Подключено",
    serial_target_device: "Целевое устройство:",
    custom_device: "Пользовательское",
    baud_rate: "Скорость передачи:",
    data_bits: "Биты данных:",
    stop_bits: "Стоп-биты:",
    parity: "Четность:",
    parity_none: "Нет",
    parity_even: "Четная",
    parity_odd: "Нечетная",
    
    // Отладка serial
    receive_data: "Полученные Данные",
    save_log: "Сохранить Журнал",
    auto_scroll: "Автопрокрутка",
    show_timestamp: "Показать временную метку",
    waiting_data: "Ожидание данных serial...",
    received: "RX",
    sent: "TX",
    bytes: "байт",
    
    send_data: "Отправить данные",
    hex_mode: "Режим HEX",
    add_newline: "Добавить новую строку",
    input_placeholder: "Введите данные для отправки...",
    input_placeholder_hex: "Введите hex данные (например: FF 01 02 03)...",
    send: "Отправить",
    
    quick_send: "Быстрая отправка:",
    manage: "Управление командами",
    no_quick_commands: "Пока нет быстрых команд. Нажмите 'Управление командами', чтобы добавить часто используемые AT-команды, отладочные инструкции и т.д. для повышения эффективности отладки",
    
    // Прошивка
    flash_config: "Конфигурация загрузки прошивки",
    target_device: "Целевое устройство:",
    select_file: "Выбрать файл прошивки",
    no_file_selected: "Файл не выбран",
    file_size: "Размер файла",
    start_download: "Начать загрузку",
    stop_download: "Остановить загрузку",
    preparing: "Подготовка...",
    downloaded: "Загружено",
    download_log: "Журнал загрузки",
    clear_log: "Очистить журнал",
    waiting_download: "Ожидание операции загрузки...",
    
    // Управление быстрыми командами
    quick_send_management: "Управление быстрой отправкой",
    add_new_command: "Добавить новую команду",
    display_name: "Отображаемое имя:",
    name_example: "например: Сброс",
    send_content: "Содержимое для отправки:",
    content_example: "например: AT+RST",
    add: "Добавить",
    existing_commands: "Существующие команды",
    no_commands: "Нет быстрых команд",
    reset_default: "Сбросить по умолчанию",
    close: "Закрыть",
    
    // Сообщения об ошибках
    error: "Ошибка",
    
    // Системные сообщения
    serial_connected: "Serial успешно подключен!",
    serial_disconnected: "Serial отключен.",
    flash_serial_connected: "Подключение Serial для загрузки прошивки успешно!",
    flash_serial_disconnected: "Serial для загрузки прошивки отключен.",
    switch_to_tab: "Переключено на {0}, подключение serial закрыто",
    tab_serial_name: "Отладка Serial",
    tab_flash_name: "Загрузка прошивки",
    
    // Диалоги подтверждения
    switch_tab_confirm: "⚠️ Предупреждение о блокировке Serial\n\nТекущая функция {0} использует подключение serial.\nФункции {0} и {1} не могут использовать serial одновременно.\n\nПереключение на {1} приведет к:\n• Автоматическому отключению текущего подключения serial\n• Остановке текущих операций\n\nВы уверены, что хотите переключиться?",
    delete_command_confirm: "Вы уверены, что хотите удалить эту быструю команду?",
    reset_commands_confirm: "Вы уверены, что хотите сбросить быстрые команды по умолчанию? Это удалит все пользовательские команды.",
    
    // Сообщения валидации
    fill_complete_info: "Пожалуйста, заполните полное имя команды и содержимое",
    command_name_exists: "Имя команды уже существует, используйте другое имя",
    no_data_to_save: "Нет данных для сохранения",
    no_log_to_save: "Нет журнала для сохранения",
    please_select_file: "Сначала выберите файл прошивки",
    please_connect_serial: "Сначала подключите serial",
    please_connect_flash_serial: "Сначала подключите serial для загрузки прошивки",
    flash_serial_not_connected: "Serial для загрузки прошивки не подключен",
    
    // Связанное с Web Serial API
    browser_not_supported: "Ваш браузер не поддерживает Web Serial API. Используйте Chrome 89+ или Edge 89+.",
    connect_failed: "Ошибка подключения: {0}",
    disconnect_failed: "Ошибка отключения: {0}",
    read_error: "Ошибка чтения данных: {0}",
    send_error: "Ошибка отправки данных: {0}",
    hex_length_error: "Длина HEX строки должна быть четной",
    serial_not_connected: "Serial не подключен",
    download_failed: "Ошибка загрузки: {0}",
    
    // Операции с файлами
    file_selected: "Файл выбран: {0} ({1} байт)",
    start_download_to: "Начало загрузки прошивки в {0}...",
    download_complete: "Загрузка прошивки завершена!",
    user_cancelled: "Пользователь отменил загрузку",
    
    // Сообщения о прогрессе загрузки прошивки
    flash_handshaking: "Установка рукопожатия...",
    flash_handshake_success: "Рукопожатие успешно",
    flash_handshake_failed: "Ошибка рукопожатия, проверьте подключение устройства",
    flash_download_cancelled: "Загрузка отменена",
    waiting_reset: "Ожидание перезагрузки устройства...",
    flash_setting_baudrate: "Установка скорости передачи на {0}...",
    flash_baudrate_set: "Скорость передачи установлена успешно",
    flash_erasing: "Стирание Flash...",
    flash_erase_progress: "Прогресс стирания: {0}/{1}",
    flash_erase_sector_failed: "Ошибка стирания сектора {0}: {1}",
    flash_erase_complete: "Стирание Flash завершено",
    flash_writing_data: "Запись данных...",
    flash_write_progress: "Прогресс записи: {0}/{1}",
    flash_write_block_failed: "Ошибка записи блока {0}: {1}",
    flash_write_complete: "Запись данных завершена",
    flash_verifying_crc: "Проверка данных...",
    flash_crc_passed: "Проверка CRC пройдена",
    flash_crc_failed_mismatch: "Ошибка проверки CRC: локальный={0}, устройство={1}",
    flash_crc_failed: "Ошибка проверки CRC: {0}",
    flash_rebooting: "Перезагрузка устройства...",
    flash_download_complete: "Загрузка завершена",
    flash_download_success: "Загрузка успешно завершена!",
    flash_download_failed: "Ошибка загрузки: {0}",
    flash_downloading: "Загрузка в процессе, дождитесь завершения",
    flash_user_cancelled: "Пользователь отменил операцию",
    
    // Имена файлов журналов
    serial_log_filename: "serial_журнал_{0}.txt",
    flash_log_filename: "flash_журнал_{0}.txt",
    
    // Подсказки
    current_tab_connected: "Текущая функция {0} подключена к serial",
    disconnect_tab_connection: "Отключить подключение serial функции {0}",
    connect_for_tab: "Подключить serial для функции {0}",
    
    // Информация об авторских правах
    powered_by: "Работает на",
    all_rights_reserved: "Все права защищены",
    
    // Функции отладки
    debug_mode: "Режим отладки",
    debug_basic: "Базовый",
    debug_detailed: "Подробный",
    debug_verbose: "Полный",
    export_debug: "Экспорт журнала отладки",
    debug_status: "Статус отладки",
    debug_level: "Уровень отладки",
    packets_sent: "Отправлено пакетов",
    packets_received: "Получено пакетов",
    
    // Функциональные кнопки и операции
    fullscreen: "Полный экран",
    exit_fullscreen: "Выйти из полноэкранного режима",
    
    // Новое: Состояние режима отладки
    debug_mode_enabled: "🔧 Режим отладки включен",
    debug_mode_disabled: "🔧 Режим отладки отключен",
    enabled: "Включено",
    disabled: "Отключено",
    
    // Новое: Связано со сбросом скорости передачи
    resetting_baudrate_115200: "Сброс скорости передачи последовательного порта до 115200...",
    baudrate_reset_success: "✅ Скорость передачи последовательного порта сброшена до 115200",
    direct_serial_reset_success: "✅ Последовательный порт напрямую сброшен до 115200",
    baudrate_reset_failed: "Не удалось сбросить скорость передачи последовательного порта",
    direct_reset_failed: "Прямой сброс последовательного порта также не удался",
    
    // Новое: Связано с менеджером загрузки
    downloader_manager_not_initialized: "Менеджер загрузки не инициализирован",
    loaded_chip_types: "Загружено {0} поддерживаемых типов чипов",
    using_default_chip_support: "Использование поддержки чипа по умолчанию (T5AI)",
    unsupported_device_type: "Неподдерживаемый тип устройства: {0}",
    unsupported_chip_type: "Неподдерживаемый тип чипа: {0}",
    
    // Новое: Связано с процессом загрузки прошивки
    starting_firmware_download_process: "Запуск процесса загрузки прошивки...",
    starting_device_download: "Начало загрузки устройства {0}, размер файла: {1} байт",
    firmware_download_completed_time: "Загрузка прошивки завершена! Общее время: {0}мс",
    device_firmware_download_completed: "Загрузка прошивки устройства {0} завершена",
    initializing_downloader: "Инициализация загрузчика {0}...",
    connecting_device: "Подключение к устройству {0}...",
    cannot_connect_device: "Невозможно подключиться к устройству {0}",
    downloading_firmware_to_device: "Загрузка прошивки в устройство {0}...",
    t5ai_firmware_download_completed: "Загрузка прошивки T5AI завершена",
    firmware_download_completed_device_restarted: "Загрузка прошивки завершена, устройство перезагружается...",
    serial_not_connected_connect_first: "Последовательный порт не подключен, сначала подключите последовательное устройство",
    restoring_serial_reader_writer_failed: "Не удалось восстановить reader/writer последовательного порта",
    cleanup_reset_baudrate: "Очистка: Сброс скорости передачи...",
    cleanup_baudrate_reset_success: "Очистка: Скорость передачи успешно сброшена",
    cleanup_reset_failed: "Очистка: Сброс не удался",
    flashdownloader_reset_baudrate: "FlashDownloader: Сброс скорости передачи до 115200...",
    flashdownloader_baudrate_reset_success: "FlashDownloader: ✅ Скорость передачи успешно сброшена до 115200",
    flashdownloader_direct_reset_success: "FlashDownloader: ✅ Прямой сброс последовательного порта также успешен",
    flashdownloader_reset_failed: "FlashDownloader: Не удался сброс скорости передачи",
    
    // Новое: Сообщения о состоянии последовательного подключения
    serial_connected_initial_switch: "первоначальное подключение, переключится на",
    serial_connected_initial: "первоначальное подключение",
    bps: "bps",
    
    // Системная информация
    system_info: "Системная Информация",
    system_info_os: "ОС",
    system_info_browser: "Браузер",
    system_info_web_serial: "Web Serial",
    system_info_platform: "Платформа",
    system_info_supported: "Поддерживается",
    system_info_not_supported: "Не поддерживается"
};

// Экспорт в глобальную область
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.ru = ru;
} 