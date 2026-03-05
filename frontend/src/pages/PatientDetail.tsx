import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, 
  FileText, Plus, CreditCard, Download, Coins, ClipboardList, Upload, Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { Patient, Invoice, Payment, ExamType, PatientReport } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'reports'>('invoices');
  const [reports, setReports] = useState<PatientReport[]>([]);

  // Formulaire facture
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; unit_price: number; quantity: number }[]>([{ description: '', unit_price: 0, quantity: 1 }]);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Formulaire paiement
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    invoice: 0,
    amount: '',
    payment_method: 'cash' as string,
    notes: '',
  });

  // Permissions - secrétaire peut créer mais pas modifier/supprimer
  const isAdmin = ['superuser', 'admin'].includes(user?.role || '');
  const canCreateInvoice = ['superuser', 'admin', 'accountant', 'secretary'].includes(user?.role || '');
  const canCreatePayment = ['superuser', 'admin', 'accountant', 'secretary'].includes(user?.role || '');
  const canDeleteInvoice = ['superuser', 'admin'].includes(user?.role || '');
  const canDeletePayment = ['superuser', 'admin'].includes(user?.role || '');
  const canUploadReport = ['superuser', 'admin', 'doctor', 'secretary'].includes(user?.role || '');
  const canDeleteReport = ['superuser', 'admin', 'doctor'].includes(user?.role || '');

  useEffect(() => {
    if (id) {
      fetchAll();
    }
  }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [patientRes, invoicesRes, paymentsRes, examsRes, reportsRes] = await Promise.all([
        api.getPatient(Number(id)),
        api.getInvoices({ patient: Number(id), page_size: 100 }),
        api.getPayments({ patient: Number(id), page_size: 100 }),
        api.getExamTypes({ page_size: 100 }),
        api.getPatientReports({ patient_id: Number(id) }).catch(() => ({ results: [] })),
      ]);
      setPatient(patientRes);
      setInvoices(invoicesRes.results || []);
      setPayments(paymentsRes.results || []);
      setExamTypes(examsRes.results || []);
      setReports(reportsRes.results || reportsRes || []);
    } catch (error) {
      console.error('Erreur chargement détails patient:', error);
      toast.error('Erreur lors du chargement du patient');
    } finally {
      setLoading(false);
    }
  };

  
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = invoiceItems.filter(i => i.description.trim() !== '' && i.unit_price > 0);
    if (validItems.length === 0) {
      toast.error('Ajoutez au moins un examen avec un nom et un prix');
      return;
    }
    try {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      
      await api.createInvoice({
        patient: Number(id),
        invoice_date: formatDate(today),
        due_date: formatDate(dueDate),
        items: validItems,
        notes: invoiceNotes,
      } as any);
      toast.success('Facture créée avec succès');
      setShowInvoiceForm(false);
      setInvoiceItems([{ description: '', unit_price: 0, quantity: 1 }]);
      setInvoiceNotes('');
      fetchAll();
    } catch (error: any) {
      console.error('Erreur création facture:', error);
      toast.error(error?.response?.data?.detail || 'Erreur lors de la création de la facture');
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.invoice || !paymentData.amount) {
      toast.error('Sélectionnez une facture et un montant');
      return;
    }
    try {
      await api.createPayment({
        invoice: paymentData.invoice,
        amount: Number(paymentData.amount),
        payment_method: paymentData.payment_method as any,
        payment_date: new Date().toISOString(),
        status: 'completed',
        notes: paymentData.notes,
      } as any);
      toast.success('Paiement enregistré avec succès');
      setShowPaymentForm(false);
      setPaymentData({ invoice: 0, amount: '', payment_method: 'cash', notes: '' });
      fetchAll();
    } catch (error: any) {
      console.error('Erreur création paiement:', error);
      toast.error(error?.response?.data?.detail || 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    const ok = await confirm({
      title: 'Supprimer la facture',
      message: 'Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.deleteInvoice(invoiceId);
      toast.success('Facture supprimée');
      fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    const ok = await confirm({
      title: 'Supprimer le paiement',
      message: 'Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.deletePayment(paymentId);
      toast.success('Paiement supprimé');
      fetchAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleDownloadPDF = async (invoiceId: number, invoiceStatus: string) => {
    // Vérifier si la facture est payée
    if (invoiceStatus !== 'paid') {
      toast.error('Le téléchargement PDF n\'est disponible que pour les factures payées');
      return;
    }
    
    try {
      const blob = await api.downloadInvoicePDF(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${invoiceId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon', sent: 'Envoyée', partially_paid: 'Partiellement payée',
      paid: 'Payée', overdue: 'En retard', cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
      partially_paid: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7a8345]"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-600">Patient introuvable</p>
        <button onClick={() => navigate('/patients')} className="mt-4 text-[#7a8345] hover:underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-800">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-sm text-neutral-500">ID Patient: {patient.patient_id}</p>
        </div>
      </div>

      {/* Infos patient */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-700 font-medium">{patient.phone_number}</span>
          </div>
          {patient.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-700">{patient.email}</span>
            </div>
          )}
          {patient.age && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-700">{patient.age} ans</span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-700">{patient.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-700">{patient.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-[#7a8345] text-[#7a8345]'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Factures ({invoices.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-[#7a8345] text-[#7a8345]'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Paiements ({payments.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-[#7a8345] text-[#7a8345]'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Comptes Rendus ({reports.length})
          </div>
        </button>
      </div>

      {/* Tab Factures */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {canCreateInvoice && (
            <button
              onClick={() => setShowInvoiceForm(!showInvoiceForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7a8345] text-white rounded-lg hover:bg-[#6b7340] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Facture
            </button>
          )}

          {/* Formulaire création facture */}
          {showInvoiceForm && (
            <form onSubmit={handleCreateInvoice} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-neutral-800">Créer une facture</h3>
              
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Nom de l'examen</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...invoiceItems];
                        newItems[idx].description = e.target.value;
                        setInvoiceItems(newItems);
                      }}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                      placeholder="Ex: Radiographie, Échographie..."
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Prix (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      value={item.unit_price || ''}
                      onChange={(e) => {
                        const newItems = [...invoiceItems];
                        newItems[idx].unit_price = Number(e.target.value);
                        setInvoiceItems(newItems);
                      }}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Qté</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...invoiceItems];
                        newItems[idx].quantity = Number(e.target.value);
                        setInvoiceItems(newItems);
                      }}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                    />
                  </div>
                  {invoiceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setInvoiceItems([...invoiceItems, { description: '', unit_price: 0, quantity: 1 }])}
                className="text-sm text-[#7a8345] hover:underline"
              >
                + Ajouter un examen
              </button>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Notes (optionnel)</label>
                <input
                  type="text"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                  placeholder="Notes..."
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-[#7a8345] text-white rounded-lg text-sm font-medium hover:bg-[#6b7340]">
                  Créer la facture
                </button>
                <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Liste factures */}
          {invoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">Aucune facture pour ce patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-neutral-800">{invoice.invoice_number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')} • {Number(invoice.total_amount).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDownloadPDF(invoice.id, invoice.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          invoice.status === 'paid' 
                            ? 'text-blue-500 hover:bg-blue-50' 
                            : 'text-neutral-300 cursor-not-allowed'
                        }`}
                        title={invoice.status === 'paid' ? 'Télécharger PDF' : 'Téléchargement disponible après paiement'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {canDeleteInvoice && (
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Paiements */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {canCreatePayment && unpaidInvoices.length > 0 && (
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7a8345] text-white rounded-lg hover:bg-[#6b7340] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nouveau Paiement
            </button>
          )}

          {/* Formulaire paiement */}
          {showPaymentForm && (
            <form onSubmit={handleCreatePayment} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-neutral-800">Enregistrer un paiement</h3>
              
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Facture *</label>
                <select
                  value={paymentData.invoice}
                  onChange={(e) => {
                    const invId = Number(e.target.value);
                    const selectedInv = unpaidInvoices.find(i => i.id === invId);
                    const paidForInv = payments.filter(p => p.invoice === invId && p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0);
                    const remaining = selectedInv ? Number(selectedInv.total_amount) - paidForInv : 0;
                    setPaymentData({ ...paymentData, invoice: invId, amount: remaining > 0 ? String(remaining) : '' });
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                  required
                >
                  <option value={0}>Sélectionner une facture</option>
                  {unpaidInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {Number(inv.total_amount).toLocaleString()} FCFA ({getStatusLabel(inv.status)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Montant (FCFA) *</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                    required
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Mode de paiement *</label>
                  <select
                    value={paymentData.payment_method}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                  >
                    <option value="cash">Espèces</option>
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="free_money">Free Money</option>
                    <option value="bank_transfer">Virement</option>
                    <option value="check">Chèque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Notes (optionnel)</label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-1 focus:ring-[#7a8345] focus:border-[#7a8345]"
                  placeholder="Notes..."
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-[#7a8345] text-white rounded-lg text-sm font-medium hover:bg-[#6b7340]">
                  Enregistrer le paiement
                </button>
                <button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Liste paiements */}
          {payments.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <CreditCard className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">Aucun paiement pour ce patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const invoiceForPayment = invoices.find(i => i.id === payment.invoice);
                const invoicePaid = invoiceForPayment?.status === 'paid';
                return (
                <div key={payment.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-[#7a8345]" />
                        <span className="font-medium text-neutral-800">
                          {Number(payment.amount).toLocaleString()} FCFA
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status === 'completed' ? 'Complété' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(payment.payment_date).toLocaleDateString('fr-FR')} • {payment.payment_method_display || payment.payment_method}
                        {payment.reference_number && ` • Réf: ${payment.reference_number}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {canDeletePayment && (isAdmin || !invoicePaid) && (
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Comptes Rendus */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {canUploadReport && (
            <label className="flex items-center gap-2 px-4 py-2 bg-[#7a8345] text-white rounded-lg hover:bg-[#6b7340] transition-colors text-sm font-medium cursor-pointer w-fit">
              <Upload className="w-4 h-4" />
              Ajouter un compte rendu
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !patient) return;
                  try {
                    // Find or create patient access
                    let patientAccess;
                    try {
                      patientAccess = await api.generatePatientAccess(patient.id);
                    } catch {
                      toast.error('Erreur: accès patient non trouvé');
                      return;
                    }
                    const formData = new FormData();
                    formData.append('report_file', file);
                    formData.append('patient_access', String(patientAccess.id));
                    await api.createPatientReport(formData);
                    toast.success('Compte rendu ajouté avec succès');
                    fetchAll();
                  } catch (error: any) {
                    console.error('Erreur upload:', error);
                    toast.error(error?.response?.data?.detail || 'Erreur lors de l\'upload');
                  }
                  e.target.value = '';
                }}
              />
            </label>
          )}

          {reports.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">Aucun compte rendu pour ce patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-4 h-4 text-[#7a8345]" />
                        <span className="font-medium text-neutral-800">
                          {report.filename || 'Compte rendu'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          report.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {report.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        {new Date(report.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={report.report_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {canDeleteReport && (
                        <button
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Supprimer le compte rendu',
                              message: 'Êtes-vous sûr de vouloir supprimer ce compte rendu ? Cette action est irréversible.',
                              confirmText: 'Supprimer',
                              variant: 'danger',
                            });
                            if (!ok) return;
                            try {
                              await api.deletePatientReport(report.id);
                              toast.success('Compte rendu supprimé');
                              fetchAll();
                            } catch {
                              toast.error('Erreur lors de la suppression');
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
