class SerialTerminal {
    constructor() {
        // 串口调试相关的连接状态
        this.serialPort = null;
        this.serialReader = null;
        this.serialWriter = null;
        this.isSerialConnected = false;
        
        // 固件下载相关的连接状态
        this.flashPort = null;
        this.flashReader = null;
        this.flashWriter = null;
        this.isFlashConnected = false;
        
        this.rxCount = 0;
        this.txCount = 0;
        this.selectedFile = null;
        this.flashDownloader = null;
        this.currentTab = 'serial'; // 默认为串口调试Tab
        
        // 数据缓冲区，用于按行显示
        this.receiveBuffer = '';
        
        this.initializeElements();
        this.bindEvents();
        this.checkWebSerialSupport();
        this.initializeTabs();
        this.initializeFlashDownloader();
        this.initializeQuickCommands();
        
        // 监听多语言系统就绪事件
        window.addEventListener('i18nReady', () => {
            this.initializeLanguage();
        });
        
        // 如果多语言系统已经就绪，立即初始化语言
        if (window.i18nLanguages && i18n.getCurrentLanguage()) {
            this.initializeLanguage();
        }
    }

    initializeElements() {
        // 串口调试按钮元素
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.saveBtn = document.getElementById('saveBtn');

        // 状态元素
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');

        // 串口调试配置元素
        this.serialTargetDevice = document.getElementById('serialTargetDevice');
        this.baudRateSelect = document.getElementById('baudRate');
        this.dataBitsSelect = document.getElementById('dataBits');
        this.stopBitsSelect = document.getElementById('stopBits');
        this.paritySelect = document.getElementById('parity');

        // 固件下载独立配置元素
        this.connectFlashBtn = document.getElementById('connectFlashBtn');
        this.disconnectFlashBtn = document.getElementById('disconnectFlashBtn');
        this.flashStatusDot = document.getElementById('flashStatusDot');
        this.flashStatusText = document.getElementById('flashStatusText');
        this.flashBaudRateSelect = document.getElementById('flashBaudRate');
        this.flashDataBitsSelect = document.getElementById('flashDataBits');
        this.flashStopBitsSelect = document.getElementById('flashStopBits');
        this.flashParitySelect = document.getElementById('flashParity');

        // 数据显示元素
        this.dataDisplay = document.getElementById('dataDisplay');
        this.sendInput = document.getElementById('sendInput');
        this.rxCountSpan = document.getElementById('rxCount');
        this.txCountSpan = document.getElementById('txCount');

        // 选项元素
        this.autoScrollCheck = document.getElementById('autoScroll');
        this.hexModeCheck = document.getElementById('hexMode');
        this.addNewlineCheck = document.getElementById('addNewline');
        this.showTimestampCheck = document.getElementById('showTimestamp');

        // 模态框元素
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.closeModal = document.querySelector('.close');

        // 快捷按钮相关元素
        this.quickButtonsContainer = document.getElementById('quickButtons');
        this.noQuickCommands = document.getElementById('noQuickCommands');
        this.manageQuickBtn = document.getElementById('manageQuickBtn');
        
        // 快捷发送管理模态框元素
        this.quickCommandModal = document.getElementById('quickCommandModal');
        this.commandName = document.getElementById('commandName');
        this.commandValue = document.getElementById('commandValue');
        this.addCommandBtn = document.getElementById('addCommandBtn');
        this.commandList = document.getElementById('commandList');
        this.noCommands = document.getElementById('noCommands');
        this.resetDefaultBtn = document.getElementById('resetDefaultBtn');
        this.closeQuickModalBtn = document.getElementById('closeQuickModalBtn');

        // Tab相关元素
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        // 固件下载相关元素
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.binFileInput = document.getElementById('binFileInput');
        this.selectedFileName = document.getElementById('selectedFileName');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileSize = document.getElementById('fileSize');
        this.deviceSelect = document.getElementById('deviceSelect');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.stopDownloadBtn = document.getElementById('stopDownloadBtn');
        this.progressArea = document.getElementById('progressArea');
        this.progressText = document.getElementById('progressText');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressFill = document.getElementById('progressFill');
        this.downloadedBytes = document.getElementById('downloadedBytes');
        this.totalBytes = document.getElementById('totalBytes');
        this.downloadSpeed = document.getElementById('downloadSpeed');

        // 固件下载日志相关元素
        this.flashLogDisplay = document.getElementById('flashLogDisplay');
        this.clearFlashLogBtn = document.getElementById('clearFlashLogBtn');
        this.saveFlashLogBtn = document.getElementById('saveFlashLogBtn');
        this.flashAutoScroll = document.getElementById('flashAutoScroll');

        // 调试控件相关元素
        this.flashDebugMode = document.getElementById('flashDebugMode');
        this.debugStatusBar = document.getElementById('debugStatusBar');
        this.debugStatusValue = document.getElementById('debugStatusValue');

        // 语言切换相关元素
        this.langDropdown = document.getElementById('langDropdown');
        this.langDropdownBtn = document.getElementById('langDropdownBtn');
        this.langDropdownMenu = document.getElementById('langDropdownMenu');
        this.currentLangFlag = document.getElementById('currentLangFlag');
        this.currentLangName = document.getElementById('currentLangName');

        // 全屏相关元素
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.fullscreenOverlay = document.getElementById('fullscreenOverlay');
        this.fullscreenCloseBtn = document.getElementById('fullscreenCloseBtn');
        this.fullscreenDataDisplay = document.getElementById('fullscreenDataDisplay');
        this.isFullscreen = false;

        // 下载日志全屏相关元素
        this.flashFullscreenBtn = document.getElementById('flashFullscreenBtn');
        this.flashFullscreenOverlay = document.getElementById('flashFullscreenOverlay');
        this.flashFullscreenCloseBtn = document.getElementById('flashFullscreenCloseBtn');
        this.flashFullscreenDataDisplay = document.getElementById('flashFullscreenDataDisplay');
        this.isFlashFullscreen = false;
    }

