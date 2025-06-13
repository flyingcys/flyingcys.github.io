// JSON Tool - English Language Pack
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['en'] = {
        // Page title and basic info
        'json_tool_title': 'JSON Visualization Tool',
        'page_title': 'JSON Visualization Tool',
        'home_btn': 'Back to Home',
        
        // Toolbar buttons
        'format_btn': '✨ Format',
        'compress_btn': '🗜️ Minify', 
        'validate_btn': '✅ Validate',
        'clear_btn': '🗑️ Clear',
        'import_btn': '📁 Import',
        'export_btn': '💾 Export',
        'expand_all_btn': '📖 Expand All',
        'collapse_all_btn': '📕 Collapse All',
        
        // Panel titles
        'editor_panel_title': '📝 JSON Editor',
        'viewer_panel_title': '🔍 JSON Viewer',
        
        // Panel control buttons
        'collapse_editor': 'Collapse Editor',
        'collapse_viewer': 'Collapse Viewer',
        'expand_editor': 'Expand Editor', 
        'expand_viewer': 'Expand Viewer',
        
        // Input placeholders
        'editor_placeholder': 'Enter or paste your JSON data here...',
        'search_placeholder': 'Search...',
        'edit_value_placeholder': 'Enter JSON object or array',
        
        // Status and statistics
        'status_valid': '✅ JSON format is valid',
        'status_invalid': '❌ JSON format error', 
        'stats_template': 'Lines: {lines} | Characters: {chars}',
        'json_empty': '<!-- JSON view will be rendered here -->',
        
        // Error and notification messages
        'format_error': 'Format failed: Invalid JSON format',
        'compress_error': 'Compression failed: Invalid JSON format',
        'export_error': 'Export failed: Invalid JSON format',
        'import_success': 'JSON file imported successfully',
        'import_error': 'File import failed',
        'clear_confirm': 'Are you sure you want to clear the editor content?',
        
        // JSON node type labels
        'json_null': 'null',
        'json_empty_array': '[]',
        'json_empty_object': '{}',
        'json_array_label': '[{count}]',
        'json_object_label': '{{count}}',
        
        // Action buttons
        'add_item': 'Add Item',
        'delete_item': 'Delete Item',
        'edit_value': 'Edit Value',
        'copy_path': 'Copy Path',
        
        // Dialog titles
        'edit_dialog_title': 'Edit Value',
        'confirm_dialog_title': 'Confirm Action',
        'add_dialog_title': 'Add New Item'
    };
    
    // Compatibility
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['en'] = window.LANGUAGE_DATA['en'];
})(); 