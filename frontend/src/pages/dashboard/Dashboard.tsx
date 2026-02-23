import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { SecretaryDashboard } from './SecretaryDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { AccountantDashboard } from './AccountantDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers le dashboard approprié selon le rôle
  switch (user.role) {
    case 'superuser':
    case 'admin':
      return <AdminDashboard />;
    case 'secretary':
      return <SecretaryDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    default:
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Rôle non reconnu
          </h1>
          <p className="text-neutral-600">
            Votre rôle ({user.role}) n'est pas configuré pour accéder au dashboard.
          </p>
        </div>
      );
  }
};
