import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, 
  FileText, Plus, CreditCard, Download, ClipboardList, Upload, Trash2,
  X, Hash
} from 'lucide-react';
import { api } from '@/lib/api';
import { Patient, Invoice, Payment, PatientReport } from '@/types';
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
    coverage_percentage: '',
    coverage_name: '',
    payment_method: 'cash' as string,
    notes: '',
  });

  // Permissions
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
      const [patientRes, invoicesRes, paymentsRes, reportsRes] = await Promise.all([
        api.getPatient(Number(id)),
        api.getInvoices({ patient: Number(id), page_size: 100 }),
        api.getPayments({ patient: Number(id), page_size: 100 }),
        api.getPatientReports({ patient_id: Number(id) }).catch(() => ({ results: [] })),
      ]);
      setPatient(patientRes);
      setInvoices(invoicesRes.results || []);
      setPayments(paymentsRes.results || []);
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
        coverage_percentage: paymentData.coverage_percentage ? Number(paymentData.coverage_percentage) : 0,
        coverage_name: paymentData.coverage_name,
        payment_method: paymentData.payment_method as any,
        payment_date: new Date().toISOString(),
        status: 'completed',
        notes: paymentData.notes,
      } as any);
      toast.success('Paiement enregistré avec succès');
      setShowPaymentForm(false);
      setPaymentData({ invoice: 0, amount: '', coverage_percentage: '', coverage_name: '', payment_method: 'cash', notes: '' });
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
      draft: 'bg-gray-100 text-gray-600 border-gray-200',
      sent: 'bg-blue-50 text-blue-700 border-blue-200',
      partially_paid: 'bg-amber-50 text-amber-700 border-amber-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overdue: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');

  const invoiceTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  }, [invoiceItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#7a8345]/20 border-t-[#7a8345]"></div>
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-24">
        <User className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-600 font-medium">Patient introuvable</p>
        <button onClick={() => navigate('/patients')} className="mt-4 text-sm text-[#7a8345] hover:underline font-medium">
          ← Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header patient */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#7a8345] to-[#5a6332] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patients')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {patient.first_name} {patient.last_name}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Hash className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-sm text-white/80 font-mono">{patient.patient_id}</span>
                    <span className="text-white/40 mx-1">|</span>
                    <span className="text-sm text-white/80">{patient.gender === 'M' ? 'Homme' : 'Femme'}</span>
                    {patient.age && (
                      <>
                        <span className="text-white/40 mx-1">|</span>
                        <span className="text-sm text-white/80">{patient.age} ans</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info cards row */}
        <div className="px-6 py-4 flex flex-wrap gap-x-6 gap-y-2">
          {patient.phone_number && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Phone className="w-4 h-4 text-[#7a8345]" />
              <span>{patient.phone_number}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Mail className="w-4 h-4 text-[#7a8345]" />
              <span>{patient.email}</span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-[#7a8345]" />
              <span>{patient.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Calendar className="w-4 h-4 text-[#7a8345]" />
            <span>Inscrit le {new Date(patient.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {[
            { key: 'invoices' as const, label: 'Factures', icon: FileText, count: invoices.length },
            { key: 'payments' as const, label: 'Paiements', icon: CreditCard, count: payments.length },
            { key: 'reports' as const, label: 'Comptes Rendus', icon: ClipboardList, count: reports.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all relative ${
                activeTab === tab.key
                  ? 'text-[#7a8345]'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key
                  ? 'bg-[#7a8345]/10 text-[#7a8345]'
                  : 'bg-neutral-100 text-neutral-400'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#7a8345] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ==================== TAB FACTURES ==================== */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-700">Historique des factures</h3>
                {canCreateInvoice && (
                  <button
                    onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7a8345] text-white rounded-lg hover:bg-[#6b7340] transition-all text-xs font-semibold shadow-sm"
                  >
                    {showInvoiceForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showInvoiceForm ? 'Fermer' : 'Nouvelle Facture'}
                  </button>
                )}
              </div>

              {/* Formulaire création facture */}
              {showInvoiceForm && (
                <form onSubmit={handleCreateInvoice} className="bg-neutral-50/80 rounded-xl border border-neutral-200/80 p-5 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-neutral-800">Nouvelle facture</h4>
                    <span className="text-xs font-semibold text-[#7a8345] bg-[#7a8345]/10 px-2.5 py-1 rounded-full">
                      Total: {invoiceTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-end bg-white rounded-lg border border-neutral-200/80 p-3">
                        <div className="flex-1">
                          {idx === 0 && <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Examen</label>}
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...invoiceItems];
                              newItems[idx].description = e.target.value;
                              setInvoiceItems(newItems);
                            }}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none transition-all"
                            placeholder="Nom de l'examen..."
                            required
                          />
                        </div>
                        <div className="w-32">
                          {idx === 0 && <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Prix (FCFA)</label>}
                          <input
                            type="number"
                            min={0}
                            value={item.unit_price || ''}
                            onChange={(e) => {
                              const newItems = [...invoiceItems];
                              newItems[idx].unit_price = Number(e.target.value);
                              setInvoiceItems(newItems);
                            }}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none transition-all"
                            placeholder="0"
                            required
                          />
                        </div>
                        <div className="w-20">
                          {idx === 0 && <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Qté</label>}
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...invoiceItems];
                              newItems[idx].quantity = Number(e.target.value);
                              setInvoiceItems(newItems);
                            }}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none transition-all text-center"
                          />
                        </div>
                        <div className="w-24 text-right">
                          {idx === 0 && <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Sous-total</label>}
                          <div className="px-2 py-2 text-sm font-semibold text-neutral-700">
                            {(item.unit_price * item.quantity).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        {invoiceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setInvoiceItems([...invoiceItems, { description: '', unit_price: 0, quantity: 1 }])}
                    className="flex items-center gap-1 text-xs font-semibold text-[#7a8345] hover:text-[#5a6332] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Notes</label>
                    <input
                      type="text"
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none transition-all"
                      placeholder="Notes optionnelles..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-[#7a8345] text-white rounded-lg text-sm font-semibold hover:bg-[#6b7340] shadow-sm transition-all">
                      Créer la facture
                    </button>
                    <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 transition-all">
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Liste factures */}
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">Aucune facture</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200/80">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">N° Facture</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Montant</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Statut</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-neutral-800">{invoice.invoice_number}</td>
                          <td className="px-4 py-3 text-neutral-500">{new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3 text-right font-semibold text-neutral-800">{Number(invoice.total_amount).toLocaleString('fr-FR')} FCFA</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(invoice.status)}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleDownloadPDF(invoice.id, invoice.status)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  invoice.status === 'paid' 
                                    ? 'text-blue-500 hover:bg-blue-50' 
                                    : 'text-neutral-300 cursor-not-allowed'
                                }`}
                                title={invoice.status === 'paid' ? 'Télécharger PDF' : 'Disponible après paiement'}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {canDeleteInvoice && (
                                <button
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB PAIEMENTS ==================== */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-700">Historique des paiements</h3>
                {canCreatePayment && unpaidInvoices.length > 0 && (
                  <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7a8345] text-white rounded-lg hover:bg-[#6b7340] transition-all text-xs font-semibold shadow-sm"
                  >
                    {showPaymentForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showPaymentForm ? 'Fermer' : 'Nouveau Paiement'}
                  </button>
                )}
              </div>

              {/* Formulaire paiement */}
              {showPaymentForm && (
                <form onSubmit={handleCreatePayment} className="bg-neutral-50/80 rounded-xl border border-neutral-200/80 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-neutral-800">Enregistrer un paiement</h4>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Facture</label>
                    <select
                      value={paymentData.invoice}
                      onChange={(e) => {
                        const invId = Number(e.target.value);
                        const selectedInv = unpaidInvoices.find(i => i.id === invId);
                        const paidForInv = payments.filter(p => p.invoice === invId && p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0);
                        const remaining = selectedInv ? Number(selectedInv.total_amount) - paidForInv : 0;
                        setPaymentData({ ...paymentData, invoice: invId, amount: remaining > 0 ? String(remaining) : '' });
                      }}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none bg-white transition-all"
                      required
                    >
                      <option value={0}>Sélectionner une facture</option>
                      {unpaidInvoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_number} — {Number(inv.total_amount).toLocaleString('fr-FR')} FCFA ({getStatusLabel(inv.status)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Montant (FCFA) *</label>
                      <input
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none bg-white transition-all"
                        required
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Prise en charge (%)</label>
                      <input
                        type="number"
                        value={paymentData.coverage_percentage}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                            setPaymentData({ ...paymentData, coverage_percentage: val });
                          }
                        }}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none bg-white transition-all"
                        min={0}
                        max={100}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Mode de paiement *</label>
                      <select
                        value={paymentData.payment_method}
                        onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none bg-white transition-all"
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

                  {paymentData.coverage_percentage && Number(paymentData.coverage_percentage) > 0 ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Nom de la prise en charge</label>
                      <input
                        type="text"
                        value={paymentData.coverage_name}
                        onChange={(e) => setPaymentData({ ...paymentData, coverage_name: e.target.value })}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none bg-white transition-all"
                        placeholder="Ex: Assurance Maladie, Mutuelle, Employeur..."
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Notes</label>
                    <input
                      type="text"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7a8345]/20 focus:border-[#7a8345] outline-none bg-white transition-all"
                      placeholder="Notes optionnelles..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-[#7a8345] text-white rounded-lg text-sm font-semibold hover:bg-[#6b7340] shadow-sm transition-all">
                      Enregistrer
                    </button>
                    <button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 transition-all">
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Liste paiements */}
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">Aucun paiement</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200/80">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Montant</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Mode</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Prise en charge</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Statut</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {payments.map((payment) => {
                        const invoiceForPayment = invoices.find(i => i.id === payment.invoice);
                        const invoicePaid = invoiceForPayment?.status === 'paid';
                        return (
                          <tr key={payment.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-4 py-3 text-neutral-600">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</td>
                            <td className="px-4 py-3 text-right font-semibold text-neutral-800">{Number(payment.amount).toLocaleString('fr-FR')} FCFA</td>
                            <td className="px-4 py-3 text-neutral-600">{payment.payment_method_display || payment.payment_method}</td>
                            <td className="px-4 py-3 text-neutral-500">
                              {payment.coverage_percentage && Number(payment.coverage_percentage) > 0 
                                ? `${payment.coverage_percentage}%${payment.coverage_name ? ` (${payment.coverage_name})` : ''}`
                                : <span className="text-neutral-300">—</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium border ${
                                payment.status === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {payment.status === 'completed' ? 'Complété' : 'En attente'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-end">
                                {canDeletePayment && (isAdmin || !invoicePaid) && (
                                  <button
                                    onClick={() => handleDeletePayment(payment.id)}
                                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB COMPTES RENDUS ==================== */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-700">Documents & comptes rendus</h3>
                {canUploadReport && (
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7a8345] text-white rounded-lg hover:bg-[#6b7340] transition-all text-xs font-semibold shadow-sm cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Ajouter un fichier
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !patient) return;
                        try {
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
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">Aucun compte rendu</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200/80">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Nom du fichier</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Statut</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="w-4 h-4 text-[#7a8345]" />
                              <span className="font-medium text-neutral-800">{report.filename || 'Compte rendu'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-neutral-500">{new Date(report.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium border ${
                              report.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                              {report.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <a
                                href={report.report_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
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
                                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
