import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Lock, Eye, Download, RefreshCw, CheckCircle, XCircle, Clock, Users, Database, Key, Activity, Settings, Ban, Unlock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

// Types
interface SecurityEvent {
  id: string;
  type: 'login_failed' | 'login_success' | 'suspicious_activity' | 'admin_action' | 'data_access' | 'permission_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
  timestamp: string;
  description: string;
  resolved: boolean;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high';
  actions: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  created: string;
  active: boolean;
}

// Mock data
const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'suspicious_activity',
    severity: 'high',
    user: 'jean.dupont@exemple.com',
    ip: '192.168.1.100',
    timestamp: '2024-01-25T14:30:00Z',
    description: 'Tentatives de connexion multiples depuis une nouvelle localisation',
    resolved: false
  },
  {
    id: '2',
    type: 'login_failed',
    severity: 'medium',
    user: 'marie.martin@exemple.com',
    ip: '10.0.0.45',
    timestamp: '2024-01-25T13:15:00Z',
    description: 'Échec de connexion - mot de passe incorrect (3e tentative)',
    resolved: true
  },
  {
    id: '3',
    type: 'admin_action',
    severity: 'low',
    user: 'admin@exemple.com',
    ip: '192.168.1.10',
    timestamp: '2024-01-25T12:00:00Z',
    description: 'Modification des paramètres de sécurité',
    resolved: true
  }
];

const mockSecurityRules: SecurityRule[] = [
  {
    id: '1',
    name: 'Détection de force brute',
    description: 'Bloque automatiquement après 5 tentatives de connexion échouées',
    enabled: true,
    severity: 'high',
    actions: ['block_ip', 'notify_admin']
  },
  {
    id: '2',
    name: 'Géolocalisation suspecte',
    description: 'Alerte lors de connexions depuis de nouveaux pays',
    enabled: true,
    severity: 'medium',
    actions: ['require_2fa', 'notify_user']
  },
  {
    id: '3',
    name: 'Activité nocturne',
    description: 'Signale les connexions en dehors des heures de bureau',
    enabled: false,
    severity: 'low',
    actions: ['log_event']
  }
];

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'API Principal',
    key: 'sk_live_*********************xyz',
    permissions: ['read', 'write', 'admin'],
    lastUsed: '2024-01-25T10:30:00Z',
    created: '2024-01-01T00:00:00Z',
    active: true
  },
  {
    id: '2',
    name: 'API Lecture seule',
    key: 'sk_live_*********************abc',
    permissions: ['read'],
    lastUsed: '2024-01-24T16:45:00Z',
    created: '2024-01-15T00:00:00Z',
    active: true
  }
];

