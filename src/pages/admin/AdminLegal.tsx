import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLegal, type LegalContent } from '@/contexts/LegalContext';
import { 
  Scale, 
  Save, 
  Eye, 
  Edit, 
  FileText,
  Shield,
  Cookie,
  Building2,
  Download,
  Upload,
  Copy,
  RefreshCw,
  History,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const AdminLegal = () => {
  const { legalPages, companyInfo, updateLegalPage, updateCompanyInfo } = useLegal();
  const { toast } = useToast();

  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<LegalContent | null>(null);
  const [companyData, setCompanyData] = useState(companyInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Templates prédéfinis
  const legalTemplates = {
    privacy: `# Politique de confidentialité

## 1. Collecte des informations

Nous collectons des informations lorsque vous vous inscrivez sur notre site, vous connectez à votre compte, effectuez un achat, participez à un concours et/ou lorsque vous vous déconnectez.

## 2. Utilisation des informations

Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
- Personnaliser votre expérience et répondre à vos besoins individuels
- Fournir un contenu publicitaire personnalisé
- Améliorer notre site Web
- Améliorer le service client et vos besoins de prise en charge
- Vous contacter par e-mail
- Administrer un concours, une promotion ou une enquête

## 3. Confidentialité du commerce en ligne

Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour n'importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et/ou une transaction.

## 4. Divulgation à des tiers

Nous ne vendons, n'échangeons et ne transférons pas vos informations personnelles identifiables à des tiers.

## 5. Protection des informations

Nous mettons en œuvre diverses mesures de sécurité pour préserver la sécurité de vos informations personnelles.`,

    terms: `# Conditions générales d'utilisation

## 1. Objet

Les présentes conditions générales d'utilisation (dites « CGU ») ont pour objet l'encadrement juridique des modalités de mise à disposition du site et des services par [NOM DE L'ENTREPRISE] et de définir les conditions d'accès et d'utilisation des services par « l'Utilisateur ».

## 2. Mentions légales

L'édition et la direction de la publication du site [URL DU SITE] est assurée par [NOM DE L'ENTREPRISE].

## 3. Accès au site

Le site [URL DU SITE] permet à l'Utilisateur un accès gratuit aux services suivants :
- Consultation de contenu
- Création de compte utilisateur
- Accès aux fonctionnalités du service

Le site est accessible gratuitement en tout lieu à tout Utilisateur ayant un accès à Internet.

## 4. Collecte des données

Le site assure à l'Utilisateur une collecte et un traitement d'informations personnelles dans le respect de la vie privée conformément à la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés.

## 5. Responsabilité

Les sources des informations diffusées sur le site [URL DU SITE] sont réputées fiables mais le site ne garantit pas qu'il soit exempt de défauts, d'erreurs ou d'omissions.`,

    legal: `# Mentions légales

Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance des utilisateurs et visiteurs du site les informations suivantes :

## Informations légales

**Statut du propriétaire :** [STATUT]
**Le Propriétaire est :** [NOM DU PROPRIÉTAIRE]
**Adresse postale du propriétaire :** [ADRESSE COMPLETE]
**Le Propriétaire peut être contacté :** [EMAIL/TELEPHONE]

**Le Créateur du site est :** [NOM DU CREATEUR]
**Le Responsable de la publication est :** [NOM DU RESPONSABLE]
**Contactez le responsable de la publication :** [EMAIL]

## Hébergement

**L'Hébergeur du site :** [NOM HEBERGEUR]
**Contact de l'hébergeur :** [ADRESSE HEBERGEUR]

## Développement

**Le Développeur du site est :** [NOM DEVELOPPEUR]

## Conditions d'utilisation

Ce site est proposé en différents langages web. Pour un meilleur confort d'utilisation et un graphisme plus agréable, nous vous recommandons de recourir à des navigateurs modernes.`,

    cookies: `# Politique des cookies

## Qu'est-ce qu'un cookie ?

Un cookie est un fichier texte déposé sur votre ordinateur lors de la visite d'un site ou de la consultation d'une publicité. Il a pour but de collecter des informations relatives à votre navigation et de vous adresser des services adaptés à votre terminal.

## Cookies utilisés sur ce site

### Cookies nécessaires
Ces cookies sont indispensables au bon fonctionnement du site et ne peuvent pas être désactivés.

### Cookies analytiques
Ces cookies nous permettent d'analyser la fréquentation de notre site afin de l'améliorer.

### Cookies de personnalisation
Ces cookies permettent d'améliorer l'expérience utilisateur en mémorisant vos préférences.

## Gestion des cookies

Vous pouvez configurer votre navigateur pour refuser les cookies. Cependant, certaines fonctionnalités du site pourraient ne pas fonctionner correctement.

## Contact

Pour toute question relative à cette politique de cookies, vous pouvez nous contacter à l'adresse : [EMAIL DE CONTACT]`
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && pageContent && editingPage) {
      const timer = setTimeout(() => {
        savePage(true);
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [pageContent, autoSave, editingPage]);

  // Validation
  const validatePage = (page: LegalContent): string[] => {
    const errors: string[] = [];
    
    if (!page.title.trim()) {
      errors.push('Le titre est requis');
    }
    
    if (!page.content.trim()) {
      errors.push('Le contenu est requis');
    }
    
    if (page.content.length < 100) {
      errors.push('Le contenu doit faire au moins 100 caractères');
    }
    
    return errors;
  };

  const startEditing = (page: LegalContent) => {
    setEditingPage(page.id);
    setPageContent({ ...page });
    setValidationErrors([]);
    setPreviewMode(false);
  };

  const cancelEditing = () => {
    setEditingPage(null);
    setPageContent(null);
    setValidationErrors([]);
    setPreviewMode(false);
  };

  const savePage = async (isAutoSave = false) => {
    if (!pageContent) return;

    const errors = validatePage(pageContent);
    setValidationErrors(errors);

    if (errors.length > 0 && !isAutoSave) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs avant de sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPage = {
        ...pageContent,
        lastUpdated: new Date().toISOString(),
      };
      
      updateLegalPage(updatedPage);
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        setEditingPage(null);
        setPageContent(null);
        
        toast({
          title: "Page sauvegardée",
          description: `La page "${pageContent.title}" a été mise à jour avec succès.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePagePublication = async (page: LegalContent) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPage = {
        ...page,
        isPublished: !page.isPublished,
        lastUpdated: new Date().toISOString(),
      };
      updateLegalPage(updatedPage);
      
      toast({
        title: updatedPage.isPublished ? "Page publiée" : "Page dépubliée",
        description: `La page "${page.title}" a été ${updatedPage.isPublished ? 'publiée' : 'dépubliée'}.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCompanyInfo = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateCompanyInfo(companyData);
      toast({
        title: "Informations sauvegardées",
        description: "Les informations de l'entreprise ont été mises à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = () => {
    if (!selectedTemplate || !pageContent) return;
    
    const template = legalTemplates[selectedTemplate as keyof typeof legalTemplates];
    if (template) {
      setPageContent({ ...pageContent, content: template });
      setIsTemplateDialogOpen(false);
      toast({
        title: "Template appliqué",
        description: "Le template a été appliqué au contenu.",
      });
    }
  };

  const exportPage = (page: LegalContent) => {
    const exportData = {
      title: page.title,
      content: page.content,
      type: page.type,
      isPublished: page.isPublished,
      lastUpdated: page.lastUpdated,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.type}-page.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Page exportée",
      description: `La page "${page.title}" a été exportée.`,
    });
  };

  const exportAllPages = () => {
    const exportData = {
      legalPages,
      companyInfo,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-pages-export.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complet",
      description: "Toutes les pages légales ont été exportées.",
    });
  };

  const copyPageContent = (page: LegalContent) => {
    navigator.clipboard.writeText(page.content);
    toast({
      title: "Contenu copié",
      description: "Le contenu de la page a été copié dans le presse-papiers.",
    });
  };

  const duplicatePage = (page: LegalContent) => {
    const duplicatedPage = {
      ...page,
      id: `${page.id}-copy-${Date.now()}`,
      title: `${page.title} (Copie)`,
      isPublished: false,
      lastUpdated: new Date().toISOString()
    };
    
    updateLegalPage(duplicatedPage);
    toast({
      title: "Page dupliquée",
      description: `Une copie de "${page.title}" a été créée.`,
    });
  };

  const renderMarkdownPreview = (content: string) => {
    // Simple markdown to HTML conversion for preview
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br/>');
  };

  const getPageIcon = (type: string) => {
    switch (type) {
      case 'privacy': return Shield;
      case 'terms': return FileText;
      case 'legal': return Scale;
      case 'cookies': return Cookie;
      default: return FileText;
    }
  };

  const getPageUrl = (type: string) => {
    switch (type) {
      case 'privacy': return '/privacy';
      case 'terms': return '/terms';
      case 'legal': return '/legal';
      case 'cookies': return '/cookies';
      default: return '#';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="h-6 w-6" />
              Gestion des mentions légales
            </h1>
            <p className="text-muted-foreground">
              Gérez le contenu des pages légales et les informations de l'entreprise
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportAllPages}>
              <Download className="w-4 h-4 mr-2" />
              Exporter tout
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pages">Pages légales</TabsTrigger>
            <TabsTrigger value="company">Informations entreprise</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Onglet Pages légales */}
          <TabsContent value="pages">
            <div className="grid gap-6">
              {legalPages.map((page) => {
                const Icon = getPageIcon(page.type);
                const isEditing = editingPage === page.id;
                
                return (
                  <Card key={page.id} className="shadow-medium border-0">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {isEditing && pageContent ? (
                            <Input
                              value={pageContent.title}
                              onChange={(e) => setPageContent({ ...pageContent, title: e.target.value })}
                              className="text-lg font-semibold border-0 p-0 h-auto"
                            />
                          ) : (
                            page.title
                          )}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                            {page.isPublished ? 'Publiée' : 'Brouillon'}
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePagePublication(page)}
                            disabled={isLoading}
                          >
                            {page.isPublished ? 'Dépublier' : 'Publier'}
                          </Button>
                          
                          {page.isPublished && (
                            <Button variant="outline" size="sm" asChild>
                              <Link to={getPageUrl(page.type)} target="_blank">
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Link>
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPageContent(page)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportPage(page)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicatePage(page)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant={isEditing ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => isEditing ? cancelEditing() : startEditing(page)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {isEditing ? 'Annuler' : 'Modifier'}
                          </Button>
                        </div>
                      </div>
                      
                      <CardDescription>
                        <div className="flex items-center justify-between">
                          <span>Dernière mise à jour : {new Date(page.lastUpdated).toLocaleDateString('fr-FR')}</span>
                          {lastSaved && editingPage === page.id && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {isEditing && pageContent ? (
                        <div className="space-y-4">
                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="p-3 border border-destructive rounded-lg bg-destructive/10">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <span className="font-medium text-destructive">Erreurs de validation</span>
                              </div>
                              <ul className="text-sm text-destructive space-y-1">
                                {validationErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Auto-save Toggle */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={autoSave}
                                onCheckedChange={setAutoSave}
                              />
                              <Label>Sauvegarde automatique</Label>
                            </div>
                            
                            <div className="flex gap-2">
                              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Templates
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Choisir un template</DialogTitle>
                                    <DialogDescription>
                                      Sélectionnez un template prédéfini pour cette page
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un template..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="privacy">Politique de confidentialité</SelectItem>
                                        <SelectItem value="terms">Conditions d'utilisation</SelectItem>
                                        <SelectItem value="legal">Mentions légales</SelectItem>
                                        <SelectItem value="cookies">Politique des cookies</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                                      Annuler
                                    </Button>
                                    <Button onClick={applyTemplate} disabled={!selectedTemplate}>
                                      Appliquer le template
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setPreviewMode(!previewMode)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {previewMode ? 'Édition' : 'Aperçu'}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Contenu de la page (Markdown)</Label>
                            {previewMode ? (
                              <div className="min-h-[400px] p-4 border rounded-lg bg-muted/50">
                                <div 
                                  className="prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html: renderMarkdownPreview(pageContent.content)
                                  }}
                                />
                              </div>
                            ) : (
                              <Textarea
                                value={pageContent.content}
                                onChange={(e) => setPageContent({ ...pageContent, content: e.target.value })}
                                rows={20}
                                className="font-mono text-sm"
                                placeholder="Tapez le contenu en Markdown..."
                              />
                            )}
                            <p className="text-xs text-muted-foreground">
                              Utilisez la syntaxe Markdown : # pour les titres, ## pour les sous-titres, - pour les listes
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={pageContent.isPublished}
                              onCheckedChange={(checked) => setPageContent({ ...pageContent, isPublished: checked })}
                            />
                            <Label>Publier cette page</Label>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button onClick={() => savePage()} disabled={isLoading}>
                              <Save className="h-4 w-4 mr-2" />
                              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                            <Button variant="outline" onClick={cancelEditing}>
                              Annuler
                            </Button>
                            {validationErrors.length === 0 && (
                              <Button variant="outline" onClick={() => savePage()}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publier maintenant
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none">
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-2">Aperçu du contenu :</p>
                              <div className="max-h-32 overflow-y-auto">
                                {page.content.split('\n').slice(0, 5).map((line, index) => (
                                  <p key={index} className="text-sm mb-1">
                                    {line.length > 100 ? line.substring(0, 100) + '...' : line}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Onglet Informations entreprise */}
          <TabsContent value="company">
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations de l'entreprise
                </CardTitle>
                <CardDescription>
                  Ces informations sont utilisées dans les mentions légales et les pages de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Raison sociale</Label>
                    <Input
                      id="companyName"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      placeholder="Ma Société SARL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="director">Directeur / Gérant</Label>
                    <Input
                      id="director"
                      value={companyData.director}
                      onChange={(e) => setCompanyData({ ...companyData, director: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email de contact</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      placeholder="contact@masociete.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siret">Numéro SIRET</Label>
                    <Input
                      id="siret"
                      value={companyData.siret}
                      onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })}
                      placeholder="12345678901234"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rcs">RCS</Label>
                    <Input
                      id="rcs"
                      value={companyData.rcs}
                      onChange={(e) => setCompanyData({ ...companyData, rcs: e.target.value })}
                      placeholder="Paris B 123 456 789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capital">Capital social</Label>
                    <Input
                      id="capital"
                      value={companyData.capital}
                      onChange={(e) => setCompanyData({ ...companyData, capital: e.target.value })}
                      placeholder="10 000 €"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea
                    id="address"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    placeholder="123 Rue de l'Innovation, 75001 Paris, France"
                    rows={3}
                  />
                </div>

                <Button onClick={saveCompanyInfo} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder les informations'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de publication</CardTitle>
                  <CardDescription>
                    Configurez les paramètres globaux pour les pages légales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Publication automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Publier automatiquement les pages après modification
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde automatique par défaut</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer la sauvegarde automatique pour toutes les pages
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Validation stricte</Label>
                      <p className="text-sm text-muted-foreground">
                        Appliquer des règles de validation strictes
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sauvegarde et restauration</CardTitle>
                  <CardDescription>
                    Gérez les sauvegardes de vos pages légales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={exportAllPages}>
                      <Download className="w-4 h-4 mr-2" />
                      Créer une sauvegarde
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Restaurer une sauvegarde
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Dernières sauvegardes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sauvegarde automatique</span>
                        <span className="text-muted-foreground">Il y a 2 heures</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sauvegarde manuelle</span>
                        <span className="text-muted-foreground">Hier à 14:30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Export complet</span>
                        <span className="text-muted-foreground">Il y a 3 jours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configurez les notifications pour les pages légales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications lors des modifications
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email de notification</Label>
                    <Input 
                      type="email" 
                      placeholder="admin@monentreprise.com"
                      value={companyData.email}
                      readOnly
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rappels de mise à jour</Label>
                      <p className="text-sm text-muted-foreground">
                        Rappels pour mettre à jour les pages anciennes
                      </p>
                    </div>
                    <Select defaultValue="monthly">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="quarterly">Trimestriel</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};