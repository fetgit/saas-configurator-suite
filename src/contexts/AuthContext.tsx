import React, { createContext, useContext, useState, useEffect } from 'react';

// Types d'utilisateur
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, company?: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Chargement de l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulation d'une connexion (à remplacer par votre API)
      // Pour le développement, on simule quelques utilisateurs
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'superadmin',
          company: 'SaaS Company',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'manager@client.com',
          name: 'Manager Client',
          role: 'admin',
          company: 'Client Company',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        {
          id: '3',
          email: 'user@client.com',
          name: 'Regular User',
          role: 'user',
          company: 'Client Company',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      ];

      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser && password === 'password') {
        const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, company?: string): Promise<boolean> => {
    try {
      // Simulation d'une inscription (à remplacer par votre API)
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'user',
        company,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        isAuthenticated, 
        isAdmin, 
        isSuperAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};