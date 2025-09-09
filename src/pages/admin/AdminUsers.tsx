import React, { useState, useEffect } from 'react';
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
  User as UserIcon,
  Mail,
  Calendar,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminUsersService, type User as AdminUser, type CreateUserData, type UpdateUserData } from '@/services/adminUsersService';

export const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // États pour les données
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // États pour les modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  
  // États pour les formulaires
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: '',
    password: '',
    name: '',
    role: 'user',
    company: ''
  });
  
  const [editForm, setEditForm] = useState<UpdateUserData>({
    name: '',
    role: 'user',
    company: '',
    status: 'active',
    email_verified: true,
    mfa_enabled: false
  });

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminUsersService.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter === 'all' ? '' : roleFilter,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs au montage et lors des changements de filtres
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  // Créer un utilisateur
  const handleCreateUser = async () => {
    try {
      await adminUsersService.createUser(createForm);
      toast({
        title: "Succès",
        description: "Utilisateur créé avec succès",
      });
      setIsCreateModalOpen(false);
      setCreateForm({ email: '', password: '', name: '', role: 'user', company: '' });
      loadUsers();
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : 'Erreur lors de la création',
        variant: "destructive",
      });
    }
  };

  // Mettre à jour un utilisateur
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await adminUsersService.updateUser(editingUser.id, editForm);
      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès",
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : 'Erreur lors de la mise à jour',
        variant: "destructive",
      });
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await adminUsersService.deleteUser(userId);
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });
      loadUsers();
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : 'Erreur lors de la suppression',
        variant: "destructive",
      });
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      company: user.company || '',
      status: user.status,
      email_verified: user.email_verified,
      mfa_enabled: user.mfa_enabled
    });
    setIsEditModalOpen(true);
  };

  // Obtenir la couleur du badge de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400';
      case 'pending_verification':
        return 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  // Obtenir la couleur du badge de rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
      case 'admin':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
      case 'user':
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des utilisateurs...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
              <p className="text-muted-foreground">
                Gérez les utilisateurs, leurs rôles et leurs permissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel Utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un Utilisateur</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouvel utilisateur au système
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="create-name">Nom</Label>
                      <Input
                        id="create-name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="Nom complet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-email">Email</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-password">Mot de passe</Label>
                      <Input
                        id="create-password"
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="Mot de passe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-role">Rôle</Label>
                      <Select
                        value={createForm.role}
                        onValueChange={(value: 'user' | 'admin' | 'superadmin') => 
                          setCreateForm({ ...createForm, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="create-company">Entreprise</Label>
                      <Input
                        id="create-company"
                        value={createForm.company}
                        onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold text-green-500">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Administrateurs</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entreprises</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {new Set(users.filter(u => u.company).map(u => u.company)).size}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending_verification">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
            <CardDescription>
              {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadUsers} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Email Vérifié</TableHead>
                      <TableHead>2FA</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role === 'superadmin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status === 'active' ? 'Actif' :
                             user.status === 'inactive' ? 'Inactif' : 'En attente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.company ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {user.company}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.email_verified ? "default" : "secondary"}>
                            {user.email_verified ? 'Oui' : 'Non'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.mfa_enabled ? "default" : "secondary"}>
                            {user.mfa_enabled ? 'Activé' : 'Désactivé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.role !== 'superadmin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal d'édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'Utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: 'user' | 'admin' | 'superadmin') => 
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-company">Entreprise</Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: 'active' | 'inactive' | 'pending_verification') => 
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending_verification">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-email-verified"
                  checked={editForm.email_verified}
                  onChange={(e) => setEditForm({ ...editForm, email_verified: e.target.checked })}
                />
                <Label htmlFor="edit-email-verified">Email vérifié</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-mfa-enabled"
                  checked={editForm.mfa_enabled}
                  onChange={(e) => setEditForm({ ...editForm, mfa_enabled: e.target.checked })}
                />
                <Label htmlFor="edit-mfa-enabled">2FA activé</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdateUser}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};