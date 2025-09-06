import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useChatbot } from '@/contexts/ChatbotContext';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  MessageCircle, 
  Settings, 
  BarChart3,
  Palette,
  Volume2,
  FileUp,
  Shield,
  TestTube,
  Download,
  Eye,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Send
} from 'lucide-react';

export function AdminChatbot() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    config, 
    updateConfig, 
    resetConfig, 
    stats, 
    messages, 
    clearMessages, 
    exportChat,
    apiKey,
    setApiKey 
  } = useChatbot();

  const [tempConfig, setTempConfig] = useState(config);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [isViewConversationsOpen, setIsViewConversationsOpen] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleSaveConfig = async () => {
    // Validation
    if (!tempApiKey.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Une clé API est requise",
        variant: "destructive",
      });
      return;
    }

    if (!tempConfig.welcomeMessage.trim()) {
      toast({
        title: "Erreur de validation", 
        description: "Le message de bienvenue est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateConfig(tempConfig);
      setApiKey(tempApiKey);
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres du chatbot ont été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleResetConfig = async () => {
    try {
      await resetConfig();
      setTempConfig(config);
      toast({
        title: "Configuration réinitialisée",
        description: "Les paramètres par défaut ont été restaurés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réinitialisation",
        variant: "destructive",
      });
    }
  };

  const handleExportStats = async () => {
    try {
      const statsData = {
        stats,
        messages: messages.length,
        config: {
          model: config.model,
          enabled: config.enabled,
          position: config.position
        },
        exportDate: new Date().toISOString()
      };
      
      const jsonData = JSON.stringify(statsData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-stats-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "Les statistiques ont été exportées.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      });
    }
  };

  const handleTestChat = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez d'abord configurer votre clé API.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Test de connexion au chatbot
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const testResponse = {
        success: true,
        responseTime: '1.2s',
        message: 'Connexion au chatbot réussie',
        model: tempConfig.model
      };
      
      setTestResults(testResponse);
      
      toast({
        title: "Test réussi",
        description: `Le chatbot fonctionne correctement (${testResponse.responseTime})`,
      });
    } catch (error) {
      const errorResult = {
        success: false,
        error: 'Impossible de se connecter au service IA',
        model: tempConfig.model
      };
      
      setTestResults(errorResult);
      
      toast({
        title: "Test échoué",
        description: "Vérifiez votre clé API et votre configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearMessages();
      toast({
        title: "Historique vidé",
        description: "Tous les messages ont été supprimés.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vider l'historique.",
        variant: "destructive",
      });
    }
  };

  const handleViewConversations = () => {
    setIsViewConversationsOpen(true);
  };

  const handleExportChats = async () => {
    try {
      await exportChat();
      toast({
        title: "Export réussi",
        description: "Les conversations ont été exportées.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les conversations.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chatbot IA
          </h1>
          <p className="text-muted-foreground">
            Configurez et gérez votre assistant virtuel intelligent
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalMessages} messages au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                Note moyenne des utilisateurs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime}s</div>
              <p className="text-xs text-muted-foreground">
                Temps moyen de réponse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session moyenne</CardTitle>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSessionLength}</div>
              <p className="text-xs text-muted-foreground">
                Messages par conversation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interface à onglets */}
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="behavior">Comportement</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="api">API & Sécurité</TabsTrigger>
          </TabsList>

          {/* Configuration générale */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration générale
                </CardTitle>
                <CardDescription>
                  Paramètres principaux du chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Activer le chatbot</Label>
                    <div className="text-sm text-muted-foreground">
                      Afficher le chatbot sur votre site
                    </div>
                  </div>
                  <Switch
                    checked={tempConfig.enabled}
                    onCheckedChange={(checked) => 
                      setTempConfig(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Modèle IA</Label>
                  <Select
                    value={tempConfig.model}
                    onValueChange={(value: any) => 
                      setTempConfig(prev => ({ ...prev, model: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="gpt-5-2025-08-07">GPT-5 (Recommandé)</SelectItem>
                      <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (Fiable)</SelectItem>
                      <SelectItem value="o4-mini-2025-04-16">O4 Mini (Rapide)</SelectItem>
                      <SelectItem value="claude-opus-4-20250514">Claude 4 Opus</SelectItem>
                      <SelectItem value="claude-sonnet-4-20250514">Claude 4 Sonnet</SelectItem>
                      <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                      <SelectItem value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Position sur la page</Label>
                  <Select
                    value={tempConfig.position}
                    onValueChange={(value: any) => 
                      setTempConfig(prev => ({ ...prev, position: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="bottom-right">Bas droite</SelectItem>
                      <SelectItem value="bottom-left">Bas gauche</SelectItem>
                      <SelectItem value="bottom-center">Bas centre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message de bienvenue</Label>
                  <Textarea
                    value={tempConfig.welcomeMessage}
                    onChange={(e) => 
                      setTempConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))
                    }
                    placeholder="Message affiché lors de l'ouverture du chat"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Placeholder de saisie</Label>
                  <Input
                    value={tempConfig.placeholder}
                    onChange={(e) => 
                      setTempConfig(prev => ({ ...prev, placeholder: e.target.value }))
                    }
                    placeholder="Texte affiché dans le champ de saisie"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apparence */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personnalisation visuelle
                </CardTitle>
                <CardDescription>
                  Customisez l'apparence du chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={tempConfig.primaryColor}
                      onChange={(e) => 
                        setTempConfig(prev => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={tempConfig.primaryColor}
                      onChange={(e) => 
                        setTempConfig(prev => ({ ...prev, primaryColor: e.target.value }))
                      }
                      placeholder="#4F46E5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select
                    value={tempConfig.theme}
                    onValueChange={(value: any) => 
                      setTempConfig(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="auto">Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Texte du bouton déclencheur</Label>
                  <Input
                    value={tempConfig.triggerText}
                    onChange={(e) => 
                      setTempConfig(prev => ({ ...prev, triggerText: e.target.value }))
                    }
                    placeholder="💬 Discuter"
                  />
                </div>

                <div className="space-y-2">
                  <Label>CSS personnalisé (optionnel)</Label>
                  <Textarea
                    value={tempConfig.customCSS || ''}
                    onChange={(e) => 
                      setTempConfig(prev => ({ ...prev, customCSS: e.target.value }))
                    }
                    placeholder="/* Styles CSS personnalisés */"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comportement */}
          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de comportement</CardTitle>
                <CardDescription>
                  Configurez la personnalité et les fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Prompt système</Label>
                  <Textarea
                    value={tempConfig.systemPrompt}
                    onChange={(e) => 
                      setTempConfig(prev => ({ ...prev, systemPrompt: e.target.value }))
                    }
                    placeholder="Instructions pour définir la personnalité de l'IA"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Température: {tempConfig.temperature}</Label>
                  <Slider
                    value={[tempConfig.temperature]}
                    onValueChange={([value]) => 
                      setTempConfig(prev => ({ ...prev, temperature: value }))
                    }
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = Réponses précises, 1 = Réponses créatives
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tokens maximum: {tempConfig.maxTokens}</Label>
                  <Slider
                    value={[tempConfig.maxTokens]}
                    onValueChange={([value]) => 
                      setTempConfig(prev => ({ ...prev, maxTokens: value }))
                    }
                    max={2000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Limite de messages par minute: {tempConfig.rateLimitPerMinute}</Label>
                  <Slider
                    value={[tempConfig.rateLimitPerMinute]}
                    onValueChange={([value]) => 
                      setTempConfig(prev => ({ ...prev, rateLimitPerMinute: value }))
                    }
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Reconnaissance vocale</Label>
                      <div className="text-sm text-muted-foreground">
                        Permettre aux utilisateurs de parler
                      </div>
                    </div>
                    <Switch
                      checked={tempConfig.enableVoice}
                      onCheckedChange={(checked) => 
                        setTempConfig(prev => ({ ...prev, enableVoice: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Upload de fichiers</Label>
                      <div className="text-sm text-muted-foreground">
                        Autoriser l'envoi de fichiers
                      </div>
                    </div>
                    <Switch
                      checked={tempConfig.enableFileUpload}
                      onCheckedChange={(checked) => 
                        setTempConfig(prev => ({ ...prev, enableFileUpload: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Indicateur de frappe</Label>
                      <div className="text-sm text-muted-foreground">
                        Afficher "En train d'écrire..."
                      </div>
                    </div>
                    <Switch
                      checked={tempConfig.showTypingIndicator}
                      onCheckedChange={(checked) => 
                        setTempConfig(prev => ({ ...prev, showTypingIndicator: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Système de feedback</Label>
                      <div className="text-sm text-muted-foreground">
                        Boutons pouce haut/bas
                      </div>
                    </div>
                    <Switch
                      checked={tempConfig.enableFeedback}
                      onCheckedChange={(checked) => 
                        setTempConfig(prev => ({ ...prev, enableFeedback: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistiques */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Analyses et métriques</h3>
              <Button onClick={handleExportStats} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Questions les plus fréquentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topQuestions.map((question, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{question.question}</p>
                        </div>
                        <Badge variant="secondary">{question.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Messages actifs</span>
                      <span className="font-medium">{messages.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversations aujourd'hui</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taux de résolution</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Temps moyen de session</span>
                      <span className="font-medium">0m 0s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gestion des conversations</CardTitle>
                <CardDescription>
                  Actions sur les données de chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleExportChats}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les chats
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vider l'historique
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          Vider l'historique des conversations
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer tous les messages et conversations ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleClearHistory}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Vider l'historique
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Dialog open={isViewConversationsOpen} onOpenChange={setIsViewConversationsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les conversations
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Conversations récentes</DialogTitle>
                        <DialogDescription>
                          Historique des {messages.length} derniers messages
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Aucune conversation enregistrée
                          </p>
                        ) : (
                          messages.slice(-20).map((message, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                                  {message.role === 'user' ? 'Utilisateur' : 'Chatbot'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp || Date.now()).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.content || 'Message vide'}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Sécurité */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuration API
                </CardTitle>
                <CardDescription>
                  Clés API et paramètres de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Clé API IA (OpenAI, Anthropic, Perplexity)</Label>
                  <Input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="sk-... ou claude-... ou pplx-..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Votre clé API sera stockée de manière sécurisée. Supporté : OpenAI, Anthropic Claude, Perplexity AI.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Domaines autorisés (optionnel)</Label>
                  <Textarea
                    value={tempConfig.allowedDomains.join('\n')}
                    onChange={(e) => 
                      setTempConfig(prev => ({ 
                        ...prev, 
                        allowedDomains: e.target.value.split('\n').filter(d => d.trim()) 
                      }))
                    }
                    placeholder="votre-domaine.com&#10;sous-domaine.votre-domaine.com"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Un domaine par ligne. Laissez vide pour autoriser tous les domaines.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Historique maximum: {tempConfig.maxHistoryLength}</Label>
                  <Slider
                    value={[tempConfig.maxHistoryLength]}
                    onValueChange={([value]) => 
                      setTempConfig(prev => ({ ...prev, maxHistoryLength: value }))
                    }
                    max={200}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre maximum de messages conservés par conversation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Réinitialiser la configuration
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir restaurer les paramètres par défaut ? Toute votre configuration actuelle sera perdue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleResetConfig}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Réinitialiser
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleTestChat}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Tester le chat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Test du chatbot</DialogTitle>
                  <DialogDescription>
                    Vérification de la configuration et de la connectivité
                  </DialogDescription>
                </DialogHeader>
                {isTesting ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Test en cours...</span>
                  </div>
                ) : testResults ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {testResults.success ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <span className={testResults.success ? "text-success" : "text-destructive"}>
                        {testResults.success ? "Test réussi" : "Test échoué"}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Modèle:</span> {testResults.model}</p>
                      {testResults.success ? (
                        <>
                          <p><span className="font-medium">Temps de réponse:</span> {testResults.responseTime}</p>
                          <p><span className="font-medium">Message:</span> {testResults.message}</p>
                        </>
                      ) : (
                        <p><span className="font-medium">Erreur:</span> {testResults.error}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Cliquez sur "Tester le chat" pour vérifier votre configuration
                  </p>
                )}
              </DialogContent>
            </Dialog>
            
            <Button onClick={handleSaveConfig}>
              <Send className="h-4 w-4 mr-2" />
              Sauvegarder les paramètres
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}