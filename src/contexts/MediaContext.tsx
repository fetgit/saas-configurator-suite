import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaService, type UploadedFile } from '@/services/mediaService';
import { useAuth } from './AuthContext';

// Types
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploadDate: string;
}

export interface CarouselConfig {
  id: string;
  name: string;
  images: string[];
  autoplay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  height: string;
}

interface MediaContextType {
  mediaLibrary: MediaItem[];
  carousels: CarouselConfig[];
  isLoading: boolean;
  setMediaLibrary: (media: MediaItem[]) => void;
  setCarousels: (carousels: CarouselConfig[]) => void;
  getCarouselById: (id: string) => CarouselConfig | undefined;
  getMediaByUrl: (url: string) => MediaItem | undefined;
  refreshMediaLibrary: () => Promise<void>;
  getDynamicCarousel: () => CarouselConfig;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [carousels, setCarousels] = useState<CarouselConfig[]>([
    {
      id: '1',
      name: 'Carrousel Principal',
      images: [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'
      ],
      autoplay: true,
      interval: 5000,
      showDots: true,
      showArrows: true,
      height: '400px'
    },
    {
      id: '2',
      name: 'Témoignages Clients',
      images: [
        'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
      ],
      autoplay: false,
      interval: 3000,
      showDots: true,
      showArrows: true,
      height: '300px'
    }
  ]);

  const getCarouselById = (id: string): CarouselConfig | undefined => {
    // Si c'est le carrousel principal (id: '1'), utiliser le carrousel dynamique
    if (id === '1') {
      return createDynamicCarousel();
    }
    
    // Sinon, chercher dans les carrousels statiques
    return carousels.find(carousel => carousel.id === id);
  };

  const getMediaByUrl = (url: string): MediaItem | undefined => {
    return mediaLibrary.find(media => media.url === url);
  };

  // Fonction pour convertir UploadedFile en MediaItem
  const convertToMediaItem = (uploadedFile: UploadedFile): MediaItem => ({
    id: uploadedFile.id.toString(),
    name: uploadedFile.originalName,
    url: uploadedFile.url,
    type: uploadedFile.mimeType.startsWith('video/') ? 'video' : 'image',
    size: uploadedFile.size,
    uploadDate: uploadedFile.uploadedAt
  });

  // Charger les médias depuis la base de données
  const loadMediaLibrary = async () => {
    if (!isAuthenticated) {
      // Si pas authentifié, utiliser des données de démonstration
      setMediaLibrary([
        {
          id: 'demo-1',
          name: 'Image de démonstration',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
          type: 'image',
          size: 245678,
          uploadDate: '2024-01-20'
        }
      ]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 MediaContext - Chargement des médias depuis la base de données...');
      const response = await MediaService.getMediaList();
      
      if (response.success && response.files) {
        const mediaItems = response.files.map(convertToMediaItem);
        setMediaLibrary(mediaItems);
        console.log('✅ MediaContext - Médias chargés:', mediaItems.length);
      } else {
        console.warn('⚠️ MediaContext - Aucun média trouvé ou erreur de chargement');
        setMediaLibrary([]);
      }
    } catch (error) {
      console.error('❌ MediaContext - Erreur lors du chargement des médias:', error);
      setMediaLibrary([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les médias au montage et quand l'authentification change
  useEffect(() => {
    loadMediaLibrary();
  }, [isAuthenticated]);

  // Créer un carrousel dynamique basé sur les médias uploadés
  const createDynamicCarousel = (): CarouselConfig => {
    console.log('🔍 MediaContext - Création du carrousel dynamique:', {
      mediaLibraryCount: mediaLibrary.length,
      mediaLibrary: mediaLibrary.map(m => ({ name: m.name, type: m.type, url: m.url }))
    });

    // Récupérer les images de catégorie 'hero' ou 'carousel'
    const heroImages = mediaLibrary
      .filter(media => media.type === 'image' && (media.name.toLowerCase().includes('hero') || media.name.toLowerCase().includes('carousel')))
      .map(media => media.url);

    // Si pas d'images hero, utiliser les premières images disponibles
    const fallbackImages = mediaLibrary
      .filter(media => media.type === 'image')
      .slice(0, 3)
      .map(media => media.url);

    const carouselImages = heroImages.length > 0 ? heroImages : fallbackImages;

    const carousel = {
      id: '1',
      name: 'Carrousel Principal',
      images: carouselImages.length > 0 ? carouselImages : [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'
      ],
      autoplay: true,
      interval: 5000,
      showDots: true,
      showArrows: true,
      height: '400px'
    };

    console.log('✅ MediaContext - Carrousel créé:', {
      imagesCount: carousel.images.length,
      images: carousel.images,
      autoplay: carousel.autoplay,
      interval: carousel.interval,
      showDots: carousel.showDots,
      showArrows: carousel.showArrows,
      height: carousel.height
    });

    return carousel;
  };

  // Synchronisation avec le localStorage pour les carousels
  useEffect(() => {
    const savedCarousels = localStorage.getItem('carousels');
    
    if (savedCarousels) {
      try {
        setCarousels(JSON.parse(savedCarousels));
      } catch (error) {
        console.error('Error loading saved carousels:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (carousels.length > 0 && carousels[0].id === '1') {
      localStorage.setItem('carousels', JSON.stringify(carousels));
    }
  }, [carousels]);

  return (
    <MediaContext.Provider value={{
      mediaLibrary,
      carousels,
      isLoading,
      setMediaLibrary,
      setCarousels,
      getCarouselById,
      getMediaByUrl,
      refreshMediaLibrary: loadMediaLibrary,
      getDynamicCarousel: createDynamicCarousel
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};