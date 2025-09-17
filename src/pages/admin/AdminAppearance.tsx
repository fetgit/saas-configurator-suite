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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, RotateCcw, Plus, Palette, Shield, Globe, Database, Users, Zap, BarChart3, Settings, Edit, CheckCircle } from 'lucide-react';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMedia } from '@/contexts/MediaContext';
import { ImageUpload } from '@/components/ImageUpload';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

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

  const handleHeroImageUpload = (file: any) => {
    updateHeroConfig({
      backgroundType: 'image',
      backgroundImage: file.url,
      backgroundImageId: file.id
    });
    refreshMediaLibrary();
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="colors">{t("admin.appearance.tabs.colors")}</TabsTrigger>
            <TabsTrigger value="branding">{t("admin.appearance.tabs.branding")}</TabsTrigger>
            <TabsTrigger value="layout">{t("admin.appearance.tabs.layout")}</TabsTrigger>
            <TabsTrigger value="content">{t("admin.appearance.tabs.content")}</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="cta">CTA Homepage</TabsTrigger>
            <TabsTrigger value="media">{t("admin.appearance.tabs.media")}</TabsTrigger>
          </TabsList>

          {/* Onglet Couleurs */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t("admin.appearance.colors.title")}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateColors({
                        primary: '#3b82f6',
                        primaryLight: '#60a5fa',
                        primaryDark: '#1d4ed8',
                        secondary: '#64748b',
                        success: '#10b981',
                        warning: '#f59e0b',
                        destructive: '#ef4444'
                      })}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t("admin.appearance.colors.reset")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateColors({
                        primary: '#8b5cf6',
                        primaryLight: '#a78bfa',
                        primaryDark: '#7c3aed',
                        secondary: '#64748b',
                        success: '#10b981',
                        warning: '#f59e0b',
                        destructive: '#ef4444'
                      })}>
                        <Palette className="h-4 w-4 mr-2" />
                        Violet
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateColors({
                        primary: '#06b6d4',
                        primaryLight: '#22d3ee',
                        primaryDark: '#0891b2',
                        secondary: '#64748b',
                        success: '#10b981',
                        warning: '#f59e0b',
                        destructive: '#ef4444'
                      })}>
                        <Palette className="h-4 w-4 mr-2" />
                        Cyan
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateColors({
                        primary: '#f59e0b',
                        primaryLight: '#fbbf24',
                        primaryDark: '#d97706',
                        secondary: '#64748b',
                        success: '#10b981',
                        warning: '#f59e0b',
                        destructive: '#ef4444'
                      })}>
                        <Palette className="h-4 w-4 mr-2" />
                        Orange
                      </Button>
                    </div>
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
                    <Label htmlFor="success-color">Couleur de succès</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="success-color"
                        type="color"
                        value={config.colors.success}
                        onChange={(e) => updateColors({ success: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.success}
                        onChange={(e) => updateColors({ success: e.target.value })}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warning-color">Couleur d'avertissement</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="warning-color"
                        type="color"
                        value={config.colors.warning}
                        onChange={(e) => updateColors({ warning: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.warning}
                        onChange={(e) => updateColors({ warning: e.target.value })}
                        placeholder="#f59e0b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destructive-color">Couleur destructive</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="destructive-color"
                        type="color"
                        value={config.colors.destructive}
                        onChange={(e) => updateColors({ destructive: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.destructive}
                        onChange={(e) => updateColors({ destructive: e.target.value })}
                        placeholder="#ef4444"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-light-color">Couleur primaire claire</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary-light-color"
                        type="color"
                        value={config.colors.primaryLight}
                        onChange={(e) => updateColors({ primaryLight: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.primaryLight}
                        onChange={(e) => updateColors({ primaryLight: e.target.value })}
                        placeholder="#60a5fa"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-dark-color">Couleur primaire foncée</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary-dark-color"
                        type="color"
                        value={config.colors.primaryDark}
                        onChange={(e) => updateColors({ primaryDark: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={config.colors.primaryDark}
                        onChange={(e) => updateColors({ primaryDark: e.target.value })}
                        placeholder="#1d4ed8"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Aperçu des couleurs</h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.primary }}
                        title="Couleur primaire"
                      />
                      <span className="text-xs text-muted-foreground">Primaire</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.primaryLight }}
                        title="Couleur primaire claire"
                      />
                      <span className="text-xs text-muted-foreground">Primaire claire</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.primaryDark }}
                        title="Couleur primaire foncée"
                      />
                      <span className="text-xs text-muted-foreground">Primaire foncée</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.secondary }}
                        title="Couleur secondaire"
                      />
                      <span className="text-xs text-muted-foreground">Secondaire</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.success }}
                        title="Couleur de succès"
                      />
                      <span className="text-xs text-muted-foreground">Succès</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.warning }}
                        title="Couleur d'avertissement"
                      />
                      <span className="text-xs text-muted-foreground">Avertissement</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: config.colors.destructive }}
                        title="Couleur destructive"
                      />
                      <span className="text-xs text-muted-foreground">Destructive</span>
                    </div>
                  </div>
                </div>

                {/* Aperçu avancé */}
                <div className="p-6 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-4">Aperçu avancé</h4>
                  <div className="space-y-4">
                    {/* Gradient primaire */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Gradient primaire (utilisé dans les CTA)</h5>
                      <div 
                        className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ 
                          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`
                        }}
                      >
                        Exemple de gradient
                      </div>
                    </div>

                    {/* Boutons d'exemple */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Boutons d'exemple</h5>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          style={{ 
                            backgroundColor: config.colors.primary,
                            color: 'white'
                          }}
                        >
                          Bouton primaire
                        </Button>
                        <Button 
                          variant="outline"
                          style={{ 
                            borderColor: config.colors.primary,
                            color: config.colors.primary
                          }}
                        >
                          Bouton secondaire
                        </Button>
                        <Button 
                          style={{ 
                            backgroundColor: config.colors.success,
                            color: 'white'
                          }}
                        >
                          Succès
                        </Button>
                        <Button 
                          style={{ 
                            backgroundColor: config.colors.warning,
                            color: 'white'
                          }}
                        >
                          Avertissement
                        </Button>
                        <Button 
                          style={{ 
                            backgroundColor: config.colors.destructive,
                            color: 'white'
                          }}
                        >
                          Destructive
                        </Button>
                      </div>
                    </div>

                    {/* Icônes d'exemple */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Icônes d'exemple</h5>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: config.colors.primary + '1A',
                            color: config.colors.primary
                          }}
                        >
                          <Shield className="h-5 w-5" />
                        </div>
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: config.colors.success + '1A',
                            color: config.colors.success
                          }}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: config.colors.warning + '1A',
                            color: config.colors.warning
                          }}
                        >
                          <Zap className="h-5 w-5" />
                        </div>
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: config.colors.destructive + '1A',
                            color: config.colors.destructive
                          }}
                        >
                          <Settings className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
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
                      <Label htmlFor="hero-title">Titre de la page d'accueil</Label>
                      <Input
                        id="hero-title"
                        value={config.branding.heroTitle}
                        onChange={(e) => updateBranding({ heroTitle: e.target.value })}
                        placeholder="Titre principal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle">Sous-titre de la page d'accueil</Label>
                      <Textarea
                        id="hero-subtitle"
                        value={config.branding.heroSubtitle}
                        onChange={(e) => updateBranding({ heroSubtitle: e.target.value })}
                        placeholder="Sous-titre principal"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("admin.appearance.branding.logo")}</Label>
                      <ImageUpload
                        onImageSelect={(file) => {
                          updateBranding({ logoUrl: file.url });
                        }}
                        category="logo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("admin.appearance.branding.favicon")}</Label>
                      <ImageUpload
                        onImageSelect={(file) => {
                          updateBranding({ faviconUrl: file.url });
                        }}
                        category="favicon"
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
                      <Label htmlFor="theme">Thème</Label>
                      <Select
                        value={config.layout.theme}
                        onValueChange={(value) => updateLayout({ theme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un thème" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="auto">Automatique</SelectItem>
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
                                       config.layout.borderRadius === 'lg' ? '12px' : '16px'
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
                        category="hero"
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

          {/* Onglet Fonctionnalités */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Fonctionnalités</CardTitle>
                <CardDescription>
                  Personnalisez la section "Fonctionnalités puissantes" de votre homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contrôle de visibilité */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Afficher la section Fonctionnalités</h3>
                    <p className="text-sm text-muted-foreground">
                      Contrôlez si la section "Fonctionnalités puissantes" apparaît sur la homepage
                    </p>
                  </div>
                  <Switch
                    checked={config.featuresConfig?.showFeaturesSection !== false}
                    onCheckedChange={(show) => updateConfig({
                      featuresConfig: {
                        ...config.featuresConfig,
                        showFeaturesSection: show
                      }
                    })}
                  />
                </div>

                {/* Titre et description principaux */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="features-title">Titre principal</Label>
                    <Input
                      id="features-title"
                      value={config.featuresConfig?.title || "Fonctionnalités puissantes"}
                      onChange={(e) => updateConfig({ 
                        featuresConfig: { 
                          ...config.featuresConfig, 
                          title: e.target.value 
                        } 
                      })}
                      placeholder="Titre de la section fonctionnalités"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="features-description">Description</Label>
                    <Textarea
                      id="features-description"
                      value={config.featuresConfig?.description || "Découvrez toutes les fonctionnalités qui font de notre SaaS la solution parfaite pour votre entreprise."}
                      onChange={(e) => updateConfig({ 
                        featuresConfig: { 
                          ...config.featuresConfig, 
                          description: e.target.value 
                        } 
                      })}
                      placeholder="Description de la section fonctionnalités"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Configuration des fonctionnalités individuelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fonctionnalités individuelles</h3>
                  
                  {Object.entries(config.featuresConfig?.features || {}).map(([key, feature]) => {
                    const getIcon = (iconName: string) => {
                      const iconMap: { [key: string]: React.ReactNode } = {
                        'Palette': <Palette className="h-4 w-4" />,
                        'Shield': <Shield className="h-4 w-4" />,
                        'Globe': <Globe className="h-4 w-4" />,
                        'Database': <Database className="h-4 w-4" />,
                        'Users': <Users className="h-4 w-4" />,
                        'Zap': <Zap className="h-4 w-4" />,
                        'BarChart3': <BarChart3 className="h-4 w-4" />,
                        'Settings': <Settings className="h-4 w-4" />
                      };
                      return iconMap[iconName] || <Settings className="h-4 w-4" />;
                    };

                    return (
                      <Card key={key} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getIcon(feature.icon)}
                              <h4 className="font-medium">{feature.title}</h4>
                            </div>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={(enabled) => updateConfig({
                                featuresConfig: {
                                  ...config.featuresConfig,
                                  features: {
                                    ...config.featuresConfig?.features,
                                    [key]: { ...feature, enabled }
                                  }
                                }
                              })}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`feature-title-${key}`}>Titre</Label>
                              <Input
                                id={`feature-title-${key}`}
                                value={feature.title}
                                onChange={(e) => updateConfig({
                                  featuresConfig: {
                                    ...config.featuresConfig,
                                    features: {
                                      ...config.featuresConfig?.features,
                                      [key]: { ...feature, title: e.target.value }
                                    }
                                  }
                                })}
                                placeholder="Titre de la fonctionnalité"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`feature-icon-${key}`}>Icône</Label>
                              <Select
                                value={feature.icon}
                                onValueChange={(icon) => updateConfig({
                                  featuresConfig: {
                                    ...config.featuresConfig,
                                    features: {
                                      ...config.featuresConfig?.features,
                                      [key]: { ...feature, icon }
                                    }
                                  }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Palette">Palette</SelectItem>
                                  <SelectItem value="Shield">Shield</SelectItem>
                                  <SelectItem value="Globe">Globe</SelectItem>
                                  <SelectItem value="Database">Database</SelectItem>
                                  <SelectItem value="Users">Users</SelectItem>
                                  <SelectItem value="Zap">Zap</SelectItem>
                                  <SelectItem value="BarChart3">BarChart3</SelectItem>
                                  <SelectItem value="Settings">Settings</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`feature-description-${key}`}>Description</Label>
                            <Textarea
                              id={`feature-description-${key}`}
                              value={feature.description}
                              onChange={(e) => updateConfig({
                                featuresConfig: {
                                  ...config.featuresConfig,
                                  features: {
                                    ...config.featuresConfig?.features,
                                    [key]: { ...feature, description: e.target.value }
                                  }
                                }
                              })}
                              placeholder="Description de la fonctionnalité"
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet CTA Homepage */}
          <TabsContent value="cta">
            <Card>
              <CardHeader>
                <CardTitle>Configuration CTA Homepage</CardTitle>
                <CardDescription>
                  Personnalisez la section d'appel à l'action finale de votre homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contrôle de visibilité */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Afficher la section CTA</h3>
                    <p className="text-sm text-muted-foreground">
                      Contrôlez si la section d'appel à l'action finale apparaît sur la homepage
                    </p>
                  </div>
                  <Switch
                    checked={config.homepageCTA?.showCTASection !== false}
                    onCheckedChange={(show) => updateConfig({
                      homepageCTA: {
                        ...config.homepageCTA,
                        showCTASection: show
                      }
                    })}
                  />
                </div>

                {/* Configuration du contenu */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-title">Titre</Label>
                    <Input
                      id="cta-title"
                      value={config.homepageCTA?.title || "Prêt à transformer votre entreprise ?"}
                      onChange={(e) => updateConfig({
                        homepageCTA: {
                          ...config.homepageCTA,
                          title: e.target.value
                        }
                      })}
                      placeholder="Titre de la section CTA"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cta-description">Description</Label>
                    <Textarea
                      id="cta-description"
                      value={config.homepageCTA?.description || "Rejoignez des milliers d'entreprises qui font déjà confiance à notre solution SaaS."}
                      onChange={(e) => updateConfig({
                        homepageCTA: {
                          ...config.homepageCTA,
                          description: e.target.value
                        }
                      })}
                      placeholder="Description de la section CTA"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-primary-text">Texte du bouton principal</Label>
                      <Input
                        id="cta-primary-text"
                        value={config.homepageCTA?.primaryButtonText || "Commencer gratuitement"}
                        onChange={(e) => updateConfig({
                          homepageCTA: {
                            ...config.homepageCTA,
                            primaryButtonText: e.target.value
                          }
                        })}
                        placeholder="Texte du bouton principal"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cta-primary-link">Lien du bouton principal</Label>
                      <Input
                        id="cta-primary-link"
                        value={config.homepageCTA?.primaryButtonLink || "/register"}
                        onChange={(e) => updateConfig({
                          homepageCTA: {
                            ...config.homepageCTA,
                            primaryButtonLink: e.target.value
                          }
                        })}
                        placeholder="/register"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-secondary-text">Texte du bouton secondaire (optionnel)</Label>
                      <Input
                        id="cta-secondary-text"
                        value={config.homepageCTA?.secondaryButtonText || "Nous contacter"}
                        onChange={(e) => updateConfig({
                          homepageCTA: {
                            ...config.homepageCTA,
                            secondaryButtonText: e.target.value
                          }
                        })}
                        placeholder="Texte du bouton secondaire"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cta-secondary-link">Lien du bouton secondaire (optionnel)</Label>
                      <Input
                        id="cta-secondary-link"
                        value={config.homepageCTA?.secondaryButtonLink || "/contact"}
                        onChange={(e) => updateConfig({
                          homepageCTA: {
                            ...config.homepageCTA,
                            secondaryButtonLink: e.target.value
                          }
                        })}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

                {/* Aperçu */}
                <div className="mt-8 p-6 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-4">Aperçu de la section CTA</h4>
                  <div 
                    className="p-8 rounded-lg text-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`
                    }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {config.homepageCTA?.title || "Prêt à transformer votre entreprise ?"}
                    </h3>
                    <p className="text-white/90 mb-6">
                      {config.homepageCTA?.description || "Rejoignez des milliers d'entreprises qui font déjà confiance à notre solution SaaS."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        className="bg-white hover:bg-white/90"
                        style={{ color: config.colors.primary }}
                      >
                        {config.homepageCTA?.primaryButtonText || "Commencer gratuitement"}
                      </Button>
                      {config.homepageCTA?.secondaryButtonText && (
                        <Button 
                          variant="outline" 
                          className="border-white text-white hover:bg-white"
                        >
                          {config.homepageCTA.secondaryButtonText}
                        </Button>
                      )}
                    </div>
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
                          alt={media.name || 'Image'}
                          className="w-full h-24 object-cover rounded"
                        />
                        <div className="mt-2 text-sm">
                          <div className="font-medium truncate">{media.name || 'Image'}</div>
                          <div className="text-muted-foreground text-xs">
                            {media.type} • {new Date(media.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
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
              <DialogTitle>Médiathèque</DialogTitle>
              <DialogDescription>
                Gérer vos médias
              </DialogDescription>
            </DialogHeader>
            <MediaLibrary
              onMediaSelect={(file) => {
                console.log('Média sélectionné:', file);
                setIsMediaDialogOpen(false);
              }}
              category="general"
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
