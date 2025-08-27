import React, { createContext, useContext, useState, useEffect } from 'react';

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
  setMediaLibrary: (media: MediaItem[]) => void;
  setCarousels: (carousels: CarouselConfig[]) => void;
  getCarouselById: (id: string) => CarouselConfig | undefined;
  getMediaByUrl: (url: string) => MediaItem | undefined;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Données initiales - synchronisées avec AdminAppearance
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([
    {
      id: '1',
      name: 'hero-image.jpg',
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      type: 'image',
      size: 245678,
      uploadDate: '2024-01-20'
    },
    {
      id: '2', 
      name: 'feature-1.jpg',
      url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
      type: 'image',
      size: 156789,
      uploadDate: '2024-01-19'
    },
    {
      id: '3',
      name: 'team-meeting.jpg',
      url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
      type: 'image',
      size: 298456,
      uploadDate: '2024-01-18'
    },
    {
      id: '4',
      name: 'office-space.jpg',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      type: 'image',
      size: 334567,
      uploadDate: '2024-01-17'
    }
  ]);

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
    return carousels.find(carousel => carousel.id === id);
  };

  const getMediaByUrl = (url: string): MediaItem | undefined => {
    return mediaLibrary.find(media => media.url === url);
  };

  // Synchronisation avec le localStorage pour persister les données
  useEffect(() => {
    const savedMedia = localStorage.getItem('mediaLibrary');
    const savedCarousels = localStorage.getItem('carousels');
    
    if (savedMedia) {
      try {
        setMediaLibrary(JSON.parse(savedMedia));
      } catch (error) {
        console.error('Error loading saved media:', error);
      }
    }
    
    if (savedCarousels) {
      try {
        setCarousels(JSON.parse(savedCarousels));
      } catch (error) {
        console.error('Error loading saved carousels:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mediaLibrary', JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  useEffect(() => {
    localStorage.setItem('carousels', JSON.stringify(carousels));
  }, [carousels]);

  return (
    <MediaContext.Provider value={{
      mediaLibrary,
      carousels,
      setMediaLibrary,
      setCarousels,
      getCarouselById,
      getMediaByUrl
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