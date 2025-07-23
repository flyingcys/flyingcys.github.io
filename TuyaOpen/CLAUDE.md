# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TuyaOpen is a web-based serial communication and firmware flashing tool built for Chrome browsers using the Web Serial API. The project is transitioning from a monolithic architecture (script-clean.js) to a modular event-driven architecture.

## Development Commands

This is a vanilla JavaScript project without a package manager:

```bash
# Start development server (no build required)
python -m http.server 8000
# Or use any static file server

# Run validation scripts
node validate-simple.js
node validate-t5-migration.js
```

## Architecture

### Current State
- **Monolithic version**: `index.html` + `script-clean.js` (2107 lines)
- **Modular version**: `index-modules.html` + `modules/` directory
- **Both versions must work identically during migration**

### Module Structure
All modules follow this pattern:
```javascript
class ModuleName {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.bindEvents();
    }
    
    bindEvents() {
        this.eventBus.on('event:name', this.handler.bind(this));
    }
    
    destroy() {
        // Clean up references
        this.eventBus = null;
    }
}
```

### Key Modules
- **EventBus** (`modules/core/EventBus.js`): Central communication hub
- **SerialTerminal** (`modules/core/SerialTerminal.js`): Main application controller
- **SerialPortManager** (`modules/serial/`): Handles Web Serial API
- **DownloaderManager** (`modules/firmware/`): Manages chip-specific downloaders
- **Logger** (`modules/utils/Logger.js`): Debugging system

### Downloader Architecture
Each chip type has its own downloader in `downloaders/`:
- Base class: `downloaders/base-downloader.js`
- Implementations: `esp32/`, `bk7231n/`, `ln882h/`, `t5ai/`

### Critical Rules
1. **Never break monolithic version** while developing modular version
2. **All module communication via EventBus** - no direct imports between modules
3. **Test in Chrome** - Web Serial API is Chrome-only
4. **Memory management** - Always implement destroy() methods
5. **Error isolation** - Errors in one module shouldn't crash others

## Testing Approach

```bash
# Test monolithic version
# Open index.html in Chrome and verify all features work

# Test modular version
# Open index-modules.html in Chrome and compare functionality

# Test specific downloaders
# Use flash-test.html for firmware flashing tests

# Validate migrations
node validate-simple.js
node validate-t5-migration.js
```

## Common Development Tasks

### Adding a New Module
1. Create module in appropriate directory under `modules/`
2. Follow the constructor pattern with EventBus
3. Register events in `bindEvents()`
4. Add to SerialTerminal initialization
5. Test both versions remain functionally identical

### Adding a New Downloader
1. Create directory under `downloaders/`
2. Extend `BaseDownloader` class
3. Implement required methods: `connect()`, `flash()`, `disconnect()`
4. Register in `DownloaderManager`

### Debugging
- Use `Logger.setLevel('debug')` for verbose output
- Check Chrome DevTools Console for errors
- Web Serial API errors often relate to permissions or port access

## Important Files

- `modules/README.md`: Detailed migration strategy and guidelines
- `i18n/loader.js`: Dynamic language loading system
- `downloaders/base-downloader.js`: Interface for new chip support
- `script-clean.js`: Reference implementation (do not modify during migration)