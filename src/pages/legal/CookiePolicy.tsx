import React from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLegal } from '@/contexts/LegalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cookie, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const CookiePolicy = () => {
  const { getLegalPageByType, companyInfo } = useLegal();
  const { language } = useLanguage();

  const cookiePage = getLegalPageByType('cookies');

  if (!cookiePage) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <Cookie className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Politique des cookies non disponible</h1>
              <p className="text-muted-foreground">
                La politique des cookies n'est pas encore configurée.
              </p>
              <Button asChild className="mt-4">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Conversion du markdown simple en HTML (basique)
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold mb-6 mt-8 first:mt-0">
              {line.substring(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-semibold mb-4 mt-6">
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold mb-3 mt-4">
              {line.substring(4)}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={index} className="mb-1">
              {line.substring(2)}
            </li>
          );
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {line}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Breadcrumb / Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header de la page */}
          <Card className="mb-8 shadow-large border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Cookie className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">
                {cookiePage.title}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
                <Calendar className="h-4 w-4" />
                <span>
                  Dernière mise à jour : {' '}
                  {new Date(cookiePage.lastUpdated).toLocaleDateString(
                    language === 'fr' ? 'fr-FR' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }
                  )}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Contenu principal */}
          <Card className="shadow-large border-0">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {formatContent(cookiePage.content)}
              </div>

              {/* Gestion des cookies */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-xl font-semibold mb-4">Gérer vos préférences</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Paramètres de votre navigateur</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Vous pouvez configurer votre navigateur pour :</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Bloquer tous les cookies</li>
                        <li>Accepter uniquement les cookies de première partie</li>
                        <li>Supprimer les cookies existants</li>
                        <li>Recevoir une notification avant chaque cookie</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Contact</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Questions sur les cookies :</p>
                      <p className="font-medium text-primary">{companyInfo.email}</p>
                      <p>Ou utilisez notre formulaire de contact</p>
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link to="/contact">Nous contacter</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation vers autres pages légales */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link to="/privacy" className="flex flex-col items-center text-center">
                <span className="font-medium">Politique de confidentialité</span>
                <span className="text-sm text-muted-foreground">Protection de vos données</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link to="/terms" className="flex flex-col items-center text-center">
                <span className="font-medium">Conditions d'utilisation</span>
                <span className="text-sm text-muted-foreground">Règles d'usage de nos services</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link to="/legal" className="flex flex-col items-center text-center">
                <span className="font-medium">Mentions légales</span>
                <span className="text-sm text-muted-foreground">Informations légales de l'entreprise</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};