# Technology Stack

## Core Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Web APIs**: Chrome Web Serial API for direct serial communication
- **Architecture**: Event-driven modular architecture with dependency injection
- **Build System**: No build system required - runs directly in browser

## Browser Requirements

- **Required**: Chrome/Chromium-based browsers (Chrome, Edge, Opera, Brave)
- **Minimum Version**: Chrome 89+ (Web Serial API support)
- **Not Supported**: Firefox, Safari, Internet Explorer

## Key Libraries & Dependencies

### Third-party Integrations
- **esptool-js**: Native ESP32 flashing support (`third_party/esptool-js/`)
- **tyutool**: Python-based multi-chip flashing tool reference (`third_party/tyutool/`)

### Internal Modules
- **Downloader System**: Chip-specific downloaders with unified manager
- **i18n System**: Dynamic language loading with 10+ language support
- **Event Bus**: Centralized communication between modules

## Development Commands

Since this is a browser-based application, no build commands are required:

```bash
# Development - serve files locally
python -m http.server 8000
# or
npx serve .

# Testing - open in Chrome
open http://localhost:8000

# Validation - check i18n completeness
# Open browser console and run validation scripts
```

## File Structure Patterns

- **Downloaders**: `downloaders/{chip}-downloader.js` - Chip-specific implementation
- **Modules**: `modules/{category}/{Module}.js` - Modular architecture components  
- **i18n**: `i18n/languages/{lang}.js` - Language files
- **Third-party**: `third_party/{library}/` - External dependencies

## Code Standards

- Use ES6+ features (classes, async/await, modules)
- Event-driven communication via EventBus
- Dependency injection pattern for modules
- Error handling with user-friendly messages
- Debug logging with conditional output