import React from 'react';
import { Header } from '@/components/layout/Header';
import { MediaSection, MediaGallery } from '@/components/MediaSection';
import { CarouselDisplay } from '@/components/ui/carousel-display';
import { useMedia } from '@/contexts/MediaContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Image, Play, Grid, ArrowLeft } from 'lucide-react';

export const MediaShowcase = () => {
  const { carousels, mediaLibrary } = useMedia();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Button variant="outline" asChild className="mb-6">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au dashboard
              </Link>
            </Button>
            <h1 className="text-4xl font-bold mb-4">Vitrine des médias</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment vos médias et carrousels personnalisés peuvent être utilisés dans votre application
            </p>
          </div>

          <Tabs defaultValue="carousels" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="carousels" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Carrousels
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Galerie
              </TabsTrigger>
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Images individuelles
              </TabsTrigger>
            </TabsList>

            {/* Onglet Carrousels */}
            <TabsContent value="carousels" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Vos carrousels personnalisés</h2>
                <p className="text-muted-foreground">
                  Les carrousels créés dans le menu Apparence peuvent être utilisés n'importe où
                </p>
              </div>

              {carousels.map((carousel) => (
                <Card key={carousel.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{carousel.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {carousel.images.length} image(s) • {carousel.autoplay ? 'Auto' : 'Manuel'}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Hauteur: {carousel.height} • Intervalle: {carousel.interval}ms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CarouselDisplay
                      images={carousel.images}
                      autoplay={carousel.autoplay}
                      interval={carousel.interval}
                      showDots={carousel.showDots}
                      showArrows={carousel.showArrows}
                      height={carousel.height}
                    />
                    
                    {/* Code d'exemple */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Code d'utilisation :</h4>
                      <code className="text-sm text-muted-foreground">
                        {`<MediaSection type="carousel" carouselId="${carousel.id}" />`}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {carousels.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Aucun carrousel créé</p>
                    <Button asChild>
                      <Link to="/admin/appearance">
                        Créer un carrousel
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Galerie */}
            <TabsContent value="gallery" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Galerie complète</h2>
                <p className="text-muted-foreground">
                  Tous vos médias organisés dans une galerie élégante
                </p>
              </div>

              <MediaGallery
                title="Médiathèque complète"
                filterType="all"
                gridCols={4}
              />

              {/* Exemples de configurations */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Images uniquement</CardTitle>
                    <CardDescription>Filtrer par type de média</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MediaGallery
                      title=""
                      filterType="image"
                      gridCols={2}
                    />
                    <div className="mt-4 p-3 bg-muted rounded text-sm">
                      <code>{`<MediaGallery filterType="image" gridCols={2} />`}</code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grille personnalisée</CardTitle>
                    <CardDescription>Utiliser des images spécifiques</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MediaSection
                      type="grid"
                      gridImages={mediaLibrary.slice(0, 4).map(m => m.url)}
                    />
                    <div className="mt-4 p-3 bg-muted rounded text-sm">
                      <code>{`<MediaSection type="grid" gridImages={[...]} />`}</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Images individuelles */}
            <TabsContent value="individual" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Images individuelles</h2>
                <p className="text-muted-foreground">
                  Utilisez vos images de la médiathèque individuellement
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {mediaLibrary.filter(m => m.type === 'image').slice(0, 4).map((media) => (
                  <Card key={media.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{media.name}</CardTitle>
                      <CardDescription>
                        Taille: {(media.size / 1024).toFixed(0)} KB • 
                        Ajouté le {new Date(media.uploadDate).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video overflow-hidden rounded-lg mb-4">
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded text-sm">
                          <strong>URL directe :</strong>
                          <br />
                          <code className="text-xs break-all">{media.url}</code>
                        </div>
                        
                        <div className="p-3 bg-muted rounded text-sm">
                          <strong>Utilisation dans un composant :</strong>
                          <br />
                          <code className="text-xs">
                            {`<MediaSection type="image" imageUrl="${media.url}" />`}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {mediaLibrary.filter(m => m.type === 'image').length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Aucune image dans la médiathèque</p>
                    <Button asChild>
                      <Link to="/admin/appearance">
                        Ajouter des images
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Guide d'utilisation */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Comment utiliser vos médias</CardTitle>
              <CardDescription>
                Guide rapide pour intégrer vos images et carrousels dans vos pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">1. Dans vos composants React</h4>
                  <div className="p-3 bg-muted rounded text-sm">
                    <code>{`import { MediaSection } from '@/components/MediaSection';

// Carrousel
<MediaSection 
  type="carousel" 
  carouselId="1" 
  title="Mon titre"
/>

// Image seule
<MediaSection 
  type="image" 
  imageUrl="https://..." 
/>

// Grille d'images
<MediaSection 
  type="grid" 
  gridImages={[...urls]}
/>`}</code>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">2. Galerie complète</h4>
                  <div className="p-3 bg-muted rounded text-sm">
                    <code>{`import { MediaGallery } from '@/components/MediaSection';

// Toutes les images
<MediaGallery 
  title="Ma galerie"
  filterType="image"
  gridCols={3}
/>

// Toutes les vidéos
<MediaGallery 
  filterType="video"
  gridCols={2}
/>`}</code>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Astuce :</strong> Tous les médias ajoutés dans le menu Apparence sont automatiquement 
                  disponibles dans ces composants. Modifiez vos carrousels et images depuis l'administration 
                  et ils se mettront à jour partout dans votre application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};