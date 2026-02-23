import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] border-b border-[#3F4A1F] flex items-center justify-between px-4 lg:px-6 shadow-lg">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden text-white hover:bg-white/20"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="hidden md:block">
          <Input
            placeholder="Rechercher..."
            icon={Search}
            className="w-64 bg-white/10 border-white/20 text-white placeholder-white/70"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Search button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white hover:bg-white/20"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative text-white hover:bg-white/20"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.username
              }
            </p>
            <p className="text-xs text-white/80">
              {user?.role === 'superuser' && 'Superutilisateur'}
              {user?.role === 'admin' && 'Administrateur'}
              {user?.role === 'doctor' && 'Docteur'}
              {user?.role === 'secretary' && 'Secrétaire'}
              {user?.role === 'accountant' && 'Comptable'}
            </p>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
            <span className="text-white font-semibold text-sm">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
