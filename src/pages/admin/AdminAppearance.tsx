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
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMedia } from '@/contexts/MediaContext';
import { ImageUpload } from '@/components/ImageUpload';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { UploadedFile } from '@/services/mediaService';

export const AdminAppearance = () => {
  const { toast } = useToast();
  const { config, updateColors, updateBranding, updateLayout, updateHeroConfig, updateConfig } = useAppearance();
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
      tokenInfo = tokens.accessToken ? 'présent' : 'absent';
      tokenStart = tokens.accessToken ? tokens.accessToken.substring(0, 20) + '...' : '...';
    } catch (error) {
      tokenInfo = 'erreur';
    }
  }
  
  console.log('🔍 AdminAppearance - État d\'authentification:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    token: tokenInfo,
    storedTokens: storedTokens ? 'présent' : 'absent'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorKey: string, value: string) => {
    updateColors({ [colorKey]: value });
  };

  const handleBrandingChange = (field: string, value: string) => {
    updateBranding({ [field]: value });
  };

  const handleLayoutChange = (field: string, value: string) => {
    updateLayout({ [field]: value });
  };

  const handleHeroConfigChange = (field: string, value: any) => {
    updateHeroConfig({ [field]: value });
  };

  const handleHeroImageSelect = (file: UploadedFile) => {
    updateHeroConfig({ 
      backgroundImage: file.url,
      backgroundImageId: file.id
    });
  };

  const handleLogoSelect = (file: UploadedFile) => {
    updateBranding({
      logoUrl: file.url,
      logoId: file.id
    });
  };

  const handleFaviconSelect = (file: UploadedFile) => {
    updateBranding({
      faviconUrl: file.url,
      faviconId: file.id
    });
  };

  const saveAppearanceSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: t("admin.appearance.toast.saved"),
        description: t("admin.appearance.toast.savedDesc"),
      });
    } catch (error) {
      toast({
        title: t("admin.appearance.toast.error"),
        description: t("admin.appearance.toast.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    updateColors({
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#2563eb',
      secondary: '#f1f5f9',
      success: '#10b981',
      warning: '#f59e0b',
      destructive: '#ef4444',
    });

    updateBranding({
      companyName: 'SaaS Template',
      logoUrl: '',
      faviconUrl: '',
      heroTitle: 'Transformez votre entreprise avec notre SaaS',
      heroSubtitle: 'Une solution complète et personnalisable pour faire évoluer votre activité',
    });

    updateLayout({
      headerStyle: 'default',
      footerStyle: 'complete',
      sidebarPosition: 'left',
      borderRadius: '0.5rem',
      theme: 'light',
    });

    updateConfig({
      mediaLibraryVisible: true,
      showMediaSections: true
    });

    updateHeroConfig({
      showHero: true,
      backgroundType: 'color' as 'color' | 'image',
      backgroundImage: '',
      backgroundColor: '#3b82f6',
      layout: 'centered' as 'centered' | 'left' | 'right'
    });
    
    toast({
      title: t("admin.appearance.toast.reset"),
      description: t("admin.appearance.toast.resetDesc"),
    });
  };

  const previewChanges = () => {
    setPreviewMode(!previewMode);
    toast({
      title: previewMode ? t("admin.appearance.toast.normal") : t("admin.appearance.toast.preview"),
      description: previewMode ? t("admin.appearance.toast.normalDesc") : t("admin.appearance.toast.previewDesc"),
    });
  };

  const copyColorPalette = () => {
    const colorData = JSON.stringify(config.colors, null, 2);
    navigator.clipboard.writeText(colorData);
    toast({
      title: t("admin.appearance.toast.copied"),
      description: t("admin.appearance.toast.copiedDesc"),
    });
  };

  const exportSettings = () => {
    const settings = {
      config,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appearance-settings.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("admin.appearance.toast.exported"),
      description: t("admin.appearance.toast.exportedDesc"),
    });
  };


  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="h-6 w-6" />
              {t("admin.appearance.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.appearance.subtitle")}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={previewChanges}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? t("admin.appearance.edit") : t("admin.appearance.preview")}
            </Button>
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              {t("admin.appearance.export")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("admin.appearance.reset")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("admin.appearance.reset.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("admin.appearance.reset.desc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={resetToDefaults}>
                    {t("admin.appearance.reset")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={saveAppearanceSettings} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? t("admin.appearance.saving") : t("common.save")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-4">
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
                  <span>{t("admin.appearance.colors.title")}</span>
                  <Button variant="outline" size="sm" onClick={copyColorPalette}>
                    <Copy className="h-4 w-4 mr-2" />
                    {t("admin.appearance.colors.copy")}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("admin.appearance.colors.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(config.colors).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{t(`admin.appearance.colors.${key}`) || key.replace(/([A-Z])/g, ' $1')}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Marque */}
          <TabsContent value="branding">
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    {t("admin.appearance.branding.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("admin.appearance.branding.subtitle")}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Configuration en 2 colonnes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche - Informations de base */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Informations de base
                      </CardTitle>
                      <CardDescription>
                        Configurez le nom et les éléments textuels de votre marque
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-medium">
                          {t("admin.appearance.branding.companyName")}
                        </Label>
                        <Input
                          id="companyName"
                          value={config.branding.companyName}
                          onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                          placeholder="Mon Entreprise SaaS"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Ce nom apparaîtra dans l'en-tête et le pied de page
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Logo principal
                      </CardTitle>
                      <CardDescription>
                        Logo affiché dans l'en-tête de votre site
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImageUpload
                        category="logo"
                        onImageSelect={handleLogoSelect}
                        selectedImageId={config.branding.logoId}
                        showPreview={true}
                        maxFiles={1}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Colonne droite - Éléments visuels */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Favicon
                      </CardTitle>
                      <CardDescription>
                        Icône affichée dans l'onglet du navigateur
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImageUpload
                        category="favicon"
                        onImageSelect={handleFaviconSelect}
                        selectedImageId={config.branding.faviconId}
                        showPreview={true}
                        maxFiles={1}
                      />
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <strong>Conseil :</strong> Utilisez une image carrée (16x16, 32x32 ou 64x64 pixels) 
                          pour un rendu optimal dans tous les navigateurs.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        Aperçu de la marque
                      </CardTitle>
                      <CardDescription>
                        Visualisez comment votre marque apparaît
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Aperçu en-tête */}
                        <div className="border rounded-lg p-4 bg-background">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {config.branding.logoUrl && (
                                <img 
                                  src={config.branding.logoUrl} 
                                  alt="Logo" 
                                  className="h-8 w-auto"
                                />
                              )}
                              <span className="font-semibold text-sm">
                                {config.branding.companyName || "Nom de l'entreprise"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              En-tête
                            </div>
                          </div>
                        </div>

                        {/* Aperçu onglet navigateur */}
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center gap-2">
                            {config.branding.faviconUrl && (
                              <img 
                                src={config.branding.faviconUrl} 
                                alt="Favicon" 
                                className="h-4 w-4"
                              />
                            )}
                            <span className="text-xs">
                              {config.branding.companyName || "Mon Entreprise SaaS"} - Page d'accueil
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Onglet du navigateur
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Actions en bas */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Les modifications sont sauvegardées automatiquement
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {previewMode ? "Masquer" : "Aperçu"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Actualiser
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Mise en page */}
          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  {t("admin.appearance.layout.title")}
                </CardTitle>
                <CardDescription>
                  {t("admin.appearance.layout.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("admin.appearance.layout.headerStyle")}</Label>
                      <Select value={config.layout.headerStyle} onValueChange={(value) => handleLayoutChange('headerStyle', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">{t("admin.appearance.layout.default")}</SelectItem>
                          <SelectItem value="transparent">{t("admin.appearance.layout.transparent")}</SelectItem>
                          <SelectItem value="colored">{t("admin.appearance.layout.colored")}</SelectItem>
                          <SelectItem value="minimal">{t("admin.appearance.layout.minimal")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("admin.appearance.layout.footerStyle")}</Label>
                      <Select value={config.layout.footerStyle} onValueChange={(value) => handleLayoutChange('footerStyle', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="complete">{t("admin.appearance.layout.complete")}</SelectItem>
                          <SelectItem value="minimal">{t("admin.appearance.layout.minimal")}</SelectItem>
                          <SelectItem value="hidden">{t("admin.appearance.layout.hidden")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("admin.appearance.layout.theme")}</Label>
                      <Select value={config.layout.theme} onValueChange={(value) => handleLayoutChange('theme', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">{t("admin.appearance.layout.light")}</SelectItem>
                          <SelectItem value="dark">{t("admin.appearance.layout.dark")}</SelectItem>
                          <SelectItem value="system">{t("admin.appearance.layout.system")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("admin.appearance.layout.sidebarPosition")}</Label>
                      <Select value={config.layout.sidebarPosition} onValueChange={(value) => handleLayoutChange('sidebarPosition', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">{t("admin.appearance.layout.left")}</SelectItem>
                          <SelectItem value="right">{t("admin.appearance.layout.right")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("admin.appearance.layout.borderRadius")}</Label>
                      <Select value={config.layout.borderRadius} onValueChange={(value) => handleLayoutChange('borderRadius', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Aucun (0px)</SelectItem>
                          <SelectItem value="0.125rem">Petit (2px)</SelectItem>
                          <SelectItem value="0.25rem">Normal (4px)</SelectItem>
                          <SelectItem value="0.5rem">Moyen (8px)</SelectItem>
                          <SelectItem value="0.75rem">Grand (12px)</SelectItem>
                          <SelectItem value="1rem">Très grand (16px)</SelectItem>
                          <SelectItem value="9999px">Rond complet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Médias */}
          <TabsContent value="media">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      {t("admin.appearance.media.title")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateConfig({ mediaLibraryVisible: !config.mediaLibraryVisible })}
                      >
                        {config.mediaLibraryVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {config.mediaLibraryVisible ? t("admin.appearance.media.hide") : t("admin.appearance.media.show")}
                      </Button>
                      <Button onClick={() => setIsMediaDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        {t("admin.appearance.media.add")}
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {t("admin.appearance.media.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!config.mediaLibraryVisible ? (
                    <div className="text-center py-8">
                      <EyeOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("admin.appearance.media.hidden")}</p>
                      <p className="text-sm text-muted-foreground">{t("admin.appearance.media.hiddenDesc")}</p>
                    </div>
                  ) : (
                    <MediaLibrary 
                      showUploadButton={false}
                      category="all"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Contrôle visibilité sections médias */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.appearance.media.sectionsTitle")}</CardTitle>
                  <CardDescription>
                    {t("admin.appearance.media.sectionsDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="media-sections">{t("admin.appearance.media.sectionsShow")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.appearance.media.sectionsInclude")}
                      </p>
                    </div>
                    <Switch
                      id="media-sections"
                      checked={config.showMediaSections}
                      onCheckedChange={(checked) => updateConfig({ showMediaSections: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Carrousels */}
          <TabsContent value="carousel">
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    {t("admin.appearance.carousel.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("admin.appearance.carousel.subtitle")}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Configuration en 2 colonnes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche - Paramètres du carrousel */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Paramètres du carrousel
                      </CardTitle>
                      <CardDescription>
                        Configurez le comportement et l'apparence du carrousel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.autoplay")}</Label>
                        <Switch
                          checked={config.carouselConfig?.autoplay || false}
                          onCheckedChange={(checked) => updateConfig({ carouselConfig: { ...config.carouselConfig, autoplay: checked } })}
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("admin.appearance.carousel.autoplayDesc")}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.interval")}</Label>
                        <Input
                          type="number"
                          value={config.carouselConfig?.interval || 3000}
                          onChange={(e) => updateConfig({ carouselConfig: { ...config.carouselConfig, interval: parseInt(e.target.value) } })}
                          min="1000"
                          max="10000"
                          step="500"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("admin.appearance.carousel.intervalDesc")}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.showArrows")}</Label>
                        <Switch
                          checked={config.carouselConfig?.showArrows !== false}
                          onCheckedChange={(checked) => updateConfig({ carouselConfig: { ...config.carouselConfig, showArrows: checked } })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Afficher les flèches de navigation
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Options d'affichage
                      </CardTitle>
                      <CardDescription>
                        Personnalisez l'apparence du carrousel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.showDots")}</Label>
                        <Switch
                          checked={config.carouselConfig?.showDots !== false}
                          onCheckedChange={(checked) => updateConfig({ carouselConfig: { ...config.carouselConfig, showDots: checked } })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Afficher les points de navigation
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.height")}</Label>
                        <Select 
                          value={config.carouselConfig?.height || "400px"} 
                          onValueChange={(value) => updateConfig({ carouselConfig: { ...config.carouselConfig, height: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="300px">{t("admin.appearance.carousel.small")}</SelectItem>
                            <SelectItem value="400px">{t("admin.appearance.carousel.medium")}</SelectItem>
                            <SelectItem value="500px">{t("admin.appearance.carousel.large")}</SelectItem>
                            <SelectItem value="600px">{t("admin.appearance.carousel.xlarge")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.borderStyle")}</Label>
                        <Select 
                          value={config.carouselConfig?.borderRadius || "0.5rem"} 
                          onValueChange={(value) => updateConfig({ carouselConfig: { ...config.carouselConfig, borderRadius: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">{t("admin.appearance.carousel.noRadius")}</SelectItem>
                            <SelectItem value="0.25rem">{t("admin.appearance.carousel.lightRadius")}</SelectItem>
                            <SelectItem value="0.5rem">{t("admin.appearance.carousel.normalRadius")}</SelectItem>
                            <SelectItem value="1rem">{t("admin.appearance.carousel.strongRadius")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Colonne droite - Gestion des images */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Images du carrousel
                      </CardTitle>
                      <CardDescription>
                        Gérez les images affichées dans le carrousel
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Utilisez la médiathèque pour ajouter des images
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => refreshMediaLibrary()}
                              variant="outline"
                              size="sm"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Actualiser
                            </Button>
                            <Button 
                              onClick={() => setIsMediaDialogOpen(true)}
                              variant="outline"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Ouvrir la médiathèque
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                          <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Les images du carrousel proviennent de la médiathèque
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Catégorie recommandée : "carousel" ou "general"
                          </p>
                        </div>

                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            <strong>Conseil :</strong> Le carrousel utilise automatiquement les images 
                            de la médiathèque. Assurez-vous d'avoir des images dans la catégorie appropriée.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Aperçu du carrousel
                      </CardTitle>
                      <CardDescription>
                        Visualisez le carrousel avec les paramètres actuels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="text-center">
                            {/* Aperçu du carrousel avec vraies images */}
                            <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden mb-3">
                              {mediaLibrary && mediaLibrary.length > 0 ? (
                                <div className="relative w-full h-full">
                                  {/* Image principale */}
                                  <img
                                    src={mediaLibrary[0].url}
                                    alt={mediaLibrary[0].name}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                  />
                                  
                                  {/* Overlay avec informations */}
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="text-white text-center">
                                      <div className="text-xs font-medium">
                                        {mediaLibrary.length} image{mediaLibrary.length > 1 ? 's' : ''}
                                      </div>
                                      <div className="text-xs opacity-75">
                                        Carrousel
                                      </div>
                                    </div>
                                  </div>

                                  {/* Indicateurs de navigation */}
                                  {config.carouselConfig?.showDots !== false && (
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                      {mediaLibrary.slice(0, 3).map((_, index) => (
                                        <div
                                          key={index}
                                          className={`w-2 h-2 rounded-full ${
                                            index === 0 ? 'bg-white' : 'bg-white/50'
                                          }`}
                                        />
                                      ))}
                                      {mediaLibrary.length > 3 && (
                                        <div className="w-2 h-2 rounded-full bg-white/30 flex items-center justify-center">
                                          <span className="text-xs text-white">+</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Flèches de navigation */}
                                  {config.carouselConfig?.showArrows !== false && (
                                    <>
                                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">‹</span>
                                      </div>
                                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">›</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs text-muted-foreground">
                                      Aucune image disponible
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              Aperçu du carrousel
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>Images disponibles :</strong> {mediaLibrary?.length || 0}</p>
                          <p><strong>Autoplay :</strong> {config.carouselConfig?.autoplay ? 'Activé' : 'Désactivé'}</p>
                          <p><strong>Intervalle :</strong> {config.carouselConfig?.interval || 3000}ms</p>
                          <p><strong>Points :</strong> {config.carouselConfig?.showDots !== false ? 'Affichés' : 'Masqués'}</p>
                          <p><strong>Flèches :</strong> {config.carouselConfig?.showArrows !== false ? 'Affichées' : 'Masquées'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

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
          </TabsContent>

          {/* Onglet Contenu */}
          <TabsContent value="content">
            <div className="space-y-6">
              {/* Configuration Hero */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t("admin.appearance.content.heroTitle")}
                      </span>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="hero-toggle">{t("admin.appearance.content.showHero")}</Label>
                      <Switch
                        id="hero-toggle"
                        checked={config.heroConfig.showHero}
                        onCheckedChange={(checked) => handleHeroConfigChange('showHero', checked)}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {t("admin.appearance.content.heroDesc")}
                  </CardDescription>
                </CardHeader>
                
                {config.heroConfig.showHero && (
                  <CardContent className="space-y-6">
                    {/* Arrière-plan */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">{t("admin.appearance.content.background")}</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="bg-color"
                            name="backgroundType"
                            value="color"
                            checked={config.heroConfig.backgroundType === 'color'}
                            onChange={(e) => handleHeroConfigChange('backgroundType', e.target.value)}
                          />
                          <Label htmlFor="bg-color">{t("admin.appearance.content.colorBackground")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="bg-image"
                            name="backgroundType"
                            value="image"
                            checked={config.heroConfig.backgroundType === 'image'}
                            onChange={(e) => handleHeroConfigChange('backgroundType', e.target.value)}
                          />
                          <Label htmlFor="bg-image">{t("admin.appearance.content.imageBackground")}</Label>
                        </div>
                      </div>

                      {config.heroConfig.backgroundType === 'color' && (
                        <div className="space-y-2">
                          <Label>{t("admin.appearance.content.backgroundColor")}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={config.heroConfig.backgroundColor}
                              onChange={(e) => handleHeroConfigChange('backgroundColor', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              value={config.heroConfig.backgroundColor}
                              onChange={(e) => handleHeroConfigChange('backgroundColor', e.target.value)}
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>
                      )}

                      {config.heroConfig.backgroundType === 'image' && (
                        <div className="space-y-4">
                          <Label>{t("admin.appearance.content.backgroundImage")}</Label>
                          <ImageUpload
                            category="hero"
                            onImageSelect={handleHeroImageSelect}
                            selectedImageId={config.heroConfig.backgroundImageId}
                            showPreview={true}
                            maxFiles={1}
                          />
                        </div>
                      )}
                    </div>

                    {/* Contenu textuel */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("admin.appearance.content.heroTitleField")}</Label>
                        <Input
                          value={config.branding.heroTitle}
                          onChange={(e) => handleBrandingChange('heroTitle', e.target.value)}
                          placeholder="Transformez votre entreprise..."
                          maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          {config.branding.heroTitle.length}/100 caractères
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Sous-titre (Hero)</Label>
                        <Textarea
                          value={config.branding.heroSubtitle}
                          onChange={(e) => handleBrandingChange('heroSubtitle', e.target.value)}
                          placeholder="Une solution complète et personnalisable..."
                          maxLength={200}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          {config.branding.heroSubtitle.length}/200 caractères
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Aperçu Hero */}
              {config.heroConfig.showHero && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aperçu de la section Hero</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-6 relative overflow-hidden text-center" 
                      style={{ 
                        backgroundColor: config.heroConfig.backgroundType === 'color' ? config.heroConfig.backgroundColor : undefined,
                        backgroundImage: config.heroConfig.backgroundType === 'image' && config.heroConfig.backgroundImage ? `url(${config.heroConfig.backgroundImage})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: config.layout.borderRadius
                      }}
                    >
                      {config.heroConfig.backgroundType === 'image' && config.heroConfig.backgroundImage && (
                        <div className="absolute inset-0 bg-black/40"></div>
                      )}
                      <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-3">
                          {config.branding.heroTitle || "Votre titre apparaîtra ici"}
                        </h2>
                        <p className="text-white/90 mb-4">
                          {config.branding.heroSubtitle || "Votre sous-titre apparaîtra ici"}
                        </p>
                        <button 
                          className="px-6 py-2 bg-white text-sm font-medium hover:bg-white/90 transition-colors"
                          style={{ 
                            color: config.heroConfig.backgroundColor,
                            borderRadius: config.layout.borderRadius
                          }}
                        >
                          Commencer maintenant
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog pour upload de médias */}
        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Médiathèque - Ajouter des médias</DialogTitle>
              <DialogDescription>
                Gérez votre médiathèque et uploadez de nouveaux médias
              </DialogDescription>
            </DialogHeader>
            <MediaLibrary 
              showUploadButton={true}
              category="all"
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};