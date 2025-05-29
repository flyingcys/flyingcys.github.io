// Français (fr-FR)
const fr = {
    // Titre de la page et description
    title: "Outil Serial TuyaOpen Beta",
    subtitle: "Outil de développeur tout-en-un basé sur l'API Chrome Web Serial",
    
    // Exigences du navigateur et avis de version beta
    browser_requirement: "Cet outil nécessite des navigateurs basés sur Chrome. Les autres navigateurs ne peuvent pas fonctionner correctement. Utilisez Chrome, Edge ou d'autres navigateurs basés sur Chromium.",
    beta_notice: "La fonctionnalité actuelle est en version beta. Si vous rencontrez des problèmes, veuillez d'abord sauvegarder les logs pertinents, puis signalez les problèmes dans le dépôt à",
    repository_link: "Dépôt TuyaOpen-Tools",
    
    // Liens liés au projet
    project_info: "Ce projet fait partie de TuyaOpen. Les projets connexes incluent :",
    tuya_open_project: "TuyaOpen",
    arduino_project: "Arduino-TuyaOpen",
    lua_project: "Luanode-TuyaOpen",
    tools_project: "TuyaOpen-Tools",
    
    // Étiquettes des onglets
    tab_serial: "Debug Serial",
    tab_flash: "Téléchargement Firmware",
    
    // Panneau de contrôle
    control_title: "Contrôle de connexion Serial",
    flash_connection_control: "Connexion Serial de téléchargement firmware",
    connect: "Connecter Serial",
    connect_flash: "Connecter Serial de téléchargement firmware",
    disconnect: "Déconnecter",
    disconnect_flash: "Déconnecter téléchargement firmware",
    status_disconnected: "Déconnecté",
    status_connected: "Connecté",
    baud_rate: "Débit en bauds :",
    data_bits: "Bits de données :",
    stop_bits: "Bits d'arrêt :",
    parity: "Parité :",
    parity_none: "Aucune",
    parity_even: "Paire",
    parity_odd: "Impaire",
    
    // Débogage série
    receive_data: "Données Reçues",
    save_log: "Sauvegarder le Journal",
    auto_scroll: "Défilement Automatique",
    show_timestamp: "Afficher l'horodatage",
    waiting_data: "En attente de données serial...",
    received: "RX",
    sent: "TX",
    bytes: "octets",
    
    send_data: "Envoyer des données",
    hex_mode: "Mode HEX",
    add_newline: "Ajouter une nouvelle ligne",
    input_placeholder: "Entrez les données à envoyer...",
    input_placeholder_hex: "Entrez les données hex (ex. : FF 01 02 03)...",
    send: "Envoyer",
    
    quick_send: "Envoi rapide :",
    manage: "Gérer les commandes",
    no_quick_commands: "Aucune commande rapide pour le moment. Cliquez sur 'Gérer les commandes' pour ajouter des commandes AT courantes, des instructions de débogage, etc. et améliorer l'efficacité du débogage",
    
    // Flash firmware
    flash_config: "Configuration de téléchargement firmware",
    target_device: "Appareil cible :",
    select_file: "Sélectionner le fichier firmware",
    no_file_selected: "Aucun fichier sélectionné",
    file_size: "Taille du fichier",
    start_download: "Démarrer le téléchargement",
    stop_download: "Arrêter le téléchargement",
    preparing: "Préparation...",
    downloaded: "Téléchargé",
    download_log: "Journal de téléchargement",
    clear_log: "Effacer le journal",
    waiting_download: "En attente d'opération de téléchargement...",
    
    // Gestion des commandes rapides
    quick_send_management: "Gestion d'envoi rapide",
    add_new_command: "Ajouter une nouvelle commande",
    display_name: "Nom d'affichage :",
    name_example: "ex. : Reset",
    send_content: "Contenu à envoyer :",
    content_example: "ex. : AT+RST",
    add: "Ajouter",
    existing_commands: "Commandes existantes",
    no_commands: "Aucune commande rapide",
    reset_default: "Réinitialiser par défaut",
    close: "Fermer",
    
    // Messages d'erreur
    error: "Erreur",
    
    // Messages système
    serial_connected: "Serial connecté avec succès !",
    serial_disconnected: "Serial déconnecté.",
    flash_serial_connected: "Connexion Serial de téléchargement firmware réussie !",
    flash_serial_disconnected: "Serial de téléchargement firmware déconnecté.",
    switch_to_tab: "Basculé vers {0}, connexion serial fermée",
    tab_serial_name: "Debug Serial",
    tab_flash_name: "Téléchargement Firmware",
    
    // Dialogues de confirmation
    switch_tab_confirm: "⚠️ Avertissement Mutex Serial\n\nLa fonction {0} actuelle utilise une connexion serial.\nLes fonctions {0} et {1} ne peuvent pas utiliser serial simultanément.\n\nBasculer vers {1} va :\n• Déconnecter automatiquement la connexion serial actuelle\n• Arrêter les opérations en cours\n\nÊtes-vous sûr de vouloir basculer ?",
    delete_command_confirm: "Êtes-vous sûr de vouloir supprimer cette commande rapide ?",
    reset_commands_confirm: "Êtes-vous sûr de vouloir réinitialiser aux commandes rapides par défaut ? Cela supprimera toutes les commandes personnalisées.",
    
    // Messages de validation
    fill_complete_info: "Veuillez remplir le nom complet de la commande et le contenu",
    command_name_exists: "Le nom de la commande existe déjà, utilisez un autre nom",
    no_data_to_save: "Aucune donnée à sauvegarder",
    no_log_to_save: "Aucun journal à sauvegarder",
    please_select_file: "Veuillez d'abord sélectionner un fichier firmware",
    please_connect_serial: "Veuillez d'abord connecter serial",
    please_connect_flash_serial: "Veuillez d'abord connecter serial de téléchargement firmware",
    flash_serial_not_connected: "Serial de téléchargement firmware non connecté",
    
    // Lié à l'API Web Serial
    browser_not_supported: "Votre navigateur ne prend pas en charge l'API Web Serial. Utilisez Chrome 89+ ou Edge 89+.",
    connect_failed: "Échec de la connexion : {0}",
    disconnect_failed: "Échec de la déconnexion : {0}",
    read_error: "Erreur de lecture des données : {0}",
    send_error: "Erreur d'envoi des données : {0}",
    hex_length_error: "La longueur de la chaîne HEX doit être paire",
    serial_not_connected: "Serial non connecté",
    download_failed: "Échec du téléchargement : {0}",
    
    // Opérations sur les fichiers
    file_selected: "Fichier sélectionné : {0} ({1} octets)",
    start_download_to: "Démarrage du téléchargement firmware vers {0}...",
    download_complete: "Téléchargement firmware terminé !",
    user_cancelled: "L'utilisateur a annulé le téléchargement",
    
    // Messages de progression du téléchargement firmware
    flash_handshaking: "Établissement de la poignée de main...",
    flash_handshake_success: "Poignée de main réussie",
    flash_handshake_failed: "Échec de la poignée de main, vérifiez la connexion de l'appareil",
    flash_download_cancelled: "Téléchargement annulé",
    waiting_reset: "En attente du redémarrage de l'appareil...",
    flash_setting_baudrate: "Définition du débit en bauds à {0}...",
    flash_baudrate_set: "Débit en bauds défini avec succès",
    flash_erasing: "Effacement de la Flash...",
    flash_erase_progress: "Progression de l'effacement : {0}/{1}",
    flash_erase_sector_failed: "Échec de l'effacement du secteur {0} : {1}",
    flash_erase_complete: "Effacement de la Flash terminé",
    flash_writing_data: "Écriture des données...",
    flash_write_progress: "Progression de l'écriture : {0}/{1}",
    flash_write_block_failed: "Échec de l'écriture du bloc {0} : {1}",
    flash_write_complete: "Écriture des données terminée",
    flash_verifying_crc: "Vérification des données...",
    flash_crc_passed: "Vérification CRC réussie",
    flash_crc_failed_mismatch: "Échec de la vérification CRC : local={0}, appareil={1}",
    flash_crc_failed: "Échec de la vérification CRC : {0}",
    flash_rebooting: "Redémarrage de l'appareil...",
    flash_download_complete: "Téléchargement terminé",
    flash_download_success: "Téléchargement terminé avec succès !",
    flash_download_failed: "Échec du téléchargement : {0}",
    flash_downloading: "Téléchargement en cours, veuillez attendre la fin",
    flash_user_cancelled: "L'utilisateur a annulé l'opération",
    
    // Noms des fichiers de journal
    serial_log_filename: "journal_serial_{0}.txt",
    flash_log_filename: "journal_flash_{0}.txt",
    
    // Info-bulles
    current_tab_connected: "Fonction {0} actuelle connectée au serial",
    disconnect_tab_connection: "Déconnecter la connexion serial de la fonction {0}",
    connect_for_tab: "Connecter serial pour la fonction {0}",
    
    // Informations de copyright
    powered_by: "Alimenté par",
    all_rights_reserved: "Tous droits réservés",
    
    // Fonctions de debug
    debug_mode: "Mode Debug",
    debug_basic: "Basique",
    debug_detailed: "Détaillé",
    debug_verbose: "Complet",
    export_debug: "Exporter le journal de debug",
    debug_status: "Statut de debug",
    debug_level: "Niveau de debug",
    packets_sent: "Paquets envoyés",
    packets_received: "Paquets reçus",
    
    // Boutons de fonction et opérations
    fullscreen: "Plein écran",
    exit_fullscreen: "Quitter le plein écran"
};

// Exporter vers global
if (typeof window !== 'undefined') {
    window.i18nLanguages = window.i18nLanguages || {};
    window.i18nLanguages.fr = fr;
} 