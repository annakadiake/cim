import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  CreditCard, 
  Stethoscope, 
  Settings, 
  LogOut,
  Home,
  UserCheck,
  Download,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Patients',
      href: '/patients',
      icon: Users,
      permission: 'patients',
    },
    {
      label: 'Examens',
      href: '/exams',
      icon: Stethoscope,
      permission: 'exams',
    },
    {
      label: 'Factures',
      href: '/invoices',
      icon: FileText,
      permission: 'invoices_full',
    },
    {
      label: 'Paiements',
      href: '/payments',
      icon: CreditCard,
      permission: 'payments',
    },
    {
      label: 'Téléchargement PDF',
      href: '/invoice-downloads',
      icon: Download,
      permission: 'invoices',
    },
    {
      label: 'Comptes Rendus',
      href: '/reports',
      icon: FileText,
      permission: 'reports',
    },
    {
      label: 'Utilisateurs',
      href: '/users',
      icon: UserCheck,
      permission: 'users',
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          
              {/* Logo personnalisé */}
              <div className="w-full bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                <img
                  src="/src/assets/images/cimef.png"
                  alt="Logo"
                  className="w-32 h-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                
              </div>
              
         

         
          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out",
                  isActive 
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25" 
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  "group-hover:scale-110 transition-transform duration-200"
                )} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className={cn(
                  "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "group-[.active]:opacity-100"
                )} />
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-neutral-200 space-y-2 bg-neutral-50/50">
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out",
                isActive 
                  ? "bg-gradient-to-r from-neutral-600 to-neutral-700 text-white shadow-lg" 
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
              )}
            >
              <Settings className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="flex-1">Paramètres</span>
            </NavLink>
            
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
            >
              <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="flex-1 text-left">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