    bindEvents() {
        // 串口调试连接/断开事件
        this.connectBtn.addEventListener('click', () => {
            this.connectSerial();
        });
        
        this.disconnectBtn.addEventListener('click', () => {
            this.disconnectSerial();
        });

        // 固件下载独立连接/断开事件
        this.connectFlashBtn.addEventListener('click', () => {
            this.connectFlashIndependent();
        });
        
        this.disconnectFlashBtn.addEventListener('click', () => {
            this.disconnectFlashIndependent();
        });

        // 发送事件
        this.sendBtn.addEventListener('click', () => this.sendData());
        this.sendInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.sendData();
            }
        });

        // 清空和保存事件
        this.clearBtn.addEventListener('click', () => this.clearDisplay());
        this.saveBtn.addEventListener('click', () => this.saveLog());

        // 模态框事件
        this.closeModal.addEventListener('click', () => this.hideError());
        window.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideError();
            }
        });

        // 快捷发送管理事件
        this.manageQuickBtn.addEventListener('click', () => {
            this.showQuickCommandModal();
        });

        this.addCommandBtn.addEventListener('click', () => {
            this.addQuickCommand();
        });

        this.resetDefaultBtn.addEventListener('click', () => {
            this.resetDefaultCommands();
        });

        this.closeQuickModalBtn.addEventListener('click', () => {
            this.hideQuickCommandModal();
        });

        // 模态框关闭事件
        this.quickCommandModal.addEventListener('click', (e) => {
            if (e.target === this.quickCommandModal) {
                this.hideQuickCommandModal();
            }
        });

        const closeQuickModal = this.quickCommandModal.querySelector('.close');
        closeQuickModal.addEventListener('click', () => {
            this.hideQuickCommandModal();
        });

        // 输入框回车添加命令
        this.commandName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.addQuickCommand();
            }
        });

        this.commandValue.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.addQuickCommand();
            }
        });

        // HEX模式切换事件
        this.hexModeCheck.addEventListener('change', () => {
            this.updateInputPlaceholder();
        });

        // 串口目标设备选择事件
        this.serialTargetDevice.addEventListener('change', () => {
            this.handleSerialTargetDeviceChange();
        });

        // Tab切换事件（移除互斥逻辑）
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // 文件选择事件
        this.selectFileBtn.addEventListener('click', () => {
            this.binFileInput.click();
        });

        this.binFileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // 固件下载事件
        this.downloadBtn.addEventListener('click', () => {
            this.startFlashDownload();
        });

        this.stopDownloadBtn.addEventListener('click', () => {
            this.stopFlashDownload();
        });

        // 固件下载日志事件
        this.clearFlashLogBtn.addEventListener('click', () => {
            this.clearFlashLog();
        });

        this.saveFlashLogBtn.addEventListener('click', () => {
            this.saveFlashLog();
        });

        // 调试控件事件
        this.flashDebugMode.addEventListener('change', () => {
            this.toggleDebugMode();
        });

        // 语言切换事件
        this.langDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLanguageDropdown();
        });

        // 语言选项点击事件
        this.langDropdownMenu.addEventListener('click', async (e) => {
            const langOption = e.target.closest('.lang-option');
            if (langOption) {
                const selectedLang = langOption.getAttribute('data-lang');
                await this.changeLanguage(selectedLang);
                this.closeLanguageDropdown();
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.langDropdown.contains(e.target)) {
                this.closeLanguageDropdown();
            }
        });

        // 全屏相关事件
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        this.fullscreenCloseBtn.addEventListener('click', () => {
            this.exitFullscreen();
        });

        // 下载日志全屏相关事件
        this.flashFullscreenBtn.addEventListener('click', () => {
            this.toggleFlashFullscreen();
        });

        this.flashFullscreenCloseBtn.addEventListener('click', () => {
            this.exitFlashFullscreen();
        });

        // ESC键退出全屏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                if (this.isFlashFullscreen) {
                    this.exitFlashFullscreen();
                }
            }
        });

        // 点击覆盖层外部退出全屏
        this.fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === this.fullscreenOverlay) {
                this.exitFullscreen();
            }
        });

        this.flashFullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === this.flashFullscreenOverlay) {
                this.exitFlashFullscreen();
            }
        });
    }

    checkWebSerialSupport() {
        // 检测浏览器类型
        const isChromeBased = this.isChromiumBrowser();
        const browserWarning = document.getElementById('browserWarning');
        
        // 如果不是Chrome内核浏览器，显示警告
        if (!isChromeBased) {
            if (browserWarning) {
                browserWarning.style.display = 'block';
            }
        }
        
        // 检查Web Serial API支持
        if (!('serial' in navigator)) {
            this.showError(i18n.t('browser_not_supported'));
            this.connectBtn.disabled = true;
            
            // 如果不支持Web Serial API，也显示浏览器警告
            if (browserWarning) {
                browserWarning.style.display = 'block';
            }
        }
    }
    
    // 检测是否为Chromium内核浏览器
    isChromiumBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        const vendor = navigator.vendor.toLowerCase();
        
        // 检测Chrome、Edge、Opera、Brave等基于Chromium的浏览器
        const isChrome = userAgent.includes('chrome') && vendor.includes('google');
        const isEdge = userAgent.includes('edg/') || userAgent.includes('edge/');
        const isOpera = userAgent.includes('opr/') || userAgent.includes('opera/');
        const isBrave = userAgent.includes('brave/');
        const isChromium = userAgent.includes('chromium');
        
        // 排除非Chromium浏览器
        const isFirefox = userAgent.includes('firefox');
        const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
        const isIE = userAgent.includes('trident') || userAgent.includes('msie');
        
        if (isFirefox || isSafari || isIE) {
            return false;
        }
        
        return isChrome || isEdge || isOpera || isBrave || isChromium;
    }

    // 串口调试连接
    async connectSerial() {
        try {
            // 请求串口访问权限
            this.serialPort = await navigator.serial.requestPort();

            // 获取串口配置
            const options = this.getSerialOptions();

            // 打开串口
            await this.serialPort.open(options);

            // 设置读写器
            this.serialReader = this.serialPort.readable.getReader();
            this.serialWriter = this.serialPort.writable.getWriter();

            // 更新UI状态
            this.updateSerialConnectionStatus(true);

            // 开始读取数据
            this.startSerialReading();

            this.addToDisplay(i18n.t('serial_connected'), 'system');
            
            // 添加系统信息到日志
            this.addSystemInfoToLog('serial');
            
            // 调试信息：明确这是串口调试的连接
            console.log('串口调试连接成功，固件下载连接状态:', this.isFlashConnected);

        } catch (error) {
            console.error('串口调试连接失败:', error);
            
            // 检查是否为用户取消选择端口
            if (error.message && error.message.includes('No port selected by the user')) {
                // 用户取消了端口选择，不显示错误提示，这是正常操作
                console.log('用户取消了串口端口选择');
                return;
            }
            
            this.showError(i18n.t('connect_failed', error.message));
        }
    }

    // 串口调试断开连接
    async disconnectSerial() {
        try {
            // 停止读取
            if (this.serialReader) {
                await this.serialReader.cancel();
                await this.serialReader.releaseLock();
                this.serialReader = null;
            }

            // 关闭写入器
            if (this.serialWriter) {
                await this.serialWriter.releaseLock();
                this.serialWriter = null;
            }

            // 关闭串口
            if (this.serialPort) {
                await this.serialPort.close();
                this.serialPort = null;
            }

            // 更新UI状态
            this.updateSerialConnectionStatus(false);

            // 断开连接时显示剩余缓冲区数据
            if (this.receiveBuffer.trim()) {
                this.addToDisplay(this.receiveBuffer, 'received');
                this.receiveBuffer = '';
            }

            this.addToDisplay(i18n.t('serial_disconnected'), 'system');

        } catch (error) {
            console.error('串口调试断开连接失败:', error);
            this.showError(i18n.t('disconnect_failed', error.message));
        }
    }

    // 固件下载连接串口
    async connectFlash(baudrate = 115200) {
        try {
            // 如果没有请求过端口，则请求串口访问权限
            if (!this.flashPort) {
                this.flashPort = await navigator.serial.requestPort();
            }

            // 固件下载必须先用115200连接（与Python逻辑一致）
            const initialOptions = {
                baudRate: 115200,  // 始终先用115200连接
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            };

            // 打开串口
            await this.flashPort.open(initialOptions);

            // 设置读写器
            this.flashReader = this.flashPort.readable.getReader();
            this.flashWriter = this.flashPort.writable.getWriter();

            this.isFlashConnected = true;
            
            // 更新UI状态
            this.updateConnectionStatus();
            
            // 添加日志 - 如果用户要求的波特率不是115200，说明后续会切换
            if (baudrate !== 115200) {
                this.addToFlashLog(i18n.t('serial_connected') + ` (${initialOptions.baudRate} ${i18n.t('bps')} - ${i18n.t('serial_connected_initial_switch')} ${baudrate} ${i18n.t('bps')})`, 'info');
            } else {
                this.addToFlashLog(i18n.t('serial_connected') + ` (${baudrate} ${i18n.t('bps')})`, 'info');
            }
            
            // 调试信息：明确这是固件下载的连接
            console.log(i18n.t('console_flash_connect_success'), this.isSerialConnected);
            
            return { reader: this.flashReader, writer: this.flashWriter, port: this.flashPort };

        } catch (error) {
            console.error(i18n.t('console_flash_connect_failed'), error);
            
            // 检查是否为用户取消选择端口
            if (error.message && error.message.includes('No port selected by the user')) {
                // 用户取消了端口选择，不显示错误提示，这是正常操作
                console.log('用户取消了固件下载串口端口选择');
                throw error; // 仍然抛出错误以保持函数行为一致
            }
            
            this.showError(i18n.t('connect_failed', error.message));
            throw error;
        }
    }

    // 固件下载断开连接
    async disconnectFlash() {
        try {
            // 停止读取
            if (this.flashReader) {
                await this.flashReader.cancel();
                await this.flashReader.releaseLock();
                this.flashReader = null;
            }

            // 关闭写入器
            if (this.flashWriter) {
                await this.flashWriter.releaseLock();
                this.flashWriter = null;
            }

            // 关闭串口
            if (this.flashPort) {
                await this.flashPort.close();
                this.flashPort = null;
            }

            this.isFlashConnected = false;
            
            // 更新UI状态
            this.updateConnectionStatus();
            
            // 添加日志
            this.addToFlashLog(i18n.t('serial_disconnected'), 'info');

        } catch (error) {
            console.error('固件下载断开连接失败:', error);
            this.showError(i18n.t('disconnect_failed', error.message));
            throw error;
        }
    }

    // 固件下载独立连接
    async connectFlashIndependent() {
        try {
            // 请求串口访问权限
            this.flashPort = await navigator.serial.requestPort();

            // 固件下载必须先用115200连接（与Python逻辑一致）
            const initialOptions = {
                baudRate: 115200,  // 始终先用115200连接
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            };

            // 打开串口
            await this.flashPort.open(initialOptions);

            // 设置读写器
            this.flashReader = this.flashPort.readable.getReader();
            this.flashWriter = this.flashPort.writable.getWriter();

            this.isFlashConnected = true;
            
            // 更新UI状态
            this.updateFlashConnectionStatus(true);
            
            // 添加日志 - 显示初始连接波特率
            this.addToFlashLog(i18n.t('serial_connected'), 'success');
            this.addToFlashLog(`初始连接波特率: ${initialOptions.baudRate} bps`, 'info');
            
            // 添加系统信息到固件下载日志
            this.addSystemInfoToLog('flash');
            
            // 调试信息：明确这是固件下载的独立连接
            console.log('固件下载独立连接成功，串口调试连接状态:', this.isSerialConnected);
            
            return { reader: this.flashReader, writer: this.flashWriter, port: this.flashPort };

        } catch (error) {
            console.error('固件下载连接失败:', error);
            
            // 检查是否为用户取消选择端口
            if (error.message && error.message.includes('No port selected by the user')) {
                // 用户取消了端口选择，不显示错误提示，这是正常操作
                console.log('用户取消了固件下载串口端口选择');
                return;
            }
            
            this.showError(i18n.t('connect_failed', error.message));
            throw error;
        }
    }

    // 固件下载独立断开连接
    async disconnectFlashIndependent() {
        try {
            // 停止读取
            if (this.flashReader) {
                await this.flashReader.cancel();
                await this.flashReader.releaseLock();
                this.flashReader = null;
            }

            // 关闭写入器
            if (this.flashWriter) {
                await this.flashWriter.releaseLock();
                this.flashWriter = null;
            }

            // 关闭串口
            if (this.flashPort) {
                await this.flashPort.close();
                this.flashPort = null;
            }

            this.isFlashConnected = false;
            
            // 更新UI状态
            this.updateFlashConnectionStatus(false);
            
            // 添加日志
            this.addToFlashLog(i18n.t('serial_disconnected'), 'info');

        } catch (error) {
            console.error('固件下载断开连接失败:', error);
            this.showError(i18n.t('disconnect_failed', error.message));
            throw error;
        }
    }

    getSerialOptions() {
        return {
            baudRate: parseInt(this.baudRateSelect.value),
            dataBits: parseInt(this.dataBitsSelect.value),
            stopBits: parseInt(this.stopBitsSelect.value),
            parity: this.paritySelect.value
        };
    }

    // 获取固件下载独立的串口配置
    getFlashSerialOptions() {
        return {
            baudRate: parseInt(this.flashBaudRateSelect.value),
            dataBits: parseInt(this.flashDataBitsSelect.value),
            stopBits: parseInt(this.flashStopBitsSelect.value),
            parity: this.flashParitySelect.value
        };
    }

    // 统一的连接状态更新方法
    updateConnectionStatus() {
        // 只更新串口调试的连接状态
        this.updateSerialConnectionStatus(this.isSerialConnected);
    }

    updateSerialConnectionStatus(connected) {
        this.isSerialConnected = connected;
        
        if (connected) {
            this.connectBtn.disabled = true;
            this.disconnectBtn.disabled = false;
            this.sendBtn.disabled = false;
            this.statusDot.classList.add('connected');
            this.statusText.textContent = i18n.t('status_connected');
            
            // 禁用配置选项
            this.baudRateSelect.disabled = true;
            this.dataBitsSelect.disabled = true;
            this.stopBitsSelect.disabled = true;
            this.paritySelect.disabled = true;
            this.serialTargetDevice.disabled = true;
        } else {
            this.connectBtn.disabled = false;
            this.disconnectBtn.disabled = true;
            this.sendBtn.disabled = true;
            this.statusDot.classList.remove('connected');
            this.statusText.textContent = i18n.t('status_disconnected');
            
            // 启用目标设备选择器
            this.serialTargetDevice.disabled = false;
            
            // 根据当前选择的目标设备决定其他配置选项的状态
            const selectedDevice = this.serialTargetDevice.value;
            const isCustom = selectedDevice === 'custom';
            
            this.baudRateSelect.disabled = !isCustom;
            this.dataBitsSelect.disabled = !isCustom;
            this.stopBitsSelect.disabled = !isCustom;
            this.paritySelect.disabled = !isCustom;
            
            // 更新视觉提示
            const configElements = [this.baudRateSelect, this.dataBitsSelect, this.stopBitsSelect, this.paritySelect];
            configElements.forEach(element => {
                if (!isCustom) {
                    element.style.backgroundColor = '#f5f5f5';
                    element.style.cursor = 'not-allowed';
                } else {
                    element.style.backgroundColor = '';
                    element.style.cursor = '';
                }
            });
        }

        // 更新连接按钮的提示文本
        this.updateConnectionButtonTooltip();
    }

    // 更新固件下载连接状态
    updateFlashConnectionStatus(connected) {
        this.isFlashConnected = connected;
        
        if (connected) {
            this.connectFlashBtn.disabled = true;
            this.disconnectFlashBtn.disabled = false;
            this.flashStatusDot.classList.add('connected');
            this.flashStatusText.textContent = i18n.t('status_connected');
            
            // 如果有选择的文件，启用下载按钮
            if (this.selectedFile) {
                this.downloadBtn.disabled = false;
            }
            
            // 禁用固件下载配置选项（连接时不允许修改配置）
            this.flashBaudRateSelect.disabled = true;
            this.flashDataBitsSelect.disabled = true;
            this.flashStopBitsSelect.disabled = true;
            this.flashParitySelect.disabled = true;
        } else {
            this.connectFlashBtn.disabled = false;
            this.disconnectFlashBtn.disabled = true;
            this.flashStatusDot.classList.remove('connected');
            this.flashStatusText.textContent = i18n.t('status_disconnected');
            this.downloadBtn.disabled = true;
            
            // 启用固件下载配置选项
            this.flashBaudRateSelect.disabled = false;
            this.flashDataBitsSelect.disabled = false;
            this.flashStopBitsSelect.disabled = false;
            this.flashParitySelect.disabled = false;
        }
    }

    async startSerialReading() {
        try {
            while (this.serialPort && this.serialPort.readable && this.serialReader) {
                const { value, done } = await this.serialReader.read();
                
                if (done) {
                    break;
                }

                if (value) {
                    this.handleReceivedData(value);
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('读取数据错误:', error);
                
                // 检测串口异常断开的情况
                const isPortDisconnected = 
                    error.name === 'NetworkError' || 
                    error.message.includes('device has been lost') ||
                    error.message.includes('device not found') ||
                    error.message.includes('not open') ||
                    !this.serialPort?.readable;
                
                if (isPortDisconnected) {
                    // 串口异常断开，自动重置状态
                    this.handleSerialDisconnection(error);
                } else {
                    // 其他读取错误
                    this.showError(i18n.t('read_error', error.message));
                }
            }
        }
    }

    handleReceivedData(data) {
        // 在ASCII模式下，过滤掉0x00字符，并且不计入统计
        let filteredData = data;
        let actualDataLength = data.length;
        
        // 检查是否包含0x00字符
        const hasNullBytes = Array.from(data).some(byte => byte === 0x00);
        
        if (hasNullBytes) {
            // 过滤掉0x00字符
            filteredData = new Uint8Array(Array.from(data).filter(byte => byte !== 0x00));
            actualDataLength = filteredData.length;
            
            // 调试信息：显示过滤的字节数
            const filteredCount = data.length - actualDataLength;
            if (filteredCount > 0) {
                console.log(i18n.t('console_filtered_null_chars', filteredCount));
            }
        }
        
        // 只统计实际有效的数据长度（不包含0x00字符）
        this.rxCount += actualDataLength;
        this.rxCountSpan.textContent = this.rxCount;

        // 如果过滤后没有数据，直接返回
        if (actualDataLength === 0) {
            return;
        }

        // 转换数据为字符串，过滤控制字符
        const decoder = new TextDecoder();
        const text = decoder.decode(filteredData);
        
        // 过滤其他不可见控制字符，但保留换行符（注意：0x00已经在上面过滤了）
        const filteredText = text.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // 将数据添加到缓冲区
        this.receiveBuffer += filteredText;

        // 查找换行符并按行显示
        this.processReceiveBuffer();
    }

    processReceiveBuffer() {
        // 查找换行符 \r\n, \n, \r
        let lines = [];
        let lastIndex = 0;
        
        for (let i = 0; i < this.receiveBuffer.length; i++) {
            const char = this.receiveBuffer[i];
            if (char === '\n' || char === '\r') {
                // 找到换行符，提取一行
                let line = this.receiveBuffer.substring(lastIndex, i);
                if (line.length > 0) {
                    // 限制单行最大长度，防止显示异常
                    if (line.length > 200) {
                        // 将过长的行分割成多行
                        while (line.length > 200) {
                            lines.push(line.substring(0, 200));
                            line = line.substring(200);
                        }
                        if (line.length > 0) {
                            lines.push(line);
                        }
                    } else {
                        lines.push(line);
                    }
                }
                
                // 处理 \r\n 的情况，跳过下一个字符如果是配对的换行符
                if (char === '\r' && i + 1 < this.receiveBuffer.length && this.receiveBuffer[i + 1] === '\n') {
                    i++; // 跳过 \n
                }
                
                lastIndex = i + 1;
            }
        }
        
        // 显示完整的行
        lines.forEach(line => {
            this.addToDisplay(line, 'received');
        });
        
        // 保留未完成的行在缓冲区中
        this.receiveBuffer = this.receiveBuffer.substring(lastIndex);
        
        // 如果缓冲区太大，强制显示并清空（防止内存泄漏）
        if (this.receiveBuffer.length > 500) {
            if (this.receiveBuffer.trim()) {
                let remainingData = this.receiveBuffer;
                // 同样限制长度
                while (remainingData.length > 200) {
                    this.addToDisplay(remainingData.substring(0, 200), 'received');
                    remainingData = remainingData.substring(200);
                }
                if (remainingData.length > 0) {
                    this.addToDisplay(remainingData, 'received');
                }
            }
            this.receiveBuffer = '';
        }
    }

    async sendData() {
        if (!this.isSerialConnected || !this.serialWriter) {
            this.showError(i18n.t('serial_not_connected'));
            return;
        }

        const input = this.sendInput.value;
        if (!input.trim()) {
            return;
        }

        try {
            let dataToSend;

            if (this.hexModeCheck.checked) {
                // HEX模式
                dataToSend = this.hexStringToBytes(input);
            } else {
                // 文本模式
                let textToSend = input;
                if (this.addNewlineCheck.checked) {
                    textToSend += '\r\n';
                }
                dataToSend = new TextEncoder().encode(textToSend);
            }

            // 发送数据
            await this.serialWriter.write(dataToSend);

            // 更新发送计数
            this.txCount += dataToSend.length;
            this.txCountSpan.textContent = this.txCount;

            // 显示发送的数据
            this.addToDisplay(input, 'sent');

            // 清空输入框
            this.sendInput.value = '';

        } catch (error) {
            console.error('发送数据错误:', error);
            this.showError(i18n.t('send_error', error.message));
        }
    }

    hexStringToBytes(hexString) {
        // 移除空格和非十六进制字符
        const cleanHex = hexString.replace(/[^0-9A-Fa-f]/g, '');
        
        if (cleanHex.length % 2 !== 0) {
            throw new Error(i18n.t('hex_length_error'));
        }

        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
        }

        return bytes;
    }

    addToDisplay(text, type = 'received') {
        // 调试：打印接收到的原始数据
        if (type === 'received') {
            console.log(i18n.t('console_raw_received_data'), text);
            console.log(i18n.t('console_data_char_codes'), Array.from(text).map(c => c.charCodeAt(0)));
            console.log(i18n.t('console_contains_ansi_escape'), /(?:\x1b|\u001b)\[([0-9;]*)m/g.test(text));
            console.log(i18n.t('console_contains_missing_escape'), /\[([0-9;]*)m/g.test(text));
        }
        
        // 移除占位符
        const placeholder = this.dataDisplay.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // 对显示文本进行安全处理
        const safeText = this.sanitizeDisplayText(text);
        console.log(i18n.t('console_processed_safe_text'), safeText);

        const line = document.createElement('div');
        line.className = `data-line ${type}`;

        // 根据时间戳选项决定是否添加时间戳
        if (this.showTimestampCheck && this.showTimestampCheck.checked) {
            const timestamp = this.generateTimestamp();
            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'timestamp';
            timestampSpan.textContent = `[${timestamp}] `;
            line.appendChild(timestampSpan);
            
            // 添加类型前缀
            if (type === 'received') {
                const prefixSpan = document.createElement('span');
                prefixSpan.className = 'prefix rx';
                prefixSpan.textContent = 'RX: ';
                line.appendChild(prefixSpan);
            } else if (type === 'sent') {
                const prefixSpan = document.createElement('span');
                prefixSpan.className = 'prefix tx';
                prefixSpan.textContent = 'TX: ';
                line.appendChild(prefixSpan);
            }
        }
        
        // 添加数据内容
        const contentSpan = document.createElement('span');
        contentSpan.className = 'content';
        
        // 处理ANSI颜色
        if (typeof safeText === 'object' && safeText.hasAnsi) {
            console.log(i18n.t('console_apply_ansi_colors'), safeText);
            // 如果有ANSI颜色信息，应用颜色样式
            contentSpan.textContent = safeText.text;
            
            if (safeText.color) {
                contentSpan.style.color = safeText.color;
            }
            if (safeText.bgColor) {
                contentSpan.style.backgroundColor = safeText.bgColor;
            }
            if (safeText.bold) {
                contentSpan.style.fontWeight = 'bold';
            }
            
            // 为带颜色的行添加特殊类名
            line.classList.add('ansi-colored');
        } else {
            // 普通文本处理
            contentSpan.textContent = safeText;
        }
        
        line.appendChild(contentSpan);

        this.dataDisplay.appendChild(line);

        // 如果在全屏模式，同时添加到全屏显示区域
        if (this.isFullscreen) {
            const fullscreenPlaceholder = this.fullscreenDataDisplay.querySelector('.placeholder');
            if (fullscreenPlaceholder) {
                fullscreenPlaceholder.remove();
            }
            
            const fullscreenLine = line.cloneNode(true);
            this.fullscreenDataDisplay.appendChild(fullscreenLine);
        }

        // 自动滚动
        if (this.autoScrollCheck.checked) {
            this.dataDisplay.scrollTop = this.dataDisplay.scrollHeight;
            if (this.isFullscreen) {
                this.fullscreenDataDisplay.scrollTop = this.fullscreenDataDisplay.scrollHeight;
            }
        }

        // 添加动画效果
        line.classList.add('fade-in');
    }

    // 生成精确到毫秒的时间戳
    generateTimestamp() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0') + ':' +
               now.getSeconds().toString().padStart(2, '0') + '.' +
               now.getMilliseconds().toString().padStart(3, '0');
    }

    // 新增：对显示文本进行安全处理
    sanitizeDisplayText(text) {
        if (!text) return '';
        
        console.log(i18n.t('console_sanitize_input'), text);
        
        // 检查是否包含ANSI颜色序列（支持三种格式：\033、\x1b和缺少转义字符的格式）
        // 标准ANSI格式：\x1b[...m 或 \033[...m
        // 缺少转义字符格式：直接[...m（你的板子输出格式）
        const ansiColorRegex = /(?:(?:\x1b|\u001b)\[([0-9;]*)m|\[([0-9;]*)m)/g;
        
        // 重置正则表达式的lastIndex，因为test()会改变它
        ansiColorRegex.lastIndex = 0;
        const hasAnsiColors = ansiColorRegex.test(text);
        
        console.log(i18n.t('console_ansi_detection_result'), hasAnsiColors);
        
        if (hasAnsiColors) {
            console.log(i18n.t('console_call_parse_ansi'));
            // 如果包含ANSI颜色序列，解析并应用颜色
            return this.parseAnsiColors(text);
        }
        
        console.log(i18n.t('console_treat_as_plain'));
        
        // 替换所有控制字符和特殊字符为可见的替代符
        let sanitized = text
            .replace(/\x00/g, '\\0')      // null字符显示为\0
            .replace(/\t/g, '    ')       // tab转换为4个空格
            .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 其他控制字符显示为替换字符
        
        // 限制单行最大显示长度
        if (sanitized.length > 200) {
            sanitized = sanitized.substring(0, 200) + '...';
        }
        
        return sanitized;
    }

    // 新增：解析ANSI颜色序列
    parseAnsiColors(text) {
        console.log(i18n.t('console_parse_ansi_input'), text);
        
        // ANSI颜色映射表
        const ansiColors = {
            '30': '#000000',  // 黑色
            '31': '#ff4444',  // 红色（调整为更亮的红色）
            '32': '#44ff44',  // 绿色（调整为更亮的绿色）
            '33': '#ffff44',  // 黄色（调整为更亮的黄色）
            '34': '#4444ff',  // 蓝色（调整为更亮的蓝色）
            '35': '#ff44ff',  // 洋红色
            '36': '#44ffff',  // 青色
            '37': '#ffffff',  // 白色
            '90': '#808080',  // 亮黑色（灰色）
            '91': '#ff6b6b',  // 亮红色
            '92': '#51cf66',  // 亮绿色
            '93': '#ffd43b',  // 亮黄色
            '94': '#74c0fc',  // 亮蓝色
            '95': '#f06292',  // 亮洋红色
            '96': '#22d3ee',  // 亮青色
            '97': '#f8f9fa'   // 亮白色
        };

        const ansiBgColors = {
            '40': '#000000',  // 黑色背景
            '41': '#8b0000',  // 红色背景（调暗）
            '42': '#006400',  // 绿色背景（调暗）
            '43': '#8b8000',  // 黄色背景（调暗）
            '44': '#000080',  // 蓝色背景（调暗）
            '45': '#8b008b',  // 洋红色背景（调暗）
            '46': '#008b8b',  // 青色背景（调暗）
            '47': '#c0c0c0',  // 白色背景（调暗）
            '100': '#404040', // 亮黑色背景
            '101': '#800000', // 亮红色背景
            '102': '#008000', // 亮绿色背景
            '103': '#808000', // 亮黄色背景
            '104': '#000080', // 亮蓝色背景
            '105': '#800080', // 亮洋红色背景
            '106': '#008080', // 亮青色背景
            '107': '#808080'  // 亮白色背景
        };

        // 支持两种ANSI格式的正则表达式
        // 1. 标准格式：\x1b[...m 或 \033[...m
        // 2. 缺少转义字符格式：直接[...m
        const ansiRegex = /(?:(?:\x1b|\u001b)\[([0-9;]*)m|\[([0-9;]*)m)/g;
        let match;
        let currentColor = null;
        let currentBgColor = null;
        let bold = false;
        
        console.log(i18n.t('console_using_regex'), ansiRegex);
        
        // 查找所有ANSI序列
        while ((match = ansiRegex.exec(text)) !== null) {
            console.log(i18n.t('console_found_ansi_match'), match);
            // match[1] 是标准格式的代码，match[2] 是缺少转义字符格式的代码
            const codes = (match[1] || match[2] || '').split(';').filter(code => code !== '');
            console.log(i18n.t('console_parsed_codes'), codes);
            
            for (const code of codes) {
                console.log(i18n.t('console_processing_code'), code);
                if (code === '0') {
                    // 重置所有样式
                    currentColor = null;
                    currentBgColor = null;
                    bold = false;
                    console.log(i18n.t('console_reset_style'));
                } else if (code === '1') {
                    // 粗体/加亮
                    bold = true;
                    console.log(i18n.t('console_set_bold'));
                } else if (code === '22') {
                    // 关闭粗体
                    bold = false;
                    console.log(i18n.t('console_close_bold'));
                } else if (code === '39') {
                    // 默认前景色
                    currentColor = null;
                    console.log(i18n.t('console_reset_foreground'));
                } else if (code === '49') {
                    // 默认背景色
                    currentBgColor = null;
                    console.log(i18n.t('console_reset_background'));
                } else if (ansiColors[code]) {
                    // 前景色
                    currentColor = ansiColors[code];
                    console.log(i18n.t('console_set_foreground'), code, '->', currentColor);
                } else if (ansiBgColors[code]) {
                    // 背景色
                    currentBgColor = ansiBgColors[code];
                    console.log(i18n.t('console_set_background'), code, '->', currentBgColor);
                }
            }
        }
        
        // 移除ANSI序列，保留纯文本（支持两种格式）
        let cleanText = text.replace(ansiRegex, '');
        console.log(i18n.t('console_cleaned_text'), cleanText);
        
        // 替换其他控制字符
        cleanText = cleanText
            .replace(/\x00/g, '\\0')
            .replace(/\t/g, '    ')
            .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // 限制长度
        if (cleanText.length > 200) {
            cleanText = cleanText.substring(0, 200) + '...';
        }
        
        const result = {
            text: cleanText,
            color: currentColor,
            bgColor: currentBgColor,
            bold: bold,
            hasAnsi: true
        };
        
        console.log(i18n.t('console_parse_ansi_final'), result);
        
        return result;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearDisplay() {
        this.dataDisplay.innerHTML = `<div class="placeholder">${i18n.t('waiting_data')}</div>`;
        if (this.isFullscreen) {
            this.fullscreenDataDisplay.innerHTML = `<div class="placeholder">${i18n.t('waiting_data')}</div>`;
        }
        this.rxCount = 0;
        this.txCount = 0;
        this.rxCountSpan.textContent = '0';
        this.txCountSpan.textContent = '0';
        
        // 清空接收缓冲区
        this.receiveBuffer = '';
    }

    saveLog() {
        const lines = this.dataDisplay.querySelectorAll('.data-line');
        if (lines.length === 0) {
            this.showError(i18n.t('no_data_to_save'));
            return;
        }

        let logContent = '';
        lines.forEach(line => {
            logContent += line.textContent + '\n';
        });

        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `serial_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    updateInputPlaceholder() {
        if (this.hexModeCheck.checked) {
            this.sendInput.placeholder = i18n.t('input_placeholder_hex');
        } else {
            this.sendInput.placeholder = i18n.t('input_placeholder');
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.style.display = 'block';
    }

    hideError() {
        this.errorModal.style.display = 'none';
        
        // 如果当前在固件下载Tab且进度区域可见，清零进度条
        if (this.currentTab === 'flash' && this.progressArea && this.progressArea.style.display === 'block') {
            this.resetFlashProgress();
        }
    }

    // 初始化Tab功能
    initializeTabs() {
        // 默认显示串口调试Tab
        this.switchTab('serial');
    }

    // 切换Tab
    switchTab(tabName) {
        // 移除所有active类
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabPanels.forEach(panel => panel.classList.remove('active'));

        // 添加active类到当前Tab
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activePanel = document.getElementById(`${tabName}Tab`);
        
        if (activeBtn && activePanel) {
            activeBtn.classList.add('active');
            activePanel.classList.add('active');
        }

        // 更新当前Tab状态
        this.currentTab = tabName;
        
        // 更新连接状态显示
        this.updateConnectionStatus();
        
        return true; // 切换成功
    }

    // 初始化固件下载器
    initializeFlashDownloader() {
        this.flashDownloader = new FlashDownloader(this);
        
        // 设置进度回调函数，接收调试信息和进度更新
        this.flashDownloader.setProgressCallback((progressData) => {
            if (progressData.type === 'log') {
                // 根据isMainProcess标志显示日志
                this.addToFlashLog(progressData.message, progressData.level, progressData.isMainProcess);
            } else if (progressData.type === 'progress') {
                // 更新进度显示
                this.updateFlashProgress({
                    message: progressData.message,
                    percent: (progressData.progress / progressData.total) * 100,
                    downloadedSize: progressData.progress,
                    totalSize: progressData.total
                });
            }
        });
        
        // 初始化支持的芯片列表
        this.initializeSupportedChips();
        
        // 监听下载进度事件
        document.addEventListener('flashProgress', (e) => {
            this.updateFlashProgress(e.detail);
        });
    }

    // 初始化支持的芯片列表
    initializeSupportedChips() {
        if (typeof window.downloaderManager !== 'undefined') {
            const supportedChips = window.downloaderManager.getSupportedChips();
            
            // 清空现有选项
            this.deviceSelect.innerHTML = '';
            
            // 添加支持的芯片选项
            supportedChips.forEach(chip => {
                const option = document.createElement('option');
                option.value = chip.name;
                option.textContent = chip.displayName;
                option.title = chip.description;
                this.deviceSelect.appendChild(option);
            });
            
            this.addToFlashLog(
                i18n.t('loaded_chip_types', supportedChips.length), 
                'info', 
                true
            );
        } else {
            // 如果下载器管理器未加载，使用默认的T5AI选项
            this.deviceSelect.innerHTML = '<option value="T5AI">T5AI</option>';
            this.addToFlashLog(i18n.t('using_default_chip_support'), 'warning', true);
        }
    }

    // 处理文件选择
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.selectedFileName.textContent = file.name;
            this.fileSize.textContent = file.size.toLocaleString();
            this.fileInfo.style.display = 'block';
            
            // 只有在固件下载连接时才启用下载按钮
            this.downloadBtn.disabled = !this.isFlashConnected;
            
            this.addToFlashLog(i18n.t('file_selected', file.name, file.size.toLocaleString()), 'info');
        }
    }

    // 开始固件下载
    async startFlashDownload() {
        if (!this.selectedFile) {
            this.showError(i18n.t('please_select_file'));
            return;
        }

        if (!this.isFlashConnected) {
            this.showError(i18n.t('please_connect_flash_serial'));
            return;
        }

        try {
            this.downloadBtn.disabled = true;
            this.stopDownloadBtn.disabled = false;
            this.progressArea.style.display = 'block';

            // 读取文件数据
            const fileData = await this.readFileAsArrayBuffer(this.selectedFile);
            const device = this.deviceSelect.value;

            this.addToFlashLog(i18n.t('start_download_to', device), 'info');

            // 开始下载
            await this.flashDownloader.downloadBinary(new Uint8Array(fileData), device);

            this.addToFlashLog(i18n.t('download_complete'), 'success');

        } catch (error) {
            // 检查是否为串口异常断开
            if (this.isFlashPortDisconnectionError(error)) {
                // 串口异常断开，清理固件下载连接状态
                await this.cleanupFlashConnection();
                
                // 重置按钮状态（因为连接已断开）
                this.downloadBtn.disabled = !this.isFlashConnected || !this.selectedFile;
                this.stopDownloadBtn.disabled = true;
                
                // 显示固件下载恢复对话框
                this.showFlashRecoveryDialog(error);
                return; // 早期返回，避免执行finally块
            }
            
            this.addToFlashLog(i18n.t('download_failed', error.message), 'error');
            this.showError(i18n.t('download_failed', error.message));
        } finally {
            // 只有在非异常断开的情况下才执行finally逻辑
            this.downloadBtn.disabled = !this.isFlashConnected || !this.selectedFile;
            this.stopDownloadBtn.disabled = true;
        }
    }

    // 停止固件下载
    async stopFlashDownload() {
        if (this.flashDownloader) {
            this.flashDownloader.stop();
            this.addToFlashLog(i18n.t('user_cancelled'), 'warning');
            
            // 关键修复：停止下载时重置串口波特率到115200
            try {
                this.addToFlashLog(i18n.t('resetting_baudrate_115200'), 'info');
                
                // 如果有芯片下载器且有setBaudrate方法，优先使用它
                if (this.flashDownloader.chipDownloader && this.flashDownloader.chipDownloader.setBaudrate) {
                    await this.flashDownloader.chipDownloader.setBaudrate(115200);
                    this.addToFlashLog(i18n.t('baudrate_reset_success'), 'info');
                } else if (this.flashPort && this.isFlashConnected) {
                    // 直接重新配置串口
                    if (this.flashReader) {
                        await this.flashReader.releaseLock();
                        this.flashReader = null;
                    }
                    if (this.flashWriter) {
                        await this.flashWriter.releaseLock();
                        this.flashWriter = null;
                    }
                    
                    await this.flashPort.close();
                    await this.flashPort.open({
                        baudRate: 115200,
                        dataBits: 8,
                        stopBits: 1,
                        parity: 'none'
                    });
                    
                    this.flashReader = this.flashPort.readable.getReader();
                    this.flashWriter = this.flashPort.writable.getWriter();
                    this.addToFlashLog(i18n.t('direct_serial_reset_success'), 'info');
                }
            } catch (resetError) {
                this.addToFlashLog(i18n.t('baudrate_reset_failed') + ': ' + resetError.message, 'warning');
            }
        }
        this.downloadBtn.disabled = !this.isFlashConnected || !this.selectedFile;
        this.stopDownloadBtn.disabled = true;
    }

    // 读取文件为ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    // 更新固件下载进度
    updateFlashProgress(detail) {
        this.progressText.textContent = detail.message;
        this.progressPercent.textContent = `${Math.round(detail.percent)}%`;
        this.progressFill.style.width = `${detail.percent}%`;
        
        if (detail.totalSize > 0) {
            this.downloadedBytes.textContent = detail.downloadedSize.toLocaleString();
            this.totalBytes.textContent = detail.totalSize.toLocaleString();
        }

        // 添加到日志
        this.addToFlashLog(detail.message, 'progress');
    }

    // 重置固件下载进度条
    resetFlashProgress() {
        // 隐藏进度区域
        if (this.progressArea) {
            this.progressArea.style.display = 'none';
        }
        
        // 重置进度文本和百分比
        if (this.progressText) {
            this.progressText.textContent = '';
        }
        if (this.progressPercent) {
            this.progressPercent.textContent = '0%';
        }
        
        // 重置进度条填充
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        
        // 重置字节数显示
        if (this.downloadedBytes) {
            this.downloadedBytes.textContent = '0';
        }
        if (this.totalBytes) {
            this.totalBytes.textContent = '0';
        }
        
        // 重置下载速度
        if (this.downloadSpeed) {
            this.downloadSpeed.textContent = '0 KB/s';
        }
        
        console.log('固件下载进度条已重置');
    }

    // 添加到固件下载日志
    addToFlashLog(text, type = 'info', isMainProcess = false) {
        // 如果不是调试模式，只显示主流程信息
        if (!this.flashDebugMode.checked && !isMainProcess) {
            return;
        }
        
        const timestamp = this.generateTimestamp();
        const logEntry = document.createElement('div');
        logEntry.className = `debug-entry ${type}`;
        
        // 为主流程信息添加特殊样式
        if (isMainProcess) {
            logEntry.classList.add('main-process');
        }
        
        // 创建时间戳
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'debug-timestamp';
        timestampSpan.textContent = `[${timestamp}]`;
        
        // 创建类型标签
        const typeSpan = document.createElement('span');
        typeSpan.className = 'debug-type';
        typeSpan.textContent = isMainProcess ? 'MAIN' : type.toUpperCase();
        
        // 创建消息内容
        const messageSpan = document.createElement('span');
        messageSpan.className = 'debug-message';
        messageSpan.textContent = text;
        
        logEntry.appendChild(timestampSpan);
        logEntry.appendChild(typeSpan);
        logEntry.appendChild(messageSpan);
        
        // 移除占位符
        const placeholder = this.flashLogDisplay.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        this.flashLogDisplay.appendChild(logEntry);
        
        // 自动滚动
        if (this.flashAutoScroll && this.flashAutoScroll.checked) {
            this.flashLogDisplay.scrollTop = this.flashLogDisplay.scrollHeight;
        }

        // 如果处于全屏模式，同步更新全屏显示区域
        if (this.isFlashFullscreen) {
            this.syncFlashDataToFullscreen();
            // 全屏模式下也自动滚动
            if (this.flashAutoScroll && this.flashAutoScroll.checked) {
                setTimeout(() => {
                    this.flashFullscreenDataDisplay.scrollTop = this.flashFullscreenDataDisplay.scrollHeight;
                }, 50);
            }
        }
    }

    // 清空固件下载日志
    clearFlashLog() {
        this.flashLogDisplay.innerHTML = `<div class="placeholder">${i18n.t('waiting_download')}</div>`;
        
        // 如果处于全屏模式，同步更新全屏显示区域
        if (this.isFlashFullscreen) {
            this.syncFlashDataToFullscreen();
        }
    }

    // 保存固件下载日志
    saveFlashLog() {
        const lines = this.flashLogDisplay.querySelectorAll('.data-line');
        if (lines.length === 0) {
            this.showError(i18n.t('no_log_to_save'));
            return;
        }

        let logContent = '';
        lines.forEach(line => {
            logContent += line.textContent + '\n';
        });

        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `flash_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // =============== 快捷发送管理功能 ===============

    // 初始化快捷命令
    initializeQuickCommands() {
        // 从localStorage加载保存的命令，如果没有则使用默认命令
        this.quickCommands = this.loadQuickCommands();
        this.renderQuickButtons();
    }

    // 加载快捷命令
    loadQuickCommands() {
        const saved = localStorage.getItem('quickCommands');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // 默认命令
        return [
            { name: 'AT', value: 'AT' }
        ];
    }

    // 保存快捷命令
    saveQuickCommands() {
        localStorage.setItem('quickCommands', JSON.stringify(this.quickCommands));
    }

    // 渲染快捷按钮
    renderQuickButtons() {
        this.quickButtonsContainer.innerHTML = '';
        
        if (this.quickCommands.length === 0) {
            this.noQuickCommands.style.display = 'block';
            return;
        }
        
        this.noQuickCommands.style.display = 'none';
        
        this.quickCommands.forEach((command, index) => {
            const button = document.createElement('button');
            button.className = 'btn btn-small quick-btn';
            button.textContent = command.name;
            button.setAttribute('data-command', command.value);
            button.setAttribute('data-index', index);
            
            button.addEventListener('click', () => {
                this.sendInput.value = command.value;
                if (this.isSerialConnected) {
                    this.sendData();
                }
            });
            
            this.quickButtonsContainer.appendChild(button);
        });
    }

    // 显示快捷命令管理模态框
    showQuickCommandModal() {
        this.quickCommandModal.style.display = 'block';
        this.renderCommandList();
        this.clearAddForm();
    }

    // 隐藏快捷命令管理模态框
    hideQuickCommandModal() {
        this.quickCommandModal.style.display = 'none';
    }

    // 渲染命令列表
    renderCommandList() {
        this.commandList.innerHTML = '';
        
        if (this.quickCommands.length === 0) {
            this.noCommands.style.display = 'block';
            return;
        }
        
        this.noCommands.style.display = 'none';
        
        this.quickCommands.forEach((command, index) => {
            const item = document.createElement('div');
            item.className = 'command-item';
            item.setAttribute('data-index', index);
            
            item.innerHTML = `
                <div class="command-info">
                    <div class="command-name">${this.escapeHtml(command.name)}</div>
                    <div class="command-value">${this.escapeHtml(command.value)}</div>
                </div>
                <div class="command-actions">
                    <button class="btn-edit" onclick="window.serialTerminal.editCommand(${index})">✏️</button>
                    <button class="btn-delete" onclick="window.serialTerminal.deleteCommand(${index})">🗑️</button>
                </div>
            `;
            
            this.commandList.appendChild(item);
        });
    }

    // 清空添加表单
    clearAddForm() {
        this.commandName.value = '';
        this.commandValue.value = '';
        this.commandName.focus();
    }

    // 添加快捷命令
    addQuickCommand() {
        const name = this.commandName.value.trim();
        const value = this.commandValue.value.trim();
        
        if (!name || !value) {
            alert(i18n.t('fill_complete_info'));
            return;
        }
        
        // 检查是否重复
        if (this.quickCommands.some(cmd => cmd.name === name)) {
            alert(i18n.t('command_name_exists'));
            return;
        }
        
        // 添加命令
        this.quickCommands.push({ name, value });
        this.saveQuickCommands();
        this.renderQuickButtons();
        this.renderCommandList();
        this.clearAddForm();
    }

    // 编辑命令
    editCommand(index) {
        const item = this.commandList.children[index];
        const command = this.quickCommands[index];
        
        // 切换到编辑模式
        item.classList.add('editing');
        item.innerHTML = `
            <div class="command-info">
                <input type="text" class="command-name" value="${this.escapeHtml(command.name)}" maxlength="20">
                <input type="text" class="command-value" value="${this.escapeHtml(command.value)}">
            </div>
            <div class="command-actions">
                <button class="btn-save" onclick="window.serialTerminal.saveCommand(${index})">💾</button>
                <button class="btn-cancel" onclick="window.serialTerminal.cancelEdit(${index})">❌</button>
            </div>
        `;
        
        // 聚焦到名称输入框
        const nameInput = item.querySelector('.command-name');
        nameInput.focus();
        nameInput.select();
    }

    // 保存命令编辑
    saveCommand(index) {
        const item = this.commandList.children[index];
        const nameInput = item.querySelector('.command-name');
        const valueInput = item.querySelector('.command-value');
        
        const name = nameInput.value.trim();
        const value = valueInput.value.trim();
        
        if (!name || !value) {
            alert(i18n.t('fill_complete_info'));
            return;
        }
        
        // 检查是否与其他命令重复（排除自己）
        if (this.quickCommands.some((cmd, i) => i !== index && cmd.name === name)) {
            alert(i18n.t('command_name_exists'));
            return;
        }
        
        // 更新命令
        this.quickCommands[index] = { name, value };
        this.saveQuickCommands();
        this.renderQuickButtons();
        this.renderCommandList();
    }

    // 取消编辑
    cancelEdit(index) {
        this.renderCommandList();
    }

    // 删除命令
    deleteCommand(index) {
        if (confirm(i18n.t('delete_command_confirm'))) {
            this.quickCommands.splice(index, 1);
            this.saveQuickCommands();
            this.renderQuickButtons();
            this.renderCommandList();
        }
    }

    // 恢复默认命令
    resetDefaultCommands() {
        if (confirm(i18n.t('reset_commands_confirm'))) {
            this.quickCommands = [
                { name: 'AT', value: 'AT' }
            ];
            this.saveQuickCommands();
            this.renderQuickButtons();
            this.renderCommandList();
        }
    }

    // =============== 移除Tab切换互斥管理 ===============

    // 更新连接按钮的提示文本
    updateConnectionButtonTooltip() {
        if (this.isSerialConnected) {
            this.connectBtn.title = i18n.t('current_tab_connected', i18n.t('tab_serial_name'));
            this.disconnectBtn.title = i18n.t('disconnect_tab_connection', i18n.t('tab_serial_name'));
        } else {
            this.connectBtn.title = i18n.t('connect_for_tab', i18n.t('tab_serial_name'));
            this.disconnectBtn.title = i18n.t('status_disconnected');
        }
    }

    // =============== 语言切换功能 ===============

    // 初始化语言设置
    initializeLanguage() {
        // 更新语言按钮显示
        this.updateLanguageDisplay();
        
        // 初始化页面文本
        i18n.updatePageText();
        
        console.log('Language UI initialized for:', i18n.getCurrentLanguage());
    }

    // 切换下拉菜单显示状态
    toggleLanguageDropdown() {
        this.langDropdown.classList.toggle('active');
    }

    // 关闭下拉菜单
    closeLanguageDropdown() {
        this.langDropdown.classList.remove('active');
    }

    // 切换语言
    async changeLanguage(lang) {
        if (lang !== i18n.getCurrentLanguage()) {
            // 异步加载并设置语言
            const success = await i18n.setLanguage(lang);
            
            if (success) {
                // 更新语言显示
                this.updateLanguageDisplay();
                
                // 更新输入框placeholder
                this.updateInputPlaceholder();
                
                // 重新渲染快捷按钮（如果有的话）
                if (this.quickCommands) {
                    this.renderQuickButtons();
                }
                
                // 更新连接状态显示
                this.updateSerialConnectionStatus(this.isSerialConnected);
                
                // 更新各种占位符文本
                this.updatePlaceholderTexts();
                
                // 更新系统信息显示
                this.updateSystemInfoDisplay();
                
                console.log(i18n.t('console_language_switched'), lang);
            } else {
                console.error(`语言切换失败: ${lang}`);
                this.showError(`Failed to switch to language: ${lang}`);
            }
        }
    }

    // 更新语言显示
    updateLanguageDisplay() {
        const currentLang = i18n.getCurrentLanguage();
        
        if (!currentLang) {
            console.warn('当前语言未设置，使用默认中文');
            return;
        }
        
        const langData = {
            'zh': { flag: '🇨🇳', name: '简体中文' },
            'zh-tw': { flag: '🇹🇼', name: '繁體中文' },
            'en': { flag: '🇺🇸', name: 'English' },
            'fr': { flag: '🇫🇷', name: 'Français' },
            'de': { flag: '🇩🇪', name: 'Deutsch' },
            'es': { flag: '🇪🇸', name: 'Español' },
            'ja': { flag: '🇯🇵', name: '日本語' },
            'ko': { flag: '🇰🇷', name: '한국어' },
            'ru': { flag: '🇷🇺', name: 'Русский' },
            'pt': { flag: '🇵🇹', name: 'Português' }
        };
        
        const currentLangData = langData[currentLang];
        if (!currentLangData) {
            console.warn(`未知语言代码: ${currentLang}`);
            return;
        }
        
        // 更新当前显示的语言
        if (this.currentLangFlag) {
            this.currentLangFlag.textContent = currentLangData.flag;
        }
        if (this.currentLangName) {
            this.currentLangName.textContent = currentLangData.name;
        }
        
        // 更新选项的激活状态
        if (this.langDropdownMenu) {
            this.langDropdownMenu.querySelectorAll('.lang-option').forEach(option => {
                const optionLang = option.getAttribute('data-lang');
                if (optionLang === currentLang) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
        
        console.log(i18n.t('console_language_display_updated'), `${currentLangData.name} (${currentLang})`);
    }

    // 兼容性方法 - 保持原有的updateLanguageButton方法名
    updateLanguageButton() {
        this.updateLanguageDisplay();
    }

    // 更新占位符文本
    updatePlaceholderTexts() {
        // 更新接收数据区域的占位符
        const dataPlaceholder = this.dataDisplay.querySelector('.placeholder');
        if (dataPlaceholder) {
            dataPlaceholder.textContent = i18n.t('waiting_data');
        }
        
        // 更新固件下载日志的占位符
        const flashPlaceholder = this.flashLogDisplay.querySelector('.placeholder');
        if (flashPlaceholder) {
            flashPlaceholder.textContent = i18n.t('waiting_download');
        }
        
        // 更新文件名显示
        if (this.selectedFileName.textContent === '未选择文件' || this.selectedFileName.textContent === 'No file selected') {
            this.selectedFileName.textContent = i18n.t('no_file_selected');
        }
        
        // 更新无快捷命令提示
        const noQuickCmds = this.noQuickCommands.querySelector('p');
        if (noQuickCmds) {
            noQuickCmds.textContent = i18n.t('no_quick_commands');
        }
    }

    // =============== 全屏功能 ===============

    // 切换全屏状态
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    // 进入全屏模式
    enterFullscreen() {
        // 同步数据到全屏显示区域
        this.syncDataToFullscreen();
        
        // 显示全屏覆盖层
        this.fullscreenOverlay.classList.add('active');
        this.isFullscreen = true;
        
        // 滚动到底部（如果启用了自动滚动）
        if (this.autoScrollCheck.checked) {
            setTimeout(() => {
                this.fullscreenDataDisplay.scrollTop = this.fullscreenDataDisplay.scrollHeight;
            }, 100);
        }
    }

    // 退出全屏模式
    exitFullscreen() {
        // 隐藏全屏覆盖层
        this.fullscreenOverlay.classList.remove('active');
        this.isFullscreen = false;
    }

    // 同步数据到全屏显示区域
    syncDataToFullscreen() {
        this.fullscreenDataDisplay.innerHTML = this.dataDisplay.innerHTML;
    }

    // 调试控制功能
    toggleDebugMode() {
        const isEnabled = this.flashDebugMode.checked;
        
        // 更新FlashDownloader的调试状态
        if (this.flashDownloader) {
            if (isEnabled) {
                this.flashDownloader.enableDebug();
            } else {
                this.flashDownloader.disableDebug();
            }
        }
        
        // 更新UI状态
        this.updateDebugStatus();
        
        // 更新状态栏样式
        if (isEnabled) {
            this.debugStatusBar.classList.remove('disabled');
        } else {
            this.debugStatusBar.classList.add('disabled');
        }
        
        // 添加日志
        this.addToFlashLog(
            isEnabled ? i18n.t('debug_mode_enabled') : i18n.t('debug_mode_disabled'), 
            isEnabled ? 'success' : 'warning',
            true // 这是主流程信息
        );
    }

    updateDebugStatus() {
        // 更新调试状态显示
        const isEnabled = this.flashDebugMode.checked;
        
        // 更新状态文本
        this.debugStatusValue.textContent = isEnabled ? i18n.t('enabled') : i18n.t('disabled');
        
        // 更新状态颜色
        this.debugStatusValue.style.color = isEnabled ? '#10b981' : '#ef4444';
    }

    // 下载日志全屏功能
    // 切换下载日志全屏状态
    toggleFlashFullscreen() {
        if (!this.isFlashFullscreen) {
            this.enterFlashFullscreen();
        } else {
            this.exitFlashFullscreen();
        }
    }

    // 进入下载日志全屏模式
    enterFlashFullscreen() {
        // 同步数据到全屏显示区域
        this.syncFlashDataToFullscreen();
        
        // 显示全屏覆盖层
        this.flashFullscreenOverlay.classList.add('active');
        this.isFlashFullscreen = true;
        
        // 滚动到底部（如果启用了自动滚动）
        if (this.flashAutoScroll.checked) {
            setTimeout(() => {
                this.flashFullscreenDataDisplay.scrollTop = this.flashFullscreenDataDisplay.scrollHeight;
            }, 100);
        }
    }

    // 退出下载日志全屏模式
    exitFlashFullscreen() {
        // 隐藏全屏覆盖层
        this.flashFullscreenOverlay.classList.remove('active');
        this.isFlashFullscreen = false;
    }

    // 同步下载日志数据到全屏显示区域
    syncFlashDataToFullscreen() {
        this.flashFullscreenDataDisplay.innerHTML = this.flashLogDisplay.innerHTML;
    }

    // 串口目标设备选择事件
    handleSerialTargetDeviceChange() {
        const selectedDevice = this.serialTargetDevice.value;
        
        // 定义设备对应的波特率配置
        const deviceBaudrateConfig = {
            'custom': { baudrate: 115200, readonly: false }, // 自定义时恢复到默认值115200
            'T5AI': { baudrate: 460800, readonly: true },
            'T3': { baudrate: 460800, readonly: true },
            'T2': { baudrate: 115200, readonly: true },
            'ESP32': { baudrate: 115200, readonly: true },
            'ESP32C3': { baudrate: 115200, readonly: true },
            'ESP32S3': { baudrate: 115200, readonly: true },
            'BK7231N': { baudrate: 115200, readonly: true },
            'LN882H': { baudrate: 921600, readonly: true }
        };
        
        const config = deviceBaudrateConfig[selectedDevice];
        
        if (config) {
            // 设置对应的波特率
            this.baudRateSelect.value = config.baudrate;
            
            // 当选择自定义时，恢复所有配置到默认值
            if (selectedDevice === 'custom') {
                this.dataBitsSelect.value = 8;
                this.stopBitsSelect.value = 1;
                this.paritySelect.value = 'none';
            }
            
            // 设置所有串口配置选择器是否只读
            const isReadonly = config.readonly;
            this.baudRateSelect.disabled = isReadonly;
            this.dataBitsSelect.disabled = isReadonly;
            this.stopBitsSelect.disabled = isReadonly;
            this.paritySelect.disabled = isReadonly;
            
            // 添加视觉提示
            const configElements = [this.baudRateSelect, this.dataBitsSelect, this.stopBitsSelect, this.paritySelect];
            configElements.forEach(element => {
                if (isReadonly) {
                    element.style.backgroundColor = '#f5f5f5';
                    element.style.cursor = 'not-allowed';
                } else {
                    element.style.backgroundColor = '';
                    element.style.cursor = '';
                }
            });
            
            console.log(i18n.t('console_serial_target_device'), `${selectedDevice}, ${i18n.t('baud_rate')} ${config.baudrate}, 配置锁定: ${isReadonly}`);
        }
    }

    // 处理串口异常断开
    async handleSerialDisconnection(error) {
        console.warn('检测到串口异常断开:', error.message);
        
        // 添加系统消息显示断开原因
        this.addToDisplay(i18n.t('serial_disconnected_unexpectedly', error.message), 'system error');
        
        // 清理连接状态和资源
        await this.cleanupSerialConnection();
        
        // 显示用户友好的恢复提示
        this.showSerialRecoveryDialog();
    }

    // 清理串口连接状态和资源
    async cleanupSerialConnection() {
        try {
            // 清理读取器
            if (this.serialReader) {
                try {
                    await this.serialReader.cancel();
                } catch (e) {
                    // 忽略取消时的错误
                }
                try {
                    await this.serialReader.releaseLock();
                } catch (e) {
                    // 忽略释放锁时的错误
                }
                this.serialReader = null;
            }

            // 清理写入器
            if (this.serialWriter) {
                try {
                    await this.serialWriter.releaseLock();
                } catch (e) {
                    // 忽略释放锁时的错误
                }
                this.serialWriter = null;
            }

            // 重置串口对象
            this.serialPort = null;
            
            // 重置连接状态
            this.updateSerialConnectionStatus(false);
            
            console.log('串口连接状态已清理完成');
            
        } catch (error) {
            console.error('清理串口连接时出错:', error);
        }
    }

    // 显示串口恢复对话框
    showSerialRecoveryDialog() {
        const isZh = i18n.getCurrentLanguage().startsWith('zh');
        const title = isZh ? '⚠️ 串口连接异常' : '⚠️ Serial Connection Error';
        const message = isZh 
            ? '串口设备已断开或被移除。\n\n可能的原因：\n• USB连接断开\n• 设备被拔出\n• 驱动程序问题\n\n请检查设备连接后重新连接串口。'
            : 'Serial device has been disconnected or removed.\n\nPossible causes:\n• USB connection lost\n• Device unplugged\n• Driver issues\n\nPlease check device connection and reconnect the serial port.';
        
        const reconnectText = isZh ? '重新连接' : 'Reconnect';
        const cancelText = isZh ? '取消' : 'Cancel';
        
        // 创建自定义对话框
        if (this.recoveryDialog) {
            document.body.removeChild(this.recoveryDialog);
        }
        
        this.recoveryDialog = document.createElement('div');
        this.recoveryDialog.className = 'recovery-dialog-overlay';
        this.recoveryDialog.innerHTML = `
            <div class="recovery-dialog">
                <div class="recovery-dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="recovery-dialog-body">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="recovery-dialog-actions">
                    <button class="btn btn-primary" id="recoveryReconnect">${reconnectText}</button>
                    <button class="btn btn-secondary" id="recoveryCancel">${cancelText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.recoveryDialog);
        
        // 绑定事件
        document.getElementById('recoveryReconnect').onclick = () => {
            this.closeRecoveryDialog();
            this.connectSerial(); // 尝试重新连接
        };
        
        document.getElementById('recoveryCancel').onclick = () => {
            this.closeRecoveryDialog();
        };
        
        // 点击背景关闭
        this.recoveryDialog.onclick = (e) => {
            if (e.target === this.recoveryDialog) {
                this.closeRecoveryDialog();
            }
        };
    }

    // 关闭恢复对话框
    closeRecoveryDialog() {
        if (this.recoveryDialog) {
            document.body.removeChild(this.recoveryDialog);
            this.recoveryDialog = null;
        }
        
        // 如果当前在固件下载Tab且进度区域可见，清零进度条
        if (this.currentTab === 'flash' && this.progressArea && this.progressArea.style.display === 'block') {
            this.resetFlashProgress();
        }
    }

    // 检测固件下载串口异常断开
    isFlashPortDisconnectionError(error) {
        return error.name === 'NetworkError' || 
               error.message.includes('device has been lost') ||
               error.message.includes('device not found') ||
               error.message.includes('not open') ||
               error.message.includes('设备连接已断开') ||
               !this.flashPort?.readable;
    }

    // 清理固件下载连接状态和资源
    async cleanupFlashConnection() {
        try {
            // 清理读取器
            if (this.flashReader) {
                try {
                    await this.flashReader.cancel();
                } catch (e) {
                    // 忽略取消时的错误
                }
                try {
                    await this.flashReader.releaseLock();
                } catch (e) {
                    // 忽略释放锁时的错误
                }
                this.flashReader = null;
            }

            // 清理写入器
            if (this.flashWriter) {
                try {
                    await this.flashWriter.releaseLock();
                } catch (e) {
                    // 忽略释放锁时的错误
                }
                this.flashWriter = null;
            }

            // 重置串口对象
            this.flashPort = null;
            
            // 重置连接状态
            this.updateFlashConnectionStatus(false);
            
            console.log('固件下载串口连接状态已清理完成');
            
        } catch (error) {
            console.error('清理固件下载串口连接时出错:', error);
        }
    }

    // 显示固件下载恢复对话框
    showFlashRecoveryDialog(error) {
        const isZh = i18n.getCurrentLanguage().startsWith('zh');
        const title = isZh ? '⚠️ 固件下载连接异常' : '⚠️ Firmware Download Connection Error';
        const message = isZh 
            ? '固件下载过程中串口设备断开或被移除。\n\n可能的原因：\n• USB连接断开\n• 设备被拔出\n• 下载过程中设备重启\n• 驱动程序问题\n\n请检查设备连接后重新连接串口并重试下载。'
            : 'Serial device disconnected during firmware download.\n\nPossible causes:\n• USB connection lost\n• Device unplugged\n• Device restart during download\n• Driver issues\n\nPlease check device connection, reconnect serial port and retry download.';
        
        const reconnectText = isZh ? '重新连接' : 'Reconnect';
        const cancelText = isZh ? '取消' : 'Cancel';
        
        // 创建自定义对话框
        if (this.flashRecoveryDialog) {
            document.body.removeChild(this.flashRecoveryDialog);
        }
        
        this.flashRecoveryDialog = document.createElement('div');
        this.flashRecoveryDialog.className = 'recovery-dialog-overlay';
        this.flashRecoveryDialog.innerHTML = `
            <div class="recovery-dialog">
                <div class="recovery-dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="recovery-dialog-body">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="recovery-dialog-actions">
                    <button class="btn btn-primary" id="flashRecoveryReconnect">${reconnectText}</button>
                    <button class="btn btn-secondary" id="flashRecoveryCancel">${cancelText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.flashRecoveryDialog);
        
        // 绑定事件
        document.getElementById('flashRecoveryReconnect').onclick = () => {
            this.closeFlashRecoveryDialog();
            this.connectFlashIndependent(); // 尝试重新连接
        };
        
        document.getElementById('flashRecoveryCancel').onclick = () => {
            this.closeFlashRecoveryDialog();
        };
        
        // 点击背景关闭
        this.flashRecoveryDialog.onclick = (e) => {
            if (e.target === this.flashRecoveryDialog) {
                this.closeFlashRecoveryDialog();
            }
        };
    }

    // 关闭固件下载恢复对话框
    closeFlashRecoveryDialog() {
        if (this.flashRecoveryDialog) {
            document.body.removeChild(this.flashRecoveryDialog);
            this.flashRecoveryDialog = null;
        }
        
        // 固件下载恢复对话框关闭时，总是重置进度条
        if (this.progressArea && this.progressArea.style.display === 'block') {
            this.resetFlashProgress();
        }
    }

    // 获取系统信息
    getSystemInfo() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        // 解析操作系统
        let os = 'Unknown';
        if (userAgent.indexOf('Windows') !== -1) {
            os = 'Windows';
            if (userAgent.indexOf('Windows NT 10.0') !== -1) os = 'Windows 10/11';
            else if (userAgent.indexOf('Windows NT 6.3') !== -1) os = 'Windows 8.1';
            else if (userAgent.indexOf('Windows NT 6.2') !== -1) os = 'Windows 8';
            else if (userAgent.indexOf('Windows NT 6.1') !== -1) os = 'Windows 7';
        } else if (userAgent.indexOf('Mac') !== -1) {
            os = 'macOS';
            const macMatch = userAgent.match(/Mac OS X ([0-9_]+)/);
            if (macMatch) {
                const version = macMatch[1].replace(/_/g, '.');
                os = `macOS ${version}`;
            }
        } else if (userAgent.indexOf('Linux') !== -1) {
            os = 'Linux';
            if (userAgent.indexOf('Ubuntu') !== -1) os = 'Ubuntu Linux';
            else if (userAgent.indexOf('CentOS') !== -1) os = 'CentOS Linux';
            else if (userAgent.indexOf('Fedora') !== -1) os = 'Fedora Linux';
        } else if (userAgent.indexOf('Android') !== -1) {
            os = 'Android';
        }

        // 解析浏览器版本
        let browser = 'Unknown';
        let browserVersion = '';
        
        if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) {
            browser = 'Chrome';
            const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
            if (chromeMatch) browserVersion = chromeMatch[1];
        } else if (userAgent.indexOf('Edg') !== -1) {
            browser = 'Edge';
            const edgeMatch = userAgent.match(/Edg\/([0-9.]+)/);
            if (edgeMatch) browserVersion = edgeMatch[1];
        } else if (userAgent.indexOf('Firefox') !== -1) {
            browser = 'Firefox';
            const firefoxMatch = userAgent.match(/Firefox\/([0-9.]+)/);
            if (firefoxMatch) browserVersion = firefoxMatch[1];
        } else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
            browser = 'Safari';
            const safariMatch = userAgent.match(/Version\/([0-9.]+)/);
            if (safariMatch) browserVersion = safariMatch[1];
        }

        // Web Serial API 支持检测
        const webSerialSupport = 'serial' in navigator;
        
        return {
            os,
            platform,
            browser,
            browserVersion,
            browserString: browserVersion ? `${browser} ${browserVersion}` : browser,
            webSerialSupport,
            userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
    }

    // 格式化系统信息为字符串
    formatSystemInfo() {
        const info = this.getSystemInfo();
        const osText = i18n.t('system_info_os') || '操作系统';
        const browserText = i18n.t('system_info_browser') || '浏览器';
        const webSerialText = i18n.t('system_info_web_serial') || 'Web Serial';
        const platformText = i18n.t('system_info_platform') || '平台';
        const supportedText = i18n.t('system_info_supported') || '支持';
        const notSupportedText = i18n.t('system_info_not_supported') || '不支持';
        
        return `${osText}: ${info.os} | ${browserText}: ${info.browserString} | ${webSerialText}: ${info.webSerialSupport ? supportedText : notSupportedText} | ${platformText}: ${info.platform}`;
    }

    // 添加系统信息到日志
    addSystemInfoToLog(logType = 'serial') {
        const info = this.getSystemInfo();
        const timestamp = this.generateTimestamp();
        
        const systemInfoLines = [
            `=== 系统环境信息 ===`,
            `时间: ${timestamp}`,
            `操作系统: ${info.os}`,
            `浏览器: ${info.browserString}`,
            `Web Serial API: ${info.webSerialSupport ? '✅ 支持' : '❌ 不支持'}`,
            `平台架构: ${info.platform}`,
            `页面地址: ${info.url}`,
            `User Agent: ${info.userAgent}`,
            `=====================`
        ];

        if (logType === 'serial') {
            // 添加到串口调试日志
            systemInfoLines.forEach(line => {
                this.addToDisplay(line, 'system');
            });
        } else if (logType === 'flash') {
            // 添加到固件下载日志
            systemInfoLines.forEach(line => {
                this.addToFlashLog(line, 'system');
            });
        }
    }

    // 更新系统信息显示
    updateSystemInfoDisplay() {
        const subtitleElement = document.getElementById('systemInfoSubtitle');
        if (subtitleElement) {
            const info = this.formatSystemInfo();
            subtitleElement.textContent = info;
        }
    }
}

// 注意：SerialTerminal现在由HTML中的DOMContentLoaded事件处理器初始化，确保多语言系统先就绪