export function AdminSecurity() {
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>(mockSecurityRules);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isCreateApiKeyOpen, setIsCreateApiKeyOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: ['read'] });

  // Statistiques de sécurité
  const securityStats = {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
    unresolvedEvents: securityEvents.filter(e => !e.resolved).length,
    securityScore: 85
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login_failed': return <XCircle className="h-4 w-4" />;
      case 'login_success': return <CheckCircle className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      case 'admin_action': return <Settings className="h-4 w-4" />;
      case 'data_access': return <Database className="h-4 w-4" />;
      case 'permission_denied': return <Ban className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const resolveSecurityEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurityEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, resolved: true } : event
      ));

      toast({
        title: "Événement résolu",
        description: "L'événement de sécurité a été marqué comme résolu.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la résolution.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSecurityRule = async (ruleId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSecurityRules(prev => prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ));

      toast({
        title: "Règle mise à jour",
        description: "La règle de sécurité a été modifiée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newApiKey.name) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de la clé API est requis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const generatedKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newApiKey.name,
        key: generatedKey,
        permissions: newApiKey.permissions,
        lastUsed: 'Jamais utilisée',
        created: new Date().toISOString(),
        active: true
      };

      setApiKeys(prev => [...prev, newKey]);
      setIsCreateApiKeyOpen(false);
      setNewApiKey({ name: '', permissions: ['read'] });

      toast({
        title: "Clé API créée",
        description: "La nouvelle clé API a été générée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(prev => prev.map(key =>
        key.id === keyId ? { ...key, active: false } : key
      ));

      toast({
        title: "Clé révoquée",
        description: "La clé API a été révoquée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportSecurityReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      stats: securityStats,
      events: securityEvents,
      rules: securityRules,
      apiKeys: apiKeys.map(key => ({ ...key, key: key.key.substring(0, 20) + '***' }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Rapport exporté",
      description: "Le rapport de sécurité a été téléchargé.",
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Centre de sécurité</h1>
            <p className="text-muted-foreground">
              Surveillez et gérez la sécurité de votre plateforme
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSecurityReport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter le rapport
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Score de sécurité et statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score de sécurité</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{securityStats.securityScore}%</div>
              <Progress value={securityStats.securityScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {securityStats.securityScore >= 80 ? 'Excellent' : 'Nécessite attention'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements totaux</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Dernières 24h</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes critiques</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.criticalEvents}</div>
              <p className="text-xs text-muted-foreground">Intervention requise</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non résolus</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.unresolvedEvents}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Événements de sécurité</TabsTrigger>
            <TabsTrigger value="rules">Règles de sécurité</TabsTrigger>
            <TabsTrigger value="api-keys">Clés API</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Onglet Événements */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Événements de sécurité récents</CardTitle>
                <CardDescription>
                  Surveillez les activités suspectes et les tentatives d'intrusion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Sévérité</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEventTypeIcon(event.type)}
                              <span className="capitalize">
                                {event.type.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{event.user}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {event.ip}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityColor(event.severity) as any}>
                              {event.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(event.timestamp).toLocaleString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {event.resolved ? (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Résolu
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <Clock className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedEvent(event)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!event.resolved && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resolveSecurityEvent(event.id)}
                                  disabled={isLoading}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Règles */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Règles de sécurité automatisées</CardTitle>
                <CardDescription>
                  Configurez les règles de détection et de prévention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => toggleSecurityRule(rule.id)}
                            disabled={isLoading}
                          />
                          <div>
                            <h4 className="font-medium">{rule.name}</h4>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          </div>
                        </div>
                        <Badge variant={getSeverityColor(rule.severity) as any}>
                          {rule.severity}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {rule.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {action.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Clés API */}
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestion des clés API</span>
                  <Dialog open={isCreateApiKeyOpen} onOpenChange={setIsCreateApiKeyOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Key className="w-4 h-4 mr-2" />
                        Nouvelle clé
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle clé API</DialogTitle>
                        <DialogDescription>
                          Générez une nouvelle clé API avec des permissions spécifiques
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="key-name">Nom de la clé</Label>
                          <Input
                            id="key-name"
                            value={newApiKey.name}
                            onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                            placeholder="API Production"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Permissions</Label>
                          <div className="flex gap-2">
                            {['read', 'write', 'admin'].map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={permission}
                                  checked={newApiKey.permissions.includes(permission)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewApiKey({
                                        ...newApiKey,
                                        permissions: [...newApiKey.permissions, permission]
                                      });
                                    } else {
                                      setNewApiKey({
                                        ...newApiKey,
                                        permissions: newApiKey.permissions.filter(p => p !== permission)
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor={permission} className="capitalize">
                                  {permission}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateApiKeyOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={createApiKey} disabled={isLoading}>
                          {isLoading ? 'Création...' : 'Créer la clé'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Gérez les clés d'accès à votre API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Clé</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Dernière utilisation</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-medium">{key.name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {key.key}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {key.permissions.map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {key.lastUsed === 'Jamais utilisée' 
                              ? key.lastUsed 
                              : new Date(key.lastUsed).toLocaleDateString('fr-FR')
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={key.active ? 'default' : 'destructive'}>
                              {key.active ? 'Active' : 'Révoquée'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {key.active && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Révoquer la clé API</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir révoquer la clé "{key.name}" ? 
                                      Cette action ne peut pas être annulée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => revokeApiKey(key.id)}>
                                      Révoquer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de sécurité généraux</CardTitle>
                  <CardDescription>
                    Configurez les paramètres de sécurité globaux
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Authentification à deux facteurs obligatoire</Label>
                      <p className="text-sm text-muted-foreground">
                        Tous les utilisateurs doivent configurer la 2FA
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Délai d'expiration de session</Label>
                      <p className="text-sm text-muted-foreground">
                        Déconnexion automatique après inactivité
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="120">2 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Journalisation des événements</Label>
                      <p className="text-sm text-muted-foreground">
                        Enregistrer tous les événements de sécurité
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications email de sécurité</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes par email pour les événements critiques
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restrictions d'accès</CardTitle>
                  <CardDescription>
                    Configurez les restrictions d'IP et de géolocalisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Adresses IP autorisées (une par ligne)</Label>
                    <Textarea
                      placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour autoriser toutes les IP
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pays bloqués</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner des pays..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune restriction</SelectItem>
                        <SelectItem value="high-risk">Pays à haut risque</SelectItem>
                        <SelectItem value="custom">Configuration personnalisée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full">
                    Sauvegarder les restrictions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog de détail d'événement */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'événement de sécurité</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type d'événement</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getEventTypeIcon(selectedEvent.type)}
                      <span className="capitalize">
                        {selectedEvent.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Sévérité</Label>
                    <div className="mt-1">
                      <Badge variant={getSeverityColor(selectedEvent.severity) as any}>
                        {selectedEvent.severity}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Utilisateur</Label>
                    <p className="mt-1">{selectedEvent.user}</p>
                  </div>
                  <div>
                    <Label>Adresse IP</Label>
                    <code className="mt-1 block text-xs bg-muted px-2 py-1 rounded">
                      {selectedEvent.ip}
                    </code>
                  </div>
                  <div>
                    <Label>Date et heure</Label>
                    <p className="mt-1">
                      {new Date(selectedEvent.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <div className="mt-1">
                      {selectedEvent.resolved ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Résolu
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <Clock className="w-3 h-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Fermer
              </Button>
              {selectedEvent && !selectedEvent.resolved && (
                <Button onClick={() => {
                  resolveSecurityEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}>
                  Marquer comme résolu
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}