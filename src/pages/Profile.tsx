import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  Shield, 
  Save, 
  Lock,
  Crown,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Redirection si non connecté
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // États pour l'édition du profil
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    company: user.company || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Ici vous intégreriez avec votre API pour sauvegarder le profil
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    // Ici vous intégreriez avec votre API pour changer le mot de passe
    toast({
      title: "Mot de passe mis à jour",
      description: "Votre mot de passe a été changé avec succès.",
    });
    
    setProfileData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setIsChangingPassword(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return (
          <Badge className="bg-gradient-primary text-white">
            <Crown className="h-3 w-3 mr-1" />
            Super Administrateur
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            Administrateur
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Utilisateur
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header du profil */}
          <Card className="shadow-large border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
              <div className="flex flex-col items-center gap-2 mt-4">
                {getRoleBadge(user.role)}
                {user.company && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {user.company}
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne principale - Informations du profil */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations personnelles */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations personnelles
                    </span>
                    <Button 
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Annuler" : "Modifier"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Gérez vos informations personnelles et coordonnées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing || user.role === 'admin'} // Admin ne peut pas changer son entreprise
                      placeholder="Nom de votre entreprise"
                    />
                    {user.role === 'admin' && (
                      <p className="text-xs text-muted-foreground">
                        Contactez un super administrateur pour modifier votre entreprise
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="pt-4">
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder les modifications
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Changement de mot de passe */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Sécurité du compte
                    </span>
                    <Button 
                      variant={isChangingPassword ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                    >
                      {isChangingPassword ? "Annuler" : "Changer le mot de passe"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Modifiez votre mot de passe pour sécuriser votre compte
                  </CardDescription>
                </CardHeader>
                {isChangingPassword && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={profileData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Votre mot de passe actuel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Nouveau mot de passe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Répétez le nouveau mot de passe"
                      />
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleChangePassword}>
                        <Lock className="h-4 w-4 mr-2" />
                        Mettre à jour le mot de passe
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Colonne latérale - Informations du compte */}
            <div className="space-y-6">
              {/* Informations du compte */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Niveau d'accès</p>
                    {getRoleBadge(user.role)}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-1">Identifiant unique</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-1">Membre depuis</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-1">Dernière connexion</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Retour au dashboard
                    </a>
                  </Button>

                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/admin/users">
                        <Crown className="h-4 w-4 mr-2" />
                        Interface d'administration
                      </a>
                    </Button>
                  )}

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/help">
                      <Mail className="h-4 w-4 mr-2" />
                      Aide et support
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Permissions utilisateur */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accès dashboard</span>
                      <Badge variant="outline" className="text-success border-success">Accordé</Badge>
                    </div>
                    
                    {user.role === 'admin' || user.role === 'superadmin' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gestion utilisateurs</span>
                          <Badge variant="outline" className="text-success border-success">Accordé</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Configuration système</span>
                          <Badge variant="outline" className={user.role === 'superadmin' ? "text-success border-success" : "text-muted-foreground"}>
                            {user.role === 'superadmin' ? 'Accordé' : 'Refusé'}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gestion utilisateurs</span>
                          <Badge variant="outline" className="text-muted-foreground">Refusé</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Configuration système</span>
                          <Badge variant="outline" className="text-muted-foreground">Refusé</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};