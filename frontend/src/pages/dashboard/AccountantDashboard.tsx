import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, FileText, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export const AccountantDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAccountantDashboard();
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
      <div className="space-y-5">
        <div className="animate-pulse">
          <div className="h-20 bg-neutral-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
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
    total_revenue: stats.total_revenue || 0,
    monthly_revenue: stats.monthly_revenue || 0,
    total_payments_amount: stats.total_payments_amount || 0,
    monthly_payments: stats.monthly_payments || 0,
    total_payments_count: stats.total_payments_count || 0,
    total_invoices: stats.total_invoices || 0,
    pending_invoices: stats.pending_invoices || [],
    recent_payments: stats.recent_payments || [],
    invoices_status: stats.invoices_status || {},
    today: stats.today || new Date().toISOString(),
    start_of_month: stats.start_of_month || new Date().toISOString(),
  };

  const formatMoney = (amount: number) => amount.toLocaleString('fr-FR') + ' FCFA';

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bienvenue, {s.user?.full_name || s.user?.username || 'Comptable'}
              </h1>
              <p className="text-white/80 text-sm">Tableau de bord — Finances & Paiements</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/15 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{new Date(s.today).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Cartes revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <p className="text-sm text-neutral-500">Paiements Reçus</p>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{formatMoney(s.total_payments_amount)}</p>
          <p className="text-xs text-neutral-400 mt-1">{s.total_payments_count} paiements complétés</p>
        </div>
      </div>

      {/* Cartes stats secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10">
          <p className="text-xs text-neutral-500">Revenu ce mois</p>
          <p className="text-lg font-bold text-[#636B2F]">{formatMoney(s.monthly_revenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10">
          <p className="text-xs text-neutral-500">Paiements ce mois</p>
          <p className="text-lg font-bold text-green-600">{formatMoney(s.monthly_payments)}</p>
        </div>
        <div onClick={() => navigate('/invoices')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <p className="text-xs text-neutral-500">Total Factures</p>
          <p className="text-lg font-bold text-neutral-800">{s.total_invoices}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-amber-200">
          <p className="text-xs text-neutral-500">En attente</p>
          <p className="text-lg font-bold text-amber-600">{s.pending_invoices.length}</p>
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
        {/* Factures en attente */}
        <div className="bg-white rounded-xl shadow-md border border-[#636B2F]/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 border-b border-[#636B2F]/10">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Factures en Attente
            </h3>
            <button onClick={() => navigate('/invoices')} className="text-xs text-[#636B2F] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {s.pending_invoices.length === 0 ? (
              <p className="text-sm text-neutral-400 p-4 text-center">Aucune facture en attente</p>
            ) : (
              s.pending_invoices.map((inv: any) => (
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
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => navigate('/payments')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <CreditCard className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Paiements</p>
          <p className="text-xs text-neutral-400">Enregistrer un paiement</p>
        </button>
        <button onClick={() => navigate('/invoices')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <FileText className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Factures</p>
          <p className="text-xs text-neutral-400">Gérer les factures</p>
        </button>
        <button onClick={() => navigate('/patients')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <FileText className="w-5 h-5 text-[#636B2F] mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Patients</p>
          <p className="text-xs text-neutral-400">Consulter les patients</p>
        </button>
        <button onClick={() => navigate('/reports')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <FileText className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Comptes Rendus</p>
          <p className="text-xs text-neutral-400">Voir les rapports</p>
        </button>
      </div>
    </div>
  );
};
