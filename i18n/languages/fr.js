// 法语语言包 (French)
(function() {
    if (!window.LANGUAGE_DATA) {
        window.LANGUAGE_DATA = {};
    }
    
    window.LANGUAGE_DATA['fr'] = {
        // 主页面翻译
        'page_title': 'Boîte à Outils - Tools',
        'main_title': 'Boîte à Outils',
        'main_subtitle': 'Collection d\'Outils Pratiques - Améliorez Votre Productivité',
        'footer_text': 'Sélectionnez un outil ci-dessus pour commencer | Tous les outils fonctionnent directement dans votre navigateur',
        
        // 工具翻译 - 对应您页面上的实际工具
        'tuya_tool_title': 'TuyaOpen',
        'tuya_tool_desc': 'Outil de communication série basé sur l\'API Web Serial prenant en charge le débogage d\'appareils, le flash de firmware et plus encore sans installer de logiciel supplémentaire.',
        
        'mp3_tool_title': 'Outil de Conversion MP3',
        'mp3_tool_desc': 'Convertir les fichiers MP3 en tableaux C pour l\'utilisation dans le développement embarqué. Prend en charge la conversion en ligne sans installer de logiciel supplémentaire.',
        
        'json_tool_title': 'Outil de Visualisation JSON',
        'json_tool_desc': 'Éditeur de visualisation JSON puissant prenant en charge l\'affichage de la structure arborescente, l\'effondrement/expansion des nœuds, les opérations CRUD pour une visualisation claire des données JSON.',
        
        'xml_tool_title': 'Outil de Visualisation XML',
        'xml_tool_desc': 'Éditeur de visualisation de documents XML professionnel prenant en charge l\'édition d\'attributs d\'éléments, le traitement CDATA, l\'affichage d\'espaces de noms pour une expérience complète d\'opération XML.',
        
        // JSON 工具页面翻译
        'json_page_title': 'Outil de Visualisation JSON',
        'json_editor': 'Éditeur JSON',
        'json_viewer': 'Visualiseur JSON',
        'format_json': 'Formater',
        'minify_json': 'Minifier',
        'validate_json': 'Valider',
        'clear_json': 'Effacer',
        'home_btn': 'Retour à l\'Accueil',
        'collapse_editor': 'Réduire l\'Éditeur',
        'collapse_viewer': 'Réduire le Visualiseur',
        
        // 测试用翻译
        'test_title': 'Page de Test du Commutateur de Langue',
        'test_content': 'Ceci est le contenu de test en français. Le commutateur de langue fonctionne correctement.',
        'test_button': 'Bouton Français',
        'test_placeholder': 'Espace réservé français',
        
        // 调试用
        'debug_title': 'Page de Débogage du Commutateur de Langue (Français)',
        'debug_subtitle': 'Pour tester et déboguer la fonctionnalité multilingue'
    };
    
    // 兼容旧版本系统
    if (!window.i18nLanguages) {
        window.i18nLanguages = {};
    }
    window.i18nLanguages['fr'] = window.LANGUAGE_DATA['fr'];
})(); 