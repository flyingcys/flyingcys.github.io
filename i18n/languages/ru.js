// Русский (ru-RU)
const ru = {
    // Заголовок страницы и описание
    title: "Инструмент TuyaOpen Serial",
    subtitle: "Универсальный инструмент разработчика на основе Chrome Web Serial API",
    
    // Требования к браузеру и уведомление о бета-версии
    browser_requirement: "Этот инструмент требует браузеры на основе Chrome. Другие браузеры не могут работать правильно. Используйте Chrome, Edge или другие браузеры на основе Chromium.",
    beta_notice: "Если вы столкнетесь с проблемами при использовании этого инструмента, пожалуйста, сообщайте о них в репозиторий по адресу",
    repository_link: "Репозиторий TuyaOpen-WebTools",
    
    // Ссылки, связанные с проектом
    project_info: "Этот проект является частью TuyaOpen. Связанные проекты включают:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-WebTools",
    
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
    
    // Анализ ошибок связанный
    error_analysis: "Анализ журнала ошибок",
    clear_analysis: "Очистить анализ (сбросить обнаружение)",
    auto_analysis: "Автоматический анализ",
    no_errors_detected: "Ошибки не обнаружены...",
    test_error_analysis: "Тест анализа ошибок",
    
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
    esp32_flash_address: "Адрес ESP32-Series Flash:",
    complete_firmware: "0x0000 (Полная прошивка)",
    custom_address: "Пользовательский адрес...",
    custom_address_placeholder: "0x10000",
    select_file: "Выбрать файл прошивки",
    no_file_selected: "Файл не выбран, нажмите \"Выбрать файл прошивки\" чтобы вручную открыть файл прошивки или перетащите файл прошивки в область файла",
    file_size: "Размер файла",
    start_download: "Начать прошивку",
    stop_download: "Завершить прошивку",
    auto_disconnect_after_flash: "Автоматически отключиться после прошивки",
    preparing: "Подготовка...",
    downloaded: "Загружено",
    burn_log: "Журнал прошивки",
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
    using_default_chip_support: "Использование поддержки чипа по умолчанию (T5AI, T3)",
    unsupported_device_type: "Неподдерживаемый тип устройства: {0}",
    unsupported_chip_type: "Неподдерживаемый тип чипа: {0}",
    
    // Новое: Связано с процессом загрузки прошивки
    starting_firmware_download_process: "Запуск процесса загрузки прошивки...",
    starting_device_download: "Запуск загрузки устройства {0}, размер файла: {1} байт",
    firmware_download_completed_time: "Загрузка прошивки завершена! Общее время: {0}мс",
    device_firmware_download_completed: "Загрузка прошивки устройства {0} завершена",
    initializing_downloader: "Инициализация загрузчика {0}...",
    connecting_device: "Подключение к устройству {0}...",
    cannot_connect_device: "Невозможно подключиться к устройству {0}",
    downloading_firmware_to_device: "Загрузка прошивки на устройство {0}...",
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
    flashdownloader_reset_failed: "FlashDownloader: Не удалось сбросить скорость передачи",
    
    // Новое: Сообщения о статусе подключения serial
    serial_connected_initial_switch: "первоначальное подключение, переключится на",
    serial_connected_initial: "первоначальное подключение",
    bps: "бит/с",
    
    // Информация о системе
    system_info: "Информация о системе",
    system_info_os: "ОС",
    system_info_browser: "Браузер",
    system_info_web_serial: "Web Serial",
    system_info_platform: "Платформа",
    system_info_supported: "Поддерживается",
    system_info_not_supported: "Не поддерживается",
    
    // Обработка отключения serial
    serial_disconnected_unexpectedly: "Последовательное соединение неожиданно отключено: {0}",
    
    // Страница устранения неполадок последовательного порта
    troubleshooting_title: "Руководство по устранению неполадок последовательного порта",
    troubleshooting_subtitle: "Полное руководство по решению проблем с последовательным подключением",
    back_to_main: "Вернуться на главную",
    no_serial_ports_found: "Последовательные порты не найдены?",
    serial_troubleshooting_guide: "Проблемы с последовательным подключением? См. руководство по устранению неполадок",
    serial_troubleshooting: "Устранение неполадок последовательного порта",
    
    // Быстрый контрольный список
    quick_check_title: "Быстрый контрольный список",
    basic_checks: "Основные пункты проверки",
    check_browser: "Использовать Chrome, Edge или другие браузеры на основе Chromium",
    check_cable: "USB-кабель для передачи данных правильно подключен (не зарядный кабель)",
    check_device_power: "Устройство правильно включено",
    check_other_software: "Закрыть другое программное обеспечение, занимающее последовательные порты",
    
    // Общие проблемы
    common_issues_title: "Общие проблемы и решения",
    issue_no_ports: "Проблема 1: Нет доступных последовательных устройств",
    issue_no_ports_desc: "Список устройств пуст после нажатия \"Подключить Serial\"",
    issue_connection_failed: "Проблема 2: Сбой подключения",
    issue_connection_failed_desc: "Устройство видно, но при подключении возникает ошибка",
    issue_no_data: "Проблема 3: Подключено, но нет данных",
    issue_no_data_desc: "Последовательное подключение успешно, но данные не получены или отображение данных ненормальное",
    
    possible_causes: "Возможные причины:",
    cause_driver_missing: "Драйвер устройства не установлен или установлен неправильно",
    cause_cable_issue: "Проблема с USB-кабелем (использование зарядного кабеля вместо кабеля для передачи данных)",
    cause_device_not_recognized: "Устройство не распознано системой",
    cause_port_occupied: "Последовательный порт занят другими программами",
    cause_permission_denied: "Недостаточные разрешения (Linux/macOS)",
    cause_device_busy: "Устройство используется другими приложениями",
    cause_driver_conflict: "Конфликт драйверов или несовместимость",
    cause_baud_rate_mismatch: "Настройка скорости передачи не совпадает",
    cause_serial_params_wrong: "Неправильные настройки битов данных, стоп-битов или четности",
    cause_device_not_sending: "Устройство не отправляет данные",
    cause_flow_control: "Проблемы настройки управления потоком",
    cause_cable_quality: "Проблемы качества кабеля для передачи данных или плохой контакт",
    
    // Диагностика проблем с драйверами
    driver_diagnosis_title: "Диагностика проблем с драйверами",
    driver_diagnosis_desc: "Большинство проблем с последовательными портами связаны с драйверами, следуйте этим шагам для диагностики",
    
    // Операционные системы
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    
    // Связанное с Windows
    windows_check_device_manager: "Шаг 1: Проверить Диспетчер устройств",
    windows_step1_title: "Открыть Диспетчер устройств",
    windows_step1_desc: "Щелкните правой кнопкой мыши \"Этот компьютер\" → \"Свойства\" → \"Диспетчер устройств\", или нажмите Win+X и выберите \"Диспетчер устройств\"",
    windows_step2_title: "Найти последовательные устройства",
    windows_step2_desc: "Искать следующие категории в Диспетчере устройств:",
    windows_step3_title: "Определить статус устройства",
    windows_step3_desc: "Проверить статус значка устройства:",
    
    ports_com_lpt: "Порты (COM и LPT)",
    universal_serial_bus: "Контроллеры универсальной последовательной шины",
    other_devices: "Другие устройства",
    
    device_normal: "✅ Нормально: Имя устройства отображается нормально",
    device_warning: "⚠️ Предупреждение: Желтый восклицательный знак, проблема с драйвером",
    device_error: "❌ Ошибка: Красный X, устройство отключено",
    device_unknown: "❓ Неизвестно: В \"Других устройствах\", драйвер не установлен",
    
    windows_driver_install: "Шаг 2: Установить драйверы",
    windows_manual_install: "Шаг 3: Ручная установка драйвера",
    
    // Описания драйверов
    ch340_desc: "Самый распространенный чип USB в последовательный",
    cp210x_desc: "Чип USB в последовательный Silicon Labs",
    ftdi_desc: "Чип USB в последовательный FTDI",
    
    download_driver: "Скачать соответствующий драйвер",
    download_driver_desc: "Скачать соответствующий драйвер согласно модели чипа устройства",
    run_installer: "Запустить установщик",
    run_installer_desc: "Запустить скачанный установщик драйвера от имени администратора",
    restart_computer: "Перезагрузить компьютер",
    restart_computer_desc: "Перезагрузить компьютер после установки для активации драйвера",
    verify_installation: "Проверить установку",
    verify_installation_desc: "Переподключить устройство и проверить, отображается ли оно нормально в Диспетчере устройств",
    
    screenshot_device_manager: "Расположение скриншота Диспетчера устройств",
    
    // Связанное с macOS
    macos_check_system: "Шаг 1: Проверить информацию о системе",
    macos_step1_title: "Открыть Информацию о системе",
    macos_step1_desc: "Удерживать клавишу Option и щелкнуть меню Apple → \"Информация о системе\"",
    macos_step2_title: "Просмотреть USB-устройства",
    macos_step2_desc: "Выбрать \"USB\" слева для просмотра подключенных USB-устройств",
    macos_step3_title: "Проверить последовательные устройства",
    macos_step3_desc: "Открыть Терминал и ввести команду для просмотра последовательных устройств:",
    
    macos_driver_install: "Шаг 2: Установить драйверы",
    macos_driver_note: "macOS обычно имеет встроенные большинство драйверов USB в последовательный, но некоторые чипы все еще требуют ручной установки",
    
    ch340_mac_desc: "Драйвер CH340 для macOS",
    cp210x_mac_desc: "Драйвер CP210x для macOS",
    
    // Связанное с Linux
    linux_check_system: "Шаг 1: Проверить распознавание системой",
    linux_step1_title: "Проверить USB-устройства",
    linux_step1_desc: "Открыть терминал и ввести следующую команду:",
    linux_step2_title: "Проверить последовательные устройства",
    linux_step2_desc: "Просмотреть доступные последовательные устройства:",
    linux_step3_title: "Проверить сообщения ядра",
    linux_step3_desc: "Просмотреть сообщения ядра при подключении устройства:",
    
    linux_permissions: "Шаг 2: Установить разрешения",
    linux_add_user_group: "Добавить пользователя в группу dialout",
    linux_add_user_desc: "Выполнить следующую команду и войти в систему заново:",
    linux_check_permissions: "Проверить разрешения устройства",
    linux_check_permissions_desc: "Подтвердить настройки разрешений устройства:",
    
    // Расширенное устранение неполадок
    advanced_troubleshooting: "Расширенное устранение неполадок",
    hardware_issues: "Исследование аппаратных проблем",
    software_conflicts: "Решение программных конфликтов",
    
    try_different_cable: "Попробовать другой USB-кабель для передачи данных",
    try_different_port: "Попробовать другой USB-порт",
    try_different_computer: "Протестировать устройство на других компьютерах",
    check_device_power: "Проверить, нормально ли питание устройства",
    
    close_other_serial_software: "Закрыть другое программное обеспечение для отладки последовательного порта",
    disable_antivirus: "Временно отключить антивирусное программное обеспечение",
    update_browser: "Обновить браузер до последней версии",
    clear_browser_cache: "Очистить кэш и данные браузера",
    
    // Получить помощь
    get_help_title: "Получить помощь",
    get_help_desc: "Если ни один из вышеперечисленных методов не может решить проблему, соберите следующую информацию и обратитесь в техническую поддержку:",
    
    help_info_os: "Версия операционной системы",
    help_info_browser: "Версия браузера",
    help_info_device: "Модель устройства и информация о чипе",
    help_info_error: "Скриншоты конкретных сообщений об ошибках",
    help_info_device_manager: "Скриншоты Диспетчера устройств (Windows)",
    
    github_support_desc: "Отправить отчет о проблеме на GitHub",
    
    // Новое: TuyaOpen Authorization related
    tab_tuya_auth: "Авторизация TuyaOpen",
    tuya_auth_title: "Запись Кода Авторизации TuyaOpen",
    tuya_auth_subtitle: "Записать информацию авторизации проекта TuyaOpen на устройство",
    uuid_label: "UUID (20 символов):",
    auth_key_label: "AUTH_KEY (32 символа):",
    uuid_placeholder: "Введите UUID из 20 символов...",
    auth_key_placeholder: "Введите AUTH_KEY из 32 символов...",
    authorize_btn: "Записать Авторизацию",
    tuya_auth_notice_title: "⚠️ Важное Уведомление",
    tuya_auth_notice_content: "Эта функция авторизации применима только для записи кодов авторизации проектов TuyaOpen и не может использоваться для не-TuyaOpen проектов.",
    tuya_auth_additional_info: "Убедитесь, что устройство находится в режиме авторизации и последовательный порт правильно подключен перед выполнением операции авторизации.",
    uuid_length_error: "Ошибка длины UUID! Введите UUID из 20 символов",
    auth_key_length_error: "Ошибка длины AUTH_KEY! Введите AUTH_KEY из 32 символов",
    uuid_empty_error: "Пожалуйста, введите UUID",
    auth_key_empty_error: "Пожалуйста, введите AUTH_KEY",
    tuya_auth_success: "✅ Информация авторизации TuyaOpen успешно записана!",
    tuya_auth_failed: "❌ Ошибка записи информации авторизации TuyaOpen: {0}",
    tuya_auth_sending: "Отправка информации авторизации...",
    tuya_auth_command_sent: "Команда авторизации отправлена: auth {0} {1}",
    
    // Информация о состоянии, связанная с авторизацией
    tuya_auth_waiting: "Ожидание операции авторизации...",
    tuya_auth_connected: "Порт авторизации подключен",
    tuya_auth_disconnected: "Порт авторизации отключен",
    connect_tuya_auth: "Подключить Порт Авторизации",
    disconnect_tuya_auth: "Отключить Порт Авторизации",
    tuya_auth_serial_connected: "Порт авторизации TuyaOpen успешно подключен!",
    tuya_auth_serial_disconnected: "Порт авторизации TuyaOpen отключен.",
    tab_tuya_auth_name: "Авторизация TuyaOpen",
    
    // TuyaOpen授权码指南相关
    license_guide: "Руководство по получению кода авторизации",
    license_guide_title: "Руководство по получению кода авторизации TuyaOpen",
    license_guide_subtitle: "Понимание кода авторизации TuyaOpen и методов получения",
    
    // 什么是TuyaOpen专用授权码
    what_is_license: "Что такое эксклюзивный код авторизации TuyaOpen?",
    license_info: "Все версии TuyaOpen Framework требуют эксклюзивный код авторизации для нормального подключения к облаку Tuya. Другие коды авторизации не могут работать правильно.",
    supported_frameworks: "Поддерживаемые фреймворки TuyaOpen",
    c_version: "TuyaOpen версия C",
    arduino_version: "TuyaOpen версия Arduino", 
    lua_version: "TuyaOpen версия Luanode",
    
    // 如何获取授权码
    how_to_get: "Как получить код авторизации",
    method1_title: "Метод 1: Покупка предварительно записанных модулей",
    method1_desc: "Покупка модулей с предварительно записанным кодом авторизации TuyaOpen через платформу разработчиков Tuya. Этот код записан в соответствующий модуль на заводе и не будет потерян. TuyaOpen считывает код авторизации через интерфейс `tuya_iot_license_read()` при запуске. Подтвердите, имеет ли текущее устройство записанный код авторизации TuyaOpen.",
    method1_advantage: "Преимущество: Готово к использованию, не требует ручной операции",
    
    method2_title: "Метод 2: Покупка на платформе Tuya",
    method2_desc: "Покупка кода авторизации TuyaOpen через платформу разработчиков Tuya, затем запись в модуль с помощью инструментов последовательного порта.",
    method2_advantage: "Преимущество: Официальная платформа, поддержка оптовых покупок",
    visit_platform: "Посетить платформу",
    visit_platform_preburn: "Купить предварительно записанные модули",
    
    method3_title: "Метод 3: Покупка на Taobao",
    method3_desc: "Покупка кода авторизации TuyaOpen через магазины Taobao, затем запись в модуль с помощью инструментов последовательного порта.",
    method3_advantage: "Преимущество: Удобная покупка, гибкие способы оплаты",
    visit_taobao: "Посетить Taobao",
    
    // 使用指南
    usage_guide: "Руководство по использованию",
    check_existing: "Шаг 1: Проверить существующий код авторизации",
    check_warning: "Сначала подтвердите, имеет ли текущее устройство уже записанный код авторизации TuyaOpen, чтобы избежать дублированных покупок.",
    write_license: "Шаг 2: Записать код авторизации",
    write_desc: "Если устройство не имеет записанного кода авторизации, вы можете использовать функцию \"TuyaOpen Auth\" этого инструмента для записи:",
    write_step1: "Подключить устройство к компьютеру",
    write_step2: "Переключиться на вкладку \"TuyaOpen Auth\"",
    write_step3: "Подключить последовательный порт",
    write_step4: "Ввести купленные UUID и AUTH_KEY",
    write_step5: "Нажать кнопку \"Записать авторизацию\"",
    write_success: "После успешной записи кода авторизации устройство может нормально использовать фреймворк TuyaOpen для подключения к облаку Tuya.",
    
    // 常见问题
    faq_title: "Часто задаваемые вопросы",
    q1: "В: Можно ли использовать другие типы кодов авторизации?",
    a1: "О: Нет. Фреймворк TuyaOpen может использовать только эксклюзивные коды авторизации TuyaOpen. Другие коды авторизации не могут нормально подключаться к облаку Tuya.",
    q2: "В: Будет ли потерян код авторизации?",
    a2: "О: При нормальных обстоятельствах код авторизации не будет потерян. Код авторизации предварительно записанных модулей записан на заводе, а код, записанный вручную, сохраняется в энергонезависимой области хранения модуля.",
    q3: "В: Как проверить, имеет ли устройство уже код авторизации?",
    a3: "О: Можно проверить, вызвав интерфейс `tuya_iot_license_read()` через программу TuyaOpen.",
    
    // 技术支持
    support_title: "Техническая поддержка",
    support_desc: "Если вы столкнулись с проблемами во время использования, получите помощь следующими способами:",
    github_support: "Отправить отчет о проблеме"
};

// Экспорт в глобальную область
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.ru = ru;
}