// 한국어 (ko-KR)
const ko = {
    // 페이지 제목과 설명
    title: "TuyaOpen 시리얼 도구 베타",
    subtitle: "Chrome Web Serial API 기반 원스톱 개발자 도구",
    
    // 브라우저 요구사항과 베타 버전 공지
    browser_requirement: "이 도구는 Chrome 기반 브라우저가 필요합니다. 다른 브라우저는 정상적으로 작동하지 않습니다. Chrome, Edge 또는 기타 Chromium 기반 브라우저를 사용하십시오.",
    beta_notice: "현재 기능은 베타 버전입니다. 문제가 발생하면 먼저 관련 로그를 저장한 다음 리포지토리에 문제를 제출하십시오",
    repository_link: "TuyaOpen-Tools 리포지토리",
    
    // 프로젝트 관련 링크
    project_info: "이 프로젝트는 TuyaOpen의 일부입니다. 관련 프로젝트는 다음과 같습니다:",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // 탭 라벨
    tab_serial: "시리얼 디버그",
    tab_flash: "펌웨어 다운로드",
    
    // 제어판
    control_title: "시리얼 연결 제어",
    flash_connection_control: "펌웨어 다운로드 시리얼 연결",
    connect: "시리얼 연결",
    connect_flash: "펌웨어 다운로드 시리얼 연결",
    disconnect: "연결 해제",
    disconnect_flash: "펌웨어 다운로드 연결 해제",
    status_disconnected: "연결 해제됨",
    status_connected: "연결됨",
    serial_target_device: "대상 장치:",
    custom_device: "사용자 정의",
    baud_rate: "보드레이트:",
    data_bits: "데이터 비트:",
    stop_bits: "정지 비트:",
    parity: "패리티:",
    parity_none: "없음",
    parity_even: "짝수",
    parity_odd: "홀수",
    
    // 시리얼 디버깅
    receive_data: "수신 데이터",
    save_log: "로그 저장",
    auto_scroll: "자동 스크롤",
    show_timestamp: "타임스탬프 표시",
    waiting_data: "시리얼 데이터 대기 중...",
    received: "RX",
    sent: "TX",
    bytes: "바이트",
    
    send_data: "데이터 전송",
    hex_mode: "HEX 모드",
    add_newline: "줄바꿈 추가",
    input_placeholder: "전송할 데이터 입력...",
    input_placeholder_hex: "16진수 데이터 입력 (예: FF 01 02 03)...",
    send: "전송",
    
    quick_send: "빠른 전송:",
    manage: "명령 관리",
    no_quick_commands: "빠른 명령이 아직 없습니다. '명령 관리'를 클릭하여 일반적인 AT 명령, 디버그 명령 등을 추가하고 디버깅 효율성을 향상시키세요",
    
    // 펌웨어 플래시
    flash_config: "펌웨어 다운로드 설정",
    target_device: "대상 장치:",
    select_file: "펌웨어 파일 선택",
    no_file_selected: "파일 선택되지 않음",
    file_size: "파일 크기",
    start_download: "다운로드 시작",
    stop_download: "다운로드 중지",
    preparing: "준비 중...",
    downloaded: "다운로드됨",
    download_log: "다운로드 로그",
    clear_log: "로그 지우기",
    waiting_download: "다운로드 작업 대기 중...",
    
    // 빠른 명령 관리
    quick_send_management: "빠른 전송 관리",
    add_new_command: "새 명령 추가",
    display_name: "표시 이름:",
    name_example: "예: 리셋",
    send_content: "전송 내용:",
    content_example: "예: AT+RST",
    add: "추가",
    existing_commands: "기존 명령",
    no_commands: "빠른 명령 없음",
    reset_default: "기본값으로 재설정",
    close: "닫기",
    
    // 오류 메시지
    error: "오류",
    
    // 시스템 메시지
    serial_connected: "시리얼 연결 성공!",
    serial_disconnected: "시리얼 연결이 해제되었습니다.",
    flash_serial_connected: "펌웨어 다운로드 시리얼 연결 성공!",
    flash_serial_disconnected: "펌웨어 다운로드 시리얼이 해제되었습니다.",
    switch_to_tab: "{0}로 전환, 시리얼 연결 해제됨",
    tab_serial_name: "시리얼 디버그",
    tab_flash_name: "펌웨어 다운로드",
    
    // 확인 대화상자
    switch_tab_confirm: "⚠️ 시리얼 뮤텍스 경고\n\n현재 {0} 기능이 시리얼 연결을 사용 중입니다.\n{0}과 {1} 기능은 동시에 시리얼을 사용할 수 없습니다.\n\n{1}로 전환하면:\n• 현재 시리얼 연결을 자동으로 해제\n• 진행 중인 작업을 중지\n\n전환하시겠습니까?",
    delete_command_confirm: "이 빠른 명령을 삭제하시겠습니까?",
    reset_commands_confirm: "기본 빠른 명령으로 재설정하시겠습니까? 모든 사용자 정의 명령이 삭제됩니다.",
    
    // 검증 메시지
    fill_complete_info: "명령 이름과 내용을 모두 입력하세요",
    command_name_exists: "명령 이름이 이미 존재합니다. 다른 이름을 사용하세요",
    no_data_to_save: "저장할 데이터가 없습니다",
    no_log_to_save: "저장할 로그가 없습니다",
    please_select_file: "먼저 펌웨어 파일을 선택하세요",
    please_connect_serial: "먼저 시리얼에 연결하세요",
    please_connect_flash_serial: "먼저 펌웨어 다운로드 시리얼에 연결하세요",
    flash_serial_not_connected: "펌웨어 다운로드 시리얼이 연결되지 않음",
    
    // Web Serial API 관련
    browser_not_supported: "귀하의 브라우저는 Web Serial API를 지원하지 않습니다. Chrome 89+ 또는 Edge 89+를 사용하세요.",
    connect_failed: "연결 실패: {0}",
    disconnect_failed: "연결 해제 실패: {0}",
    read_error: "데이터 읽기 오류: {0}",
    send_error: "데이터 전송 오류: {0}",
    hex_length_error: "HEX 문자열 길이는 짝수여야 합니다",
    serial_not_connected: "시리얼이 연결되지 않음",
    download_failed: "다운로드 실패: {0}",
    
    // 파일 작업
    file_selected: "파일 선택됨: {0} ({1} 바이트)",
    start_download_to: "{0}에 펌웨어 다운로드 시작...",
    download_complete: "펌웨어 다운로드 완료!",
    user_cancelled: "사용자가 다운로드를 취소함",
    
    // 펌웨어 다운로드 진행 메시지
    flash_handshaking: "핸드셰이크 연결 중...",
    flash_handshake_success: "핸드셰이크 성공",
    flash_handshake_failed: "핸드셰이크 실패, 장치 연결을 확인하세요",
    flash_download_cancelled: "다운로드 취소됨",
    waiting_reset: "장치 재부팅 대기 중...",
    flash_setting_baudrate: "보드레이트를 {0}로 설정 중...",
    flash_baudrate_set: "보드레이트 설정 완료",
    flash_erasing: "플래시 지우는 중...",
    flash_erase_progress: "지우기 진행률: {0}/{1}",
    flash_erase_sector_failed: "섹터 {0} 지우기 실패: {1}",
    flash_erase_complete: "플래시 지우기 완료",
    flash_writing_data: "데이터 쓰는 중...",
    flash_write_progress: "쓰기 진행률: {0}/{1}",
    flash_write_block_failed: "블록 {0} 쓰기 실패: {1}",
    flash_write_complete: "데이터 쓰기 완료",
    flash_verifying_crc: "데이터 검증 중...",
    flash_crc_passed: "CRC 검증 통과",
    flash_crc_failed_mismatch: "CRC 검증 실패: 로컬={0}, 장치={1}",
    flash_crc_failed: "CRC 검증 실패: {0}",
    flash_rebooting: "장치 재부팅 중...",
    flash_download_complete: "다운로드 완료",
    flash_download_success: "다운로드 성공적으로 완료!",
    flash_download_failed: "다운로드 실패: {0}",
    flash_downloading: "다운로드 진행 중, 완료까지 기다려 주세요",
    flash_user_cancelled: "사용자가 작업을 취소함",
    
    // 로그 파일 이름
    serial_log_filename: "시리얼_로그_{0}.txt",
    flash_log_filename: "플래시_로그_{0}.txt",
    
    // 툴팁
    current_tab_connected: "현재 {0} 기능이 시리얼에 연결됨",
    disconnect_tab_connection: "{0} 기능의 시리얼 연결 해제",
    connect_for_tab: "{0} 기능용 시리얼 연결",
    
    // 저작권 정보
    powered_by: "제공",
    all_rights_reserved: "모든 권리 보유",
    
    // 디버그 기능
    debug_mode: "디버그 모드",
    debug_basic: "기본",
    debug_detailed: "상세",
    debug_verbose: "완전",
    export_debug: "디버그 로그 내보내기",
    debug_status: "디버그 상태",
    debug_level: "디버그 레벨",
    packets_sent: "전송 패킷 수",
    packets_received: "수신 패킷 수",
    
    // 기능 버튼 및 작업
    fullscreen: "전체 화면",
    exit_fullscreen: "전체 화면 종료",
    
    // 새로 추가: 디버그 모드 상태
    debug_mode_enabled: "🔧 디버그 모드 활성화됨",
    debug_mode_disabled: "🔧 디버그 모드 비활성화됨",
    enabled: "활성화됨",
    disabled: "비활성화됨",
    
    // 새로 추가: 보드레이트 재설정 관련
    resetting_baudrate_115200: "시리얼 포트 보드레이트를 115200으로 재설정 중...",
    baudrate_reset_success: "✅ 시리얼 포트 보드레이트를 115200으로 재설정했습니다",
    direct_serial_reset_success: "✅ 시리얼 포트를 115200으로 직접 재설정했습니다",
    baudrate_reset_failed: "시리얼 포트 보드레이트 재설정 실패",
    direct_reset_failed: "시리얼 포트 직접 재설정도 실패",
    
    // 새로 추가: 다운로더 관리자 관련
    downloader_manager_not_initialized: "다운로더 관리자가 초기화되지 않음",
    loaded_chip_types: "{0}개의 지원되는 칩 유형이 로드됨",
    using_default_chip_support: "기본 칩 지원 사용 (T5AI)",
    unsupported_device_type: "지원되지 않는 장치 유형: {0}",
    unsupported_chip_type: "지원되지 않는 칩 유형: {0}",
    
    // 새로 추가: 펌웨어 다운로드 프로세스 관련
    starting_firmware_download_process: "펌웨어 다운로드 프로세스 시작 중...",
    starting_device_download: "{0} 장치 다운로드 시작, 파일 크기: {1} 바이트",
    firmware_download_completed_time: "펌웨어 다운로드 완료! 총 시간: {0}ms",
    device_firmware_download_completed: "{0} 장치 펌웨어 다운로드 완료",
    initializing_downloader: "{0} 다운로더 초기화 중...",
    connecting_device: "{0} 장치에 연결 중...",
    cannot_connect_device: "{0} 장치에 연결할 수 없습니다",
    downloading_firmware_to_device: "{0} 장치에 펌웨어 다운로드 중...",
    t5ai_firmware_download_completed: "T5AI 펌웨어 다운로드 완료",
    firmware_download_completed_device_restarted: "펌웨어 다운로드 완료, 장치 재시작 중...",
    serial_not_connected_connect_first: "시리얼이 연결되지 않음, 먼저 시리얼 장치를 연결하세요",
    restoring_serial_reader_writer_failed: "시리얼 reader/writer 복원 실패",
    cleanup_reset_baudrate: "정리: 보드레이트 재설정 중...",
    cleanup_baudrate_reset_success: "정리: 보드레이트 재설정 성공",
    cleanup_reset_failed: "정리: 재설정 실패",
    flashdownloader_reset_baudrate: "FlashDownloader: 보드레이트를 115200으로 재설정 중...",
    flashdownloader_baudrate_reset_success: "FlashDownloader: ✅ 보드레이트를 115200으로 성공적으로 재설정",
    flashdownloader_direct_reset_success: "FlashDownloader: ✅ 시리얼 포트 직접 재설정도 성공",
    flashdownloader_reset_failed: "FlashDownloader: 보드레이트 재설정 실패",
    
    // 새로 추가: 시리얼 연결 상태 메시지
    serial_connected_initial_switch: "초기 연결, 다음으로 전환됩니다",
    serial_connected_initial: "초기 연결",
    bps: "bps",
    
    // 시스템 정보 관련
    system_info: "시스템 정보",
    system_info_os: "운영체제",
    system_info_browser: "브라우저",
    system_info_web_serial: "Web Serial",
    system_info_platform: "플랫폼",
    system_info_supported: "지원됨",
    system_info_not_supported: "지원되지 않음",
    
    // 시리얼 연결 해제 처리
    serial_disconnected_unexpectedly: "시리얼 연결이 예기치 않게 해제됨: {0}",
    
    // 시리얼 포트 문제 해결 페이지
    troubleshooting_title: "시리얼 포트 문제 해결 가이드",
    troubleshooting_subtitle: "시리얼 연결 문제를 해결하는 완전한 가이드",
    back_to_main: "메인으로 돌아가기",
    no_serial_ports_found: "시리얼 포트를 찾을 수 없나요?",
    serial_troubleshooting_guide: "시리얼 연결 문제? 문제 해결 가이드 확인",
    serial_troubleshooting: "시리얼 문제 해결",
    
    // 빠른 확인 목록
    quick_check_title: "빠른 확인 목록",
    basic_checks: "기본 확인 항목",
    check_browser: "Chrome, Edge 또는 기타 Chromium 기반 브라우저 사용",
    check_cable: "USB 데이터 케이블이 정상적으로 연결됨 (충전 케이블이 아님)",
    check_device_power: "장치가 올바르게 전원이 켜짐",
    check_other_software: "시리얼 포트를 점유하는 다른 소프트웨어 종료",
    
    // 일반적인 문제
    common_issues_title: "일반적인 문제 및 해결책",
    issue_no_ports: "문제 1: 사용 가능한 시리얼 장치 없음",
    issue_no_ports_desc: "\"시리얼 연결\" 클릭 후 장치 목록이 비어 있음",
    issue_connection_failed: "문제 2: 연결 실패",
    issue_connection_failed_desc: "장치는 보이지만 연결 시 오류 발생",
    issue_no_data: "문제 3: 연결 성공했지만 데이터 없음",
    issue_no_data_desc: "시리얼 연결은 성공했지만 데이터를 받지 못하거나 데이터 표시가 비정상",
    
    possible_causes: "가능한 원인:",
    cause_driver_missing: "장치 드라이버가 설치되지 않았거나 올바르게 설치되지 않음",
    cause_cable_issue: "USB 케이블 문제 (데이터 케이블 대신 충전 케이블 사용)",
    cause_device_not_recognized: "장치가 시스템에 인식되지 않음",
    cause_port_occupied: "시리얼 포트가 다른 프로그램에 의해 점유됨",
    cause_permission_denied: "권한 부족 (Linux/macOS)",
    cause_device_busy: "장치가 다른 애플리케이션에서 사용 중",
    cause_driver_conflict: "드라이버 충돌 또는 비호환성",
    cause_baud_rate_mismatch: "보드레이트 설정 불일치",
    cause_serial_params_wrong: "데이터 비트, 정지 비트, 패리티 설정 오류",
    cause_device_not_sending: "장치에서 데이터를 보내지 않음",
    cause_flow_control: "흐름 제어 설정 문제",
    cause_cable_quality: "데이터 케이블 품질 문제 또는 접촉 불량",
    
    // 드라이버 문제 진단
    driver_diagnosis_title: "드라이버 문제 진단",
    driver_diagnosis_desc: "대부분의 시리얼 포트 문제는 드라이버와 관련이 있습니다. 다음 단계에 따라 진단하세요",
    
    // 운영 체제
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    
    // Windows 관련
    windows_check_device_manager: "단계 1: 장치 관리자 확인",
    windows_step1_title: "장치 관리자 열기",
    windows_step1_desc: "\"내 PC\" 우클릭 → \"속성\" → \"장치 관리자\", 또는 Win+X를 누르고 \"장치 관리자\" 선택",
    windows_step2_title: "시리얼 장치 찾기",
    windows_step2_desc: "장치 관리자에서 다음 범주를 찾으세요:",
    windows_step3_title: "장치 상태 식별",
    windows_step3_desc: "장치 아이콘 상태 확인:",
    
    ports_com_lpt: "포트(COM 및 LPT)",
    universal_serial_bus: "범용 직렬 버스 컨트롤러",
    other_devices: "기타 장치",
    
    device_normal: "✅ 정상: 장치 이름이 정상적으로 표시됨",
    device_warning: "⚠️ 경고: 노란색 느낌표, 드라이버 문제",
    device_error: "❌ 오류: 빨간색 X, 장치가 비활성화됨",
    device_unknown: "❓ 알 수 없음: \"기타 장치\"에 있음, 드라이버가 설치되지 않음",
    
    windows_driver_install: "단계 2: 드라이버 설치",
    windows_manual_install: "단계 3: 수동 드라이버 설치",
    
    // 드라이버 설명
    ch340_desc: "가장 일반적인 USB-시리얼 변환 칩",
    cp210x_desc: "Silicon Labs USB-시리얼 변환 칩",
    ftdi_desc: "FTDI USB-시리얼 변환 칩",
    
    download_driver: "해당 드라이버 다운로드",
    download_driver_desc: "장치 칩 모델에 따라 해당 드라이버 다운로드",
    run_installer: "설치 프로그램 실행",
    run_installer_desc: "다운로드한 드라이버 설치 프로그램을 관리자 권한으로 실행",
    restart_computer: "컴퓨터 재시작",
    restart_computer_desc: "설치 완료 후 컴퓨터를 재시작하여 드라이버 적용",
    verify_installation: "설치 확인",
    verify_installation_desc: "장치를 다시 연결하고 장치 관리자에서 정상적으로 표시되는지 확인",
    
    screenshot_device_manager: "장치 관리자 스크린샷 위치",
    
    // macOS 관련
    macos_check_system: "단계 1: 시스템 정보 확인",
    macos_step1_title: "시스템 정보 열기",
    macos_step1_desc: "Option 키를 누른 상태에서 Apple 메뉴 클릭 → \"시스템 정보\"",
    macos_step2_title: "USB 장치 보기",
    macos_step2_desc: "왼쪽에서 \"USB\"를 선택하여 연결된 USB 장치 보기",
    macos_step3_title: "시리얼 장치 확인",
    macos_step3_desc: "터미널을 열고 명령을 입력하여 시리얼 장치 보기:",
    
    macos_driver_install: "단계 2: 드라이버 설치",
    macos_driver_note: "macOS는 일반적으로 대부분의 USB-시리얼 변환 드라이버를 내장하고 있지만, 일부 칩은 여전히 수동 설치가 필요합니다",
    
    ch340_mac_desc: "macOS용 CH340 드라이버",
    cp210x_mac_desc: "macOS용 CP210x 드라이버",
    
    // Linux 관련
    linux_check_system: "단계 1: 시스템 인식 확인",
    linux_step1_title: "USB 장치 확인",
    linux_step1_desc: "터미널을 열고 다음 명령을 입력:",
    linux_step2_title: "시리얼 장치 확인",
    linux_step2_desc: "사용 가능한 시리얼 장치 보기:",
    linux_step3_title: "커널 메시지 확인",
    linux_step3_desc: "장치 연결 시 커널 메시지 보기:",
    
    linux_permissions: "단계 2: 권한 설정",
    linux_add_user_group: "사용자를 dialout 그룹에 추가",
    linux_add_user_desc: "다음 명령을 실행하고 다시 로그인:",
    linux_check_permissions: "장치 권한 확인",
    linux_check_permissions_desc: "장치 권한 설정 확인:",
    
    // 고급 문제 해결
    advanced_troubleshooting: "고급 문제 해결",
    hardware_issues: "하드웨어 문제 조사",
    software_conflicts: "소프트웨어 충돌 해결",
    
    try_different_cable: "다른 USB 데이터 케이블 시도",
    try_different_port: "다른 USB 포트 시도",
    try_different_computer: "다른 컴퓨터에서 장치 테스트",
    check_device_power: "장치 전원 공급이 정상인지 확인",
    
    close_other_serial_software: "다른 시리얼 디버깅 소프트웨어 종료",
    disable_antivirus: "일시적으로 안티바이러스 소프트웨어 비활성화",
    update_browser: "브라우저를 최신 버전으로 업데이트",
    clear_browser_cache: "브라우저 캐시 및 데이터 지우기",
    
    // 도움말 받기
    get_help_title: "도움말 받기",
    get_help_desc: "위의 방법으로 문제가 해결되지 않으면 다음 정보를 수집하여 기술 지원에 문의하세요:",
    
    help_info_os: "운영 체제 버전",
    help_info_browser: "브라우저 버전",
    help_info_device: "장치 모델 및 칩 정보",
    help_info_error: "구체적인 오류 메시지 스크린샷",
    help_info_device_manager: "장치 관리자 스크린샷 (Windows)",
    
    github_support_desc: "GitHub에서 문제 보고서 제출"
};

// 전역으로 내보내기
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.ko = ko;
} 