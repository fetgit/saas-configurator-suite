import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Database,
  Upload,
  Download
} from 'lucide-react';
import { useSyncService } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';

export const SyncButton: React.FC = () => {
  const { syncAll, loadAll } = useSyncService();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSyncToPostgres = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    
    try {
      const result = await syncAll();
      
      if (result.success) {
        setSyncStatus('success');
        setLastSync(new Date());
        toast({
          title: "Synchronisation réussie",
          description: `Toutes les configurations ont été synchronisées avec PostgreSQL (${result.synced.length} configurations)`,
        });
      } else {
        setSyncStatus('error');
        toast({
          title: "Synchronisation partielle",
          description: `${result.synced.length} configurations synchronisées, ${result.failed.length} échouées`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec PostgreSQL",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromPostgres = async () => {
    setIsLoading(true);
    setSyncStatus('idle');
    
    try {
      const result = await loadAll();
      
      if (result.success) {
        setSyncStatus('success');
        toast({
          title: "Chargement réussi",
          description: `Toutes les configurations ont été chargées depuis PostgreSQL (${result.loaded.length} configurations)`,
        });
      } else {
        setSyncStatus('error');
        toast({
          title: "Chargement partiel",
          description: `${result.loaded.length} configurations chargées, ${result.failed.length} échouées`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger depuis PostgreSQL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    switch (syncStatus) {
      case 'success':
        return <Badge className="bg-green-500 text-white">Synchronisé</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="secondary">Local</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Synchronisation PostgreSQL
        </CardTitle>
        <CardDescription>
          Synchronisez vos configurations entre le stockage local et PostgreSQL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut de synchronisation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Statut de synchronisation</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Dernière synchronisation */}
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            Dernière synchronisation: {lastSync.toLocaleString()}
          </div>
        )}

        {/* Informations sur la base de données */}
        <Alert>
          <Cloud className="h-4 w-4" />
          <AlertDescription>
            <strong>Base de données:</strong> PostgreSQL (147.93.58.155:5432)<br />
            <strong>Base:</strong> saas_configurator<br />
            <strong>Mode:</strong> Stockage local avec synchronisation optionnelle
          </AlertDescription>
        </Alert>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSyncToPostgres}
            disabled={isSyncing || isLoading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser vers PostgreSQL'}
          </Button>
          
          <Button 
            onClick={handleLoadFromPostgres}
            disabled={isSyncing || isLoading}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Chargement...' : 'Charger depuis PostgreSQL'}
          </Button>
        </div>

        {/* Informations sur le mode de fonctionnement */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Mode actuel:</strong> Stockage local (localStorage)</p>
          <p><strong>Avantages:</strong> Rapide, fonctionne hors ligne, pas de serveur requis</p>
          <p><strong>Synchronisation:</strong> Optionnelle avec PostgreSQL pour la persistance</p>
        </div>
      </CardContent>
    </Card>
  );
};
