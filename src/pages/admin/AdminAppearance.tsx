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

export const AdminAppearance = () => {
  const { toast } = useToast();
  const { config, updateColors, updateBranding, updateLayout, updateHeroConfig, updateConfig } = useAppearance();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  // États locaux pour la médiathèque (temporaire pour démo)
  const [mediaLibrary, setMediaLibrary] = useState([
    {
      id: '1',
      name: 'hero-image.jpg',
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      type: 'image' as const,
      size: 245678,
      uploadDate: '2024-01-20'
    },
    {
      id: '2', 
      name: 'feature-1.jpg',
      url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
      type: 'image' as const,
      size: 156789,
      uploadDate: '2024-01-19'
    }
  ]);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.appearance.branding.title")}</CardTitle>
                <CardDescription>
                  {t("admin.appearance.branding.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("admin.appearance.branding.companyName")}</Label>
                  <Input
                    value={config.branding.companyName}
                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                    placeholder="Mon Entreprise SaaS"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.appearance.branding.logo")}</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          handleBrandingChange('logoUrl', url);
                        }
                      }}
                    />
                    {config.branding.logoUrl && (
                      <div className="flex items-center gap-2 p-2 border rounded-md">
                        <img 
                          src={config.branding.logoUrl} 
                          alt="Logo preview" 
                          className="w-8 h-8 object-contain"
                        />
                        <span className="text-sm text-muted-foreground">{t("admin.appearance.branding.logoPreview")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.appearance.branding.favicon")}</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          handleBrandingChange('faviconUrl', url);
                        }
                      }}
                    />
                    {config.branding.faviconUrl && (
                      <div className="flex items-center gap-2 p-2 border rounded-md">
                        <img 
                          src={config.branding.faviconUrl} 
                          alt="Favicon preview" 
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-sm text-muted-foreground">{t("admin.appearance.branding.faviconPreview")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaLibrary.map((media) => (
                        <div key={media.id} className="group relative">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium truncate">{media.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(media.size)} • {new Date(media.uploadDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {mediaLibrary.length === 0 && config.mediaLibraryVisible && (
                    <div className="text-center py-12">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("admin.appearance.media.empty")}</p>
                      <Button className="mt-4" onClick={() => setIsMediaDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        {t("admin.appearance.media.addFirst")}
                      </Button>
                    </div>
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
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.appearance.carousel.title")}</CardTitle>
                  <CardDescription>
                    {t("admin.appearance.carousel.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("admin.appearance.carousel.showDots")}</Label>
                        <Switch
                          checked={config.carouselConfig?.showDots !== false}
                          onCheckedChange={(checked) => updateConfig({ carouselConfig: { ...config.carouselConfig, showDots: checked } })}
                        />
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.appearance.carousel.imagesTitle")}</CardTitle>
                  <CardDescription>
                    {t("admin.appearance.carousel.imagesDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {(config.carouselConfig?.images || []).length} {t("admin.appearance.carousel.imagesCount")}
                      </p>
                      <Button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = Array.from((e.target as HTMLInputElement).files || []);
                            const newImages = files.map(file => ({
                              id: Math.random().toString(36).substr(2, 9),
                              url: URL.createObjectURL(file),
                              alt: file.name.split('.')[0]
                            }));
                            const currentImages = config.carouselConfig?.images || [];
                            updateConfig({ 
                              carouselConfig: { 
                                ...config.carouselConfig, 
                                images: [...currentImages, ...newImages] 
                              } 
                            });
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t("admin.appearance.carousel.addImages")}
                      </Button>
                    </div>

                    {(config.carouselConfig?.images || []).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(config.carouselConfig?.images || []).map((image: any, index: number) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const currentImages = config.carouselConfig?.images || [];
                                const newImages = currentImages.filter((_: any, i: number) => i !== index);
                                updateConfig({ 
                                  carouselConfig: { 
                                    ...config.carouselConfig, 
                                    images: newImages 
                                  } 
                                });
                              }}
                            >
                              ×
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {image.alt}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {t("admin.appearance.carousel.noImages")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                        <div className="space-y-2">
                          <Label>{t("admin.appearance.content.backgroundImage")}</Label>
                          <Input
                            value={config.heroConfig.backgroundImage}
                            onChange={(e) => handleHeroConfigChange('backgroundImage', e.target.value)}
                            placeholder="https://exemple.com/image.jpg"
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>{t("admin.appearance.upload.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.appearance.upload.desc")}
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t("admin.appearance.upload.development")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("admin.appearance.upload.future")}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};