import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Settings,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportConfigs, importConfigs, resetAppConfigs, showConfigStatus } from '@/scripts/initConfigs';

export const ConfigManager: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportConfigs();
      toast({
        title: "Export réussi",
        description: "Les configurations ont été exportées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les configurations",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importConfigs(file);
      toast({
        title: "Import réussi",
        description: "Les configurations ont été importées avec succès",
      });
      // Recharger la page pour appliquer les nouvelles configurations
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les configurations",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les configurations ? Cette action est irréversible.')) {
      return;
    }

    setIsResetting(true);
    try {
      resetAppConfigs();
      toast({
        title: "Réinitialisation réussie",
        description: "Toutes les configurations ont été réinitialisées",
      });
      // Recharger la page pour appliquer les configurations par défaut
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser les configurations",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleShowStatus = () => {
    showConfigStatus();
    toast({
      title: "Statut affiché",
      description: "Consultez la console pour voir le statut des configurations",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Gestionnaire de configurations
        </CardTitle>
        <CardDescription>
          Importez, exportez et gérez vos configurations d'administration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations sur les configurations */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Configurations disponibles:</strong><br />
            Base de données, Chatbot, Système, Sécurité, Mailing, Apparence, Légal, Communauté, Analytics
          </AlertDescription>
        </Alert>

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export des configurations
            </h4>
            <p className="text-sm text-muted-foreground">
              Téléchargez toutes vos configurations dans un fichier JSON
            </p>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import des configurations
            </h4>
            <p className="text-sm text-muted-foreground">
              Chargez des configurations depuis un fichier JSON
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Import en cours...' : 'Importer'}
            </Button>
          </div>
        </div>

        {/* Actions secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Statut */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Statut des configurations
            </h4>
            <p className="text-sm text-muted-foreground">
              Affiche le statut de toutes les configurations
            </p>
            <Button 
              onClick={handleShowStatus}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Afficher le statut
            </Button>
          </div>

          {/* Réinitialisation */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Réinitialisation
            </h4>
            <p className="text-sm text-muted-foreground">
              Remet toutes les configurations à zéro
            </p>
            <Button 
              onClick={handleReset}
              disabled={isResetting}
              variant="destructive"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Réinitialisation...' : 'Réinitialiser'}
            </Button>
          </div>
        </div>

        {/* Informations sur le format */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Format des fichiers:</strong> JSON<br />
            <strong>Structure:</strong> Le fichier doit contenir un objet avec les propriétés "timestamp", "version" et "configs"<br />
            <strong>Compatibilité:</strong> Compatible avec les exports de cette application
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
