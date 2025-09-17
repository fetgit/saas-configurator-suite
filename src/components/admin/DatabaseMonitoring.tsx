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
  Activity,
  HardDrive,
  Lock
} from 'lucide-react';

interface DatabaseMetrics {
  connections: {
    active: number;
    max: number;
    percentage: number;
  };
  queries: {
    total: number;
    avgTime: string;
    totalTime: string;
  };
  locks: {
    active: number;
  };
  cache: {
    hitRatio: string;
  };
  database: {
    name: string;
    version: string;
  };
  timestamp: string;
}

interface DatabaseLog {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  details: string;
}

interface DatabaseInfo {
  status: string;
  message: string;
  stats: {
    userCount: number;
    tableCount: number;
    databaseSize: string;
  };
  config: {
    db_type: string;
    host: string;
    port: number;
    database_name: string;
    username: string;
    ssl_enabled: boolean;
    test_status: string;
    test_message: string;
    created_at: string;
  };
  connectionInfo: {
    host: string;
    port: number;
    database: string;
    ssl: boolean;
  };
}

export const DatabaseMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [logs, setLogs] = useState<DatabaseLog[]>([]);
  const [info, setInfo] = useState<DatabaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsResponse, logsResponse, infoResponse] = await Promise.all([
        fetch('http://localhost:3003/api/database/metrics'),
        fetch('http://localhost:3003/api/database/logs'),
        fetch('http://localhost:3003/api/database/info')
      ]);

      const [metricsData, logsData, infoData] = await Promise.all([
        metricsResponse.json(),
        logsResponse.json(),
        infoResponse.json()
      ]);

      if (metricsData.status === 'connected') {
        setMetrics(metricsData.metrics);
      }

      if (logsData.status === 'connected') {
        setLogs(logsData.logs);
      }

      if (infoData.status === 'connected') {
        setInfo(infoData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Surveillance en temps réel</h3>
          <p className="text-sm text-muted-foreground">
            Métriques et logs de la base de données PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={fetchData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Statistiques de performance PostgreSQL
          </CardTitle>
          <CardDescription>
            Métriques en temps réel de votre base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Connexions actives</p>
                <p className="text-2xl font-bold">
                  {metrics.connections.active} / {metrics.connections.max}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${metrics.connections.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.connections.percentage}% d'utilisation
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Cache hit ratio</p>
                <p className="text-2xl font-bold">{metrics.cache.hitRatio}%</p>
                <p className={`text-xs ${
                  parseFloat(metrics.cache.hitRatio) > 95 ? 'text-green-600' : 
                  parseFloat(metrics.cache.hitRatio) > 90 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {parseFloat(metrics.cache.hitRatio) > 95 ? 'Excellent' : 
                   parseFloat(metrics.cache.hitRatio) > 90 ? 'Bon' : 'À surveiller'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Locks actifs</p>
                <p className="text-2xl font-bold">{metrics.locks.active}</p>
                <p className={`text-xs ${
                  metrics.locks.active === 0 ? 'text-green-600' : 
                  metrics.locks.active < 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.locks.active === 0 ? 'Normal' : 
                   metrics.locks.active < 5 ? 'Attention' : 'Problème'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des métriques...</span>
            </div>
          )}

          {/* Informations de la base de données */}
          {info && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">Informations de la base de données</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Utilisateurs</p>
                  <p className="text-2xl font-bold">{info.stats.userCount}</p>
                  <p className="text-xs text-muted-foreground">Utilisateurs enregistrés</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tables</p>
                  <p className="text-2xl font-bold">{info.stats.tableCount}</p>
                  <p className="text-xs text-muted-foreground">Tables créées</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Taille</p>
                  <p className="text-2xl font-bold">{info.stats.databaseSize}</p>
                  <p className="text-xs text-muted-foreground">Taille de la base</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs et événements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Logs et événements récents
          </CardTitle>
          <CardDescription>
            Historique des activités de la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className={`flex items-center gap-3 p-3 rounded-lg ${getLogColor(log.type)}`}>
                  {getLogIcon(log.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs opacity-75">{log.details}</p>
                  </div>
                  <div className="text-xs opacity-75">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des logs...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations de connexion */}
      {info && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Informations de connexion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Serveur:</span>
                <span>{info.connectionInfo.host}:{info.connectionInfo.port}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Base:</span>
                <span>{info.connectionInfo.database}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">SSL:</span>
                <Badge variant={info.connectionInfo.ssl ? "default" : "secondary"}>
                  {info.connectionInfo.ssl ? 'Activé' : 'Désactivé'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Version:</span>
                <span>{metrics?.database.version || 'PostgreSQL'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
