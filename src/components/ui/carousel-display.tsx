import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselDisplayProps {
  images: string[];
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export const CarouselDisplay: React.FC<CarouselDisplayProps> = ({
  images,
  autoplay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  height = '400px',
  className,
  rounded = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  if (!images || images.length === 0) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          rounded && "rounded-lg",
          className
        )}
        style={{ height }}
      >
        Aucune image dans ce carrousel
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden group",
        rounded && "rounded-lg",
        className
      )}
      style={{ height }}
      onMouseEnter={() => autoplay && setIsPlaying(false)}
      onMouseLeave={() => autoplay && setIsPlaying(true)}
    >
      {/* Images Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "absolute left-4 top-1/2 transform -translate-y-1/2",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "shadow-lg hover:shadow-xl"
            )}
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "absolute right-4 top-1/2 transform -translate-y-1/2",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "shadow-lg hover:shadow-xl"
            )}
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentIndex === index 
                  ? "bg-white shadow-lg" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Pause/Play Button (optional) */}
      {autoplay && images.length > 1 && (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "absolute top-4 right-4",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
      )}
    </div>
  );
};