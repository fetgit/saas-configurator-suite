import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Crown, 
  Building2, 
  User,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types pour la gestion des utilisateurs
interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  company: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
}

export const AdminUsers = () => {
  const { user, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // États pour la gestion des utilisateurs
  const [users, setUsers] = useState<UserData[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);

  // Filtrage des utilisateurs selon les permissions
  const getFilteredUsers = () => {
    let filtered = users;

    // Si admin (pas super admin), voir seulement sa propre entreprise
    if (!isSuperAdmin && user?.company) {
      filtered = filtered.filter(u => u.company === user.company);
    }

    // Filtres de recherche
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (filterCompany !== 'all') {
      filtered = filtered.filter(u => u.company === filterCompany);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Statistiques
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.status === 'active').length,
    admins: filteredUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    companies: [...new Set(filteredUsers.map(u => u.company))].length,
  };

  // Fonctions utilitaires
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-gradient-primary text-white"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case 'admin':
        return <Badge variant="secondary"><Building2 className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="outline"><User className="h-3 w-3 mr-1" />Utilisateur</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "Utilisateur supprimé",
      description: "L'utilisateur a été supprimé avec succès.",
    });
  };

  const handleEditUser = (userData: UserData) => {
    setEditingUser(userData);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = (updatedUser: UserData) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsEditUserOpen(false);
    setEditingUser(null);
    toast({
      title: "Utilisateur modifié",
      description: "Les informations ont été mises à jour avec succès.",
    });
  };

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin' | 'superadmin') => {
    if (!isSuperAdmin && newRole === 'superadmin') {
      toast({
        title: "Action non autorisée",
        description: "Seuls les super administrateurs peuvent créer d'autres super administrateurs.",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    
    toast({
      title: "Rôle modifié",
      description: `Le rôle a été changé vers ${newRole === 'superadmin' ? 'Super Admin' : newRole === 'admin' ? 'Administrateur' : 'Utilisateur'}.`,
    });
  };

  const companies = [...new Set(users.map(u => u.company))];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">
              {isSuperAdmin 
                ? 'Gérez tous les utilisateurs de toutes les entreprises'
                : `Gérez les utilisateurs de ${user?.company}`
              }
            </p>
          </div>
          
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte utilisateur pour votre {isSuperAdmin ? 'plateforme' : 'entreprise'}.
                </DialogDescription>
              </DialogHeader>
              {/* Formulaire d'ajout - à développer */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      {isSuperAdmin && (
                        <SelectItem value="superadmin">Super Administrateur</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddUserOpen(false)} variant="outline" className="flex-1">
                    Annuler
                  </Button>
                  <Button className="flex-1">Créer l'utilisateur</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Administrateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.companies}</p>
                  <p className="text-sm text-muted-foreground">Entreprises</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="sr-only">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="user">Utilisateurs</SelectItem>
                  <SelectItem value="admin">Administrateurs</SelectItem>
                  {isSuperAdmin && (
                    <SelectItem value="superadmin">Super Admins</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {isSuperAdmin && (
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les entreprises</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs avec leurs informations et statuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    {isSuperAdmin && <TableHead>Entreprise</TableHead>}
                    <TableHead>Créé le</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{userData.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={userData.role} 
                          onValueChange={(value: 'user' | 'admin' | 'superadmin') => 
                            handleRoleChange(userData.id, value)
                          }
                          disabled={userData.id === user?.id} // Empêche de modifier son propre rôle
                        >
                          <SelectTrigger className="w-40">
                            <div className="flex items-center gap-2">
                              {userData.role === 'superadmin' && <Crown className="h-3 w-3" />}
                              {userData.role === 'admin' && <Building2 className="h-3 w-3" />}
                              {userData.role === 'user' && <User className="h-3 w-3" />}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-background border shadow-lg">
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Utilisateur
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                Administrateur
                              </div>
                            </SelectItem>
                            {isSuperAdmin && (
                              <SelectItem value="superadmin">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-3 w-3" />
                                  Super Admin
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{getStatusBadge(userData.status)}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {userData.company}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(userData.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {userData.lastLogin ? (
                          <div className="text-sm text-muted-foreground">
                            {formatDate(userData.lastLogin)}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Jamais</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(userData)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(userData.id)}
                            className="text-destructive hover:text-destructive"
                            disabled={userData.id === user?.id} // Empêche de se supprimer soi-même
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog d'édition d'utilisateur */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input 
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entreprise</Label>
                  <Input 
                    value={editingUser.company}
                    onChange={(e) => setEditingUser({...editingUser, company: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select 
                    value={editingUser.status} 
                    onValueChange={(value: 'active' | 'inactive' | 'pending') => 
                      setEditingUser({...editingUser, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value: 'user' | 'admin' | 'superadmin') => 
                      setEditingUser({...editingUser, role: value})
                    }
                    disabled={editingUser.id === user?.id} // Empêche de modifier son propre rôle
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Utilisateur
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          Administrateur
                        </div>
                      </SelectItem>
                      {isSuperAdmin && (
                        <SelectItem value="superadmin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-3 w-3" />
                            Super Administrateur
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsEditUserOpen(false)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={() => handleUpdateUser(editingUser)}
                    className="flex-1"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};