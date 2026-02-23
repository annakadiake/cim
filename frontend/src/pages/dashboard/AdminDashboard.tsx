import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Shield, DollarSign, Stethoscope, CreditCard, TrendingUp, ClipboardList, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          <div className="h-20 bg-neutral-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-xl"></div>
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

  const s = {
    user: stats.user || {},
    total_patients: stats.total_patients || 0,
    patients_this_month: stats.patients_this_month || 0,
    total_invoices: stats.total_invoices || 0,
    total_exams: stats.total_exams || 0,
    total_reports: stats.total_reports || 0,
    total_users: stats.total_users || 0,
    users_by_role: stats.users_by_role || {},
    total_revenue: stats.total_revenue || 0,
    monthly_revenue: stats.monthly_revenue || 0,
    weekly_revenue: stats.weekly_revenue || 0,
    total_payments: stats.total_payments || 0,
    total_payments_amount: stats.total_payments_amount || 0,
    monthly_payments: stats.monthly_payments || 0,
    invoices_status: stats.invoices_status || {},
    recent_patients: stats.recent_patients || [],
    recent_invoices: stats.recent_invoices || [],
    recent_payments: stats.recent_payments || [],
    recent_users: stats.recent_users || [],
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon', sent: 'Envoyée', partially_paid: 'Partiel',
      paid: 'Payée', cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-neutral-100 text-neutral-700',
      sent: 'bg-blue-100 text-blue-700',
      partially_paid: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-700';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      superuser: 'Super', admin: 'Admin', doctor: 'Docteur',
      secretary: 'Secrétaire', accountant: 'Comptable',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bienvenue, {s.user?.full_name || s.user?.username || 'Administrateur'}
              </h1>
              <p className="text-white/80 text-sm">Tableau de bord — Vue d'ensemble du système</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/15 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Système opérationnel</span>
          </div>
        </div>
      </div>

      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div onClick={() => navigate('/patients')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#636B2F]/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#636B2F]" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Patients</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_patients}</p>
            </div>
          </div>
          <p className="text-xs text-[#636B2F] mt-2">+{s.patients_this_month} ce mois</p>
        </div>

        <div onClick={() => navigate('/invoices')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Factures</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_invoices}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">{s.invoices_status.paid || 0} payées</p>
        </div>

        <div onClick={() => navigate('/payments')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Paiements</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_payments}</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">{formatMoney(s.monthly_payments)} ce mois</p>
        </div>

        <div onClick={() => navigate('/exams')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Examens</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_exams}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">types actifs</p>
        </div>

        <div onClick={() => navigate('/reports')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Rapports</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_reports}</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">comptes rendus</p>
        </div>

        <div onClick={() => navigate('/users')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Utilisateurs</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_users}</p>
            </div>
          </div>
          <p className="text-xs text-red-500 mt-2">{Object.keys(s.users_by_role).length} rôles</p>
        </div>
      </div>

      {/* Revenus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80">Revenu Total</p>
            <DollarSign className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-2xl font-bold">{formatMoney(s.total_revenue)}</p>
          <p className="text-xs text-white/60 mt-1">Toutes factures payées</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-[#636B2F]/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-500">Revenu Mensuel</p>
            <TrendingUp className="w-5 h-5 text-[#636B2F]" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{formatMoney(s.monthly_revenue)}</p>
          <p className="text-xs text-neutral-400 mt-1">Ce mois-ci</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-[#636B2F]/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-500">Paiements Reçus</p>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{formatMoney(s.total_payments_amount)}</p>
          <p className="text-xs text-neutral-400 mt-1">{s.total_payments} paiements complétés</p>
        </div>
      </div>

      {/* Factures par statut */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-[#636B2F]/10">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Factures par statut</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(s.invoices_status).map(([status, count]) => (
            <div key={status} className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(status)}`}>
              {getStatusLabel(status)}: <span className="font-bold">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tableaux récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Derniers patients */}
        <div className="bg-white rounded-xl shadow-md border border-[#636B2F]/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 border-b border-[#636B2F]/10">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#636B2F]" />
              Derniers Patients
            </h3>
            <button onClick={() => navigate('/patients')} className="text-xs text-[#636B2F] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {s.recent_patients.length === 0 ? (
              <p className="text-sm text-neutral-400 p-4 text-center">Aucun patient</p>
            ) : (
              s.recent_patients.map((p: any) => (
                <div key={p.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-neutral-400">{p.phone_number}</p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dernières factures */}
        <div className="bg-white rounded-xl shadow-md border border-[#636B2F]/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 border-b border-[#636B2F]/10">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Dernières Factures
            </h3>
            <button onClick={() => navigate('/invoices')} className="text-xs text-[#636B2F] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {s.recent_invoices.length === 0 ? (
              <p className="text-sm text-neutral-400 p-4 text-center">Aucune facture</p>
            ) : (
              s.recent_invoices.map((inv: any) => (
                <div key={inv.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{inv.invoice_number}</p>
                    <p className="text-xs text-neutral-400">{inv.patient_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-800">{formatMoney(inv.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(inv.status)}`}>
                      {getStatusLabel(inv.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Derniers paiements */}
        <div className="bg-white rounded-xl shadow-md border border-[#636B2F]/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 border-b border-[#636B2F]/10">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              Derniers Paiements
            </h3>
            <button onClick={() => navigate('/payments')} className="text-xs text-[#636B2F] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {s.recent_payments.length === 0 ? (
              <p className="text-sm text-neutral-400 p-4 text-center">Aucun paiement</p>
            ) : (
              s.recent_payments.map((p: any) => (
                <div key={p.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{p.patient_name}</p>
                    <p className="text-xs text-neutral-400">{p.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+{formatMoney(p.amount)}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(p.payment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Utilisateurs par rôle */}
        <div className="bg-white rounded-xl shadow-md border border-[#636B2F]/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 border-b border-[#636B2F]/10">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Équipe ({s.total_users} utilisateurs)
            </h3>
            <button onClick={() => navigate('/users')} className="text-xs text-[#636B2F] hover:underline flex items-center gap-1">
              Gérer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(s.users_by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{getRoleLabel(role)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] rounded-full"
                      style={{ width: `${Math.min(((count as number) / s.total_users) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-neutral-800 w-6 text-right">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
