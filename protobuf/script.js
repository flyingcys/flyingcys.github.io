// 全局变量
let currentSchema = null;
let currentMessage = null;
let currentData = {};
let activeTab = 'visual';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSample();
    setupEventListeners();
    updateStatus('就绪');
});

// 设置事件监听器
function setupEventListeners() {
    // Schema编辑器变化监听
    document.getElementById('schemaEditor').addEventListener('input', debounce(parseSchema, 500));
    
    // JSON编辑器变化监听
    document.getElementById('jsonEditor').addEventListener('input', debounce(updateFromJson, 500));
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            switchPanels();
        }
    });
    
    // 展开按钮事件
    document.getElementById('expandEditorBtn').addEventListener('click', () => expandPanel('editor'));
    document.getElementById('expandViewerBtn').addEventListener('click', () => expandPanel('viewer'));
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 面板管理功能
function togglePanel(panelType) {
    const editorPanel = document.getElementById('editorPanel');
    const viewerPanel = document.getElementById('viewerPanel');
    const editorBtn = document.getElementById('collapseEditorBtn');
    const viewerBtn = document.getElementById('collapseViewerBtn');
    const resetBtn = document.getElementById('resetPanelsBtn');
    const expandEditorBtn = document.getElementById('expandEditorBtn');
    const expandViewerBtn = document.getElementById('expandViewerBtn');

    if (panelType === 'editor') {
        if (editorPanel.classList.contains('panel-collapsed')) {
            showNotification('编辑器面板已经折叠', 'warning');
            return;
        }
        
        if (viewerPanel.classList.contains('panel-collapsed')) {
            showNotification('无法折叠：至少需要保持一个面板展开', 'error');
            return;
        }

        editorPanel.classList.add('panel-collapsed');
        viewerPanel.classList.add('panel-expanded');
        editorBtn.style.opacity = '0.5';
        editorBtn.style.pointerEvents = 'none';
        expandEditorBtn.style.display = 'flex';
        resetBtn.style.display = 'inline-block';
        
    } else if (panelType === 'viewer') {
        if (viewerPanel.classList.contains('panel-collapsed')) {
            showNotification('预览面板已经折叠', 'warning');
            return;
        }
        
        if (editorPanel.classList.contains('panel-collapsed')) {
            showNotification('无法折叠：至少需要保持一个面板展开', 'error');
            return;
        }

        viewerPanel.classList.add('panel-collapsed');
        editorPanel.classList.add('panel-expanded');
        viewerBtn.style.opacity = '0.5';
        viewerBtn.style.pointerEvents = 'none';
        expandViewerBtn.style.display = 'flex';
        resetBtn.style.display = 'inline-block';
    }
}

function expandPanel(panelType) {
    const editorPanel = document.getElementById('editorPanel');
    const viewerPanel = document.getElementById('viewerPanel');
    const expandEditorBtn = document.getElementById('expandEditorBtn');
    const expandViewerBtn = document.getElementById('expandViewerBtn');
    
    if (panelType === 'editor') {
        editorPanel.classList.remove('panel-collapsed');
        viewerPanel.classList.remove('panel-expanded');
        expandEditorBtn.style.display = 'none';
        document.getElementById('collapseEditorBtn').style.opacity = '1';
        document.getElementById('collapseEditorBtn').style.pointerEvents = 'auto';
    } else if (panelType === 'viewer') {
        viewerPanel.classList.remove('panel-collapsed');
        editorPanel.classList.remove('panel-expanded');
        expandViewerBtn.style.display = 'none';
        document.getElementById('collapseViewerBtn').style.opacity = '1';
        document.getElementById('collapseViewerBtn').style.pointerEvents = 'auto';
    }
    
    // 检查是否需要隐藏重置按钮
    if (!editorPanel.classList.contains('panel-collapsed') && 
        !viewerPanel.classList.contains('panel-collapsed')) {
        document.getElementById('resetPanelsBtn').style.display = 'none';
    }
}

