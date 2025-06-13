// XML Tool - English Language Pack
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['en'] = {
        // Page title and basic info
        'xml_tool_title': 'XML Visualization Tool',
        'page_title': 'XML Visualization Tool',
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
        'editor_panel_title': '📝 XML Editor',
        'viewer_panel_title': '🔍 XML Viewer',
        
        // Panel control buttons
        'collapse_editor': 'Collapse Editor',
        'collapse_viewer': 'Collapse Viewer',
        'expand_editor': 'Expand Editor', 
        'expand_viewer': 'Expand Viewer',
        
        // Input placeholders
        'editor_placeholder': 'Enter or paste your XML data here...',
        'search_placeholder': 'Search...',
        'edit_value_placeholder': 'Enter XML element or attribute value',
        
        // Status and statistics
        'status_valid': '✅ XML format is valid',
        'status_invalid': '❌ XML format error', 
        'stats_template': 'Lines: {lines} | Characters: {chars}',
        'xml_empty': '<!-- XML view will be rendered here -->',
        
        // Error and notification messages
        'format_error': 'Format failed: Invalid XML format',
        'compress_error': 'Compression failed: Invalid XML format',
        'export_error': 'Export failed: Invalid XML format',
        'import_success': 'XML file imported successfully',
        'import_error': 'File import failed',
        'clear_confirm': 'Are you sure you want to clear the editor content?',
        
        // XML node type labels
        'xml_element': 'Element',
        'xml_attribute': 'Attribute',
        'xml_text': 'Text',
        'xml_comment': 'Comment',
        'xml_cdata': 'CDATA',
        
        // Action buttons
        'add_element': 'Add Element',
        'add_attribute': 'Add Attribute',
        'delete_node': 'Delete Node',
        'edit_value': 'Edit Value',
        'copy_xpath': 'Copy XPath',
        
        // Dialog titles
        'edit_dialog_title': 'Edit Value',
        'confirm_dialog_title': 'Confirm Action',
        'add_dialog_title': 'Add New Node'
    };
    
    // Compatibility
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['en'] = window.LANGUAGE_DATA['en'];
})(); 