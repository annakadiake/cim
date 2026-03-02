import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Search, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

interface LoginNotif {
  id: number;
  user: number;
  user_name: string;
  user_role: string;
  login_time: string;
  ip_address: string | null;
  is_read: boolean;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'superuser' || user?.role === 'admin';

  const [notifications, setNotifications] = useState<LoginNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isAdmin) return;
    try {
      const data = await api.getLoginNotifications();
      setNotifications(data.results || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="h-16 bg-gradient-to-r from-[#7a8345] to-[#5a6332] border-b border-[#5a6332] flex items-center justify-between px-4 lg:px-6 shadow-lg">
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
        {isAdmin && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowDropdown(!showDropdown); if (!showDropdown) fetchNotifications(); }}
              className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-800">Connexions récentes</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-[#7a8345] hover:text-[#5a6332] font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-neutral-400 text-sm">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-neutral-100 last:border-0 transition-colors ${
                          !notif.is_read ? 'bg-blue-50/50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                          !notif.is_read ? 'bg-[#7a8345]' : 'bg-neutral-300'
                        }`}>
                          {notif.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.is_read ? 'font-semibold text-neutral-800' : 'text-neutral-600'}`}>
                            {notif.user_name}
                          </p>
                          <p className="text-xs text-neutral-500">{notif.user_role}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {formatTime(notif.login_time)}
                            {notif.ip_address && ` • ${notif.ip_address}`}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-1 text-neutral-400 hover:text-[#7a8345] rounded transition-colors flex-shrink-0"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
              {user?.role === 'doctor' && 'Médecin'}
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
