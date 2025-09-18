import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Database, 
  Palette,
  Scale,
  Image,
  User
} from 'lucide-react';

export const Dashboard = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  // Redirection si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour, {user?.name} !
              </h1>
              <p className="text-muted-foreground">
                Bienvenue sur votre tableau de bord {user?.company && `de ${user.company}`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">
                    {isSuperAdmin ? '1,234' : isAdmin ? '47' : '1'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Croissance</p>
                  <p className="text-2xl font-bold">+24%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sécurité</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base de données</p>
                  <p className="text-2xl font-bold">{isAdmin || isSuperAdmin ? 'Actif' : 'Limité'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Actions rapides */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accès direct aux fonctionnalités principales selon votre niveau d'accès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Actions pour tous les utilisateurs */}
                  <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                    <Link to="/profile">
                      <User className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Mon profil</div>
                        <div className="text-sm text-muted-foreground">Gérer mes informations</div>
                      </div>
                    </Link>
                  </Button>

                  {/* Actions pour admins et superadmins */}
                  {(isAdmin || isSuperAdmin) && (
                    <>
                      <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                        <Link to="/admin/users">
                          <Users className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{t('admin.users')}</div>
                            <div className="text-sm text-muted-foreground">
                              Gérer les utilisateurs{isAdmin ? ' de votre entreprise' : ''}
                            </div>
                          </div>
                        </Link>
                      </Button>

                      <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                        <Link to="/admin/settings">
                          <Settings className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{t('admin.settings')}</div>
                            <div className="text-sm text-muted-foreground">Configuration générale</div>
                          </div>
                        </Link>
                      </Button>

                      <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                        <Link to="/admin/appearance">
                          <Palette className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Apparence</div>
                            <div className="text-sm text-muted-foreground">Personnaliser l'interface</div>
                          </div>
                        </Link>
                      </Button>

                      <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                        <Link to="/media-showcase">
                          <Image className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Vitrine des médias</div>
                            <div className="text-sm text-muted-foreground">Voir vos images et carrousels en action</div>
                          </div>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Actions pour superadmins uniquement */}
                  {isSuperAdmin && (
                    <>
                      <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                        <Link to="/admin/database">
                          <Database className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{t('admin.database')}</div>
                            <div className="text-sm text-muted-foreground">Configuration MySQL</div>
                          </div>
                        </Link>
                      </Button>

                      <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                        <Link to="/admin/legal">
                          <Scale className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Mentions légales</div>
                            <div className="text-sm text-muted-foreground">Gérer les pages légales</div>
                          </div>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Profil utilisateur */}
          <div className="space-y-6">
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Mon compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Nom</p>
                  <p className="text-muted-foreground">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                {user?.company && (
                  <div>
                    <p className="text-sm font-medium">Entreprise</p>
                    <p className="text-muted-foreground">{user.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Membre depuis</p>
                  <p className="text-muted-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Aide et support */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Aide et support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/help">
                    <Settings className="h-4 w-4 mr-2" />
                    Documentation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/contact">
                    <Users className="h-4 w-4 mr-2" />
                    Contacter le support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};