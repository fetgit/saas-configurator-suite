import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Server,
  Clock,
  Users,
  HardDrive
} from 'lucide-react';
import { localDatabaseConfigService } from '@/services/localPostgresService';

interface DatabaseStatusProps {
  onStatusChange?: (status: 'connected' | 'disconnected' | 'testing') => void;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [lastTest, setLastTest] = useState<Date | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const dbConfig = await localDatabaseConfigService.load();
      if (dbConfig) {
        setConfig(dbConfig);
        setStatus(dbConfig.test_status === 'success' ? 'connected' : 'disconnected');
        if (dbConfig.test_status === 'success') {
          setLastTest(new Date());
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!config) return;
    
    setStatus('testing');
    onStatusChange?.('testing');
    
    try {
      const result = await localDatabaseConfigService.testConnection(config);
      if (result.success) {
        setStatus('connected');
        setLastTest(new Date());
        onStatusChange?.('connected');
      } else {
        setStatus('disconnected');
        onStatusChange?.('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
      onStatusChange?.('disconnected');
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500 text-white">Connecté</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Déconnecté</Badge>;
      case 'testing':
        return <Badge variant="secondary">Test en cours...</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'testing':
        return 'text-blue-600';
    }
  };

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statut de la base de données
          </CardTitle>
          <CardDescription>
            Chargement de la configuration...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Statut de la base de données
        </CardTitle>
        <CardDescription>
          Connexion à {config.db_type?.toUpperCase()} - {config.host}:{config.port}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {status === 'connected' ? 'Base de données connectée' : 
               status === 'disconnected' ? 'Base de données déconnectée' : 
               'Test de connexion en cours...'}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Dernier test */}
        {lastTest && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Dernier test: {lastTest.toLocaleString()}
          </div>
        )}

        {/* Informations de connexion */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Serveur:</span>
            <span>{config.host}:{config.port}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Base:</span>
            <span>{config.database_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Utilisateur:</span>
            <span>{config.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Type:</span>
            <span>{config.db_type?.toUpperCase()}</span>
          </div>
        </div>

        {/* Configuration PostgreSQL spécifique */}
        {config.db_type === 'postgresql' && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuration PostgreSQL:</strong><br />
              Schéma: {config.schema_name || 'public'}<br />
              Timezone: {config.timezone || 'UTC'}<br />
              Extensions: {config.extensions?.join(', ') || 'Aucune'}
            </AlertDescription>
          </Alert>
        )}

        {/* Bouton de test */}
        <Button 
          onClick={testConnection}
          disabled={isLoading || status === 'testing'}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${status === 'testing' ? 'animate-spin' : ''}`} />
          {status === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
        </Button>

        {/* Message de statut */}
        {config.test_message && (
          <div className={`text-sm p-3 rounded-md ${
            status === 'connected' ? 'bg-green-50 text-green-700' : 
            status === 'disconnected' ? 'bg-red-50 text-red-700' : 
            'bg-blue-50 text-blue-700'
          }`}>
            {config.test_message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
