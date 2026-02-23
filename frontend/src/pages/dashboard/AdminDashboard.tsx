import React, { useEffect, useState } from 'react';
import { Users, FileText, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { AdminDashboardStats } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminDashboard();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
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
    users_by_role: stats.users_by_role || {},
    recent_users: stats.recent_users || [],
    total_users: stats.total_users || 0,
    total_patients: stats.total_patients || 0,
    total_invoices: stats.total_invoices || 0,
    total_revenue: stats.total_revenue || 0
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Dashboard Administrateur
            </h1>
            <p className="text-neutral-600">
              Bienvenue, {safeStats.user?.full_name || safeStats.user?.username || 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF]/95">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-3">
              Espace d'Administration
            </h2>
            <p className="text-neutral-600 max-w-lg mx-auto">
              Gérez efficacement votre système médical avec les outils d'administration avancés.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#636B2F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#636B2F]/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Patients Enregistrés</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">{safeStats.total_patients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#3F4A1F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3F4A1F] to-[#3F4A1F]/80 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Factures Créées</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#3F4A1F] to-[#636B2F] bg-clip-text text-transparent">{safeStats.total_invoices}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-full border border-[#636B2F]/20">
              <div className="w-2 h-2 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] rounded-full animate-pulse"></div>
              <span className="text-sm bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent font-medium">Système opérationnel</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
