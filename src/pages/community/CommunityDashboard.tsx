import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommunity } from '@/contexts/CommunityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  UsersRound, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  Crown,
  Building2,
  Globe
} from 'lucide-react';

export const CommunityDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { posts, groups, events, members, getPostsByCompany, getGroupsByCompany, getEventsByCompany } = useCommunity();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Statistiques selon le niveau d'accès
  const visiblePosts = getPostsByCompany();
  const visibleGroups = getGroupsByCompany();
  const visibleEvents = getEventsByCompany();

  const stats = {
    totalPosts: visiblePosts.length,
    myPosts: visiblePosts.filter(p => p.authorId === user?.id).length,
    totalMembers: user?.role === 'superadmin' ? members.length : members.filter(m => m.company === user?.company).length,
    myGroups: visibleGroups.filter(g => g.members.some(m => m.id === user?.id)).length,
    upcomingEvents: visibleEvents.filter(e => new Date(e.date) > new Date()).length,
    myEvents: visibleEvents.filter(e => e.attendees.includes(user?.id || '')).length,
  };

  const recentPosts = visiblePosts.slice(0, 5);
  const upcomingEvents = visibleEvents
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-primary text-primary-foreground';
      case 'help': return 'bg-warning text-warning-foreground';
      case 'general': return 'bg-secondary text-secondary-foreground';
      case 'feature': return 'bg-success text-success-foreground';
      case 'bug': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Header avec actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Communauté
              {user?.role === 'superadmin' && (
                <Badge className="bg-gradient-primary text-white ml-2">
                  <Crown className="h-3 w-3 mr-1" />
                  Globale
                </Badge>
              )}
              {user?.role === 'admin' && user?.company && (
                <Badge variant="secondary" className="ml-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  {user.company}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'superadmin' 
                ? 'Gérez et modérez toutes les communautés'
                : user?.role === 'admin'
                ? `Animez la communauté de ${user.company}`
                : 'Échangez avec votre communauté'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <Link to="/community/posts/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau post
              </Link>
            </Button>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Button variant="outline" asChild>
                <Link to="/community/moderation">
                  <Crown className="h-4 w-4 mr-2" />
                  Modération
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posts actifs</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                  <p className="text-xs text-muted-foreground">Dont {stats.myPosts} par moi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membres</p>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs text-success">
                    {members.filter(m => m.isOnline).length} en ligne
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <UsersRound className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mes groupes</p>
                  <p className="text-2xl font-bold">{stats.myGroups}</p>
                  <p className="text-xs text-muted-foreground">Sur {visibleGroups.length} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Événements</p>
                  <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                  <p className="text-xs text-muted-foreground">Dont {stats.myEvents} pour moi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Navigation rapide */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions rapides */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Navigation communauté</CardTitle>
                <CardDescription>
                  Accédez rapidement aux différentes sections de la communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                    <Link to="/community/posts">
                      <MessageSquare className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Forum & Discussions</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.totalPosts} posts actifs
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                    <Link to="/community/members">
                      <Users className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Membres</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.totalMembers} membres
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                    <Link to="/community/groups">
                      <UsersRound className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Groupes</div>
                        <div className="text-sm text-muted-foreground">
                          {visibleGroups.length} groupes disponibles
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                    <Link to="/community/events">
                      <Calendar className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Événements</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.upcomingEvents} à venir
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts récents */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Discussions récentes</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/community/posts">
                      Voir tout
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPosts.length > 0 ? recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{post.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(post.category)}`}
                          >
                            {post.category}
                          </Badge>
                          {post.isPinned && (
                            <Badge variant="outline" className="text-xs">
                              Épinglé
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {post.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Par {post.author.name}</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>{post.likes} ❤️</span>
                          <span>{post.replies.length} réponses</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune discussion récente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Événements à venir */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Prochains événements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.attendees.length} participants
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun événement à venir
                    </p>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/community/events">
                    Voir tous les événements
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Membres en ligne */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Membres en ligne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members
                    .filter(m => m.isOnline && (user?.role === 'superadmin' || m.company === user?.company))
                    .slice(0, 5)
                    .map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.title}</p>
                        </div>
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      </div>
                    ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/community/members">
                    Voir tous les membres
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Actions admin */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link to="/community/moderation">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Modération
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link to="/community/analytics">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Statistiques
                    </Link>
                  </Button>
                  
                  {user?.role === 'superadmin' && (
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link to="/community/settings">
                        <Building2 className="h-4 w-4 mr-2" />
                        Paramètres globaux
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};