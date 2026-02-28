import React, { useState, useEffect } from 'react';
import { Download, FileText, Search, Calendar, User, DollarSign, Filter, X } from 'lucide-react';
import { api } from '../lib/api';
import { Invoice } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { useToast } from '@/components/ui/Toast';

const InvoicePDFDownloads: React.FC = () => {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      const response = await api.getInvoices(Object.fromEntries(params));
      setInvoices(response.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setDownloading(invoice.id);
      const response = await api.downloadInvoicePDF(invoice.id);
      
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setShowFilters(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'paid': { bg: 'bg-gradient-to-r from-green-100 to-green-200', text: 'text-green-800', border: 'border-green-300', label: 'Payée' },
      'sent': { bg: 'bg-gradient-to-r from-[#636B2F]/10 to-[#636B2F]/20', text: 'text-[#636B2F]', border: 'border-[#636B2F]/30', label: 'Envoyée' },
      'partially_paid': { bg: 'bg-gradient-to-r from-orange-100 to-orange-200', text: 'text-orange-800', border: 'border-orange-300', label: 'Partiellement payée' },
      'draft': { bg: 'bg-gradient-to-r from-gray-100 to-gray-200', text: 'text-gray-800', border: 'border-gray-300', label: 'Brouillon' },
      'cancelled': { bg: 'bg-gradient-to-r from-red-100 to-red-200', text: 'text-red-800', border: 'border-red-300', label: 'Annulée' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Téléchargement PDF</h1>
            <p className="text-neutral-600">Téléchargez les factures au format PDF avec les clés d'accès patient</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#636B2F]/20 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#636B2F] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro, patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              showFilters 
                ? 'bg-gradient-to-r from-[#3F4A1F] to-[#3F4A1F]/80 text-white shadow-lg' 
                : 'border-2 border-[#3F4A1F]/20 text-[#3F4A1F] hover:bg-[#3F4A1F]/10 hover:border-[#3F4A1F]'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-[#636B2F]/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#636B2F] mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                  <option value="partially_paid">Partiellement payée</option>
                  <option value="paid">Payée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#3F4A1F] mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#3F4A1F]/20 rounded-xl focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#636B2F] mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-6 py-3 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 rounded-xl transition-all duration-300 font-medium"
              >
                <X className="h-4 w-4" />
                Effacer les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des factures */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#636B2F]/20 p-8 text-center shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#636B2F] mx-auto"></div>
            <p className="mt-2 text-neutral-600">Chargement des factures...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#636B2F]/20 p-8 text-center shadow-lg">
            <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Aucune facture trouvée
            </h3>
            <p className="text-neutral-600">
              Aucune facture ne correspond aux critères de recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="bg-white/80 backdrop-blur-sm border-2 border-[#636B2F]/10 hover:border-[#636B2F]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#636B2F]/20 to-[#3F4A1F]/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#636B2F]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-800 mb-1">{invoice.invoice_number}</h3>
                          <div className="flex items-center space-x-6 text-sm mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-[#636B2F]" />
                              <span className="font-medium text-neutral-700">
                                {invoice.patient_details?.full_name || `Patient #${invoice.patient}`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-[#3F4A1F]" />
                              <span className="text-neutral-600">
                                {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-neutral-800">
                                {invoice.total_amount.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {getStatusBadge(invoice.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        disabled={downloading === invoice.id}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {downloading === invoice.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        {downloading === invoice.id ? 'Téléchargement...' : 'Télécharger PDF'}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePDFDownloads;
