# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memories

- 以后文档和回答都要用中文交流

## Overview

TuyaOpen Serial Tool is a web-based serial communication and firmware flashing tool for TuyaOpen ecosystem devices. It's a static web application (no build process) that runs in Chrome/Chromium browsers using the Web Serial API.

## Commands

### Run the application
```bash
# Direct file access (file:// protocol)
open index.html  # macOS
xdg-open index.html  # Linux

# Or serve locally
python3 -m http.server 8000
# Navigate to http://localhost:8000
```

### Validate i18n translations
```bash
node i18n/validation.js
```

## Architecture

The codebase has **two parallel architectures** that must be maintained:

1. **Legacy Monolithic** (`script-clean.js`): Single 2107-line file containing the entire application
2. **Modern Modular** (`modules/`): Event-driven architecture with separated concerns

### Module Structure

```
modules/
├── core/           # Core infrastructure
│   ├── EventBus.js      # Central event system
│   └── SerialTerminal.js # Main controller
├── serial/         # Serial communication
│   ├── SerialManager.js  # Port management
│   └── DataProcessor.js # Data formatting
├── ui/            # User interface
│   ├── UIManager.js      # DOM operations
│   ├── TabManager.js     # Tab switching
│   └── ModalManager.js   # Modal dialogs
├── firmware/      # Firmware operations
│   ├── FlashManager.js   # Flashing logic
│   └── ProgressTracker.js # Progress UI
└── i18n/          # Internationalization
    ├── LanguageManager.js # Language switching
    └── TextUpdater.js     # Dynamic text updates
```

### Event-Driven Communication

All modules communicate via EventBus:
```javascript
// Emit event
this.eventBus.emit('serial:data', { data: buffer });

// Listen for event
this.eventBus.on('serial:data', (event) => { /* handle */ });
```

### Supported Devices

Each device has a specific downloader in `downloaders/`:
- **Tuya chips**: T5AI, T3, T2 (`t5ai-downloader.js`)
- **ESP32 variants**: All ESP32 models (`esp32-esptool-js-wrapper.js`)
- **Others**: BK7231N (`bk7231n-downloader.js`), LN882H (`ln882h-downloader.js`)

## Key Constraints

1. **Chrome-only**: Web Serial API requires Chrome/Chromium browsers
2. **No build tools**: Direct file editing, no npm/webpack/transpilation
3. **Dual architecture**: Both `script-clean.js` and modular version must work
4. **All text must use i18n**: Use `data-i18n` attributes, never hardcode strings
5. **Chinese as base language**: `zh-CN.json` is the reference for all translations

## Critical Files

- `index.html`: Main entry, loads either monolithic or modular version
- `script-clean.js`: Complete application in single file (legacy)
- `modules/core/EventBus.js`: Central nervous system of modular architecture
- `i18n/languages/*.js`: Translation files (6 complete, 4 partial languages)
- `downloaders/downloader-manager.js`: Device detection and firmware flashing

## Common Development Patterns

### Adding new UI text
```html
<!-- HTML -->
<span data-i18n="section.key">Fallback Text</span>

<!-- JavaScript -->
this.eventBus.emit('language-changed'); // Trigger update
```

### Adding new module
1. Create module class with EventBus dependency injection
2. Register in `modules/core/SerialTerminal.js`
3. Add script tag to `index.html` (modular section)

### Error handling pattern
```javascript
try {
    // Operation
} catch (error) {
    this.eventBus.emit('error', { 
        message: error.message,
        source: 'ModuleName'
    });
}
```

## Important Notes

- The project is marked as "内测版" (internal testing version)
- Recent refactoring from monolithic to modular is complete but both versions coexist
- No automated tests, linting, or build pipeline exists
- Development is active with focus on internationalization and modularity