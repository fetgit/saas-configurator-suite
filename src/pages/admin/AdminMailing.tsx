import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useMailing } from '@/contexts/MailingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Settings, 
  Users, 
  FileText, 
  Send, 
  BarChart3,
  Shield,
  TestTube,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Copy,
  Plus,
  Search,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';

export function AdminMailing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    smtpConfig,
    updateSMTPConfig,
    testSMTPConnection,
    templates,
    mailingLists,
    campaigns,
    contacts,
    globalStats,
    isLoading
  } = useMailing();

  const [smtpForm, setSMTPForm] = useState(smtpConfig || {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: ''
  });
  const [testingConnection, setTestingConnection] = useState(false);
  
  // États pour les dialogs
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les formulaires
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    templateId: '',
    listId: '',
    scheduledAt: ''
  });
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'newsletter',
    subject: '',
    htmlContent: '',
    variables: [] as string[]
  });
  
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    tags: [] as string[]
  });
  
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    tags: [] as string[]
  });

  const handleSMTPSave = async () => {
    try {
      await updateSMTPConfig(smtpForm);
      toast({
        title: "Configuration SMTP",
        description: "Configuration sauvegardée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const success = await testSMTPConnection();
      toast({
        title: success ? "Test réussi" : "Test échoué",
        description: success 
          ? "La connexion SMTP fonctionne correctement" 
          : "Impossible de se connecter au serveur SMTP",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du test de connexion",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Handlers pour les actions
  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) {
      toast({
        title: "Erreur",
        description: "Nom et sujet requis",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Campagne créée",
      description: `La campagne "${newCampaign.name}" a été créée avec succès.`,
    });
    
    setNewCampaign({ name: '', subject: '', templateId: '', listId: '', scheduledAt: '' });
    setIsNewCampaignOpen(false);
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.htmlContent) {
      toast({
        title: "Erreur",
        description: "Nom et contenu HTML requis",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Template créé",
      description: `Le template "${newTemplate.name}" a été créé avec succès.`,
    });
    
    setNewTemplate({ name: '', category: 'newsletter', subject: '', htmlContent: '', variables: [] });
    setIsNewTemplateOpen(false);
  };

  const handleCreateList = () => {
    if (!newList.name) {
      toast({
        title: "Erreur",
        description: "Nom de liste requis",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Liste créée",
      description: `La liste "${newList.name}" a été créée avec succès.`,
    });
    
    setNewList({ name: '', description: '', tags: [] });
    setIsNewListOpen(false);
  };

  const handleCreateContact = () => {
    if (!newContact.firstName || !newContact.email) {
      toast({
        title: "Erreur",
        description: "Prénom et email requis",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Contact créé",
      description: `Le contact "${newContact.firstName} ${newContact.lastName}" a été créé avec succès.`,
    });
    
    setNewContact({ firstName: '', lastName: '', email: '', company: '', tags: [] });
    setIsNewContactOpen(false);
  };

  const handleDeleteItem = (type: string, id: string, name: string) => {
    toast({
      title: `${type} supprimé`,
      description: `"${name}" a été supprimé avec succès.`,
    });
  };

  const handleDuplicateItem = (type: string, name: string) => {
    toast({
      title: `${type} dupliqué`,
      description: `"${name}" a été dupliqué avec succès.`,
    });
  };

  const handleImportContacts = () => {
    toast({
      title: "Import en cours",
      description: "L'import des contacts a été démarré.",
    });
  };

  const handleExportContacts = () => {
    toast({
      title: "Export en cours",
      description: "L'export des contacts a été démarré.",
    });
  };

  const handlePreviewItem = (type: string, name: string) => {
    toast({
      title: "Aperçu",
      description: `Ouverture de l'aperçu pour "${name}".`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'default',
      sending: 'default',
      sent: 'default',
      paused: 'secondary',
      cancelled: 'destructive'
    } as const;

    const labels = {
      draft: 'Brouillon',
      scheduled: 'Programmé',
      sending: 'En cours',
      sent: 'Envoyé',
      paused: 'En pause',
      cancelled: 'Annulé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Système de Mailing
          </h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes email, templates et listes de diffusion
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {globalStats.totalDelivered} délivrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.averageOpenRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {globalStats.totalOpened} ouvertures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.averageClickRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {globalStats.totalClicked} clics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">
                {contacts.filter(c => c.subscribed).length} abonnés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interface à onglets */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="lists">Listes</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campagnes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(campaign.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {campaign.statistics.sent} envoyés
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Templates populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.slice(0, 5).map((template) => (
                      <div key={template.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Catégorie: {template.category}
                          </p>
                        </div>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campagnes */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Campagnes</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle campagne
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Créer une nouvelle campagne</DialogTitle>
                      <DialogDescription>
                        Configurez votre nouvelle campagne email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom de la campagne</Label>
                        <Input
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ma nouvelle campagne"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sujet de l'email</Label>
                        <Input
                          value={newCampaign.subject}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Sujet accrocheur"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <Select value={newCampaign.templateId} onValueChange={(value) => 
                          setNewCampaign(prev => ({ ...prev, templateId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un template" />
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-background border shadow-lg">
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Liste de diffusion</Label>
                        <Select value={newCampaign.listId} onValueChange={(value) => 
                          setNewCampaign(prev => ({ ...prev, listId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une liste" />
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-background border shadow-lg">
                            {mailingLists.map(list => (
                              <SelectItem key={list.id} value={list.id}>
                                {list.name} ({list.contacts.length} contacts)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsNewCampaignOpen(false)} variant="outline" className="flex-1">
                          Annuler
                        </Button>
                        <Button onClick={handleCreateCampaign} className="flex-1">
                          Créer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Nom</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-left p-4">Envoyés</th>
                        <th className="text-left p-4">Taux d'ouverture</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="p-4">{campaign.statistics.sent}</td>
                          <td className="p-4">{campaign.statistics.openRate.toFixed(1)}%</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePreviewItem('Campagne', campaign.name)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingItem(campaign);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDuplicateItem('Campagne', campaign.name)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <AlertTriangle className="h-5 w-5 text-warning" />
                                      Supprimer la campagne
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer la campagne "{campaign.name}" ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteItem('Campagne', campaign.id, campaign.name)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Templates d'email</h3>
              <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau template</DialogTitle>
                    <DialogDescription>
                      Créez un template d'email réutilisable.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom du template</Label>
                        <Input
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Mon template"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select value={newTemplate.category} onValueChange={(value) => 
                          setNewTemplate(prev => ({ ...prev, category: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-background border shadow-lg">
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="transactional">Transactionnel</SelectItem>
                            <SelectItem value="promotional">Promotionnel</SelectItem>
                            <SelectItem value="welcome">Bienvenue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sujet par défaut</Label>
                      <Input
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Sujet du template"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contenu HTML</Label>
                      <Textarea
                        value={newTemplate.htmlContent}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, htmlContent: e.target.value }))}
                        placeholder="<html>...</html>"
                        rows={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsNewTemplateOpen(false)} variant="outline" className="flex-1">
                        Annuler
                      </Button>
                      <Button onClick={handleCreateTemplate} className="flex-1">
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Catégorie: {template.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Variables: {template.variables.join(', ')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreviewItem('Template', template.name)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingItem(template);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicateItem('Template', template.name)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Dupliquer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Listes */}
          <TabsContent value="lists" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Listes de diffusion</h3>
              <Dialog open={isNewListOpen} onOpenChange={setIsNewListOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle liste
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle liste</DialogTitle>
                    <DialogDescription>
                      Créez une liste de diffusion pour organiser vos contacts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom de la liste</Label>
                      <Input
                        value={newList.name}
                        onChange={(e) => setNewList(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ma liste de diffusion"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newList.description}
                        onChange={(e) => setNewList(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description de la liste..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsNewListOpen(false)} variant="outline" className="flex-1">
                        Annuler
                      </Button>
                      <Button onClick={handleCreateList} className="flex-1">
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mailingLists.map((list) => (
                <Card key={list.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{list.name}</CardTitle>
                      <Badge variant={list.isActive ? 'default' : 'secondary'}>
                        {list.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{list.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">{list.contacts.length}</span> contacts
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {list.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreviewItem('Liste', list.name)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Voir contacts
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingItem(list);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contacts */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Contacts</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleImportContacts}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleExportContacts}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un nouveau contact</DialogTitle>
                      <DialogDescription>
                        Ajoutez un contact à votre base de données.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Prénom</Label>
                          <Input
                            value={newContact.firstName}
                            onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nom</Label>
                          <Input
                            value={newContact.lastName}
                            onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Entreprise</Label>
                        <Input
                          value={newContact.company}
                          onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Entreprise Inc."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsNewContactOpen(false)} variant="outline" className="flex-1">
                          Annuler
                        </Button>
                        <Button onClick={handleCreateContact} className="flex-1">
                          Créer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Contact</th>
                        <th className="text-left p-4">Entreprise</th>
                        <th className="text-left p-4">Tags</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{contact.email}</p>
                            </div>
                          </td>
                          <td className="p-4">{contact.company}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={contact.subscribed ? 'default' : 'secondary'}>
                              {contact.subscribed ? 'Abonné' : 'Désabonné'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingItem(contact);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <AlertTriangle className="h-5 w-5 text-warning" />
                                      Supprimer le contact
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer le contact "{contact.firstName} {contact.lastName}" ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteItem('Contact', contact.id, `${contact.firstName} ${contact.lastName}`)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration SMTP
                </CardTitle>
                <CardDescription>
                  Configurez votre serveur SMTP pour l'envoi d'emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">Serveur SMTP</Label>
                    <Input
                      id="smtp-host"
                      value={smtpForm.host}
                      onChange={(e) => setSMTPForm(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={smtpForm.port}
                      onChange={(e) => setSMTPForm(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={smtpForm.secure}
                    onCheckedChange={(checked) => setSMTPForm(prev => ({ ...prev, secure: checked }))}
                  />
                  <Label>Connexion sécurisée (SSL/TLS)</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Nom d'utilisateur</Label>
                    <Input
                      id="smtp-username"
                      value={smtpForm.username}
                      onChange={(e) => setSMTPForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="username@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Mot de passe</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      value={smtpForm.password}
                      onChange={(e) => setSMTPForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-email">Email expéditeur</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={smtpForm.fromEmail}
                      onChange={(e) => setSMTPForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                      placeholder="noreply@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-name">Nom expéditeur</Label>
                    <Input
                      id="from-name"
                      value={smtpForm.fromName}
                      onChange={(e) => setSMTPForm(prev => ({ ...prev, fromName: e.target.value }))}
                      placeholder="Mon SaaS"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={handleSMTPSave} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={handleTestConnection} disabled={testingConnection}>
                    {testingConnection ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Tester la connexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}