import React from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { config } = useAppearance();
  const navigate = useNavigate();

  // Debug du contexte Appearance
  React.useEffect(() => {
    console.log('🔍 Header - Contexte Appearance mis à jour:', {
      companyName: config.branding.companyName,
      logoUrl: config.branding.logoUrl,
      faviconUrl: config.branding.faviconUrl,
      logoId: config.branding.logoId,
      faviconId: config.branding.faviconId
    });
  }, [config.branding]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header 
      className={`w-full border-b transition-all duration-300 ${
        transparent 
          ? 'bg-transparent border-white/20 backdrop-blur-sm' 
          : 'bg-background/95 backdrop-blur-md border-border'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {config.branding.logoUrl ? (
              <img 
                src={config.branding.logoUrl} 
                alt={config.branding.companyName}
                className="w-8 h-8 rounded-lg object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
            )}
            <span className={`text-xl font-bold ${transparent ? 'text-white' : 'text-foreground'}`}>
              {config.branding.companyName}
            </span>
          </Link>

          {/* Navigation avec communauté */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`hover:text-primary transition-colors ${
                transparent ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/features" 
              className={`hover:text-primary transition-colors ${
                transparent ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
              }`}
            >
              {t('nav.features')}
            </Link>
            <Link 
              to="/pricing" 
              className={`hover:text-primary transition-colors ${
                transparent ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
              }`}
            >
              {t('nav.pricing')}
            </Link>
            {isAuthenticated && (
              <Link 
                to="/community" 
                className={`hover:text-primary transition-colors ${
                  transparent ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
                }`}
              >
                Communauté
              </Link>
            )}
            <Link 
              to="/contact" 
              className={`hover:text-primary transition-colors ${
                transparent ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
              }`}
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            <LanguageSelector variant={transparent ? 'ghost' : 'ghost'} />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Link */}
                <Button 
                  variant={transparent ? 'ghost' : 'ghost'} 
                  asChild
                  className={transparent ? 'text-white hover:text-white hover:bg-white/10' : ''}
                >
                  <Link to="/dashboard">{t('nav.dashboard')}</Link>
                </Button>

                {/* User Menu - Version simplifiée */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={transparent ? 'ghost' : 'ghost'} 
                    size="sm"
                    asChild
                    className={`gap-2 ${transparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                  >
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                      Profil
                    </Link>
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Button 
                      variant={transparent ? 'ghost' : 'ghost'} 
                      size="sm"
                      asChild
                      className={`gap-2 ${transparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                    >
                      <Link to="/admin">
                        <Settings className="h-4 w-4" />
                        {t('nav.admin')}
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant={transparent ? 'ghost' : 'ghost'} 
                    size="sm"
                    onClick={handleLogout}
                    className={`gap-2 ${transparent ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('auth.logout')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant={transparent ? 'ghost' : 'ghost'} 
                  asChild
                  className={transparent ? 'text-white hover:text-white hover:bg-white/10' : ''}
                >
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button 
                  variant={transparent ? 'outline' : 'default'}
                  asChild
                  className={transparent ? 'border-white text-white hover:bg-white hover:text-primary' : ''}
                >
                  <Link to="/register">{t('nav.register')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};