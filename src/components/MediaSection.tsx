import React from 'react';
import { CarouselDisplay } from '@/components/ui/carousel-display';
import { useMedia } from '@/contexts/MediaContext';
import { Card, CardContent } from '@/components/ui/card';

interface MediaSectionProps {
  type: 'carousel' | 'image' | 'grid';
  carouselId?: string;
  imageUrl?: string;
  gridImages?: string[];
  title?: string;
  description?: string;
  className?: string;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  type,
  carouselId,
  imageUrl,
  gridImages,
  title,
  description,
  className
}) => {
  const { getCarouselById, getMediaByUrl } = useMedia();

  const renderContent = () => {
    switch (type) {
      case 'carousel':
        if (!carouselId) return null;
        const carousel = getCarouselById(carouselId);
        if (!carousel) return null;
        
        return (
          <CarouselDisplay
            images={carousel.images}
            autoplay={carousel.autoplay}
            interval={carousel.interval}
            showDots={carousel.showDots}
            showArrows={carousel.showArrows}
            height={carousel.height}
            className="w-full"
          />
        );

      case 'image':
        if (!imageUrl) return null;
        return (
          <img
            src={imageUrl}
            alt={title || 'Image'}
            className="w-full h-full object-cover rounded-lg"
          />
        );

      case 'grid':
        if (!gridImages || gridImages.length === 0) return null;
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gridImages.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {(title || description) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          )}
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

// Composant pour afficher une galerie d'images depuis la médiathèque
export const MediaGallery: React.FC<{
  title?: string;
  filterType?: 'image' | 'video' | 'all';
  gridCols?: number;
  className?: string;
  showEmptyMessage?: boolean;
}> = ({
  title = "Galerie",
  filterType = 'all',
  gridCols = 3,
  className,
  showEmptyMessage = true
}) => {
  const { mediaLibrary, isLoading } = useMedia();

  const filteredMedia = mediaLibrary.filter(media => 
    filterType === 'all' || media.type === filterType
  );

  if (isLoading) {
    return (
      <div className={className}>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Chargement des médias...</p>
        </div>
      </div>
    );
  }

  if (filteredMedia.length === 0) {
    if (!showEmptyMessage) {
      return null;
    }
    
    return (
      <div className={className}>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">Aucun média trouvé</p>
            <p className="text-sm">Les médias uploadés dans l'administration apparaîtront ici</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      </div>
      
      <div className={`grid gap-6 max-w-6xl mx-auto grid-cols-1 md:grid-cols-${gridCols}`}>
        {filteredMedia.map((media) => (
          <Card key={media.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-video overflow-hidden">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm truncate">{media.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(media.uploadDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};