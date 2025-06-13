// MP3 Converter - English Language Pack
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['en'] = {
        // Page title and basic info
        'mp3_tool_title': 'MP3 to C Array Converter',
        'page_title': 'MP3 to C Array Converter',
        'home_btn': 'Back to Home',
        
        // Main title and description
        'main_title': '🎵 MP3 to C Array Converter',
        'main_subtitle': 'Convert MP3 audio files to C language arrays for embedded development',
        
        // Upload area
        'upload_area_title': 'Select MP3 File',
        'upload_area_desc': 'Click here to select a file or drag and drop files to this area',
        'drag_drop_text': 'Drag files here or click to select',
        'file_types': 'Supported file types: MP3',
        'max_file_size': 'Maximum file size: 10MB',
        
        // Conversion settings
        'settings_title': 'Conversion Settings',
        'array_name_label': 'Array Name:',
        'array_name_placeholder': 'Enter C array variable name',
        'sample_rate_label': 'Sample Rate:',
        'bit_depth_label': 'Bit Depth:',
        'format_label': 'Output Format:',
        
        // Conversion buttons and status
        'convert_btn': '🔄 Start Conversion',
        'converting_text': 'Converting...',
        'download_btn': '💾 Download C File',
        'copy_btn': '📋 Copy Code',
        'clear_btn': '🗑️ Clear',
        
        // Progress and status information
        'file_info_title': 'File Information',
        'file_name': 'File Name:',
        'file_size': 'File Size:',
        'duration': 'Duration:',
        'conversion_progress': 'Conversion Progress:',
        'status_ready': 'Ready',
        'status_processing': 'Processing...',
        'status_completed': 'Conversion Completed',
        'status_error': 'Conversion Failed',
        
        // Preview area
        'preview_title': 'Code Preview',
        'preview_placeholder': 'The converted C code will be displayed here...',
        
        // Error and notification messages
        'error_no_file': 'Please select an MP3 file first',
        'error_invalid_file': 'Please select a valid MP3 file',
        'error_file_too_large': 'File is too large, please select a file smaller than 10MB',
        'error_conversion_failed': 'Conversion failed, please check the file format',
        'success_converted': 'MP3 file converted successfully!',
        'success_copied': 'Code copied to clipboard',
        'success_downloaded': 'File downloaded successfully',
        
        // Usage instructions
        'instructions_title': 'Usage Instructions',
        'instructions': [
            '1. Select or drag and drop an MP3 file to the upload area',
            '2. Set the array name and conversion parameters',
            '3. Click the "Start Conversion" button',
            '4. Download or copy the code after conversion is complete',
            '5. Integrate the generated C code into your project'
        ],
        
        // Technical notes
        'tech_notes_title': 'Technical Notes',
        'tech_notes': [
            '• Supports standard MP3 format files',
            '• Outputs in standard C language array format',
            '• Suitable for Arduino, ESP32 and other embedded platforms',
            '• Generated array includes audio data and length information',
            '• Recommend using shorter audio clips to save storage space'
        ]
    };
    
    // Compatibility
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['en'] = window.LANGUAGE_DATA['en'];
})(); 