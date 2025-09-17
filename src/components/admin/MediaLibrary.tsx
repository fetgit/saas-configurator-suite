import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Trash2, 
  Edit, 
  Download, 
  Eye, 
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Plus,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { MediaService, type UploadedFile } from '@/services/mediaService';

interface MediaLibraryProps {
  onMediaSelect?: (media: UploadedFile) => void;
  selectedMediaId?: string;
  category?: string;
  showUploadButton?: boolean;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onMediaSelect,
  selectedMediaId,
  category,
  showUploadButton = true
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // États
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<UploadedFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragOver, setDragOver] = useState(false);

  // Catégories disponibles
  const categories = [
    { value: 'all', label: 'Tous les médias' },
    { value: 'hero', label: 'Images Hero' },
    { value: 'logo', label: 'Logos' },
    { value: 'favicon', label: 'Favicons' },
    { value: 'gallery', label: 'Galerie' },
    { value: 'banner', label: 'Bannières' },
    { value: 'icon', label: 'Icônes' },
    { value: 'general', label: 'Général' }
  ];

  // Charger les médias
  const loadMedia = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await MediaService.getMediaList(selectedCategory === 'all' ? undefined : selectedCategory);
      if (response.success) {
        setMediaFiles(response.files || []);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les médias",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des médias",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les médias
  useEffect(() => {
    let filtered = mediaFiles;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(media => 
        media.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMedia(filtered);
  }, [mediaFiles, searchTerm, selectedCategory]);

  // Charger les médias au montage et quand la catégorie change
  useEffect(() => {
    loadMedia();
  }, [selectedCategory, isAuthenticated]);

  // Gestion de l'upload
  const handleFileUpload = async (files: FileList | File[], category: string = 'general') => {
    if (!isAuthenticated) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      if (!isValidType) {
        toast({
          title: "Fichier non supporté",
          description: `${file.name} n'est pas un type de fichier supporté`,
          variant: "destructive"
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la taille maximale de 10MB`,
          variant: "destructive"
        });
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Upload des fichiers
    for (const file of validFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const response = await MediaService.uploadImage(file, category);
        
        if (response.success) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          toast({
            title: "Upload réussi",
            description: `${file.name} a été uploadé avec succès`,
          });
        } else {
          throw new Error(response.error || 'Erreur lors de l\'upload');
        }
      } catch (error) {
        console.error('Erreur upload:', error);
        toast({
          title: "Erreur d'upload",
          description: `Impossible d'uploader ${file.name}`,
          variant: "destructive"
        });
      }
    }

    // Recharger la liste des médias
    setTimeout(() => {
      loadMedia();
      setUploadProgress({});
    }, 1000);
  };

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, selectedCategory === 'all' ? 'general' : selectedCategory);
    }
  };

  // Supprimer un média
  const handleDeleteMedia = async (media: UploadedFile) => {
    if (!isAuthenticated) return;

    try {
      const response = await MediaService.deleteMedia(media.id);
      if (response.success) {
        toast({
          title: "Média supprimé",
          description: `${media.originalName} a été supprimé`,
        });
        loadMedia();
      } else {
        throw new Error(response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le média",
        variant: "destructive"
      });
    }
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Médiathèque</h3>
          <p className="text-sm text-muted-foreground">
            {filteredMedia.length} média{filteredMedia.length > 1 ? 's' : ''} 
            {selectedCategory !== 'all' && ` dans ${categories.find(c => c.value === selectedCategory)?.label}`}
          </p>
        </div>
        
        {showUploadButton && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter des médias
          </Button>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les médias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Zone de drop pour l'upload rapide */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Glissez-déposez vos fichiers ici pour un upload rapide
        </p>
        <p className="text-xs text-muted-foreground">
          Images, vidéos et fichiers audio jusqu'à 10MB
        </p>
      </div>

      {/* Liste des médias */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Chargement des médias...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Aucun média trouvé</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par ajouter vos premiers médias'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
          : 'space-y-2'
        }>
          {filteredMedia.map((media) => (
            <Card 
              key={media.id} 
              className={`group relative cursor-pointer transition-all hover:shadow-md ${
                selectedMediaId === media.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onMediaSelect?.(media)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                    {media.mimeType.startsWith('image/') ? (
                      <img
                        src={media.url}
                        alt={media.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(media.mimeType)}
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium truncate" title={media.originalName}>
                        {media.originalName}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {media.category}
                        </Badge>
                        <span>{formatFileSize(media.size)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(media.uploadedAt)}
                      </p>
                    </div>
                  </CardContent>

                  {/* Actions au survol */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(media.url, '_blank');
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMediaToDelete(media);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {media.mimeType.startsWith('image/') ? (
                        <img
                          src={media.url}
                          alt={media.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(media.mimeType)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{media.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {media.category}
                        </Badge>
                        <span>•</span>
                        <span>{formatFileSize(media.size)}</span>
                        <span>•</span>
                        <span>{formatDate(media.uploadedAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(media.url, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMediaToDelete(media);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'upload */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter des médias</DialogTitle>
            <DialogDescription>
              Uploadez des images, vidéos ou fichiers audio dans votre médiathèque
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Sélection de catégorie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== 'all').map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone d'upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Images, vidéos et fichiers audio jusqu'à 10MB
              </p>
              
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files, selectedCategory === 'all' ? 'general' : selectedCategory);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner des fichiers
                </label>
              </Button>
            </div>

            {/* Progression d'upload */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload en cours...</p>
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate">{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le média</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{mediaToDelete?.originalName}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (mediaToDelete) {
                  handleDeleteMedia(mediaToDelete);
                  setIsDeleteDialogOpen(false);
                  setMediaToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
