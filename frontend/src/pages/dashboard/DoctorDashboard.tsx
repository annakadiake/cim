import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Stethoscope, Users, ClipboardList, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    patients_this_month: stats.patients_this_month || 0,
    total_reports: stats.total_reports || 0,
    reports_this_month: stats.reports_this_month || 0,
    total_exam_types: stats.total_exam_types || 0,
    recent_reports: stats.recent_reports || [],
    recent_patients: stats.recent_patients || [],
    today: stats.today || new Date().toISOString(),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bienvenue, Dr. {s.user?.full_name || s.user?.username || 'Médecin'}
              </h1>
              <p className="text-white/80 text-sm">Tableau de bord — Activité médicale</p>
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
          <p className="text-xs text-green-600 mt-2">+{s.reports_this_month} ce mois</p>
        </div>

        <div onClick={() => navigate('/exams')} className="cursor-pointer bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Types d'Examens</p>
              <p className="text-xl font-bold text-neutral-800">{s.total_exam_types}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">examens actifs</p>
        </div>

        <div className="bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl p-4 shadow-md text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/70">Ce mois</p>
              <p className="text-xl font-bold">{s.reports_this_month}</p>
            </div>
          </div>
          <p className="text-xs text-white/60 mt-2">rapports uploadés</p>
        </div>
      </div>

      {/* Tableaux récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Derniers comptes rendus */}
        <div className="bg-white rounded-xl shadow-md border border-[#636B2F]/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 border-b border-[#636B2F]/10">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-green-600" />
              Derniers Comptes Rendus
            </h3>
            <button onClick={() => navigate('/reports')} className="text-xs text-[#636B2F] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {s.recent_reports.length === 0 ? (
              <p className="text-sm text-neutral-400 p-4 text-center">Aucun rapport</p>
            ) : (
              s.recent_reports.map((r: any) => (
                <div key={r.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{r.patient_name}</p>
                      <p className="text-xs text-neutral-400">{r.report_type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

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
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button onClick={() => navigate('/reports')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <ClipboardList className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Comptes Rendus</p>
          <p className="text-xs text-neutral-400">Uploader un rapport</p>
        </button>
        <button onClick={() => navigate('/patients')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <Users className="w-5 h-5 text-[#636B2F] mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Patients</p>
          <p className="text-xs text-neutral-400">Consulter les dossiers</p>
        </button>
        <button onClick={() => navigate('/exams')} className="bg-white rounded-xl p-4 shadow-md border border-[#636B2F]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left">
          <Stethoscope className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">Examens</p>
          <p className="text-xs text-neutral-400">Types d'examens</p>
        </button>
      </div>
    </div>
  );
};
