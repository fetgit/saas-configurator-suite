import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react';
import { MediaService, UploadedFile } from '@/services/mediaService';
import { useToast } from '@/hooks/use-toast';
import { cleanupBlobUrls } from '@/utils/cleanupBlobUrls';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  category?: string;
  onImageSelect?: (file: UploadedFile) => void;
  selectedImageId?: number;
  showPreview?: boolean;
  maxFiles?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  category = 'general',
  onImageSelect,
  selectedImageId,
  showPreview = true,
  maxFiles = 1,
  className = ''
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour nettoyer les URLs blob invalides
  const cleanupBlobUrls = () => {
    // Nettoyer les URLs blob invalides du localStorage
    const savedFiles = localStorage.getItem(`uploadedFiles_${category}`);
    if (savedFiles) {
      try {
        const files = JSON.parse(savedFiles);
        const validFiles = files.filter((file: any) => {
          // Vérifier si l'URL est une URL blob valide
          if (file.url && file.url.startsWith('blob:')) {
            return false; // Supprimer les URLs blob
          }
          return true;
        });
        localStorage.setItem(`uploadedFiles_${category}`, JSON.stringify(validFiles));
      } catch (error) {
        console.error('Erreur lors du nettoyage des URLs blob:', error);
        localStorage.removeItem(`uploadedFiles_${category}`);
      }
    }
  };

  // Charger les images existantes seulement si l'utilisateur est connecté
  React.useEffect(() => {
    // Nettoyer les URLs blob invalides au chargement
    cleanupBlobUrls();
    
    // Debug de l'état d'authentification
    const storedTokens = localStorage.getItem('auth_tokens');
    let tokenInfo = 'absent';
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        tokenInfo = tokens.accessToken ? 'présent' : 'absent';
      } catch (error) {
        tokenInfo = 'erreur';
      }
    }
    
    console.log('🔍 ImageUpload - État d\'authentification:', {
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      token: tokenInfo,
      storedTokens: storedTokens ? 'présent' : 'absent'
    });
    
    // Charger les images seulement si l'utilisateur est authentifié
    if (isAuthenticated && user) {
      console.log('✅ ImageUpload - Chargement des images...');
      loadExistingImages();
    } else {
      console.log('❌ ImageUpload - Utilisateur non authentifié, arrêt du chargement');
      setIsLoading(false);
    }
  }, [category, isAuthenticated, user]);

  const loadExistingImages = async () => {
    try {
      setIsLoading(true);
      const response = await MediaService.getMediaList(category);
      if (response.success && response.files) {
        setUploadedFiles(response.files);
      } else {
        setUploadedFiles([]);
      }
    } catch (error: any) {
      setError(error.message);
      setUploadedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour uploader des images",
        variant: "destructive",
      });
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Valider le fichier
    const validation = MediaService.validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Erreur de validation",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Uploader le fichier
    await uploadFile(file);
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simuler le progrès (dans un vrai projet, vous pourriez utiliser axios avec onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await MediaService.uploadImage(file, category);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Ajouter le fichier à la liste
      setUploadedFiles(prev => [response.file, ...prev]);

      toast({
        title: "Upload réussi",
        description: "L'image a été uploadée avec succès",
      });

      // Appeler le callback si fourni
      if (onImageSelect) {
        onImageSelect(response.file);
      }

    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erreur d'upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (fileId: number) => {
    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour supprimer des images",
        variant: "destructive",
      });
      return;
    }

    try {
      await MediaService.deleteImage(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectImage = (file: UploadedFile) => {
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Message d'information si pas connecté */}
      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté en tant qu'administrateur pour gérer les images.
          </AlertDescription>
        </Alert>
      )}

      {/* Zone d'upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload d'images
          </CardTitle>
          <CardDescription>
            Glissez-déposez une image ou cliquez pour sélectionner un fichier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Input file caché */}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Zone de drop */}
            <div
              onClick={isAuthenticated ? openFileDialog : undefined}
              className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors ${
                isAuthenticated 
                  ? 'cursor-pointer hover:border-primary/50' 
                  : 'cursor-not-allowed opacity-50'
              }`}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isUploading ? 'Upload en cours...' : 'Cliquez pour sélectionner une image'}
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, GIF, WebP, SVG (max 5MB)
              </p>
            </div>

            {/* Barre de progression */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des images uploadées */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Images disponibles
            </CardTitle>
            <CardDescription>
              Cliquez sur une image pour la sélectionner
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune image uploadée</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImageId === file.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectImage(file)}
                  >
                    {/* Image */}
                    <div className="aspect-square bg-muted">
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Overlay avec actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(file.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge de sélection */}
                    {selectedImageId === file.id && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="bg-primary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sélectionné
                        </Badge>
                      </div>
                    )}

                    {/* Informations du fichier */}
                    <div className="p-2 bg-background/95">
                      <p className="text-xs font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {MediaService.formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
