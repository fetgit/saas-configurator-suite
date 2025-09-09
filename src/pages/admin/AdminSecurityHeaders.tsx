import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SecurityHeadersDisplay } from '@/components/SecurityHeadersDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Settings, Download, Upload, RefreshCw, Info } from 'lucide-react';

export const AdminSecurityHeaders: React.FC = () => {
  const [environment, setEnvironment] = useState<'development' | 'production'>('development');
  const [generatedHeaders, setGeneratedHeaders] = useState<{ [key: string]: string }>({});

  // Gérer la génération des headers
  const handleHeadersGenerated = (headers: { [key: string]: string }) => {
    setGeneratedHeaders(headers);
  };

  // Exporter la configuration
  const exportConfiguration = () => {
    const config = {
      environment,
      headers: generatedHeaders,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-headers-${environment}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exporter les headers pour Nginx
  const exportNginxConfig = () => {
    const nginxConfig = Object.entries(generatedHeaders)
      .map(([key, value]) => `    add_header ${key} "${value}";`)
      .join('\n');

    const fullConfig = `# Configuration Nginx - Headers de Sécurité
# Environnement: ${environment}
# Généré le: ${new Date().toISOString()}

server {
    # ... autres configurations ...
    
    # Headers de sécurité
${nginxConfig}
    
    # ... autres configurations ...
}`;

    const blob = new Blob([fullConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nginx-security-headers-${environment}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exporter les headers pour Apache
  const exportApacheConfig = () => {
    const apacheConfig = Object.entries(generatedHeaders)
      .map(([key, value]) => `    Header always set ${key} "${value}"`)
      .join('\n');

    const fullConfig = `# Configuration Apache - Headers de Sécurité
# Environnement: ${environment}
# Généré le: ${new Date().toISOString()}

<VirtualHost *:80>
    # ... autres configurations ...
    
    # Headers de sécurité
${apacheConfig}
    
    # ... autres configurations ...
</VirtualHost>`;

    const blob = new Blob([fullConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apache-security-headers-${environment}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Headers de Sécurité</h1>
                <p className="text-muted-foreground">
                  Configuration et gestion des headers de sécurité HTTP
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {environment === 'development' ? 'Développement' : 'Production'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnvironment(environment === 'development' ? 'production' : 'development')}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {environment === 'development' ? 'Production' : 'Développement'}
                </Button>
              </div>
            </div>
          </div>

          {/* Informations importantes */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Important :</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Les headers de sécurité sont configurés automatiquement par le backend</li>
                <li>Cette interface permet de visualiser et exporter la configuration</li>
                <li>En production, configurez également votre serveur web (Nginx/Apache)</li>
                <li>Testez toujours la configuration avant le déploiement</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Actions d'export */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export de Configuration
              </CardTitle>
              <CardDescription>
                Exporter la configuration des headers de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={exportConfiguration}
                  disabled={Object.keys(generatedHeaders).length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={exportNginxConfig}
                  disabled={Object.keys(generatedHeaders).length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Nginx
                </Button>
                <Button
                  variant="outline"
                  onClick={exportApacheConfig}
                  disabled={Object.keys(generatedHeaders).length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Apache
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Affichage des headers */}
          <SecurityHeadersDisplay
            environment={environment}
            onHeadersGenerated={handleHeadersGenerated}
          />

          {/* Instructions de déploiement */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Instructions de Déploiement
              </CardTitle>
              <CardDescription>
                Guide pour déployer les headers de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Backend (Express.js)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Les headers sont déjà configurés dans le backend avec Helmet.js
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    app.use(helmet(&#123;...&#125;));
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Serveur Web (Nginx)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ajoutez les headers dans votre configuration Nginx
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    add_header X-Frame-Options "DENY";<br/>
                    add_header X-Content-Type-Options "nosniff";<br/>
                    # ... autres headers
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Serveur Web (Apache)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ajoutez les headers dans votre configuration Apache
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    Header always set X-Frame-Options "DENY"<br/>
                    Header always set X-Content-Type-Options "nosniff"<br/>
                    # ... autres headers
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. CDN/Proxy</h3>
                  <p className="text-sm text-muted-foreground">
                    Configurez également les headers au niveau du CDN ou proxy (Cloudflare, AWS CloudFront, etc.)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </AdminLayout>
  );
};
