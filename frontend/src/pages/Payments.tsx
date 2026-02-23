import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  DollarSign,
  Phone,
  Building2
} from 'lucide-react';
import { api } from '@/lib/api';
import { Payment, Invoice, PaymentSummary } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const Payments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  // Permissions
  const canCreate = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'secretary' || user?.role === 'accountant';
  const canEdit = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'accountant';
  const canDelete = user?.role === 'superuser' || user?.role === 'admin';
  const canDownloadPDF = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'accountant' || user?.role === 'secretary';

  const [formData, setFormData] = useState({
    invoice: '',
    amount: '',
    payment_method: 'cash' as Payment['payment_method'],
    payment_date: new Date().toISOString().split('T')[0],
    status: 'completed' as Payment['status'],
    reference_number: '',
    transaction_id: '',
    phone_number: '',
    operator_reference: '',
    notes: ''
  });

  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'check', label: 'Chèque' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'wave', label: 'Wave' },
    { value: 'free_money', label: 'Free Money' },
    { value: 'credit_card', label: 'Carte de crédit' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'completed', label: 'Complété' },
    { value: 'failed', label: 'Échoué' },
    { value: 'cancelled', label: 'Annulé' },
    { value: 'refunded', label: 'Remboursé' }
  ];

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchSummary();
  }, [currentPage, searchTerm, statusFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(statusFilter && { status: statusFilter }),
        ...(methodFilter && { payment_method: methodFilter })
      });

      const response = await api.getPayments(Object.fromEntries(params));
      setPayments(response.results);
      setTotalPages(Math.ceil(response.count / 20));
    } catch (err) {
      setError('Erreur lors du chargement des paiements');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.getInvoices({ status: 'sent,partially_paid' });
      setInvoices(response.results || []);
      console.log('Factures chargées:', response.results?.length || 0);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.getPaymentSummary();
      setSummary(response);
    } catch (err) {
      console.error('Error fetching payment summary:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...formData,
        invoice: parseInt(formData.invoice),
        amount: parseInt(formData.amount),
        payment_date: new Date(formData.payment_date).toISOString()
      };

      console.log('Données envoyées:', paymentData);

      if (editingPayment) {
        await api.updatePayment(editingPayment.id, paymentData);
      } else {
        await api.createPayment(paymentData);
      }

      setShowModal(false);
      setEditingPayment(null);
      resetForm();
      fetchPayments();
      fetchSummary();
    } catch (err: any) {
      console.error('Erreur détaillée:', err.response?.data);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      invoice: payment.invoice.toString(),
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date.split('T')[0],
      status: payment.status,
      reference_number: payment.reference_number || '',
      transaction_id: payment.transaction_id || '',
      phone_number: payment.phone_number || '',
      operator_reference: payment.operator_reference || '',
      notes: payment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await api.deletePayment(id);
        fetchPayments();
        fetchSummary();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };


  const resetForm = () => {
    setFormData({
      invoice: '',
      amount: '',
      payment_method: 'cash' as Payment['payment_method'],
      payment_date: new Date().toISOString().split('T')[0],
      status: 'completed' as Payment['status'],
      reference_number: '',
      transaction_id: '',
      phone_number: '',
      operator_reference: '',
      notes: ''
    });
  };


  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'mobile_money':
      case 'orange_money':
      case 'wave':
      case 'free_money':
        return <Phone className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête modernisé */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Gestion des Paiements</h1>
              <p className="text-neutral-600">Suivi et gestion des paiements des factures</p>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5" />
              Nouveau Paiement
            </button>
          )}
        </div>
      </div>

      {/* Statistiques avec design PatientReports */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#636B2F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#636B2F]/80 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Paiements</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">{summary.total_payments.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#3F4A1F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3F4A1F] to-[#3F4A1F]/80 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Nombre de Paiements</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#3F4A1F] to-[#636B2F] bg-clip-text text-transparent">{summary.payment_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#636B2F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#636B2F]/80 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Mobile Money</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">{summary.total_mobile_money.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#3F4A1F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3F4A1F] to-[#3F4A1F]/80 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Espèces</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#3F4A1F] to-[#636B2F] bg-clip-text text-transparent">{summary.total_cash.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche modernisés */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#636B2F]/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#636B2F] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par référence, numéro de facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-[#3F4A1F]/20 rounded-xl focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
          >
            <option value="">Toutes les méthodes</option>
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des paiements modernisée */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#636B2F]/20 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 p-6 border-b border-[#636B2F]/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
              Liste des Paiements
            </h3>
          </div>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#636B2F]/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Facture */}
                    <div className="md:col-span-1">
                      <div className="text-xs font-semibold text-[#636B2F] mb-1">FACTURE</div>
                      <div className="text-sm font-bold text-neutral-800">
                        {payment.invoice_details?.invoice_number || `#${payment.invoice}`}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {payment.invoice_details?.patient_name}
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="md:col-span-1">
                      <div className="text-xs font-semibold text-[#3F4A1F] mb-1">MONTANT</div>
                      <div className="text-sm font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
                        {payment.amount.toLocaleString()} FCFA
                      </div>
                      {payment.is_partial_payment && (
                        <div className="text-xs text-orange-600 font-medium">Partiel</div>
                      )}
                    </div>

                    {/* Méthode */}
                    <div className="md:col-span-1">
                      <div className="text-xs font-semibold text-[#636B2F] mb-1">MÉTHODE</div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center">
                          {getMethodIcon(payment.payment_method)}
                        </div>
                        <span className="text-sm text-neutral-800 font-medium">
                          {payment.payment_method_display}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-1">
                      <div className="text-xs font-semibold text-[#3F4A1F] mb-1">DATE</div>
                      <div className="text-sm text-neutral-800 font-medium">
                        {formatDate(payment.payment_date)}
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="md:col-span-1">
                      <div className="text-xs font-semibold text-[#636B2F] mb-1">STATUT</div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        payment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {payment.status_display}
                      </div>
                    </div>

                    {/* Référence */}
                    <div className="md:col-span-1">
                      <div className="text-xs font-semibold text-[#3F4A1F] mb-1">RÉFÉRENCE</div>
                      <div className="text-sm text-neutral-800">
                        {payment.reference_number && (
                          <div className="text-xs text-neutral-600">
                            Réf: {payment.reference_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {canDownloadPDF && payment.status === 'completed' && (
                      <button
                        onClick={async () => {
                          try {
                            const blob = await api.downloadInvoicePDF(payment.invoice);
                            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `facture_${payment.invoice}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            setError('Erreur lors du téléchargement de la facture');
                          }
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Télécharger la facture PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(payment)}
                        className="p-2 text-[#636B2F] hover:bg-[#636B2F]/10 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination modernisée */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#636B2F]/20">
              <div className="text-sm font-medium text-neutral-700">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-[#636B2F]/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#636B2F]/10 transition-all duration-300 font-medium"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-2 border-[#636B2F]/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#636B2F]/10 transition-all duration-300 font-medium"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/édition modernisé */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-[#636B2F]/20" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 px-5 py-3 rounded-t-xl border-b border-[#636B2F]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
                    {editingPayment ? 'Modifier le Paiement' : 'Nouveau Paiement'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPayment(null);
                    resetForm();
                  }}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-5 py-4">

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Informations essentielles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                      Facture *
                    </label>
                    <select
                      value={formData.invoice}
                      onChange={(e) => {
                        const selectedInvoiceId = e.target.value;
                        const selectedInvoice = invoices.find(inv => inv.id.toString() === selectedInvoiceId);
                        
                        // Calculer le montant restant dû
                        let remainingAmount = 0;
                        if (selectedInvoice) {
                          const totalPaid = payments
                            .filter(p => p.invoice === selectedInvoice.id && p.status === 'completed')
                            .reduce((sum, p) => sum + p.amount, 0);
                          remainingAmount = selectedInvoice.total_amount - totalPaid;
                        }
                        
                        setFormData({ 
                          ...formData, 
                          invoice: selectedInvoiceId,
                          amount: remainingAmount > 0 ? remainingAmount.toString() : ''
                        });
                      }}
                      required
                      className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    >
                      <option value="">Sélectionner une facture</option>
                      {invoices.length > 0 ? (
                        invoices.map((invoice) => (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.invoice_number} - {invoice.patient_name || 'Patient inconnu'} ({invoice.total_amount?.toLocaleString() || 0} FCFA)
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Aucune facture disponible</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                      Montant (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm"
                      placeholder="Montant calculé automatiquement"
                    />
                    {formData.invoice && (
                      <p className="text-xs text-[#3F4A1F] mt-1 font-medium">
                        Montant restant dû calculé automatiquement
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                      Mode de paiement *
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as Payment['payment_method'] })}
                      required
                      className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                      Date de paiement *
                    </label>
                    <input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
                      className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                      N° référence
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm"
                    />
                  </div>

                </div>

                {/* Champs spécifiques Mobile Money */}
                {['mobile_money', 'orange_money', 'wave', 'free_money'].includes(formData.payment_method) && (
                  <div className="bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 p-3 rounded-lg border border-[#636B2F]/20">
                    <h4 className="text-xs font-bold text-[#636B2F] mb-2">Informations Mobile Money</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                          Réf. opérateur
                        </label>
                        <input
                          type="text"
                          value={formData.operator_reference}
                          onChange={(e) => setFormData({ ...formData, operator_reference: e.target.value })}
                          className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ID de transaction et Notes */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                      ID de transaction
                    </label>
                    <input
                      type="text"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                      className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm resize-none"
                      placeholder="Informations complémentaires sur le paiement..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#636B2F]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPayment(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    {editingPayment ? 'Modifier le paiement' : 'Créer le paiement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
