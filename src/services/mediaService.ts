import { apiClient } from '@/hooks/useApi';

export interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  category: string;
  uploadedAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: UploadedFile;
}

export interface MediaListResponse {
  success: boolean;
  files: UploadedFile[];
}

export class MediaService {
  /**
   * Uploader une image
   */
  static async uploadImage(file: File, category: string = 'general'): Promise<UploadResponse> {
    console.log('🔍 MediaService.uploadImage - Début:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type, 
      category 
    });
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    // Debug du FormData
    console.log('🔍 MediaService - FormData créé:', {
      hasImage: formData.has('image'),
      hasCategory: formData.has('category'),
      imageFile: formData.get('image'),
      categoryValue: formData.get('category')
    });

    try {
      const response = await apiClient.post<UploadResponse>('/media/upload', formData);
      console.log('✅ MediaService - Upload réussi:', response);

      return response.data || response;
    } catch (error: any) {
      console.error('❌ MediaService - Erreur lors de l\'upload:', error);
      console.error('❌ MediaService - Détails de l\'erreur:', {
        status: error.status,
        message: error.message,
        response: error.response
      });
      throw new Error(error.response?.data?.error || error.message || 'Erreur lors de l\'upload de l\'image');
    }
  }

  /**
   * Récupérer la liste des images uploadées
   */
  static async getMediaList(category?: string): Promise<MediaListResponse> {
    try {
      console.log('🔍 MediaService.getMediaList - Début:', { category });
      
      // Vérifier le token correctement
      const storedTokens = localStorage.getItem('auth_tokens');
      let tokenPresent = 'NON';
      if (storedTokens) {
        try {
          const tokens = JSON.parse(storedTokens);
          tokenPresent = tokens.accessToken ? 'OUI' : 'NON';
        } catch (error) {
          tokenPresent = 'ERREUR';
        }
      }
      console.log('🔍 MediaService - Token présent:', tokenPresent);
      
      const params = category ? { category } : undefined;
      console.log('🔍 MediaService - Paramètres:', params);
      
      const response = await apiClient.get<MediaListResponse>('/media/list', params);
      console.log('✅ MediaService - Réponse reçue:', response);
      
      // Vérifier la structure de la réponse
      if (response && response.data && response.data.success && Array.isArray(response.data.files)) {
        return response.data;
      } else if (response && response.success && Array.isArray(response.files)) {
        return response;
      } else {
        console.warn('⚠️ MediaService - Structure de réponse inattendue:', response);
        return { success: false, files: [] };
      }
    } catch (error: any) {
      console.error('❌ MediaService - Erreur lors de la récupération des images:', error);
      console.error('❌ MediaService - Détails de l\'erreur:', {
        status: error.status,
        message: error.message,
        response: error.response
      });
      return { success: false, files: [] };
    }
  }

  /**
   * Supprimer une image
   */
  static async deleteImage(id: number): Promise<void> {
    try {
      await apiClient.delete(`/media/${id}`);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de l\'image');
    }
  }

  /**
   * Supprimer un média (alias pour deleteImage)
   */
  static async deleteMedia(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      await apiClient.delete(`/media/${id}`);
      return { success: true, message: 'Média supprimé avec succès' };
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      return { success: false, error: error.response?.data?.error || 'Erreur lors de la suppression du média' };
    }
  }

  /**
   * Récupérer les images par catégorie
   */
  static async getImagesByCategory(category: string): Promise<UploadedFile[]> {
    const response = await this.getMediaList(category);
    return response.files || [];
  }

  /**
   * Récupérer les images Hero
   */
  static async getHeroImages(): Promise<UploadedFile[]> {
    return this.getImagesByCategory('hero');
  }

  /**
   * Récupérer les logos
   */
  static async getLogos(): Promise<UploadedFile[]> {
    return this.getImagesByCategory('logo');
  }

  /**
   * Récupérer les favicons
   */
  static async getFavicons(): Promise<UploadedFile[]> {
    return this.getImagesByCategory('favicon');
  }

  /**
   * Formater la taille d'un fichier
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Valider un fichier image
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Vérifier le type MIME
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Seules les images sont autorisées' };
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'La taille du fichier ne doit pas dépasser 5MB' };
    }

    // Vérifier les extensions autorisées
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG' };
    }

    return { valid: true };
  }
}
