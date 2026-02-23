import React, { useEffect, useState } from 'react';
import { FileText, Stethoscope, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { DoctorDashboardStats } from '@/types';
import { formatDate } from '@/lib/utils';

export const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DoctorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDoctorDashboard();
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
    recent_reports: stats.recent_reports || [],
    upcoming_appointments: stats.upcoming_appointments || [],
    total_reports: stats.total_reports || 0,
    total_patients: (stats as any).total_patients || 0,
    total_exams: (stats as any).total_exams || 0,
    today: stats.today || new Date().toISOString()
  };


  return (
    <div className="space-y-6">
      {/* Header avec design AdminDashboard */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Dashboard Docteur</h1>
              <p className="text-neutral-600">
                Bienvenue, Dr. {safeStats.user.full_name || safeStats.user.username}
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



      {/* Medical Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary-600" />
            Activité Médicale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#636B2F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#636B2F]/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Total Patients</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">{safeStats.total_patients || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#3F4A1F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3F4A1F] to-[#3F4A1F]/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Total Examens</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#3F4A1F] to-[#636B2F] bg-clip-text text-transparent">{safeStats.total_exams || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Comptes Rendus</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">{safeStats.total_reports}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
