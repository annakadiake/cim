import React, { useEffect, useState } from 'react';
import { Users, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QuickStats } from '@/components/dashboard/DashboardStats';
import { api } from '@/lib/api';
import { SecretaryDashboardStats } from '@/types';
import { formatDate } from '@/lib/utils';

export const SecretaryDashboard: React.FC = () => {
  const [stats, setStats] = useState<SecretaryDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getSecretaryDashboard();
        setStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Erreur lors du chargement des données</p>
      </div>
    );
  }

  // Vérifications de sécurité pour éviter les erreurs
  const safeStats = {
    ...stats,
    user: stats.user || {},
    recent_patients: stats.recent_patients || [],
    recent_invoices: stats.recent_invoices || [],
    appointments_today: stats.appointments_today || 0,
    total_patients: stats.total_patients || 0,
    today: stats.today || new Date().toISOString()
  };

  const quickStats = [
   
    {
      title: 'Total Patients',
      value: safeStats.total_patients,
      icon: Users,
      color: 'secondary' as const,
    },
    {
      title: 'Patients Récents',
      value: safeStats.recent_patients.length,
      icon: Users,
      color: 'success' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec design AdminDashboard */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Dashboard Secrétaire</h1>
              <p className="text-neutral-600">
                Bienvenue, {safeStats.user.full_name || safeStats.user.username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Aujourd'hui</p>
            <p className="text-sm font-medium text-neutral-700">
              {formatDate(safeStats.today)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Patients Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeStats.recent_patients.length > 0 ? (
                safeStats.recent_patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {patient.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">
                        {formatDate(patient.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun patient récent</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Planning d'Aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Système de Rendez-vous
            </h3>
            <p className="text-neutral-600 mb-4">
              Le module de gestion des rendez-vous sera bientôt disponible.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">En développement</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
