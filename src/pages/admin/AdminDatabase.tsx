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
  Shield,
  Server
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { localDatabaseConfigService, type DatabaseConfig } from '@/services/localPostgresService';
import { SyncButton } from '@/components/admin/SyncButton';
import { DatabaseStatus } from '@/components/admin/DatabaseStatus';
import { ConfigManager } from '@/components/admin/ConfigManager';
import { autoCreateDatabase } from '@/services/autoDatabaseService';

export const AdminDatabase = () => {
  const { toast } = useToast();

  // États pour la configuration de base de données
  const [dbType, setDbType] = useState<'mysql' | 'postgresql'>('mysql');
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fonction pour mettre à jour le port par défaut selon le type de DB
  const handleDbTypeChange = (newType: 'mysql' | 'postgresql') => {
    setDbType(newType);
    setDbConfig(prev => ({
      ...prev,
      port: newType === 'mysql' ? '3306' : '5432'
    }));
  };

  // Charger la configuration existante au montage du composant
  React.useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const config = await localDatabaseConfigService.load();
      if (config) {
        setDbType(config.db_type);
        setDbConfig({
          host: config.host,
          port: config.port.toString(),
          database: config.database_name,
          username: config.username,
          password: config.password,
          ssl: config.ssl_enabled,
        });
        setConnectionStatus(config.test_status === 'success' ? 'success' : 'idle');
        setTestResult(config.test_message || '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de test de connexion
  const testConnection = async () => {
    setConnectionStatus('testing');
    setTestResult('');

    if (!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
      setConnectionStatus('error');
      setTestResult('Erreur: Veuillez remplir tous les champs obligatoires.');
      toast({
        title: "Test de connexion échoué",
        description: "Vérifiez vos paramètres de connexion.",
        variant: "destructive",
      });
      return;
    }

    try {
      const configToTest: DatabaseConfig = {
        db_type: dbType,
        host: dbConfig.host,
        port: parseInt(dbConfig.port),
        database_name: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        ssl_enabled: dbConfig.ssl,
        ssl_verify_cert: true,
        charset: dbType === 'mysql' ? 'utf8mb4' : 'UTF8',
        schema_name: dbType === 'postgresql' ? 'public' : undefined,
        timezone: dbType === 'postgresql' ? 'UTC' : undefined,
        extensions: dbType === 'postgresql' ? ['uuid-ossp', 'pg_trgm'] : undefined,
        max_connections: 50,
        connection_timeout: 30,
        query_timeout: 60,
        is_active: true,
      };

      const result = await localDatabaseConfigService.testConnection(configToTest);
      
      if (result.success) {
        setConnectionStatus('success');
        setTestResult(`Connexion réussie à la base de données ${dbType.toUpperCase()} !`);
        toast({
          title: "Test de connexion réussi",
          description: `La connexion à la base de données ${dbType.toUpperCase()} a été établie avec succès.`,
        });
      } else {
        setConnectionStatus('error');
        setTestResult(result.message);
        toast({
          title: "Test de connexion échoué",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestResult('Erreur lors du test de connexion');
      toast({
        title: "Test de connexion échoué",
        description: "Erreur lors du test de connexion.",
        variant: "destructive",
      });
    }
  };

  // Fonction de création automatique de base de données
  const createDatabaseAutomatically = async () => {
    setConnectionStatus('testing');
    setTestResult('');

    if (!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
      setConnectionStatus('error');
      setTestResult('Erreur: Veuillez remplir tous les champs obligatoires.');
      toast({
        title: "Création échouée",
        description: "Vérifiez vos paramètres de connexion.",
        variant: "destructive",
      });
      return;
    }

    try {
      const configToCreate: DatabaseConfig = {
        db_type: dbType,
        host: dbConfig.host,
        port: parseInt(dbConfig.port),
        database_name: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        ssl_enabled: dbConfig.ssl,
        ssl_verify_cert: true,
        charset: dbType === 'mysql' ? 'utf8mb4' : 'UTF8',
        schema_name: dbType === 'postgresql' ? 'public' : undefined,
        timezone: dbType === 'postgresql' ? 'UTC' : undefined,
        extensions: dbType === 'postgresql' ? ['uuid-ossp', 'pg_trgm'] : undefined,
        max_connections: 50,
        connection_timeout: 30,
        query_timeout: 60,
        is_active: true,
        test_status: 'never_tested',
        test_message: ''
      };

      const result = await autoCreateDatabase(configToCreate);
      
      if (result.success) {
        setConnectionStatus('success');
        setTestResult(`✅ ${result.message}`);
        
        toast({
          title: "Base de données créée avec succès",
          description: result.message,
        });
        
        // Afficher les détails
        if (result.details) {
          console.log('📊 Détails de la création:', result.details);
          if (result.details.databaseCreated) {
            toast({
              title: "Base de données créée",
              description: `La base '${dbConfig.database}' a été créée automatiquement`,
            });
          }
          if (result.details.extensionsCreated.length > 0) {
            toast({
              title: "Extensions créées",
              description: `Extensions: ${result.details.extensionsCreated.join(', ')}`,
            });
          }
          if (result.details.tablesCreated > 0) {
            toast({
              title: "Tables créées",
              description: `${result.details.tablesCreated} tables créées automatiquement`,
            });
          }
        }
      } else {
        setConnectionStatus('error');
        setTestResult(`❌ ${result.message}`);
        toast({
          title: "Erreur de création",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestResult(`❌ Erreur: ${error}`);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer la base de données automatiquement",
        variant: "destructive",
      });
    }
  };

  const saveConfiguration = async () => {
    if (!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const configToSave: DatabaseConfig = {
        db_type: dbType,
        host: dbConfig.host,
        port: parseInt(dbConfig.port),
        database_name: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        ssl_enabled: dbConfig.ssl,
        ssl_verify_cert: true,
        charset: dbType === 'mysql' ? 'utf8mb4' : 'UTF8',
        schema_name: dbType === 'postgresql' ? 'public' : undefined,
        timezone: dbType === 'postgresql' ? 'UTC' : undefined,
        extensions: dbType === 'postgresql' ? ['uuid-ossp', 'pg_trgm'] : undefined,
        max_connections: 50,
        connection_timeout: 30,
        query_timeout: 60,
        is_active: true,
        test_status: connectionStatus === 'success' ? 'success' : 'never_tested',
        test_message: testResult,
      };

      const success = await localDatabaseConfigService.save(configToSave);
      
      if (success) {
        toast({
          title: "Configuration sauvegardée",
          description: "Les paramètres de base de données ont été sauvegardés avec succès.",
        });
      } else {
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder la configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
              Configurez la connexion à votre base de données (MySQL ou PostgreSQL)
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

        {/* Alert d'information sur le type de base de données */}
        {dbType === 'postgresql' && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>PostgreSQL :</strong> Cette base de données est optimisée pour les applications complexes avec des requêtes avancées, 
              la recherche textuelle et les données géospatiales. Le schéma est déjà compatible avec PostgreSQL.
            </AlertDescription>
          </Alert>
        )}

        {dbType === 'mysql' && (
          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <strong>MySQL :</strong> Cette base de données est idéale pour les applications web avec des performances élevées 
              et une facilité de maintenance. Le schéma sera adapté automatiquement pour MySQL.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="connection" className="space-y-4">
          <TabsList>
            <TabsTrigger value="connection">Connexion</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
            <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
            <TabsTrigger value="status">Statut</TabsTrigger>
            <TabsTrigger value="sync">Synchronisation</TabsTrigger>
            <TabsTrigger value="manager">Gestionnaire</TabsTrigger>
          </TabsList>

          {/* Onglet Configuration de connexion */}
          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de connexion {dbType.toUpperCase()}
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres pour vous connecter à votre base de données {dbType.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={(e) => e.preventDefault()}>
                {/* Sélecteur de type de base de données */}
                <div className="space-y-2">
                  <Label htmlFor="dbType">Type de base de données *</Label>
                  <Select value={dbType} onValueChange={handleDbTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de base de données" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          MySQL
                        </div>
                      </SelectItem>
                      <SelectItem value="postgresql">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          PostgreSQL
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      placeholder={dbType === 'mysql' ? '3306' : '5432'}
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
                    disabled={connectionStatus === 'testing' || isLoading}
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {connectionStatus === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
                  </Button>
                  
                  <Button 
                    onClick={createDatabaseAutomatically}
                    disabled={connectionStatus === 'testing' || isLoading}
                    variant="secondary"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {connectionStatus === 'testing' ? 'Création...' : 'Créer automatiquement'}
                  </Button>
                  
                  <Button 
                    onClick={saveConfiguration}
                    disabled={isSaving || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
                  </Button>
                </div>
                </form>
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
                        defaultValue={dbType === 'mysql' ? 'utf8mb4' : 'UTF8'}
                        placeholder={dbType === 'mysql' ? 'utf8mb4' : 'UTF8'}
                      />
                    </div>

                    {dbType === 'postgresql' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="schema">Schéma par défaut</Label>
                          <Input
                            id="schema"
                            defaultValue="public"
                            placeholder="public"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timezone">Fuseau horaire</Label>
                          <Input
                            id="timezone"
                            defaultValue="UTC"
                            placeholder="UTC"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Extensions PostgreSQL</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enableUuid"
                                className="rounded border-gray-300"
                                defaultChecked={true}
                              />
                              <Label htmlFor="enableUuid" className="text-sm">
                                Activer l'extension uuid-ossp
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enableTrgm"
                                className="rounded border-gray-300"
                                defaultChecked={true}
                              />
                              <Label htmlFor="enableTrgm" className="text-sm">
                                Activer l'extension pg_trgm (recherche textuelle)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enablePostgis"
                                className="rounded border-gray-300"
                                defaultChecked={false}
                              />
                              <Label htmlFor="enablePostgis" className="text-sm">
                                Activer l'extension PostGIS (géolocalisation)
                              </Label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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
                  <CardTitle>Statistiques de performance {dbType.toUpperCase()}</CardTitle>
                  <CardDescription>
                    Surveillez les performances de votre base de données {dbType.toUpperCase()} en temps réel
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

                  {dbType === 'postgresql' && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-4">Métriques PostgreSQL spécifiques</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cache hit ratio</p>
                          <p className="text-2xl font-bold">98.5%</p>
                          <p className="text-xs text-success">Excellent</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Locks actifs</p>
                          <p className="text-2xl font-bold">3</p>
                          <p className="text-xs text-muted-foreground">Normal</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Taille de la base</p>
                          <p className="text-2xl font-bold">2.3 GB</p>
                          <p className="text-xs text-muted-foreground">Croissance stable</p>
                        </div>
                      </div>
                    </div>
                  )}
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

          {/* Onglet Statut */}
          <TabsContent value="status">
            <DatabaseStatus />
          </TabsContent>

          {/* Onglet Synchronisation */}
          <TabsContent value="sync">
            <SyncButton />
          </TabsContent>

          {/* Onglet Gestionnaire */}
          <TabsContent value="manager">
            <ConfigManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};