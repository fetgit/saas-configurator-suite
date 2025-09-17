import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Types pour le contexte de langue
export type Language = 'fr' | 'en' | 'es' | 'it';

export type Translations = {
  [key: string]: {
    [K in Language]: string;
  };
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
  setTranslations: (translations: Translations) => void;
}

// Traductions par défaut pour l'application SaaS
const defaultTranslations: Translations = {
  // Navigation
  'nav.home': { fr: 'Accueil', en: 'Home', es: 'Inicio', it: 'Home' },
  'nav.features': { fr: 'Fonctionnalités', en: 'Features', es: 'Funciones', it: 'Funzionalità' },
  'nav.pricing': { fr: 'Tarifs', en: 'Pricing', es: 'Precios', it: 'Prezzi' },
  'nav.contact': { fr: 'Contact', en: 'Contact', es: 'Contacto', it: 'Contatto' },
  'nav.login': { fr: 'Connexion', en: 'Login', es: 'Iniciar sesión', it: 'Accedi' },
  'nav.register': { fr: 'S\'inscrire', en: 'Sign up', es: 'Registrarse', it: 'Registrati' },
  'nav.dashboard': { fr: 'Tableau de bord', en: 'Dashboard', es: 'Panel', it: 'Pannello' },
  'nav.admin': { fr: 'Administration', en: 'Administration', es: 'Administración', it: 'Amministrazione' },
  'nav.settings': { fr: 'Paramètres', en: 'Settings', es: 'Configuración', it: 'Impostazioni' },

  // Hero Section
  'hero.title': { 
    fr: 'Transformez votre entreprise avec notre SaaS', 
    en: 'Transform your business with our SaaS', 
    es: 'Transforma tu negocio con nuestro SaaS', 
    it: 'Trasforma la tua azienda con il nostro SaaS' 
  },
  'hero.subtitle': { 
    fr: 'Une solution complète et personnalisable pour faire évoluer votre activité', 
    en: 'A complete and customizable solution to grow your business', 
    es: 'Una solución completa y personalizable para hacer crecer tu negocio', 
    it: 'Una soluzione completa e personalizzabile per far crescere la tua attività' 
  },
  'hero.cta.primary': { fr: 'Commencer maintenant', en: 'Get Started', es: 'Empezar ahora', it: 'Inizia ora' },
  'hero.cta.secondary': { fr: 'En savoir plus', en: 'Learn More', es: 'Saber más', it: 'Scopri di più' },

  // Features
  'features.title': { fr: 'Fonctionnalités puissantes', en: 'Powerful Features', es: 'Funciones potentes', it: 'Funzionalità potenti' },
  'features.customizable': { fr: 'Entièrement personnalisable', en: 'Fully Customizable', es: 'Totalmente personalizable', it: 'Completamente personalizzabile' },
  'features.secure': { fr: 'Sécurisé et fiable', en: 'Secure & Reliable', es: 'Seguro y confiable', it: 'Sicuro e affidabile' },
  'features.multilingual': { fr: 'Multi-langue', en: 'Multi-language', es: 'Multi-idioma', it: 'Multi-lingua' },

  // Auth
  'auth.email': { fr: 'Email', en: 'Email', es: 'Email', it: 'Email' },
  'auth.password': { fr: 'Mot de passe', en: 'Password', es: 'Contraseña', it: 'Password' },
  'auth.login': { fr: 'Se connecter', en: 'Login', es: 'Iniciar sesión', it: 'Accedi' },
  'auth.register': { fr: 'S\'inscrire', en: 'Register', es: 'Registrarse', it: 'Registrati' },
  'auth.logout': { fr: 'Déconnexion', en: 'Logout', es: 'Cerrar sesión', it: 'Esci' },

  // Admin
  'admin.users': { fr: 'Utilisateurs', en: 'Users', es: 'Usuarios', it: 'Utenti' },
  'admin.settings': { fr: 'Paramètres', en: 'Settings', es: 'Configuración', it: 'Impostazioni' },
  'admin.database': { fr: 'Base de données', en: 'Database', es: 'Base de datos', it: 'Database' },
  'admin.appearance': { fr: 'Apparence', en: 'Appearance', es: 'Apariencia', it: 'Aspetto' },

  // Admin Appearance
  'admin.appearance.title': { fr: 'Personnalisation de l\'interface', en: 'Interface Customization', es: 'Personalización de la interfaz', it: 'Personalizzazione dell\'interfaccia' },
  'admin.appearance.description': { fr: 'Personnalisez l\'apparence de votre application SaaS', en: 'Customize the appearance of your SaaS application', es: 'Personaliza la apariencia de tu aplicación SaaS', it: 'Personalizza l\'aspetto della tua applicazione SaaS' },
  'admin.appearance.subtitle': { fr: 'Personnalisez l\'apparence de votre application SaaS', en: 'Customize the appearance of your SaaS application', es: 'Personaliza la apariencia de tu aplicación SaaS', it: 'Personalizza l\'aspetto della tua applicazione SaaS' },
  'admin.appearance.preview': { fr: 'Aperçu', en: 'Preview', es: 'Vista previa', it: 'Anteprima' },
  'admin.appearance.edit': { fr: 'Édition', en: 'Edit', es: 'Edición', it: 'Modifica' },
  'admin.appearance.export': { fr: 'Exporter', en: 'Export', es: 'Exportar', it: 'Esporta' },
  'admin.appearance.reset': { fr: 'Réinitialiser', en: 'Reset', es: 'Restablecer', it: 'Reimposta' },
  'admin.appearance.saving': { fr: 'Sauvegarde...', en: 'Saving...', es: 'Guardando...', it: 'Salvataggio...' },

  // Tabs
  'admin.appearance.tabs.colors': { fr: 'Couleurs', en: 'Colors', es: 'Colores', it: 'Colori' },
  'admin.appearance.tabs.branding': { fr: 'Marque', en: 'Branding', es: 'Marca', it: 'Marchio' },
  'admin.appearance.tabs.layout': { fr: 'Mise en page', en: 'Layout', es: 'Diseño', it: 'Layout' },
  'admin.appearance.tabs.content': { fr: 'Contenu', en: 'Content', es: 'Contenido', it: 'Contenuto' },
  'admin.appearance.tabs.media': { fr: 'Médias', en: 'Media', es: 'Medios', it: 'Media' },
  'admin.appearance.tabs.carousel': { fr: 'Carrousels', en: 'Carousels', es: 'Carruseles', it: 'Caroselli' },

  // Colors section
  'admin.appearance.colors.title': { fr: 'Palette de couleurs', en: 'Color Palette', es: 'Paleta de colores', it: 'Tavolozza dei colori' },
  'admin.appearance.colors.subtitle': { fr: 'Personnalisez les couleurs principales de votre application', en: 'Customize the main colors of your application', es: 'Personaliza los colores principales de tu aplicación', it: 'Personalizza i colori principali della tua applicazione' },
  'admin.appearance.colors.copy': { fr: 'Copier', en: 'Copy', es: 'Copiar', it: 'Copia' },
  'admin.appearance.colors.primary': { fr: 'Primaire', en: 'Primary', es: 'Primario', it: 'Primario' },
  'admin.appearance.colors.primaryLight': { fr: 'Primaire clair', en: 'Primary Light', es: 'Primario claro', it: 'Primario chiaro' },
  'admin.appearance.colors.primaryDark': { fr: 'Primaire foncé', en: 'Primary Dark', es: 'Primario oscuro', it: 'Primario scuro' },
  'admin.appearance.colors.secondary': { fr: 'Secondaire', en: 'Secondary', es: 'Secundario', it: 'Secondario' },
  'admin.appearance.colors.success': { fr: 'Succès', en: 'Success', es: 'Éxito', it: 'Successo' },
  'admin.appearance.colors.warning': { fr: 'Avertissement', en: 'Warning', es: 'Advertencia', it: 'Avviso' },
  'admin.appearance.colors.destructive': { fr: 'Destructeur', en: 'Destructive', es: 'Destructivo', it: 'Distruttivo' },
  'admin.appearance.colors.reset': { fr: 'Réinitialiser', en: 'Reset', es: 'Restablecer', it: 'Reimposta' },
  'admin.appearance.colors.description': { fr: 'Personnalisez les couleurs principales de votre application', en: 'Customize the main colors of your application', es: 'Personaliza los colores principales de tu aplicación', it: 'Personalizza i colori principali della tua applicazione' },

  // Branding section
  'admin.appearance.branding.title': { fr: 'Configuration de la marque', en: 'Brand Configuration', es: 'Configuración de marca', it: 'Configurazione del marchio' },
  'admin.appearance.branding.subtitle': { fr: 'Définissez l\'identité visuelle de votre application', en: 'Define the visual identity of your application', es: 'Define la identidad visual de tu aplicación', it: 'Definisci l\'identità visiva della tua applicazione' },
  'admin.appearance.branding.companyName': { fr: 'Nom de l\'entreprise', en: 'Company Name', es: 'Nombre de la empresa', it: 'Nome dell\'azienda' },
  'admin.appearance.branding.logo': { fr: 'Logo de l\'entreprise', en: 'Company Logo', es: 'Logo de la empresa', it: 'Logo dell\'azienda' },
  'admin.appearance.branding.favicon': { fr: 'Favicon', en: 'Favicon', es: 'Favicon', it: 'Favicon' },
  'admin.appearance.branding.logoPreview': { fr: 'Aperçu du logo', en: 'Logo preview', es: 'Vista previa del logo', it: 'Anteprima del logo' },
  'admin.appearance.branding.faviconPreview': { fr: 'Aperçu du favicon', en: 'Favicon preview', es: 'Vista previa del favicon', it: 'Anteprima del favicon' },
  'admin.appearance.branding.description': { fr: 'Définissez l\'identité visuelle de votre application', en: 'Define the visual identity of your application', es: 'Define la identidad visual de tu aplicación', it: 'Definisci l\'identità visiva della tua applicazione' },

  // Layout section
  'admin.appearance.layout.title': { fr: 'Configuration de la mise en page', en: 'Layout Configuration', es: 'Configuración del diseño', it: 'Configurazione del layout' },
  'admin.appearance.layout.subtitle': { fr: 'Personnalisez la disposition et l\'apparence générale', en: 'Customize the layout and general appearance', es: 'Personaliza el diseño y la apariencia general', it: 'Personalizza il layout e l\'aspetto generale' },
  'admin.appearance.layout.headerStyle': { fr: 'Style du header', en: 'Header Style', es: 'Estilo del encabezado', it: 'Stile dell\'intestazione' },
  'admin.appearance.layout.footerStyle': { fr: 'Style du footer', en: 'Footer Style', es: 'Estilo del pie de página', it: 'Stile del piè di pagina' },
  'admin.appearance.layout.theme': { fr: 'Thème', en: 'Theme', es: 'Tema', it: 'Tema' },
  'admin.appearance.layout.sidebarPosition': { fr: 'Position de la sidebar (admin)', en: 'Sidebar Position (admin)', es: 'Posición de la barra lateral (admin)', it: 'Posizione della barra laterale (admin)' },
  'admin.appearance.layout.borderRadius': { fr: 'Arrondi des bordures', en: 'Border Radius', es: 'Radio de borde', it: 'Raggio del bordo' },
  'admin.appearance.layout.description': { fr: 'Personnalisez la disposition et l\'apparence générale', en: 'Customize the layout and general appearance', es: 'Personaliza el diseño y la apariencia general', it: 'Personalizza il layout e l\'aspetto generale' },

  // Layout options
  'admin.appearance.layout.default': { fr: 'Par défaut', en: 'Default', es: 'Por defecto', it: 'Predefinito' },
  'admin.appearance.layout.transparent': { fr: 'Transparent', en: 'Transparent', es: 'Transparente', it: 'Trasparente' },
  'admin.appearance.layout.colored': { fr: 'Coloré', en: 'Colored', es: 'Coloreado', it: 'Colorato' },
  'admin.appearance.layout.minimal': { fr: 'Minimal', en: 'Minimal', es: 'Mínimo', it: 'Minimale' },
  'admin.appearance.layout.complete': { fr: 'Complet', en: 'Complete', es: 'Completo', it: 'Completo' },
  'admin.appearance.layout.hidden': { fr: 'Masqué', en: 'Hidden', es: 'Oculto', it: 'Nascosto' },
  'admin.appearance.layout.light': { fr: 'Clair', en: 'Light', es: 'Claro', it: 'Chiaro' },
  'admin.appearance.layout.dark': { fr: 'Sombre', en: 'Dark', es: 'Oscuro', it: 'Scuro' },
  'admin.appearance.layout.system': { fr: 'Système', en: 'System', es: 'Sistema', it: 'Sistema' },
  'admin.appearance.layout.left': { fr: 'Gauche', en: 'Left', es: 'Izquierda', it: 'Sinistra' },
  'admin.appearance.layout.right': { fr: 'Droite', en: 'Right', es: 'Derecha', it: 'Destra' },

  // Media section
  'admin.appearance.media.title': { fr: 'Médiathèque', en: 'Media Library', es: 'Biblioteca multimedia', it: 'Libreria multimediale' },
  'admin.appearance.media.subtitle': { fr: 'Gérez vos images et vidéos pour personnaliser votre application', en: 'Manage your images and videos to customize your application', es: 'Gestiona tus imágenes y videos para personalizar tu aplicación', it: 'Gestisci le tue immagini e video per personalizzare la tua applicazione' },
  'admin.appearance.media.hide': { fr: 'Masquer', en: 'Hide', es: 'Ocultar', it: 'Nascondi' },
  'admin.appearance.media.show': { fr: 'Afficher', en: 'Show', es: 'Mostrar', it: 'Mostra' },
  'admin.appearance.media.add': { fr: 'Ajouter des médias', en: 'Add Media', es: 'Agregar medios', it: 'Aggiungi media' },
  'admin.appearance.media.hidden': { fr: 'Médiathèque masquée', en: 'Media library hidden', es: 'Biblioteca multimedia oculta', it: 'Libreria multimediale nascosta' },
  'admin.appearance.media.hiddenDesc': { fr: 'Cliquez sur "Afficher" pour voir vos médias', en: 'Click "Show" to see your media', es: 'Haz clic en "Mostrar" para ver tus medios', it: 'Clicca su "Mostra" per vedere i tuoi media' },
  'admin.appearance.media.empty': { fr: 'Aucun média dans votre bibliothèque', en: 'No media in your library', es: 'No hay medios en tu biblioteca', it: 'Nessun media nella tua libreria' },
  'admin.appearance.media.addFirst': { fr: 'Ajouter vos premiers médias', en: 'Add your first media', es: 'Agregar tus primeros medios', it: 'Aggiungi i tuoi primi media' },
  'admin.appearance.media.sectionsTitle': { fr: 'Affichage des sections médias', en: 'Media Sections Display', es: 'Visualización de secciones multimedia', it: 'Visualizzazione sezioni multimediali' },
  'admin.appearance.media.sectionsDesc': { fr: 'Contrôlez l\'affichage des sections médias sur la page d\'accueil', en: 'Control the display of media sections on the homepage', es: 'Controla la visualización de secciones multimedia en la página de inicio', it: 'Controlla la visualizzazione delle sezioni multimediali nella homepage' },
  'admin.appearance.media.sectionsShow': { fr: 'Afficher les sections médias', en: 'Show media sections', es: 'Mostrar secciones multimedia', it: 'Mostra sezioni multimediali' },
  'admin.appearance.media.sectionsInclude': { fr: 'Inclut les carrousels et galeries d\'images sur la landing page', en: 'Includes carousels and image galleries on the landing page', es: 'Incluye carruseles y galerías de imágenes en la página de destino', it: 'Include caroselli e gallerie di immagini nella landing page' },
  'admin.appearance.media.description': { fr: 'Gérez vos images et vidéos pour personnaliser votre application', en: 'Manage your images and videos to customize your application', es: 'Gestiona tus imágenes y videos para personalizar tu aplicación', it: 'Gestisci le tue immagini e video per personalizzare la tua applicazione' },

  // Carousel section
  'admin.appearance.carousel.title': { fr: 'Configuration des carrousels', en: 'Carousel Configuration', es: 'Configuración de carruseles', it: 'Configurazione caroselli' },
  'admin.appearance.carousel.subtitle': { fr: 'Personnalisez l\'apparence et le comportement des carrousels d\'images', en: 'Customize the appearance and behavior of image carousels', es: 'Personaliza la apariencia y comportamiento de los carruseles de imágenes', it: 'Personalizza l\'aspetto e il comportamento dei caroselli di immagini' },
  'admin.appearance.carousel.autoplay': { fr: 'Lecture automatique', en: 'Autoplay', es: 'Reproducción automática', it: 'Riproduzione automatica' },
  'admin.appearance.carousel.autoplayDesc': { fr: 'Active la lecture automatique des images', en: 'Enable automatic playback of images', es: 'Activa la reproducción automática de imágenes', it: 'Attiva la riproduzione automatica delle immagini' },
  'admin.appearance.carousel.interval': { fr: 'Intervalle (ms)', en: 'Interval (ms)', es: 'Intervalo (ms)', it: 'Intervallo (ms)' },
  'admin.appearance.carousel.intervalDesc': { fr: 'Temps d\'affichage de chaque image (1000-10000ms)', en: 'Display time for each image (1000-10000ms)', es: 'Tiempo de visualización de cada imagen (1000-10000ms)', it: 'Tempo di visualizzazione per ogni immagine (1000-10000ms)' },
  'admin.appearance.carousel.showArrows': { fr: 'Afficher les flèches', en: 'Show Arrows', es: 'Mostrar flechas', it: 'Mostra frecce' },
  'admin.appearance.carousel.showDots': { fr: 'Afficher les points de navigation', en: 'Show Navigation Dots', es: 'Mostrar puntos de navegación', it: 'Mostra punti di navigazione' },
  'admin.appearance.carousel.height': { fr: 'Hauteur du carrousel', en: 'Carousel Height', es: 'Altura del carrusel', it: 'Altezza del carosello' },
  'admin.appearance.carousel.borderStyle': { fr: 'Style des bordures', en: 'Border Style', es: 'Estilo de bordes', it: 'Stile dei bordi' },
  'admin.appearance.carousel.small': { fr: 'Petite (300px)', en: 'Small (300px)', es: 'Pequeña (300px)', it: 'Piccola (300px)' },
  'admin.appearance.carousel.medium': { fr: 'Moyenne (400px)', en: 'Medium (400px)', es: 'Mediana (400px)', it: 'Media (400px)' },
  'admin.appearance.carousel.large': { fr: 'Grande (500px)', en: 'Large (500px)', es: 'Grande (500px)', it: 'Grande (500px)' },
  'admin.appearance.carousel.xlarge': { fr: 'Très grande (600px)', en: 'Extra Large (600px)', es: 'Muy grande (600px)', it: 'Extra grande (600px)' },
  'admin.appearance.carousel.noRadius': { fr: 'Aucun arrondi', en: 'No radius', es: 'Sin redondeo', it: 'Nessun raggio' },
  'admin.appearance.carousel.lightRadius': { fr: 'Léger arrondi', en: 'Light radius', es: 'Redondeo ligero', it: 'Raggio leggero' },
  'admin.appearance.carousel.normalRadius': { fr: 'Arrondi normal', en: 'Normal radius', es: 'Redondeo normal', it: 'Raggio normale' },
  'admin.appearance.carousel.strongRadius': { fr: 'Fort arrondi', en: 'Strong radius', es: 'Redondeo fuerte', it: 'Raggio forte' },
  'admin.appearance.carousel.imagesTitle': { fr: 'Images du carrousel', en: 'Carousel Images', es: 'Imágenes del carrusel', it: 'Immagini del carosello' },
  'admin.appearance.carousel.imagesDesc': { fr: 'Ajoutez et organisez les images de votre carrousel principal', en: 'Add and organize the images of your main carousel', es: 'Agrega y organiza las imágenes de tu carrusel principal', it: 'Aggiungi e organizza le immagini del tuo carosello principale' },
  'admin.appearance.carousel.imagesCount': { fr: 'image(s) configurée(s)', en: 'image(s) configured', es: 'imagen(es) configurada(s)', it: 'immagine/i configurata/e' },
  'admin.appearance.carousel.addImages': { fr: 'Ajouter des images', en: 'Add Images', es: 'Agregar imágenes', it: 'Aggiungi immagini' },
  'admin.appearance.carousel.noImages': { fr: 'Aucune image dans le carrousel', en: 'No images in carousel', es: 'No hay imágenes en el carrusel', it: 'Nessuna immagine nel carosello' },

  // Content section
  'admin.appearance.content.heroTitle': { fr: 'Configuration Section Hero', en: 'Hero Section Configuration', es: 'Configuración de la sección Hero', it: 'Configurazione sezione Hero' },
  'admin.appearance.content.heroDesc': { fr: 'Configurez l\'apparence et le contenu de votre section hero', en: 'Configure the appearance and content of your hero section', es: 'Configura la apariencia y contenido de tu sección hero', it: 'Configura l\'aspetto e il contenuto della tua sezione hero' },
  'admin.appearance.content.showHero': { fr: 'Afficher la section Hero', en: 'Show Hero Section', es: 'Mostrar sección Hero', it: 'Mostra sezione Hero' },
  'admin.appearance.content.background': { fr: 'Arrière-plan', en: 'Background', es: 'Fondo', it: 'Sfondo' },
  'admin.appearance.content.colorBackground': { fr: 'Couleur unie', en: 'Solid Color', es: 'Color sólido', it: 'Colore solido' },
  'admin.appearance.content.imageBackground': { fr: 'Image', en: 'Image', es: 'Imagen', it: 'Immagine' },
  'admin.appearance.content.backgroundColor': { fr: 'Couleur d\'arrière-plan', en: 'Background Color', es: 'Color de fondo', it: 'Colore di sfondo' },
  'admin.appearance.content.backgroundImage': { fr: 'Image d\'arrière-plan', en: 'Background Image', es: 'Imagen de fondo', it: 'Immagine di sfondo' },
  'admin.appearance.content.heroTitleField': { fr: 'Titre principal (Hero)', en: 'Main Title (Hero)', es: 'Título principal (Hero)', it: 'Titolo principale (Hero)' },
  'admin.appearance.content.heroSubtitleField': { fr: 'Sous-titre (Hero)', en: 'Subtitle (Hero)', es: 'Subtítulo (Hero)', it: 'Sottotitolo (Hero)' },
  'admin.appearance.content.characters': { fr: 'caractères', en: 'characters', es: 'caracteres', it: 'caratteri' },
  'admin.appearance.content.previewTitle': { fr: 'Aperçu de la section Hero', en: 'Preview of Hero Section', es: 'Vista previa de la sección Hero', it: 'Anteprima della sezione Hero' },
  'admin.appearance.content.titlePlaceholder': { fr: 'Votre titre apparaîtra ici', en: 'Your title will appear here', es: 'Tu título aparecerá aquí', it: 'Il tuo titolo apparirà qui' },
  'admin.appearance.content.subtitlePlaceholder': { fr: 'Votre sous-titre apparaîtra ici', en: 'Your subtitle will appear here', es: 'Tu subtítulo aparecerá aquí', it: 'Il tuo sottotitolo apparirà qui' },
  'admin.appearance.content.ctaButton': { fr: 'Commencer maintenant', en: 'Get Started Now', es: 'Empezar ahora', it: 'Inizia ora' },
  'admin.appearance.content.title': { fr: 'Configuration du contenu', en: 'Content Configuration', es: 'Configuración del contenido', it: 'Configurazione del contenuto' },
  'admin.appearance.content.description': { fr: 'Configurez le contenu de votre page d\'accueil', en: 'Configure your homepage content', es: 'Configura el contenido de tu página de inicio', it: 'Configura il contenuto della tua homepage' },

  // Upload dialog
  'admin.appearance.upload.title': { fr: 'Ajouter des médias', en: 'Add Media', es: 'Agregar medios', it: 'Aggiungi media' },
  'admin.appearance.upload.desc': { fr: 'Uploadez des images ou des vidéos dans votre médiathèque', en: 'Upload images or videos to your media library', es: 'Sube imágenes o videos a tu biblioteca multimedia', it: 'Carica immagini o video nella tua libreria multimediale' },
  'admin.appearance.upload.development': { fr: 'Fonction d\'upload en cours de développement', en: 'Upload function under development', es: 'Función de carga en desarrollo', it: 'Funzione di caricamento in sviluppo' },
  'admin.appearance.upload.future': { fr: 'Cette fonctionnalité permettra d\'uploader des médias', en: 'This feature will allow uploading media', es: 'Esta funcionalidad permitirá subir medios', it: 'Questa funzionalità consentirà di caricare media' },

  // Reset dialog
  'admin.appearance.reset.title': { fr: 'Réinitialiser l\'apparence', en: 'Reset Appearance', es: 'Restablecer apariencia', it: 'Reimposta aspetto' },
  'admin.appearance.reset.desc': { fr: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres d\'apparence ? Cette action ne peut pas être annulée.', en: 'Are you sure you want to reset all appearance settings? This action cannot be undone.', es: '¿Estás seguro de que quieres restablecer todos los ajustes de apariencia? Esta acción no se puede deshacer.', it: 'Sei sicuro di voler reimpostare tutte le impostazioni dell\'aspetto? Questa azione non può essere annullata.' },

  // Toast messages
  'admin.appearance.toast.saved': { fr: 'Apparence sauvegardée', en: 'Appearance saved', es: 'Apariencia guardada', it: 'Aspetto salvato' },
  'admin.appearance.toast.savedDesc': { fr: 'Les paramètres d\'apparence ont été mis à jour avec succès.', en: 'Appearance settings have been successfully updated.', es: 'Los ajustes de apariencia se han actualizado correctamente.', it: 'Le impostazioni dell\'aspetto sono state aggiornate con successo.' },
  'admin.appearance.toast.error': { fr: 'Erreur', en: 'Error', es: 'Error', it: 'Errore' },
  'admin.appearance.toast.errorDesc': { fr: 'Une erreur est survenue lors de la sauvegarde.', en: 'An error occurred while saving.', es: 'Ocurrió un error al guardar.', it: 'Si è verificato un errore durante il salvataggio.' },
  'admin.appearance.toast.reset': { fr: 'Paramètres réinitialisés', en: 'Settings reset', es: 'Configuración restablecida', it: 'Impostazioni reimpostate' },
  'admin.appearance.toast.resetDesc': { fr: 'L\'apparence a été remise aux valeurs par défaut.', en: 'Appearance has been reset to default values.', es: 'La apariencia se ha restablecido a los valores predeterminados.', it: 'L\'aspetto è stato reimpostato ai valori predefiniti.' },
  'admin.appearance.toast.preview': { fr: 'Mode aperçu', en: 'Preview mode', es: 'Modo vista previa', it: 'Modalità anteprima' },
  'admin.appearance.toast.normal': { fr: 'Mode normal', en: 'Normal mode', es: 'Modo normal', it: 'Modalità normale' },
  'admin.appearance.toast.normalDesc': { fr: 'Vous êtes revenu au mode d\'édition.', en: 'You have returned to edit mode.', es: 'Has vuelto al modo de edición.', it: 'Sei tornato alla modalità di modifica.' },
  'admin.appearance.toast.previewDesc': { fr: 'Aperçu activé - voyez vos changements en temps réel.', en: 'Preview enabled - see your changes in real time.', es: 'Vista previa activada - ve tus cambios en tiempo real.', it: 'Anteprima abilitata - vedi le tue modifiche in tempo reale.' },
  'admin.appearance.toast.copied': { fr: 'Palette copiée', en: 'Palette copied', es: 'Paleta copiada', it: 'Tavolozza copiata' },
  'admin.appearance.toast.copiedDesc': { fr: 'La palette de couleurs a été copiée dans le presse-papiers.', en: 'The color palette has been copied to the clipboard.', es: 'La paleta de colores se ha copiado al portapapeles.', it: 'La tavolozza dei colori è stata copiata negli appunti.' },
  'admin.appearance.toast.exported': { fr: 'Configuration exportée', en: 'Configuration exported', es: 'Configuración exportada', it: 'Configurazione esportata' },
  'admin.appearance.toast.exportedDesc': { fr: 'Vos paramètres d\'apparence ont été exportés.', en: 'Your appearance settings have been exported.', es: 'Tus ajustes de apariencia han sido exportados.', it: 'Le tue impostazioni dell\'aspetto sono state esportate.' },

  // Common
  'common.save': { fr: 'Sauvegarder', en: 'Save', es: 'Guardar', it: 'Salva' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel', es: 'Cancelar', it: 'Annulla' },
  'common.edit': { fr: 'Modifier', en: 'Edit', es: 'Editar', it: 'Modifica' },
  'common.delete': { fr: 'Supprimer', en: 'Delete', es: 'Eliminar', it: 'Elimina' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...', es: 'Cargando...', it: 'Caricamento...' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const [translations, setTranslations] = useState<Translations>(defaultTranslations);

  // Chargement de la langue depuis le localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['fr', 'en', 'es', 'it'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Sauvegarde de la langue dans le localStorage mémorisée
  const handleSetLanguage = useCallback((lang: Language) => {
    // Éviter les mises à jour inutiles si la langue n'a pas changé
    if (lang === language) {
      return;
    }
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, [language]);

  // Fonction de traduction mémorisée
  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.fr || key;
  }, [translations, language]);

  // Mémoriser la valeur du contexte pour éviter les re-rendus inutiles
  const contextValue = useMemo(() => ({
    language, 
    setLanguage: handleSetLanguage, 
    t, 
    translations, 
    setTranslations 
  }), [language, handleSetLanguage, t, translations]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};