import React, { useState, useEffect } from 'react';
import { Receipt, Search, Plus, Edit2, Trash2, Download, Calendar, User } from 'lucide-react';
import { Invoice, Patient, ExamType, InvoiceItem } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Permissions
  const canCreate = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'accountant';
  const canEdit = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'accountant';
  const canDelete = user?.role === 'superuser' || user?.role === 'admin';
  const canDownloadPDF = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'accountant' || user?.role === 'secretary';

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
    fetchExamTypes();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      };

      const response = await api.getInvoices(params);
      setInvoices(response.results);
      setTotalPages(Math.ceil(response.count / 20));
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.getPatients({ page_size: 1000 });
      setPatients(response.results);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  const fetchExamTypes = async () => {
    try {
      const response = await api.getExamTypes({ page_size: 1000, is_active: true });
      setExamTypes(response.results);
    } catch (error) {
      console.error('Erreur lors du chargement des types d\'examens:', error);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      await api.deleteInvoice(id);
      fetchInvoices();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (invoice.status !== 'paid') {
      alert(`Impossible de télécharger la facture #${invoice.id}.\nLe téléchargement PDF n'est disponible que pour les factures avec le statut "Payée".`);
      return;
    }

    try {
      const blob = await api.downloadInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `facture_${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleSubmitInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      if (editingInvoice) {
        await api.updateInvoice(editingInvoice.id, invoiceData);
      } else {
        await api.createInvoice(invoiceData);
      }
      setShowModal(false);
      fetchInvoices();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      alert(`Erreur lors de la sauvegarde de la facture: ${error.response?.data?.detail || error.message}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', class: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Envoyée', class: 'bg-blue-100 text-blue-800' },
      partially_paid: { label: 'Partiellement payée', class: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Payée', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Gestion des Factures</h1>
              <p className="text-neutral-600">Créez et gérez efficacement les factures patients</p>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Facture
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#636B2F]/20 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#636B2F] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border-2 border-[#3F4A1F]/20 rounded-xl focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="partially_paid">Partiellement payée</option>
            <option value="paid">Payée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
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
            <Receipt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Aucune facture trouvée</h3>
            <p className="text-neutral-600">
              {searchTerm ? 'Aucune facture ne correspond à votre recherche.' : 'Commencez par créer une facture.'}
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
                          <Receipt className="w-5 h-5 text-[#636B2F]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-neutral-800">#{invoice.invoice_number}</h3>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-[#636B2F]" />
                              <span className="font-medium text-neutral-700">
                                {invoice.patient_details?.full_name || `Patient #${invoice.patient}`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-[#3F4A1F]" />
                              <span className="text-neutral-700">{formatDate(invoice.invoice_date)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-neutral-500">Sous-total: {formatPrice(invoice.subtotal)}</span>
                              <span className="text-xs text-neutral-500">TVA ({invoice.tax_rate}%): {formatPrice(invoice.tax_amount)}</span>
                              <span className="font-semibold text-neutral-800">{formatPrice(invoice.total_amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {canDownloadPDF && (
                        <>
                          {invoice.status === 'paid' ? (
                            <button
                              onClick={() => handleDownloadPDF(invoice)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                              title="Télécharger PDF"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                              title="Téléchargement disponible uniquement pour les factures payées"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-2 text-[#636B2F] hover:bg-[#636B2F]/10 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Modifier la facture"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Supprimer la facture"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#636B2F]/20 p-4 shadow-lg">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border-2 border-[#636B2F]/20 rounded-lg hover:bg-[#636B2F]/10 hover:border-[#636B2F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              Précédent
            </button>
            
            <span className="px-4 py-2 text-sm text-neutral-700 font-medium bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-lg">
              Page {currentPage} sur {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border-2 border-[#3F4A1F]/20 rounded-lg hover:bg-[#3F4A1F]/10 hover:border-[#3F4A1F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <InvoiceModal
          invoice={editingInvoice}
          patients={patients}
          examTypes={examTypes}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitInvoice}
        />
      )}
    </div>
  );
};

interface InvoiceModalProps {
  invoice: Invoice | null;
  patients: Patient[];
  examTypes: ExamType[];
  onClose: () => void;
  onSubmit: (invoiceData: Partial<Invoice>) => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, patients, examTypes, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patient: invoice?.patient || 0,
    invoice_date: invoice?.invoice_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: invoice?.status || 'sent',
    tax_rate: invoice?.tax_rate || 18.00,
    notes: invoice?.notes || '',
  });

  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    invoice?.items || [{ exam_type: 0, quantity: 1, unit_price: 0 }]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculer le sous-total et le total avec TVA
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price || 0) * (item.quantity || 1), 0);
    const tax_rate = formData.tax_rate || 18.00;
    const tax_amount = subtotal * (tax_rate / 100);
    const total_amount = subtotal + tax_amount;

    onSubmit({
      ...formData,
      tax_rate,
      subtotal,
      tax_amount,
      total_amount,
      items: items.map((item, index) => ({
        id: item.id || index,
        exam_type: item.exam_type || 0,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: (item.unit_price || 0) * (item.quantity || 1)
      })) as InvoiceItem[],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-fill unit price when exam type is selected
      if (field === 'exam_type') {
        const examType = examTypes.find(et => et.id === Number(value));
        if (examType) {
          newItems[index].unit_price = examType.price;
        }
      }
      
      return newItems;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { exam_type: 0, quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const total_amount = items.reduce((sum, item) => sum + (item.unit_price || 0) * (item.quantity || 1), 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#636B2F]/20" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 px-5 py-3 rounded-t-xl border-b border-[#636B2F]/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
              {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
            </h2>
          </div>
        </div>
        <div className="px-5 py-4">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informations essentielles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                  Patient *
                </label>
                <select
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                >
                  <option value={0}>Sélectionner un patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                  Date de facturation *
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm"
                />
              </div>
            </div>

            {/* Articles de la facture */}
            <div className="bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 p-4 rounded-lg border border-[#636B2F]/20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-[#3F4A1F]">
                  Articles de la facture
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-lg text-xs font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="bg-white/80 p-3 rounded-lg border border-[#636B2F]/10">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                          Examen
                        </label>
                        <select
                          value={item.exam_type || 0}
                          onChange={(e) => handleItemChange(index, 'exam_type', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-[#636B2F]/20 rounded text-sm focus:ring-1 focus:ring-[#636B2F]/30"
                        >
                          <option value={0}>Sélectionner un examen</option>
                          {examTypes.map(examType => (
                            <option key={examType.id} value={examType.id}>
                              {examType.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                          Qté
                        </label>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          min="1"
                          className="w-full px-2 py-1.5 border border-[#3F4A1F]/20 rounded text-sm focus:ring-1 focus:ring-[#3F4A1F]/30"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                          Prix unit.
                        </label>
                        <input
                          type="number"
                          value={item.unit_price || 0}
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                          min="0"
                          className="w-full px-2 py-1.5 border border-[#636B2F]/20 rounded text-sm focus:ring-1 focus:ring-[#636B2F]/30"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                          Total
                        </label>
                        <div className="px-2 py-1.5 bg-[#636B2F]/5 border border-[#3F4A1F]/20 rounded text-sm text-neutral-800 font-semibold">
                          {new Intl.NumberFormat('fr-FR').format((item.unit_price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TVA et Total de la facture */}
            <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 p-3 rounded-lg border border-[#636B2F]/30">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                    Taux de TVA (%)
                  </label>
                  <input
                    type="number"
                    name="tax_rate"
                    value={formData.tax_rate || 18.00}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <div className="text-right">
                    <div className="text-xs text-neutral-600">Sous-total: {new Intl.NumberFormat('fr-FR').format(total_amount)} FCFA</div>
                    <div className="text-xs text-neutral-600">TVA ({formData.tax_rate || 18.00}%): {new Intl.NumberFormat('fr-FR').format(total_amount * ((formData.tax_rate || 18.00) / 100))} FCFA</div>
                    <div className="text-sm font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
                      Total: {new Intl.NumberFormat('fr-FR').format(total_amount * (1 + ((formData.tax_rate || 18.00) / 100)))} FCFA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes optionnelles */}
            <div>
              <label className="block text-xs font-semibold text-[#636B2F] mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm resize-none"
                placeholder="Informations complémentaires sur la facture..."
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-[#636B2F]/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {invoice ? 'Modifier la facture' : 'Créer la facture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
