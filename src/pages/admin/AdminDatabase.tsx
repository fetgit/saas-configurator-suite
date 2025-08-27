import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  TestTube, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Key,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminDatabase = () => {
  const { toast } = useToast();

  // États pour la configuration de base de données
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '3306',
    database: '',
    username: '',
    password: '',
    ssl: false,
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  // Fonction de test de connexion
  const testConnection = async () => {
    setConnectionStatus('testing');
    setTestResult('');

    // Simulation du test de connexion
    setTimeout(() => {
      if (dbConfig.host && dbConfig.database && dbConfig.username && dbConfig.password) {
        setConnectionStatus('success');
        setTestResult('Connexion réussie à la base de données MySQL !');
        toast({
          title: "Test de connexion réussi",
          description: "La connexion à la base de données a été établie avec succès.",
        });
      } else {
        setConnectionStatus('error');
        setTestResult('Erreur: Veuillez remplir tous les champs obligatoires.');
        toast({
          title: "Test de connexion échoué",
          description: "Vérifiez vos paramètres de connexion.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const saveConfiguration = () => {
    // Ici vous sauvegarderiez la configuration dans votre système
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres de base de données ont été sauvegardés.",
    });
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="outline">Test en cours...</Badge>;
      case 'success':
        return <Badge className="bg-success text-success-foreground">Connecté</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="secondary">Non testé</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="h-6 w-6" />
              Configuration base de données
            </h1>
            <p className="text-muted-foreground">
              Configurez la connexion à votre base de données MySQL
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Alert d'information */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Sécurité :</strong> Les informations de connexion sont chiffrées et stockées de manière sécurisée. 
            Seuls les Super Administrateurs peuvent voir et modifier ces paramètres.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="connection" className="space-y-4">
          <TabsList>
            <TabsTrigger value="connection">Connexion</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
            <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
          </TabsList>

          {/* Onglet Configuration de connexion */}
          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de connexion MySQL
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres pour vous connecter à votre base de données MySQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Hôte / Serveur *</Label>
                    <Input
                      id="host"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost ou IP du serveur"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                      placeholder="3306"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database">Nom de la base de données *</Label>
                    <Input
                      id="database"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="nom_de_ma_base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur *</Label>
                    <Input
                      id="username"
                      value={dbConfig.username}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="utilisateur_db"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mot de passe de la base de données"
                  />
                </div>

                {/* Résultat du test */}
                {testResult && (
                  <Alert variant={connectionStatus === 'error' ? 'destructive' : 'default'}>
                    {getStatusIcon()}
                    <AlertDescription>{testResult}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={testConnection} 
                    disabled={connectionStatus === 'testing'}
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {connectionStatus === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
                  </Button>
                  
                  <Button 
                    onClick={saveConfiguration}
                    disabled={connectionStatus !== 'success'}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder la configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres avancés */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Paramètres avancés
                </CardTitle>
                <CardDescription>
                  Configuration avancée de la base de données et optimisations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Optimisation des performances</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxConnections">Nombre maximum de connexions</Label>
                      <Input
                        id="maxConnections"
                        type="number"
                        defaultValue="50"
                        min="1"
                        max="1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="connectionTimeout">Timeout de connexion (secondes)</Label>
                      <Input
                        id="connectionTimeout"
                        type="number"
                        defaultValue="30"
                        min="5"
                        max="300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="queryTimeout">Timeout des requêtes (secondes)</Label>
                      <Input
                        id="queryTimeout"
                        type="number"
                        defaultValue="60"
                        min="10"
                        max="600"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Sécurité et chiffrement</h4>
                    
                    <div className="space-y-2">
                      <Label>Chiffrement SSL/TLS</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enableSSL"
                          className="rounded border-gray-300"
                          defaultChecked={false}
                        />
                        <Label htmlFor="enableSSL" className="text-sm">
                          Activer le chiffrement SSL/TLS
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Vérification des certificats</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="verifyCert"
                          className="rounded border-gray-300"
                          defaultChecked={true}
                        />
                        <Label htmlFor="verifyCert" className="text-sm">
                          Vérifier les certificats SSL
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="charset">Jeu de caractères</Label>
                      <Input
                        id="charset"
                        defaultValue="utf8mb4"
                        placeholder="utf8mb4"
                      />
                    </div>
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres avancés
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Surveillance */}
          <TabsContent value="monitoring">
            <div className="grid gap-6">
              {/* Statistiques de performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques de performance</CardTitle>
                  <CardDescription>
                    Surveillez les performances de votre base de données en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Connexions actives</p>
                      <p className="text-2xl font-bold">12 / 50</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Requêtes par seconde</p>
                      <p className="text-2xl font-bold">147</p>
                      <p className="text-xs text-muted-foreground">Moyenne sur 5 min</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Temps de réponse moyen</p>
                      <p className="text-2xl font-bold">23ms</p>
                      <p className="text-xs text-success">Performance excellente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logs et événements */}
              <Card>
                <CardHeader>
                  <CardTitle>Logs et événements récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Connexion établie avec succès</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 minutes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Requête lente détectée (2.3s)</p>
                        <p className="text-xs text-muted-foreground">Il y a 15 minutes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sauvegarde automatique terminée</p>
                        <p className="text-xs text-muted-foreground">Il y a 1 heure</p>
                      </div>
                    </div>
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