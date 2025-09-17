import React, { useEffect } from 'react';
import { useAppearance } from '@/contexts/AppearanceContext';

export const DynamicHead: React.FC = () => {
  const { config } = useAppearance();

  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = config.branding.companyName || 'SaaS Template';

    // Mettre à jour le favicon
    if (config.branding.faviconUrl) {
      // Supprimer tous les anciens favicons
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      // Créer le nouveau favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/x-icon';
      favicon.href = config.branding.faviconUrl;
      favicon.crossOrigin = 'anonymous'; // Ajouter crossOrigin pour éviter les erreurs CORS
      document.head.appendChild(favicon);

      // Ajouter aussi un favicon pour les navigateurs modernes
      const faviconPng = document.createElement('link');
      faviconPng.rel = 'icon';
      faviconPng.type = 'image/png';
      faviconPng.href = config.branding.faviconUrl;
      faviconPng.crossOrigin = 'anonymous'; // Ajouter crossOrigin pour éviter les erreurs CORS
      document.head.appendChild(faviconPng);

      // Ne pas ajouter de paramètre de cache pour éviter les erreurs CORS
      console.log('🔍 Favicon mis à jour:', config.branding.faviconUrl);
    }

    // Mettre à jour les meta tags Open Graph
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Mettre à jour les meta tags
    updateMetaTag('og:title', config.branding.companyName || 'SaaS Template');
    updateMetaTag('og:description', config.branding.heroSubtitle || 'Une solution complète et personnalisable');
    updateMetaName('description', config.branding.heroSubtitle || 'Une solution complète et personnalisable');
    
    if (config.branding.logoUrl) {
      updateMetaTag('og:image', config.branding.logoUrl);
    }

  }, [config.branding]);

  return null; // Ce composant ne rend rien
};
