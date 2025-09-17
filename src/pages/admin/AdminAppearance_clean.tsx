import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Palette,
  Upload,
  Save,
  RotateCcw,
  Eye,
  Image,
  Type,
  Layout,
  Download,
  AlertTriangle,
  Copy,
  EyeOff,
  Settings,
  Shield,
  Globe,
  Database,
  Users,
  BarChart3,
  Zap,
  Lock,
  CheckCircle,
  MessageSquare,
  Mail,
  Bot,
  FileText,
  Camera,
  Bell,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Star,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Monitor,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Bluetooth,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Speaker,
  Mic,
  Video,
  File,
  Folder,
  Archive,
  Bookmark,
  Tag,
  Flag,
  Target,
  Rocket,
  Gem,
  RefreshCw
} from 'lucide-react';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMedia } from '@/contexts/MediaContext';
import { ImageUpload } from '@/components/ImageUpload';
import { MediaLibrary } from '@/components/MediaLibrary';
import { CarouselDisplay } from '@/components/CarouselDisplay';

// Mapping des icônes
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'Palette': Palette, 'Shield': Shield, 'Globe': Globe, 'Database': Database, 
    'Users': Users, 'BarChart3': BarChart3, 'Settings': Settings, 'Zap': Zap,
    'Lock': Lock, 'CheckCircle': CheckCircle, 'MessageSquare': MessageSquare, 'Mail': Mail,
    'Bot': Bot, 'FileText': FileText, 'Camera': Camera, 'Bell': Bell, 'Search': Search, 'Filter': Filter,
    'Download': Download, 'Upload': Upload, 'Eye': Eye, 'Edit': Edit, 'Trash2': Trash2, 'Plus': Plus,
    'Star': Star, 'Heart': Heart, 'Share2': Share2, 'Calendar': Calendar, 'Clock': Clock, 'MapPin': MapPin,
    'Phone': Phone, 'Monitor': Monitor, 'Server': Server, 'Cpu': Cpu, 'HardDrive': HardDrive, 'Wifi': Wifi,
    'Bluetooth': Bluetooth, 'Smartphone': Smartphone, 'Laptop': Laptop, 'Tablet': Tablet, 'Headphones': Headphones, 'Speaker': Speaker,
    'Mic': Mic, 'Video': Video, 'Image': Image, 'File': File, 'Folder': Folder, 'Archive': Archive,
    'Bookmark': Bookmark, 'Tag': Tag, 'Flag': Flag, 'Target': Target, 'Rocket': Rocket, 'Gem': Gem
  };
  return iconMap[iconName] || Settings;
};

