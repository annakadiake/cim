import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ExamType } from '../types';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const Exams: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Permissions
  const canCreate = user?.role === 'superuser' || user?.role === 'admin';
  const canEdit = user?.role === 'superuser' || user?.role === 'admin';
  const canDelete = user?.role === 'superuser' || user?.role === 'admin';

  useEffect(() => {
    fetchExamTypes();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        search: searchTerm || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      };

      const response = await api.getExamTypes(params);
      setExamTypes(response.results);
      setTotalPages(Math.ceil(response.count / 20));
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error);
      // Fallback to empty array if API fails
      setExamTypes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = () => {
    setEditingExam(null);
    setShowModal(true);
  };

  const handleEditExam = (exam: ExamType) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  const handleDeleteExam = async (id: number) => {
    const ok = await confirm({
      title: 'Supprimer l\'examen',
      message: 'Êtes-vous sûr de vouloir supprimer cet examen ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deleteExamType(id);
      fetchExamTypes();
      toast.success('Examen supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'examen');
    }
  };

  const handleSubmitExam = async (examData: Partial<ExamType>) => {
    try {
      if (editingExam) {
        await api.updateExamType(editingExam.id, examData);
      } else {
        await api.createExamType(examData);
      }
      setShowModal(false);
      fetchExamTypes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'examen');
    }
  };

  // Filter and sort exam types
  const filteredExamTypes = examTypes
    .filter((exam) => {
      const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && exam.is_active) ||
                           (statusFilter === 'inactive' && !exam.is_active);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'duration':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7a8345]/10 to-[#5a6332]/10 rounded-2xl p-6 border border-[#7a8345]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7a8345] to-[#5a6332] rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Gestion des Examens</h1>
              <p className="text-neutral-600">Gérez efficacement les types d'examens et leurs tarifs</p>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={handleCreateExam}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7a8345] to-[#5a6332] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5" />
              Nouvel Examen
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#7a8345]/20 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a8345] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un examen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#7a8345]/20 rounded-xl focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-[#5a6332]/20 rounded-xl focus:ring-2 focus:ring-[#5a6332]/30 focus:border-[#5a6332] transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border-2 border-[#7a8345]/20 rounded-xl focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="name">Trier par nom</option>
              <option value="price">Trier par prix</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des examens */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#7a8345]/20 p-8 text-center shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7a8345] mx-auto"></div>
            <p className="mt-2 text-neutral-600">Chargement des examens...</p>
          </div>
        ) : filteredExamTypes.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#7a8345]/20 p-8 text-center shadow-lg">
            <Stethoscope className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">Aucun examen trouvé</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredExamTypes.map((exam) => (
              <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-2 border-[#7a8345]/10 hover:border-[#7a8345]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7a8345]/20 to-[#5a6332]/20 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-[#7a8345]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-800 mb-1">{exam.name}</h3>
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-[#7a8345]">Prix:</span>
                              <span className="text-neutral-700">
                                {exam.price ? `${Number(exam.price).toLocaleString()} FCFA` : 'Non défini'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-neutral-600">Statut:</span>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                exam.is_active 
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                                  : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                              }`}>
                                {exam.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {canEdit && (
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="p-2 text-[#7a8345] hover:bg-[#7a8345]/10 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Modifier l'examen"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Supprimer l'examen"
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
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#7a8345]/20 p-4 shadow-lg">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border-2 border-[#7a8345]/20 rounded-lg hover:bg-[#7a8345]/10 hover:border-[#7a8345] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              Précédent
            </button>
            
            <span className="px-4 py-2 text-sm text-neutral-700 font-medium bg-gradient-to-r from-[#7a8345]/10 to-[#5a6332]/10 rounded-lg">
              Page {currentPage} sur {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border-2 border-[#5a6332]/20 rounded-lg hover:bg-[#5a6332]/10 hover:border-[#5a6332] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ExamModal
          exam={editingExam}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitExam}
        />
      )}
    </div>
  );
};

interface ExamModalProps {
  exam: ExamType | null;
  onClose: () => void;
  onSubmit: (examData: Partial<ExamType>) => void;
}

const ExamModal: React.FC<ExamModalProps> = ({ exam, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: exam?.name || '',
    description: exam?.description || '',
    price: exam?.price || '',
    duration_minutes: exam?.duration_minutes || 30,
    is_active: exam?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, price: Number(formData.price) || 0 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
              : (type === 'number' && name !== 'price') ? Number(value) 
              : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#7a8345]/20" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#7a8345]/10 to-[#5a6332]/10 px-5 py-3 rounded-t-xl border-b border-[#7a8345]/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7a8345] to-[#5a6332] rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-[#7a8345] to-[#5a6332] bg-clip-text text-transparent">
              {exam ? 'Modifier l\'examen' : 'Nouvel examen'}
            </h2>
          </div>
        </div>
        <div className="px-5 py-4">
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#7a8345] mb-1">
                Nom de l'examen *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#7a8345]/20 rounded-lg focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all text-sm"
                placeholder="Ex: Radiographie thoracique"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#7a8345] mb-1">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-[#7a8345]/20 rounded-lg focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all text-sm"
                placeholder="15000"
              />
            </div>
            
            <div className="bg-gradient-to-r from-[#7a8345]/5 to-[#5a6332]/5 p-3 rounded-lg border border-[#7a8345]/10">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-2 border-[#7a8345]/30 text-[#7a8345] focus:ring-[#7a8345]/30 focus:ring-1"
                />
                <span className="text-sm font-semibold text-neutral-700">Examen actif</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-[#7a8345]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-gradient-to-r from-[#7a8345] to-[#5a6332] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                {exam ? 'Modifier l\'examen' : 'Créer l\'examen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Exams;
