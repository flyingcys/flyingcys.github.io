// =============== 工具函数 ===============

/**
 * 将十六进制字符串转换为字节数组
 * @param {string} hexString - 十六进制字符串
 * @returns {Uint8Array} 字节数组
 */
window.hexStringToBytes = function(hexString) {
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
};

/**
 * 生成精确到毫秒的时间戳
 * @returns {string} 格式化的时间戳
 */
window.generateTimestamp = function() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' +
           now.getMinutes().toString().padStart(2, '0') + ':' +
           now.getSeconds().toString().padStart(2, '0') + '.' +
           now.getMilliseconds().toString().padStart(3, '0');
};

/**
 * 对显示文本进行安全处理
 * @param {string} text - 原始文本
 * @returns {string|object} 处理后的文本或包含ANSI信息的对象
 */
window.sanitizeDisplayText = function(text) {
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
        return window.parseAnsiColors(text);
    }
    
    console.log(i18n.t('console_treat_as_plain'));
    
    // 替换所有控制字符和特殊字符为可见的替代符
    let sanitized = text
        .replace(/\x00/g, '\\0')      // null字符显示为\0
        .replace(/\t/g, '    ')       // tab转换为4个空格
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 其他控制字符显示为替换字符
    
    // 限制单行最大显示长度
    if (sanitized.length > window.MAX_DISPLAY_LINE_LENGTH) {
        sanitized = sanitized.substring(0, window.MAX_DISPLAY_LINE_LENGTH) + '...';
    }
    
    return sanitized;
};

/**
 * 解析ANSI颜色序列
 * @param {string} text - 包含ANSI序列的文本
 * @returns {object} 包含文本和样式信息的对象
 */
window.parseAnsiColors = function(text) {
    console.log(i18n.t('console_parse_ansi_input'), text);
    
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
            } else if (window.ANSI_COLORS[code]) {
                // 前景色
                currentColor = window.ANSI_COLORS[code];
                console.log(i18n.t('console_set_foreground'), code, '->', currentColor);
            } else if (window.ANSI_BG_COLORS[code]) {
                // 背景色
                currentBgColor = window.ANSI_BG_COLORS[code];
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
    if (cleanText.length > window.MAX_DISPLAY_LINE_LENGTH) {
        cleanText = cleanText.substring(0, window.MAX_DISPLAY_LINE_LENGTH) + '...';
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
};

/**
 * 转义HTML字符
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
window.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * 读取文件为ArrayBuffer
 * @param {File} file - 文件对象
 * @returns {Promise<ArrayBuffer>} ArrayBuffer内容
 */
window.readFileAsArrayBuffer = function(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * 检测是否为Chromium内核浏览器
 * @returns {boolean} 是否为Chromium内核
 */
window.isChromiumBrowser = function() {
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
}; 