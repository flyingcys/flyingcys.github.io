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
    exit_fullscreen: "전체 화면 종료"
};

// 전역으로 내보내기
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.ko = ko;
} 