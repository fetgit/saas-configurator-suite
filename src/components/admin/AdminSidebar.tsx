import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Users, 
  Settings, 
  Database, 
  Palette, 
  BarChart3, 
  Shield, 
  Globe,
  Building2,
  Crown,
  Scale,
  Mail,
  MessageCircle,
  UserCheck,
  Zap,
  DollarSign,
  Star
} from 'lucide-react';

export function AdminSidebar() {
  const { user, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  // Menu items selon le niveau d'accès
  const adminItems = [
    { title: t('admin.users'), url: '/admin/users', icon: Users },
    { title: 'Gestion des tarifs', url: '/admin/pricing', icon: DollarSign },
    { title: t('admin.settings'), url: '/admin/settings', icon: Settings },
    { title: 'Communauté', url: '/admin/community', icon: UserCheck },
    { title: 'Mailing', url: '/admin/mailing', icon: Mail },
    { title: 'Chatbot IA', url: '/admin/chatbot', icon: MessageCircle },
    { title: 'Statistiques', url: '/admin/analytics', icon: BarChart3 },
    { title: 'Performances', url: '/admin/performance', icon: Zap },
  ];

  const superAdminItems = [
    { title: 'Toutes les entreprises', url: '/admin/companies', icon: Building2 },
    { title: t('admin.database'), url: '/admin/database', icon: Database },
    { title: t('admin.appearance'), url: '/admin/appearance', icon: Palette },
    { title: 'Mentions légales', url: '/admin/legal', icon: Scale },
  ];

  const securityItems = [
    { title: 'Sécurité globale', url: '/admin/security', icon: Shield },
    { title: 'Sécurité intégrée', url: '/admin/security-integrated', icon: Shield },
    { title: 'Headers de sécurité', url: '/admin/security-headers', icon: Shield },
    { title: 'Système', url: '/admin/system', icon: Settings },
  ];

  const items = isSuperAdmin ? [...adminItems, ...superAdminItems] : adminItems;

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent className="bg-admin-sidebar">
        {/* Header avec logo et titre */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex-shrink-0"></div>
            <div>
              <h2 className="text-sm font-semibold text-admin-sidebar-foreground">Administration</h2>
              <p className="text-xs text-admin-sidebar-foreground/70">
                {isSuperAdmin ? 'Super Admin' : 'Admin Client'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-admin-sidebar-foreground/80">
            {isSuperAdmin ? 'Gestion globale' : `Gestion - ${user?.company || 'Entreprise'}`}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Super Admin exclusive */}
        {isSuperAdmin && (
          <SidebarGroup className="px-2">
            <SidebarGroupLabel className="text-admin-sidebar-foreground/80 flex items-center gap-2">
              <Crown className="h-3 w-3" />
              Super Admin uniquement
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {securityItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Informations utilisateur en bas */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              {isSuperAdmin ? (
                <Crown className="h-4 w-4 text-primary" />
              ) : (
                <Users className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-admin-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-admin-sidebar-foreground/70 truncate">
                {user?.company}
              </p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}