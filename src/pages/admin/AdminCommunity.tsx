import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Users, 
  MessageSquare, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Ban,
  UserX,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useCommunity } from '@/contexts/CommunityContext';

export function AdminCommunity() {
  const { members, posts, groups, events } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings state
  const [autoModeration, setAutoModeration] = useState(false);
  const [memberValidation, setMemberValidation] = useState(false);
  const [moderationNotifications, setModerationNotifications] = useState(true);
  const [communityRules, setCommunityRules] = useState(`1. Respectez les autres membres
2. Pas de contenu inapproprié
3. Utilisez les bonnes catégories
4. Pas de spam ou publicité non autorisée`);

  // Mock moderated posts data
  const moderatedPosts = posts.filter(post => post.category === 'general').slice(0, 5);
  const reportedContent: any[] = [];

  const handleModerationAction = async (action: string, itemId: number) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Action "${action}" appliquée avec succès`);
    setIsLoading(false);
  };

  const handleBanUser = async (userId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Utilisateur banni avec succès');
    setIsLoading(false);
  };

  const handleViewItem = (type: string, id: string) => {
    toast.info(`Affichage ${type} - ID: ${id}`);
  };

  const handleOpenSettings = () => {
    toast.info('Ouverture des paramètres avancés de la communauté');
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Paramètres sauvegardés avec succès');
    setIsLoading(false);
  };

  const handleResetSettings = () => {
    setAutoModeration(false);
    setMemberValidation(false);
    setModerationNotifications(true);
    setCommunityRules(`1. Respectez les autres membres
2. Pas de contenu inapproprié
3. Utilisez les bonnes catégories
4. Pas de spam ou publicité non autorisée`);
    toast.success('Paramètres réinitialisés');
  };

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && member.isOnline) ||
                         (filterStatus === 'inactive' && !member.isOnline);
    return matchesSearch && matchesStatus;
  });

  const communityStats = {
    totalMembers: members.length,
    activePosts: posts.length,
    totalGroups: groups.length,
    totalEvents: events.length,
    pendingReports: reportedContent.length,
    bannedUsers: 2
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion de la Communauté</h1>
            <p className="text-muted-foreground">
              Modération et administration de la communauté
            </p>
          </div>
          <Button onClick={handleOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres communauté
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">+12% ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publications</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.activePosts}</div>
              <p className="text-xs text-muted-foreground">+8% ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groupes</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalGroups}</div>
              <p className="text-xs text-muted-foreground">+3 nouveaux</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">5 à venir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{communityStats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">À traiter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bannis</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.bannedUsers}</div>
              <p className="text-xs text-muted-foreground">Utilisateurs</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="moderation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="moderation">Modération</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contenu signalé</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gérez les contenus signalés par la communauté
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Contenu</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Signalements</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportedContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{item.reports}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleModerationAction('approve', item.id)}
                              disabled={isLoading}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleModerationAction('delete', item.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewItem('contenu signalé', item.id.toString())}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des membres</CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Rechercher un membre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="inactive">Inactifs</SelectItem>
                      <SelectItem value="banned">Bannis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.slice(0, 10).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>
                        <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={member.isOnline ? "default" : "secondary"}>
                            {member.isOnline ? 'En ligne' : 'Hors ligne'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBanUser(member.id)}
                              disabled={isLoading}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewItem('membre', member.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du contenu</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Publications, groupes et événements de la communauté
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Publications récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {moderatedPosts.map((post) => (
                          <div key={post.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm truncate">{post.title}</p>
                              <p className="text-xs text-muted-foreground">par {post.author.name}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewItem('publication', post.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Groupes actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groups.slice(0, 5).map((group) => (
                          <div key={group.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm truncate">{group.name}</p>
                              <p className="text-xs text-muted-foreground">{group.members.length} membres</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewItem('groupe', group.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Événements à venir</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {events.slice(0, 5).map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewItem('événement', event.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la communauté</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configurez les règles et paramètres globaux
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modération automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer la modération automatique des contenus
                      </p>
                    </div>
                    <Switch 
                      checked={autoModeration}
                      onCheckedChange={setAutoModeration}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Validation des nouveaux membres</Label>
                      <p className="text-sm text-muted-foreground">
                        Approuver manuellement les nouveaux membres
                      </p>
                    </div>
                    <Switch 
                      checked={memberValidation}
                      onCheckedChange={setMemberValidation}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications de modération</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications pour les actions de modération
                      </p>
                    </div>
                    <Switch 
                      checked={moderationNotifications}
                      onCheckedChange={setModerationNotifications}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Règles de la communauté</Label>
                  <Textarea
                    placeholder="Saisissez les règles de votre communauté..."
                    className="min-h-[120px]"
                    value={communityRules}
                    onChange={(e) => setCommunityRules(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    Sauvegarder les paramètres
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleResetSettings}
                    disabled={isLoading}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}