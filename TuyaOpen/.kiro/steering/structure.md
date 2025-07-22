# Project Structure

## Root Level Files

- `index.html` - Main application entry point (monolithic version)
- `script-clean.js` - Main application logic (3800+ lines, legacy monolithic)
- `flash-downloader.js` - Universal firmware downloader with chip manager integration
- `style.css` - Application styles

## Core Directories

### `/downloaders/` - Chip-Specific Downloaders
```
downloaders/
├── downloader-manager.js     # Central manager for all chip downloaders
├── base-downloader.js        # Abstract base class for all downloaders
├── t5ai-downloader.js        # T5AI/T3/T2 series chips
├── esp32-esptool-js-wrapper.js # ESP32 series (uses esptool-js)
├── bk7231n-downloader.js     # BK7231N chips
├── ln882h-downloader.js      # LN882H chips
└── t5_bak/                   # Backup/legacy T5 implementations
```

### `/modules/` - Modular Architecture (Alternative to monolithic)
```
modules/
├── config/Constants.js       # Global configuration
├── core/
│   ├── EventBus.js          # Inter-module communication
│   └── SerialTerminal.js    # Main controller
├── serial/
│   ├── SerialManager.js     # Serial connection management
│   └── DataProcessor.js     # Data processing and display
├── ui/
│   ├── UIManager.js         # DOM management
│   ├── ModalManager.js      # Modal dialogs
│   ├── TabManager.js        # Tab switching
│   └── FullscreenManager.js # Fullscreen functionality
├── firmware/
│   ├── FlashManager.js      # Firmware flashing coordination
│   └── ProgressTracker.js   # Download progress tracking
├── i18n/
│   ├── LanguageManager.js   # Language switching
│   └── TextUpdater.js       # DOM text updates
└── utils/
    ├── Logger.js            # Unified logging
    └── FileUtils.js         # File operations
```

### `/i18n/` - Internationalization System
```
i18n/
├── loader.js                # Dynamic language loader
├── validation.js            # Translation completeness validation
└── languages/
    ├── zh.js               # Chinese (base language)
    ├── en.js               # English
    ├── zh-tw.js            # Traditional Chinese
    ├── ja.js               # Japanese
    ├── ko.js               # Korean
    ├── es.js               # Spanish
    └── [other languages]
```

### `/third_party/` - External Dependencies
```
third_party/
├── esptool-js/             # Official ESP32 flashing library
├── tyutool/                # Python multi-chip tool (reference)
└── web_serial_esp32/       # Alternative ESP32 implementation
```

## Architecture Patterns

### Downloader Pattern
- Each chip type has its own downloader class extending `BaseDownloader`
- `DownloaderManager` handles dynamic loading and instantiation
- Unified interface for all chip types through base class

### Module Pattern (Alternative Architecture)
- Event-driven communication via `EventBus`
- Dependency injection through constructor parameters
- Single responsibility principle - each module handles one concern
- Modular loading allows for selective feature inclusion

### i18n Pattern
- Dynamic language loading to reduce initial bundle size
- Fallback to base language (Chinese) for missing translations
- HTML attribute-based automatic translation (`data-i18n`)
- Parameter substitution support (`{0}`, `{1}`, etc.)

## File Naming Conventions

- **Downloaders**: `{chip-name}-downloader.js`
- **Modules**: `{Category}/{ModuleName}.js` (PascalCase)
- **Languages**: `{language-code}.js` (lowercase)
- **Utilities**: `{function-name}.js` (kebab-case)
- **Tests**: `test-{feature-name}.html`

## Development Approaches

### Monolithic (Current Default)
- Single `script-clean.js` file with all functionality
- Easier deployment and debugging
- Used by `index.html`

### Modular (Alternative)
- Separated into logical modules under `/modules/`
- Better maintainability and testing
- Event-driven architecture
- Can be used by creating alternative HTML entry point

Both approaches provide identical functionality - choose based on development preferences and deployment requirements.