import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response: AuthResponse = await api.login(credentials);
      
      // Stocker les tokens et les données utilisateur
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = (): void => {
    api.logout();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Superuser et admin ont tous les droits
    if (user.role === 'superuser' || user.role === 'admin') {
      return true;
    }
    
    // Permissions par rôle
    const rolePermissions: Record<string, string[]> = {
      doctor: ['patients', 'exams', 'reports'],
      secretary: ['patients', 'appointments', 'invoices', 'exams', 'reports'],
      accountant: ['invoices', 'invoices_full', 'payments'],
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
