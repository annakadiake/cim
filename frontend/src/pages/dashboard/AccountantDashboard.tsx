import React, { useEffect, useState } from 'react';
import { CreditCard, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QuickStats } from '@/components/dashboard/DashboardStats';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { AccountantDashboardStats } from '@/types';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';

export const AccountantDashboard: React.FC = () => {
  const [stats, setStats] = useState<AccountantDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    pending_invoices: stats.pending_invoices || [],
    invoices_status: stats.invoices_status || {
      draft: 0,
      sent: 0,
      partially_paid: 0,
      paid: 0,
      cancelled: 0
    },
    monthly_revenue: stats.monthly_revenue || 0,
    today: stats.today || new Date().toISOString(),
    start_of_month: stats.start_of_month || new Date().toISOString()
  };

  const quickStats = [
    
    {
      title: 'Factures en Attente',
      value: safeStats.pending_invoices.length,
      icon: AlertCircle,
      color: 'warning' as const,
    },
    {
      title: 'Factures Payées',
      value: safeStats.invoices_status.paid,
      icon: FileText,
      color: 'primary' as const,
    },
    
  ];

  return (
    <div className="space-y-6">
      {/* Header avec design AdminDashboard */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Dashboard Comptable</h1>
              <p className="text-neutral-600">
                Bienvenue, {safeStats.user.full_name || safeStats.user.username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Ce mois</p>
            <p className="text-sm font-medium text-neutral-700">
              {formatDate(safeStats.start_of_month)} - {formatDate(safeStats.today)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Factures en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeStats.pending_invoices.length > 0 ? (
                safeStats.pending_invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {invoice.patient_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Échéance: {formatDate(invoice.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900 mb-1">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                      <Badge 
                        className={getStatusColor(invoice.status)}
                        size="sm"
                      >
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune facture en attente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Statuts des Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                  <span className="text-sm text-neutral-600">Brouillons</span>
                </div>
                <Badge variant="default">{safeStats.invoices_status.draft}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600">Envoyées</span>
                </div>
                <Badge variant="info">{safeStats.invoices_status.sent}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600">Partiellement payées</span>
                </div>
                <Badge variant="warning">{safeStats.invoices_status.partially_paid}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600">Payées</span>
                </div>
                <Badge variant="success">{safeStats.invoices_status.paid}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600">Annulées</span>
                </div>
                <Badge variant="danger">{safeStats.invoices_status.cancelled}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

     

      {/* Quick Actions */}
      
    </div>
  );
};
