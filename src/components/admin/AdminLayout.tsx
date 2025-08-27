import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Link } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, logout, user } = useAuth();
  const { toast } = useToast();

  // Vérifier les permissions d'accès
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin && !isSuperAdmin) {
    toast({
      title: "Accès refusé",
      description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-admin-bg">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header d'administration */}
          <header className="h-16 bg-admin-header border-b border-border flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">
                  Interface d'administration
                </h1>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector variant="ghost" size="sm" />
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};