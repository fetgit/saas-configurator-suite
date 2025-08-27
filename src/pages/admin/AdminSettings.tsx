import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Settings, 
  Save, 
  Shield, 
  Mail, 
  Globe, 
  Bell,
  Lock,
  Key,
  Database,
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminSettings = () => {
  const { user, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // États pour les paramètres
  const [companySettings, setCompanySettings] = useState({
    companyName: user?.company || '',
    companyEmail: user?.email || '',
    companyPhone: '',
    companyAddress: '',
    companyWebsite: '',
    companyDescription: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPasswords: true,
    enableTwoFactor: false,
    sessionTimeout: 60, // minutes
    allowMultipleSessions: true,
    requireEmailVerification: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',
    maxLoginAttempts: 5,
    apiRateLimit: 1000,
  });

  const [apiSettings, setApiSettings] = useState({
    apiEnabled: true,
    rateLimitPerHour: 1000,
    requireApiKey: true,
    allowCors: true,
  });

  const handleSaveCompanySettings = () => {
    // Validation basique
    if (!companySettings.companyName.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'entreprise est requis.",
        variant: "destructive",
      });
      return;
    }

    if (!companySettings.companyEmail.trim() || !companySettings.companyEmail.includes('@')) {
      toast({
        title: "Erreur de validation",
        description: "Une adresse email valide est requise.",
        variant: "destructive",
      });
      return;
    }

    // Ici vous intégreriez avec votre API
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres de l'entreprise ont été mis à jour.",
    });
  };

  const handleSaveSecuritySettings = () => {
    toast({
      title: "Paramètres de sécurité sauvegardés",
      description: "Les paramètres de sécurité ont été mis à jour.",
    });
  };

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Paramètres de notification sauvegardés",
      description: "Les paramètres de notification ont été mis à jour.",
    });
  };

  const handleSaveSystemSettings = () => {
    if (!isSuperAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les super administrateurs peuvent modifier ces paramètres.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Paramètres système sauvegardés",
      description: "Les paramètres système ont été mis à jour.",
    });
  };

  const handleSaveApiSettings = () => {
    if (!isSuperAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les super administrateurs peuvent modifier ces paramètres.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Paramètres API sauvegardés",
      description: "Les paramètres de l'API ont été mis à jour.",
    });
  };

  const handleBackupNow = () => {
    if (!isSuperAdmin) return;
    
    toast({
      title: "Sauvegarde en cours",
      description: "La sauvegarde manuelle a été démarrée.",
    });
  };

  const handleMaintenanceModeToggle = (enabled: boolean) => {
    if (!isSuperAdmin) return;
    
    setSystemSettings(prev => ({ ...prev, maintenanceMode: enabled }));
    
    toast({
      title: enabled ? "Mode maintenance activé" : "Mode maintenance désactivé",
      description: enabled 
        ? "La plateforme est maintenant en maintenance." 
        : "La plateforme est de nouveau accessible.",
      variant: enabled ? "destructive" : "default",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Paramètres
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdmin 
                ? 'Gérez tous les paramètres système et entreprise'
                : `Gérez les paramètres de ${user?.company}`
              }
            </p>
          </div>
        </div>

        {/* Paramètres de l'entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informations de l'entreprise
            </CardTitle>
            <CardDescription>
              Gérez les informations de base de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                <Input
                  id="companyName"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Mon Entreprise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email principal</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companySettings.companyEmail}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                  placeholder="contact@monentreprise.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">Téléphone</Label>
                <Input
                  id="companyPhone"
                  value={companySettings.companyPhone}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Site web</Label>
                <Input
                  id="companyWebsite"
                  value={companySettings.companyWebsite}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  placeholder="https://monentreprise.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Adresse</Label>
              <Input
                id="companyAddress"
                value={companySettings.companyAddress}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                placeholder="123 Rue de l'Exemple, 75001 Paris"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Description</Label>
              <Textarea
                id="companyDescription"
                value={companySettings.companyDescription}
                onChange={(e) => setCompanySettings(prev => ({ ...prev, companyDescription: e.target.value }))}
                placeholder="Description de votre entreprise..."
                rows={3}
              />
            </div>

            <Button onClick={handleSaveCompanySettings}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder les informations
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres de sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité et authentification
            </CardTitle>
            <CardDescription>
              Configurez les paramètres de sécurité pour votre {isSuperAdmin ? 'plateforme' : 'entreprise'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mots de passe forts requis</Label>
                <p className="text-sm text-muted-foreground">
                  Exiger des mots de passe complexes pour tous les utilisateurs
                </p>
              </div>
              <Switch
                checked={securitySettings.requireStrongPasswords}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Activer l'authentification à deux facteurs pour tous les utilisateurs
                </p>
              </div>
              <Switch
                checked={securitySettings.enableTwoFactor}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 60 }))}
                min="5"
                max="480"
              />
              <p className="text-xs text-muted-foreground">
                Entre 5 et 480 minutes (8 heures maximum)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sessions multiples autorisées</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux utilisateurs de se connecter depuis plusieurs appareils
                </p>
              </div>
              <Switch
                checked={securitySettings.allowMultipleSessions}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({ ...prev, allowMultipleSessions: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vérification email requise</Label>
                <p className="text-sm text-muted-foreground">
                  Exiger la vérification de l'adresse email lors de l'inscription
                </p>
              </div>
              <Switch
                checked={securitySettings.requireEmailVerification}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))
                }
              />
            </div>

            <Button onClick={handleSaveSecuritySettings}>
              <Lock className="h-4 w-4 mr-2" />
              Sauvegarder la sécurité
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres de notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configurez les préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications importantes par email
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes de sécurité</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des alertes pour les événements de sécurité
                </p>
              </div>
              <Switch
                checked={notificationSettings.securityAlerts}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Emails marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des emails promotionnels et des nouvelles produit
                </p>
              </div>
              <Switch
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rapports hebdomadaires</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir un résumé hebdomadaire des activités
                </p>
              </div>
              <Switch
                checked={notificationSettings.weeklyReports}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                }
              />
            </div>

            <Button onClick={handleSaveNotificationSettings}>
              <Mail className="h-4 w-4 mr-2" />
              Sauvegarder les notifications
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres système (Super Admin uniquement) */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Paramètres système
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Super Admin
                </span>
              </CardTitle>
              <CardDescription>
                Paramètres avancés du système (accès Super Admin uniquement)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode maintenance pour toute la plateforme
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        {systemSettings.maintenanceMode ? 'Désactiver' : 'Activer'} le mode maintenance
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {systemSettings.maintenanceMode 
                          ? 'Êtes-vous sûr de vouloir désactiver le mode maintenance ? La plateforme redeviendra accessible à tous les utilisateurs.'
                          : 'Êtes-vous sûr de vouloir activer le mode maintenance ? Tous les utilisateurs seront déconnectés et ne pourront plus accéder à la plateforme.'
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleMaintenanceModeToggle(!systemSettings.maintenanceMode)}
                        className={systemSettings.maintenanceMode ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
                      >
                        {systemSettings.maintenanceMode ? 'Désactiver' : 'Activer'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode debug pour les développeurs
                  </p>
                </div>
                <Switch
                  checked={systemSettings.debugMode}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, debugMode: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logLevel">Niveau de log</Label>
                  <Select value={systemSettings.logLevel} onValueChange={(value) => 
                    setSystemSettings(prev => ({ ...prev, logLevel: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="error">Erreurs uniquement</SelectItem>
                      <SelectItem value="warn">Avertissements et erreurs</SelectItem>
                      <SelectItem value="info">Informations</SelectItem>
                      <SelectItem value="debug">Debug complet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                  <Select value={systemSettings.backupFrequency} onValueChange={(value) => 
                    setSystemSettings(prev => ({ ...prev, backupFrequency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Tentatives de connexion max</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                    min="3"
                    max="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">Limite API (req/heure)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) || 1000 }))}
                    min="100"
                    max="10000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSystemSettings}>
                  <Key className="h-4 w-4 mr-2" />
                  Sauvegarder le système
                </Button>
                
                <Button onClick={handleBackupNow} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Sauvegarde manuelle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paramètres API (Super Admin uniquement) */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Paramètres API
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Super Admin
                </span>
              </CardTitle>
              <CardDescription>
                Configuration de l'API et des accès développeurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API activée</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer ou désactiver l'accès à l'API
                  </p>
                </div>
                <Switch
                  checked={apiSettings.apiEnabled}
                  onCheckedChange={(checked) => 
                    setApiSettings(prev => ({ ...prev, apiEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clé API requise</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger une clé API pour l'authentification
                  </p>
                </div>
                <Switch
                  checked={apiSettings.requireApiKey}
                  onCheckedChange={(checked) => 
                    setApiSettings(prev => ({ ...prev, requireApiKey: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>CORS autorisé</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre les requêtes cross-origin
                  </p>
                </div>
                <Switch
                  checked={apiSettings.allowCors}
                  onCheckedChange={(checked) => 
                    setApiSettings(prev => ({ ...prev, allowCors: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rateLimitPerHour">Limite de requêtes par heure</Label>
                <Input
                  id="rateLimitPerHour"
                  type="number"
                  value={apiSettings.rateLimitPerHour}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, rateLimitPerHour: parseInt(e.target.value) || 1000 }))}
                  min="100"
                  max="50000"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre maximum de requêtes API par heure par utilisateur
                </p>
              </div>

              <Button onClick={handleSaveApiSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sauvegarder l'API
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};