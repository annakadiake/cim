import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, ClipboardList, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export const SecretaryDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    total_patients: stats.total_patients || 0,
    patients_today: stats.patients_today || 0,
    patients_this_month: stats.patients_this_month || 0,
    total_invoices: stats.total_invoices || 0,
    invoices_today: stats.invoices_today || 0,
    invoices_status: stats.invoices_status || {},
    total_reports: stats.total_reports || 0,
    recent_patients: stats.recent_patients || [],
    recent_invoices: stats.recent_invoices || [],
    today: stats.today || new Date().toISOString(),
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
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bienvenue, {s.user?.full_name || s.user?.username || 'Secrétaire'}
              </h1>
              <p className="text-white/80 text-sm">Tableau de bord — Accueil & Patients</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/15 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{new Date(s.today).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        <div className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Aujourd'hui</p>
              <p className="text-xl font-bold text-neutral-800">{s.patients_today}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">patients enregistrés</p>
        </div>

        <div onClick={() => navigate('/invoices')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Factures</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_invoices}</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">+{s.invoices_today} aujourd'hui</p>
        </div>

        <div onClick={() => navigate('/reports')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Comptes Rendus</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_reports}</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">rapports disponibles</p>
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
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#636B2F]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#636B2F] font-semibold text-xs">
                        {p.first_name?.charAt(0)}{p.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-neutral-400">{p.phone_number}</p>
                    </div>
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
              <FileText className="w-4 h-4 text-amber-600" />
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
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => navigate('/patients')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <Users className="w-5 h-5 text-[#636B2F] mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Nouveau Patient</p>
          <p className="text-xs text-neutral-400">Enregistrer un patient</p>
        </button>
        <button onClick={() => navigate('/invoices')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <FileText className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Nouvelle Facture</p>
          <p className="text-xs text-neutral-400">Créer une facture</p>
        </button>
        <button onClick={() => navigate('/reports')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <ClipboardList className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Comptes Rendus</p>
          <p className="text-xs text-neutral-400">Gérer les rapports</p>
        </button>
        <button onClick={() => navigate('/payments')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <FileText className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Paiements</p>
          <p className="text-xs text-neutral-400">Voir les paiements</p>
        </button>
      </div>
    </div>
  );
};
