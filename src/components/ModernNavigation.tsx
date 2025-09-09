import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  Shield, 
  Database,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

interface ModernNavigationProps {
  items: NavigationItem[];
  className?: string;
  variant?: 'sidebar' | 'topbar' | 'mobile';
  showSearch?: boolean;
  showNotifications?: boolean;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
}

export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  items,
  className,
  variant = 'sidebar',
  showSearch = false,
  showNotifications = false,
  user
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);

  const location = useLocation();
  const navigate = useNavigate();

  // Déterminer l'élément actif basé sur la route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = items.find(item => 
      item.path === currentPath || 
      item.children?.some(child => child.path === currentPath)
    );
    if (activeItem) {
      setActiveItem(activeItem.id);
    }
  }, [location.pathname, items]);

  // Gérer l'expansion des éléments
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Filtrer les éléments basés sur la recherche
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Rendu des éléments de navigation
  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="relative">
        <motion.button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200',
            'hover:bg-primary-50 hover:text-primary-600',
            isActive && 'bg-primary-100 text-primary-600 shadow-sm',
            level > 0 && 'ml-4 text-sm'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-5 h-5 transition-colors',
              isActive ? 'text-primary-600' : 'text-gray-500'
            )}>
              {item.icon}
            </div>
            <span className="font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full"
              >
                {item.badge}
              </motion.span>
            )}
          </div>
          
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </motion.button>

        {/* Sous-éléments */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1">
                {item.children?.map(child => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Rendu de la barre de recherche
  const renderSearch = () => (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );

  // Rendu des notifications
  const renderNotifications = () => (
    <motion.button
      onClick={() => setNotifications(0)}
      className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Bell className="w-6 h-6" />
      {notifications > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
        >
          {notifications}
        </motion.span>
      )}
    </motion.button>
  );

  // Rendu du profil utilisateur
  const renderUserProfile = () => (
    <div className="flex items-center space-x-3 p-4 border-t border-gray-200">
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
        ) : (
          <User className="w-5 h-5 text-primary-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user?.role}
        </p>
      </div>
    </div>
  );

  // Rendu mobile
  if (variant === 'mobile') {
    return (
      <>
        <motion.button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                
                <div className="p-4 space-y-2">
                  {showSearch && renderSearch()}
                  {filteredItems.map(item => renderNavigationItem(item))}
                </div>
                
                {user && renderUserProfile()}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Rendu sidebar
  if (variant === 'sidebar') {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          'h-full bg-white border-r border-gray-200 flex flex-col',
          className
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {showSearch && renderSearch()}
          {filteredItems.map(item => renderNavigationItem(item))}
        </div>
        
        {user && renderUserProfile()}
      </motion.div>
    );
  }

  // Rendu topbar
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center space-x-8">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <div className="hidden md:flex items-center space-x-6">
          {filteredItems.map(item => renderNavigationItem(item))}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {showSearch && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}
        
        {showNotifications && renderNotifications()}
        
        {user && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
        )}
      </div>
    </motion.nav>
  );
};