function resetPanels() {
    const editorPanel = document.getElementById('editorPanel');
    const viewerPanel = document.getElementById('viewerPanel');
    const editorBtn = document.getElementById('collapseEditorBtn');
    const viewerBtn = document.getElementById('collapseViewerBtn');
    const resetBtn = document.getElementById('resetPanelsBtn');
    const expandEditorBtn = document.getElementById('expandEditorBtn');
    const expandViewerBtn = document.getElementById('expandViewerBtn');

    editorPanel.classList.remove('panel-collapsed', 'panel-expanded');
    viewerPanel.classList.remove('panel-collapsed', 'panel-expanded');
    
    editorBtn.style.opacity = '1';
    editorBtn.style.pointerEvents = 'auto';
    viewerBtn.style.opacity = '1';
    viewerBtn.style.pointerEvents = 'auto';
    
    expandEditorBtn.style.display = 'none';
    expandViewerBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    
    showNotification('面板已恢复默认布局', 'success');
}

function switchPanels() {
    const editorPanel = document.getElementById('editorPanel');
    const viewerPanel = document.getElementById('viewerPanel');
    
    if (editorPanel.classList.contains('panel-collapsed')) {
        expandPanel('editor');
        togglePanel('viewer');
    } else if (viewerPanel.classList.contains('panel-collapsed')) {
        expandPanel('viewer');
        togglePanel('editor');
    }
}

// 标签页切换
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活选中的标签页
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    activeTab = tabName;
    
    // 根据标签页更新内容
    if (tabName === 'json') {
        updateJsonTab();
    } else if (tabName === 'binary') {
        updateBinaryTab();
    }
}

// 加载示例数据
function loadSample() {
    const sampleSchema = `syntax = "proto3";

// 用户信息消息
message Person {
  string name = 1;           // 姓名
  int32 id = 2;             // 用户ID
  string email = 3;         // 邮箱地址
  repeated string phone = 4; // 电话号码列表
  Address address = 5;      // 地址信息
  
  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }
  
  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }
  
  repeated PhoneNumber phones = 6;
}

// 地址信息
message Address {
  string street = 1;        // 街道
  string city = 2;          // 城市
  string state = 3;         // 省份
  int32 zip_code = 4;       // 邮编
  string country = 5;       // 国家
}

// 公司信息
message Company {
  string name = 1;          // 公司名称
  repeated Person employees = 2; // 员工列表
  Address headquarters = 3;  // 总部地址
}`;

    document.getElementById('schemaEditor').value = sampleSchema;
    parseSchema();
    updateStatus('示例数据已加载');
    showNotification('示例 Proto Schema 已加载', 'success');
}

// 解析Proto Schema
function parseSchema() {
    const schemaText = document.getElementById('schemaEditor').value;
    
    if (!schemaText.trim()) {
        currentSchema = null;
        updateMessageSelect([]);
        updateSchemaInfo('未定义');
        return;
    }
    
    try {
        const messages = parseProtoMessages(schemaText);
        currentSchema = { messages, raw: schemaText };
        updateMessageSelect(Object.keys(messages));
        updateSchemaInfo(`${Object.keys(messages).length} 个消息类型`);
        updateStatus('Schema 解析成功');
    } catch (error) {
        updateStatus(`Schema 解析错误: ${error.message}`);
        showNotification(`Schema 解析错误: ${error.message}`, 'error');
    }
}