export const AdminAppearance = () => {
  const { config, updateColors, updateBranding, updateLayout, updateHeroConfig, updateConfig, isLoading, isMigrating, migrationCompleted } = useAppearance();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { mediaLibrary, refreshMediaLibrary } = useMedia();
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  // Debug de l'état d'authentification
  const storedTokens = localStorage.getItem('auth_tokens');
  let tokenInfo = 'absent';
  let tokenStart = '...';

  if (storedTokens) {
    try {
      const tokens = JSON.parse(storedTokens);
      if (tokens.accessToken) {
        tokenInfo = 'présent';
        tokenStart = tokens.accessToken.substring(0, 20) + '...';
      }
    } catch (error) {
      tokenInfo = 'corrompu';
    }
  }

  const handleHeroImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', 'hero');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_tokens') ? JSON.parse(localStorage.getItem('auth_tokens')!).accessToken : ''}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          updateHeroConfig({
            backgroundType: 'image',
            backgroundImage: result.imageUrl,
            backgroundImageId: result.imageId
          });
          refreshMediaLibrary();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image hero:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement de la configuration...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isMigrating) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Migration de la configuration vers la base de données...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.appearance.title")}</h1>
            <p className="text-muted-foreground">
              {t("admin.appearance.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Debug info */}
        <div className="bg-muted/50 p-4 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Authentification:</strong> {isAuthenticated ? '✅ Connecté' : '❌ Non connecté'}
            </div>
            <div>
              <strong>Utilisateur:</strong> {user?.email || 'Non défini'}
            </div>
            <div>
              <strong>Token:</strong> {tokenInfo} ({tokenStart})
            </div>
            <div>
              <strong>Migration:</strong> {migrationCompleted ? '✅ Terminée' : '⏳ En cours'}
            </div>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">{t("admin.appearance.tabs.colors")}</TabsTrigger>
            <TabsTrigger value="branding">{t("admin.appearance.tabs.branding")}</TabsTrigger>
            <TabsTrigger value="layout">{t("admin.appearance.tabs.layout")}</TabsTrigger>
            <TabsTrigger value="content">{t("admin.appearance.tabs.content")}</TabsTrigger>
            <TabsTrigger value="media">{t("admin.appearance.tabs.media")}</TabsTrigger>
            <TabsTrigger value="carousel">{t("admin.appearance.tabs.carousel")}</TabsTrigger>
          </TabsList>

          {/* Onglet Couleurs */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("admin.appearance.colors.title")}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateColors({
                      primary: '#3b82f6',
                      secondary: '#64748b',
                      accent: '#f59e0b',
                      background: '#ffffff',
                      foreground: '#0f172a',
                      muted: '#f1f5f9',
                      mutedForeground: '#64748b',
                      border: '#e2e8f0',
                      input: '#ffffff',
                      ring: '#3b82f6'
                    })}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t("admin.appearance.colors.reset")}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {t("admin.appearance.colors.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">{t("admin.appearance.colors.primary")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={config.colors.primary}
                        onChange={(e) => updateColors({ primary: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.primary}
                        onChange={(e) => updateColors({ primary: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">{t("admin.appearance.colors.secondary")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={config.colors.secondary}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.secondary}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                        placeholder="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">{t("admin.appearance.colors.accent")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={config.colors.accent}
                        onChange={(e) => updateColors({ accent: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.accent}
                        onChange={(e) => updateColors({ accent: e.target.value })}
                        placeholder="#f59e0b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-color">{t("admin.appearance.colors.background")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={config.colors.background}
                        onChange={(e) => updateColors({ background: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.background}
                        onChange={(e) => updateColors({ background: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foreground-color">{t("admin.appearance.colors.foreground")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="foreground-color"
                        type="color"
                        value={config.colors.foreground}
                        onChange={(e) => updateColors({ foreground: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.foreground}
                        onChange={(e) => updateColors({ foreground: e.target.value })}
                        placeholder="#0f172a"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="muted-color">{t("admin.appearance.colors.muted")}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="muted-color"
                        type="color"
                        value={config.colors.muted}
                        onChange={(e) => updateColors({ muted: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.muted}
                        onChange={(e) => updateColors({ muted: e.target.value })}
                        placeholder="#f1f5f9"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Aperçu des couleurs</h4>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: config.colors.primary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: config.colors.secondary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: config.colors.accent }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: config.colors.background }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: config.colors.foreground }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: config.colors.muted }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Branding */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.appearance.branding.title")}</CardTitle>
                <CardDescription>
                  {t("admin.appearance.branding.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">{t("admin.appearance.branding.companyName")}</Label>
                      <Input
                        id="company-name"
                        value={config.branding.companyName}
                        onChange={(e) => updateBranding({ companyName: e.target.value })}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">{t("admin.appearance.branding.tagline")}</Label>
                      <Input
                        id="tagline"
                        value={config.branding.tagline}
                        onChange={(e) => updateBranding({ tagline: e.target.value })}
                        placeholder="Votre slogan"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{t("admin.appearance.branding.description")}</Label>
                      <Textarea
                        id="description"
                        value={config.branding.description}
                        onChange={(e) => updateBranding({ description: e.target.value })}
                        placeholder="Description de votre entreprise"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("admin.appearance.branding.logo")}</Label>
                      <ImageUpload
                        onImageSelect={(file) => {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            updateBranding({ logoUrl: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }}
                        currentImage={config.branding.logoUrl}
                        placeholder="Télécharger un logo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("admin.appearance.branding.favicon")}</Label>
                      <ImageUpload
                        onImageSelect={(file) => {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            updateBranding({ faviconUrl: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }}
                        currentImage={config.branding.faviconUrl}
                        placeholder="Télécharger un favicon"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Layout */}
          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.appearance.layout.title")}</CardTitle>
                <CardDescription>
                  {t("admin.appearance.layout.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">{t("admin.appearance.layout.borderRadius")}</Label>
                      <Select
                        value={config.layout.borderRadius}
                        onValueChange={(value) => updateLayout({ borderRadius: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rayon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          <SelectItem value="sm">Petit</SelectItem>
                          <SelectItem value="md">Moyen</SelectItem>
                          <SelectItem value="lg">Grand</SelectItem>
                          <SelectItem value="xl">Très grand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spacing">{t("admin.appearance.layout.spacing")}</Label>
                      <Select
                        value={config.layout.spacing}
                        onValueChange={(value) => updateLayout({ spacing: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un espacement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="relaxed">Relaxé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Aperçu du layout</h4>
                      <div 
                        className="p-4 border rounded-lg"
                        style={{ 
                          borderRadius: config.layout.borderRadius === 'none' ? '0px' : 
                                       config.layout.borderRadius === 'sm' ? '4px' :
                                       config.layout.borderRadius === 'md' ? '8px' :
                                       config.layout.borderRadius === 'lg' ? '12px' : '16px',
                          padding: config.layout.spacing === 'compact' ? '8px' :
                                  config.layout.spacing === 'normal' ? '16px' : '24px'
                        }}
                      >
                        <div className="text-sm text-muted-foreground">
                          Exemple de contenu avec les paramètres actuels
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Contenu */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.appearance.content.title")}</CardTitle>
                <CardDescription>
                  {t("admin.appearance.content.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-title">{t("admin.appearance.content.heroTitle")}</Label>
                    <Input
                      id="hero-title"
                      value={config.heroConfig.title}
                      onChange={(e) => updateHeroConfig({ title: e.target.value })}
                      placeholder="Titre principal de votre page d'accueil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">{t("admin.appearance.content.heroSubtitle")}</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={config.heroConfig.subtitle}
                      onChange={(e) => updateHeroConfig({ subtitle: e.target.value })}
                      placeholder="Sous-titre de votre page d'accueil"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-cta">{t("admin.appearance.content.heroCta")}</Label>
                    <Input
                      id="hero-cta"
                      value={config.heroConfig.ctaText}
                      onChange={(e) => updateHeroConfig({ ctaText: e.target.value })}
                      placeholder="Texte du bouton d'action"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type d'arrière-plan</Label>
                    <Select
                      value={config.heroConfig.backgroundType}
                      onValueChange={(value) => {
                        if (value === 'color') {
                          updateHeroConfig({ 
                            backgroundType: value,
                            backgroundImage: '',
                            backgroundImageId: null
                          });
                        } else if (value === 'image') {
                          updateHeroConfig({ 
                            backgroundType: value,
                            // Garder l'image existante si elle existe
                            backgroundImage: config.heroConfig.backgroundImage || '',
                            backgroundImageId: config.heroConfig.backgroundImageId || null
                          });
                        } else {
                          updateHeroConfig({ backgroundType: value as "color" | "image" });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">Couleur</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.heroConfig.backgroundType === 'color' && (
                    <div className="space-y-2">
                      <Label htmlFor="hero-background-color">Couleur d'arrière-plan</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="hero-background-color"
                          type="color"
                          value={config.heroConfig.backgroundColor}
                          onChange={(e) => updateHeroConfig({ backgroundColor: e.target.value })}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.heroConfig.backgroundColor}
                          onChange={(e) => updateHeroConfig({ backgroundColor: e.target.value })}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {config.heroConfig.backgroundType === 'image' && (
                    <div className="space-y-2">
                      <Label>Image d'arrière-plan</Label>
                      <ImageUpload
                        onImageSelect={handleHeroImageUpload}
                        currentImage={config.heroConfig.backgroundImage}
                        placeholder="Télécharger une image d'arrière-plan"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Disposition du contenu</Label>
                    <Select
                      value={config.heroConfig.layout}
                      onValueChange={(value) => updateHeroConfig({ layout: value as "left" | "centered" | "right" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une disposition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="centered">Centré</SelectItem>
                        <SelectItem value="right">Droite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Médias */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.appearance.media.title")}</CardTitle>
                <CardDescription>
                  {t("admin.appearance.media.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Médiathèque</h3>
                    <Button 
                      onClick={() => setIsMediaDialogOpen(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter des médias
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaLibrary.map((media) => (
                      <div key={media.id} className="border rounded-lg p-2">
                        <img 
                          src={media.url} 
                          alt={media.filename}
                          className="w-full h-24 object-cover rounded"
                        />
                        <div className="mt-2 text-sm">
                          <div className="font-medium truncate">{media.filename}</div>
                          <div className="text-muted-foreground text-xs">
                            {media.category} • {new Date(media.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Carrousel */}
          <TabsContent value="carousel">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.appearance.carousel.title")}</CardTitle>
                <CardDescription>
                  {t("admin.appearance.carousel.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Configuration du carrousel</h3>
                    <Button 
                      onClick={() => setIsMediaDialogOpen(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter des images
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Activer le carrousel</Label>
                        <Switch
                          checked={config.carouselConfig.enabled}
                          onCheckedChange={(enabled) => updateConfig({
                            carouselConfig: {
                              ...config.carouselConfig,
                              enabled
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Autoplay</Label>
                        <Switch
                          checked={config.carouselConfig.autoplay}
                          onCheckedChange={(autoplay) => updateConfig({
                            carouselConfig: {
                              ...config.carouselConfig,
                              autoplay
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Afficher les points</Label>
                        <Switch
                          checked={config.carouselConfig.showDots}
                          onCheckedChange={(showDots) => updateConfig({
                            carouselConfig: {
                              ...config.carouselConfig,
                              showDots
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Afficher les flèches</Label>
                        <Switch
                          checked={config.carouselConfig.showArrows}
                          onCheckedChange={(showArrows) => updateConfig({
                            carouselConfig: {
                              ...config.carouselConfig,
                              showArrows
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Aperçu du carrousel</h4>
                      <div className="border rounded-lg p-4 bg-muted/30">
                        <CarouselDisplay 
                          images={config.carouselConfig.images}
                          autoplay={config.carouselConfig.autoplay}
                          showDots={config.carouselConfig.showDots}
                          showArrows={config.carouselConfig.showArrows}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Dialog de médiathèque */}
        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Médiathèque - Images du carrousel</DialogTitle>
              <DialogDescription>
                Sélectionnez les images à utiliser dans le carrousel
              </DialogDescription>
            </DialogHeader>
            <MediaLibrary
              onMediaSelect={(file) => {
                console.log('Image sélectionnée pour le carrousel:', file);
                setIsMediaDialogOpen(false);
              }}
              category="carousel"
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
