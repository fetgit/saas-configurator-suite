import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { securityHeadersApiService, type SecurityHeadersConfig, type GeneratedHeaders } from '@/services/securityHeadersApiService';
import { Shield, CheckCircle, AlertTriangle, Info, Copy, RefreshCw, Loader2 } from 'lucide-react';

interface SecurityHeadersDisplayProps {
  environment?: 'development' | 'production';
  onHeadersGenerated?: (headers: { [key: string]: string }) => void;
}

export const SecurityHeadersDisplay: React.FC<SecurityHeadersDisplayProps> = ({
  environment = 'development',
  onHeadersGenerated
}) => {
  const [config, setConfig] = useState<SecurityHeadersConfig | null>(null);
  const [headers, setHeaders] = useState<{ [key: string]: string }>({});
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [stats, setStats] = useState<any>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la configuration depuis l'API
  useEffect(() => {
    const loadSecurityHeaders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer la configuration depuis l'API
        const securityConfig = await securityHeadersApiService.getConfig(environment);
        setConfig(securityConfig);
        
        // Générer les headers depuis l'API
        const generatedData = await securityHeadersApiService.generateHeaders(environment);
        setHeaders(generatedData.headers);
        
        // Valider la configuration
        const validationResult = securityHeadersApiService.validateConfig(securityConfig);
        setValidation(validationResult);
        
        // Calculer les statistiques
        const securityStats = securityHeadersApiService.calculateSecurityStats(securityConfig);
        setStats(securityStats);

        // Appeler le callback si fourni
        if (onHeadersGenerated) {
          onHeadersGenerated(generatedData.headers);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des Security Headers:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadSecurityHeaders();
  }, [environment]); // Retirer onHeadersGenerated des dépendances pour éviter la boucle infinie

  // Copier un header dans le presse-papiers
  const copyToClipboard = useCallback(async (text: string, headerName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(headerName);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  }, []);

  // Obtenir la couleur du badge selon le niveau de sécurité
  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Obtenir l'icône selon le niveau de sécurité
  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'maximum': return <CheckCircle className="h-4 w-4" />;
      case 'high': return <Shield className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Afficher le loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des Security Headers...</span>
        </div>
      </div>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-2">Erreur lors du chargement :</div>
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Headers de Sécurité
          </CardTitle>
          <CardDescription>
            Configuration des headers de sécurité pour l'environnement {environment}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalHeaders || 0}</div>
              <div className="text-sm text-muted-foreground">Headers Actifs</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                {getSecurityLevelIcon(stats.securityLevel)}
                <span className="text-lg font-semibold capitalize">{stats.securityLevel}</span>
              </div>
              <div className="text-sm text-muted-foreground">Niveau de Sécurité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {validation.isValid ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Configuration</div>
            </div>
          </div>

          {/* Alertes de validation */}
          {!validation.isValid && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Erreurs de configuration :</div>
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Recommandations */}
          {stats.recommendations && stats.recommendations.length > 0 && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Recommandations :</div>
                <ul className="list-disc list-inside space-y-1">
                  {stats.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="text-sm">{recommendation}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Headers actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Headers Actifs</CardTitle>
          <CardDescription>
            Liste des headers de sécurité configurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.enabledHeaders?.map((header: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {header}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Détails des headers */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Détaillée</CardTitle>
          <CardDescription>
            Détails de chaque header de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="csp" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="csp">CSP</TabsTrigger>
              <TabsTrigger value="hsts">HSTS</TabsTrigger>
              <TabsTrigger value="frame">Frame</TabsTrigger>
              <TabsTrigger value="xss">XSS</TabsTrigger>
              <TabsTrigger value="other">Autres</TabsTrigger>
            </TabsList>

            <TabsContent value="csp" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Content Security Policy</h3>
                <div className="bg-muted p-3 rounded text-sm font-mono break-all">
                  {headers['Content-Security-Policy'] || 'Non configuré'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(headers['Content-Security-Policy'] || '', 'CSP')}
                >
                  {copied === 'CSP' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'CSP' ? 'Copié' : 'Copier'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="hsts" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Strict Transport Security</h3>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  {headers['Strict-Transport-Security'] || 'Non configuré'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(headers['Strict-Transport-Security'] || '', 'HSTS')}
                >
                  {copied === 'HSTS' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'HSTS' ? 'Copié' : 'Copier'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="frame" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">X-Frame-Options</h3>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  {headers['X-Frame-Options'] || 'Non configuré'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(headers['X-Frame-Options'] || '', 'X-Frame-Options')}
                >
                  {copied === 'X-Frame-Options' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'X-Frame-Options' ? 'Copié' : 'Copier'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="xss" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">X-XSS-Protection</h3>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  {headers['X-XSS-Protection'] || 'Non configuré'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(headers['X-XSS-Protection'] || '', 'X-XSS-Protection')}
                >
                  {copied === 'X-XSS-Protection' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'X-XSS-Protection' ? 'Copié' : 'Copier'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <div className="space-y-4">
                {Object.entries(headers).map(([key, value]) => {
                  if (['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options', 'X-XSS-Protection'].includes(key)) {
                    return null;
                  }
                  return (
                    <div key={key}>
                      <h3 className="font-semibold mb-2">{key}</h3>
                      <div className="bg-muted p-3 rounded text-sm font-mono break-all">
                        {value}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(value, key)}
                      >
                        {copied === key ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied === key ? 'Copié' : 'Copier'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Configuration complète */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Complète</CardTitle>
          <CardDescription>
            Tous les headers de sécurité pour l'intégration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="text-sm font-mono text-blue-600 min-w-0 flex-shrink-0">
                  {key}:
                </code>
                <code className="text-sm font-mono break-all flex-1">
                  {value}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`${key}: ${value}`, key)}
                >
                  {copied === key ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