// 简单的Proto消息解析器
function parseProtoMessages(schemaText) {
    const messages = {};
    const lines = schemaText.split('\n');
    let currentMessage = null;
    let braceCount = 0;
    
    for (let line of lines) {
        line = line.trim();
        
        // 跳过注释和空行
        if (line.startsWith('//') || line.startsWith('/*') || !line) continue;
        
        // 检测消息定义开始
        const messageMatch = line.match(/message\s+(\w+)\s*\{/);
        if (messageMatch) {
            currentMessage = {
                name: messageMatch[1],
                fields: []
            };
            braceCount = 1;
            continue;
        }
        
        // 处理消息内容
        if (currentMessage && braceCount > 0) {
            // 计算大括号
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            // 解析字段
            const fieldMatch = line.match(/^\s*(repeated\s+)?(\w+)\s+(\w+)\s*=\s*(\d+);/);
            if (fieldMatch) {
                const [, repeated, type, name, number] = fieldMatch;
                currentMessage.fields.push({
                    name,
                    type,
                    number: parseInt(number),
                    repeated: !!repeated
                });
            }
            
            // 消息定义结束
            if (braceCount === 0) {
                messages[currentMessage.name] = currentMessage;
                currentMessage = null;
            }
        }
    }
    
    return messages;
}

// 更新消息选择器
function updateMessageSelect(messageNames) {
    const select = document.getElementById('messageSelect');
    select.innerHTML = '<option value="">选择消息类型</option>';
    
    messageNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// 切换消息类型
function switchMessage() {
    const messageName = document.getElementById('messageSelect').value;
    if (!messageName || !currentSchema) return;
    
    currentMessage = currentSchema.messages[messageName];
    currentData = {};
    
    generateVisualEditor();
    updateJsonTab();
    updateBinaryTab();
    updateStatus(`已选择消息类型: ${messageName}`);
}

// 生成可视化编辑器
function generateVisualEditor() {
    const container = document.getElementById('visualEditor');
    
    if (!currentMessage) {
        container.innerHTML = '<div class="placeholder">请先定义 Proto Schema 并选择消息类型</div>';
        return;
    }
    
    let html = '';
    
    currentMessage.fields.forEach(field => {
        html += generateFieldHtml(field);
    });
    
    container.innerHTML = html;
    
    // 绑定事件监听器
    container.querySelectorAll('.field-input').forEach(input => {
        input.addEventListener('input', updateDataFromVisual);
    });
}

// 生成字段HTML
function generateFieldHtml(field) {
    const fieldId = `field_${field.name}`;
    const isRepeated = field.repeated;
    const fieldClass = isRepeated ? 'field-group repeated-field' : 'field-group';
    
    let html = `<div class="${fieldClass}">
        <div class="field-label">
            ${field.name}
            <span class="field-type">${field.type}</span>
            ${isRepeated ? '<span class="field-type">repeated</span>' : ''}
        </div>`;
    
    if (isRepeated) {
        html += `<div class="repeated-items" id="${fieldId}_items">
            <!-- 重复项将在这里动态添加 -->
        </div>
        <button class="add-btn" onclick="addRepeatedItem('${field.name}', '${field.type}')">+ 添加项</button>`;
    } else {
        html += generateInputHtml(field.name, field.type, '');
    }
    
    html += '</div>';
    return html;
}

// 生成输入框HTML
function generateInputHtml(fieldName, fieldType, value, index = null) {
    const inputId = index !== null ? `field_${fieldName}_${index}` : `field_${fieldName}`;
    const inputName = index !== null ? `${fieldName}[${index}]` : fieldName;
    
    let inputHtml = '';
    
    switch (fieldType) {
        case 'string':
            inputHtml = `<input type="text" class="field-input" id="${inputId}" name="${inputName}" value="${value}" placeholder="输入字符串...">`;
            break;
        case 'int32':
        case 'int64':
        case 'uint32':
        case 'uint64':
            inputHtml = `<input type="number" class="field-input" id="${inputId}" name="${inputName}" value="${value}" placeholder="输入数字...">`;
            break;
        case 'bool':
            inputHtml = `<select class="field-input" id="${inputId}" name="${inputName}">
                <option value="">选择布尔值</option>
                <option value="true" ${value === 'true' ? 'selected' : ''}>true</option>
                <option value="false" ${value === 'false' ? 'selected' : ''}>false</option>
            </select>`;
            break;
        case 'float':
        case 'double':
            inputHtml = `<input type="number" step="any" class="field-input" id="${inputId}" name="${inputName}" value="${value}" placeholder="输入浮点数...">`;
            break;
        default:
            inputHtml = `<input type="text" class="field-input" id="${inputId}" name="${inputName}" value="${value}" placeholder="输入 ${fieldType}...">`;
    }
    
    if (index !== null) {
        return `<div class="repeated-item">
            ${inputHtml}
            <button class="remove-btn" onclick="removeRepeatedItem('${fieldName}', ${index})">×</button>
        </div>`;
    }
    
    return inputHtml;
}

// 添加重复项
function addRepeatedItem(fieldName, fieldType) {
    const container = document.getElementById(`field_${fieldName}_items`);
    const currentItems = container.children.length;
    
    const itemHtml = generateInputHtml(fieldName, fieldType, '', currentItems);
    container.insertAdjacentHTML('beforeend', itemHtml);
    
    // 绑定新输入框的事件
    const newInput = container.lastElementChild.querySelector('.field-input');
    newInput.addEventListener('input', updateDataFromVisual);
}

// 移除重复项
function removeRepeatedItem(fieldName, index) {
    const container = document.getElementById(`field_${fieldName}_items`);
    const items = container.children;
    
    if (items[index]) {
        items[index].remove();
        updateDataFromVisual();
    }
}

// 从可视化编辑器更新数据
function updateDataFromVisual() {
    if (!currentMessage) return;
    
    const newData = {};
    
    currentMessage.fields.forEach(field => {
        if (field.repeated) {
            const items = document.getElementById(`field_${field.name}_items`).children;
            const values = [];
            
            for (let item of items) {
                const input = item.querySelector('.field-input');
                const value = convertValue(input.value, field.type);
                if (value !== null && value !== '') {
                    values.push(value);
                }
            }
            
            if (values.length > 0) {
                newData[field.name] = values;
            }
        } else {
            const input = document.getElementById(`field_${field.name}`);
            if (input) {
                const value = convertValue(input.value, field.type);
                if (value !== null && value !== '') {
                    newData[field.name] = value;
                }
            }
        }
    });
    
    currentData = newData;
    
    // 更新其他标签页
    if (activeTab === 'json') {
        updateJsonTab();
    } else if (activeTab === 'binary') {
        updateBinaryTab();
    }
}

// 转换值类型
function convertValue(value, type) {
    if (!value) return null;
    
    switch (type) {
        case 'int32':
        case 'int64':
        case 'uint32':
        case 'uint64':
            return parseInt(value) || 0;
        case 'float':
        case 'double':
            return parseFloat(value) || 0.0;
        case 'bool':
            return value === 'true';
        case 'string':
        default:
            return value;
    }
}

// 更新JSON标签页
function updateJsonTab() {
    const jsonEditor = document.getElementById('jsonEditor');
    jsonEditor.value = JSON.stringify(currentData, null, 2);
}

// 从JSON更新数据
function updateFromJson() {
    try {
        const jsonText = document.getElementById('jsonEditor').value;
        if (!jsonText.trim()) {
            currentData = {};
            return;
        }
        
        currentData = JSON.parse(jsonText);
        
        // 更新可视化编辑器
        if (activeTab === 'visual') {
            updateVisualFromData();
        }
        
        updateBinaryTab();
    } catch (error) {
        showNotification(`JSON 解析错误: ${error.message}`, 'error');
    }
}

// 从数据更新可视化编辑器
function updateVisualFromData() {
    if (!currentMessage) return;
    
    currentMessage.fields.forEach(field => {
        const value = currentData[field.name];
        
        if (field.repeated && Array.isArray(value)) {
            const container = document.getElementById(`field_${field.name}_items`);
            container.innerHTML = '';
            
            value.forEach((item, index) => {
                const itemHtml = generateInputHtml(field.name, field.type, item, index);
                container.insertAdjacentHTML('beforeend', itemHtml);
            });
            
            // 重新绑定事件
            container.querySelectorAll('.field-input').forEach(input => {
                input.addEventListener('input', updateDataFromVisual);
            });
        } else if (!field.repeated && value !== undefined) {
            const input = document.getElementById(`field_${field.name}`);
            if (input) {
                input.value = value;
            }
        }
    });
}

// 更新二进制标签页
function updateBinaryTab() {
    const binaryContent = document.getElementById('binaryContent');
    const binarySize = document.getElementById('binarySize');
    
    try {
        // 模拟Protobuf二进制编码
        const binaryData = encodeProtobuf(currentData);
        const hexString = arrayToHex(binaryData);
        
        binarySize.textContent = binaryData.length;
        binaryContent.innerHTML = formatHexDump(hexString);
    } catch (error) {
        binaryContent.innerHTML = `<div class="error-message">二进制编码错误: ${error.message}</div>`;
        binarySize.textContent = '0';
    }
}

// 简单的Protobuf编码模拟
function encodeProtobuf(data) {
    const bytes = [];
    
    if (!currentMessage) return bytes;
    
    currentMessage.fields.forEach(field => {
        const value = data[field.name];
        if (value === undefined || value === null) return;
        
        const fieldNumber = field.number;
        const wireType = getWireType(field.type);
        const tag = (fieldNumber << 3) | wireType;
        
        if (field.repeated && Array.isArray(value)) {
            value.forEach(item => {
                bytes.push(tag);
                encodeValue(bytes, item, field.type);
            });
        } else {
            bytes.push(tag);
            encodeValue(bytes, value, field.type);
        }
    });
    
    return bytes;
}

// 获取线路类型
function getWireType(type) {
    switch (type) {
        case 'int32':
        case 'int64':
        case 'uint32':
        case 'uint64':
        case 'bool':
            return 0; // Varint
        case 'float':
            return 5; // 32-bit
        case 'double':
            return 1; // 64-bit
        case 'string':
            return 2; // Length-delimited
        default:
            return 2;
    }
}

// 编码值
function encodeValue(bytes, value, type) {
    switch (type) {
        case 'int32':
        case 'uint32':
            encodeVarint(bytes, value);
            break;
        case 'bool':
            bytes.push(value ? 1 : 0);
            break;
        case 'string':
            const stringBytes = new TextEncoder().encode(value);
            encodeVarint(bytes, stringBytes.length);
            bytes.push(...stringBytes);
            break;
        case 'float':
            const floatBytes = new Float32Array([value]);
            const floatUint8 = new Uint8Array(floatBytes.buffer);
            bytes.push(...floatUint8);
            break;
        default:
            const defaultBytes = new TextEncoder().encode(String(value));
            encodeVarint(bytes, defaultBytes.length);
            bytes.push(...defaultBytes);
    }
}

// 编码变长整数
function encodeVarint(bytes, value) {
    while (value >= 0x80) {
        bytes.push((value & 0xFF) | 0x80);
        value >>>= 7;
    }
    bytes.push(value & 0xFF);
}

// 数组转十六进制
function arrayToHex(bytes) {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 格式化十六进制转储
function formatHexDump(hexString) {
    let html = '';
    const bytesPerLine = 16;
    
    for (let i = 0; i < hexString.length; i += bytesPerLine * 2) {
        const offset = (i / 2).toString(16).padStart(8, '0');
        const hexBytes = hexString.substr(i, bytesPerLine * 2);
        const formattedHex = hexBytes.match(/.{2}/g)?.join(' ') || '';
        
        // 生成ASCII表示
        const ascii = hexBytes.match(/.{2}/g)?.map(hex => {
            const byte = parseInt(hex, 16);
            return (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
        }).join('') || '';
        
        html += `<div class="hex-line">
            <span class="hex-offset">${offset}</span>
            <span class="hex-bytes">${formattedHex.padEnd(bytesPerLine * 3 - 1, ' ')}</span>
            <span class="hex-ascii">${ascii}</span>
        </div>`;
    }
    
    return html || '无数据';
}

// 生成示例数据
function generateSample() {
    if (!currentMessage) {
        showNotification('请先选择消息类型', 'warning');
        return;
    }
    
    const sampleData = {};
    
    currentMessage.fields.forEach(field => {
        if (field.repeated) {
            sampleData[field.name] = generateSampleArray(field.type, 2);
        } else {
            sampleData[field.name] = generateSampleValue(field.type);
        }
    });
    
    currentData = sampleData;
    updateVisualFromData();
    updateJsonTab();
    updateBinaryTab();
    
    showNotification('示例数据已生成', 'success');
}

// 生成示例数组
function generateSampleArray(type, count) {
    const array = [];
    for (let i = 0; i < count; i++) {
        array.push(generateSampleValue(type, i));
    }
    return array;
}

// 生成示例值
function generateSampleValue(type, index = 0) {
    switch (type) {
        case 'string':
            return `示例文本${index + 1}`;
        case 'int32':
        case 'uint32':
            return Math.floor(Math.random() * 1000) + index;
        case 'int64':
        case 'uint64':
            return Math.floor(Math.random() * 10000) + index;
        case 'bool':
            return Math.random() > 0.5;
        case 'float':
        case 'double':
            return Math.round((Math.random() * 100 + index) * 100) / 100;
        default:
            return `${type}_value_${index + 1}`;
    }
}

// 验证Schema
function validateSchema() {
    const schemaText = document.getElementById('schemaEditor').value;
    
    if (!schemaText.trim()) {
        showNotification('Schema 为空', 'warning');
        return;
    }
    
    try {
        parseProtoMessages(schemaText);
        showNotification('Schema 验证通过', 'success');
        updateStatus('Schema 验证成功');
    } catch (error) {
        showNotification(`Schema 验证失败: ${error.message}`, 'error');
        updateStatus(`Schema 验证失败: ${error.message}`);
    }
}

// 格式化Schema
function formatSchema() {
    const schemaText = document.getElementById('schemaEditor').value;
    
    if (!schemaText.trim()) {
        showNotification('Schema 为空', 'warning');
        return;
    }
    
    try {
        // 简单的格式化逻辑
        const lines = schemaText.split('\n');
        let formatted = '';
        let indentLevel = 0;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            
            if (trimmed.includes('}')) {
                indentLevel--;
            }
            
            formatted += '  '.repeat(indentLevel) + trimmed + '\n';
            
            if (trimmed.includes('{')) {
                indentLevel++;
            }
        });
        
        document.getElementById('schemaEditor').value = formatted;
        showNotification('Schema 已格式化', 'success');
    } catch (error) {
        showNotification(`格式化失败: ${error.message}`, 'error');
    }
}

// 文件操作
function importFile() {
    document.getElementById('fileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        
        if (file.name.endsWith('.proto')) {
            document.getElementById('schemaEditor').value = content;
            parseSchema();
            showNotification('Proto 文件已导入', 'success');
        } else if (file.name.endsWith('.json')) {
            document.getElementById('jsonEditor').value = content;
            updateFromJson();
            switchTab('json');
            showNotification('JSON 文件已导入', 'success');
        }
    };
    reader.readAsText(file);
}

function exportProto() {
    const schemaText = document.getElementById('schemaEditor').value;
    
    if (!schemaText.trim()) {
        showNotification('Schema 为空，无法导出', 'warning');
        return;
    }
    
    downloadFile(schemaText, 'schema.proto', 'text/plain');
    showNotification('Proto 文件已导出', 'success');
}

function exportBinary() {
    if (!currentData || Object.keys(currentData).length === 0) {
        showNotification('没有数据可导出', 'warning');
        return;
    }
    
    try {
        const binaryData = encodeProtobuf(currentData);
        const blob = new Blob([new Uint8Array(binaryData)], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.pb';
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification('二进制文件已导出', 'success');
    } catch (error) {
        showNotification(`导出失败: ${error.message}`, 'error');
    }
}

function copyBinary() {
    const binaryContent = document.getElementById('binaryContent');
    const text = binaryContent.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('二进制数据已复制到剪贴板', 'success');
    }).catch(() => {
        showNotification('复制失败', 'error');
    });
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

function clearAll() {
    if (confirm('确定要清空所有内容吗？')) {
        document.getElementById('schemaEditor').value = '';
        document.getElementById('jsonEditor').value = '';
        document.getElementById('visualEditor').innerHTML = '<div class="placeholder">请先定义 Proto Schema 并选择消息类型</div>';
        document.getElementById('binaryContent').innerHTML = '二进制数据将在此显示...';
        document.getElementById('binarySize').textContent = '0';
        
        currentSchema = null;
        currentMessage = null;
        currentData = {};
        
        updateMessageSelect([]);
        updateSchemaInfo('未定义');
        updateStatus('已清空所有内容');
        showNotification('所有内容已清空', 'success');
    }
}

// 工具函数
function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

function updateSchemaInfo(info) {
    document.getElementById('schemaInfo').textContent = `Schema: ${info}`;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 