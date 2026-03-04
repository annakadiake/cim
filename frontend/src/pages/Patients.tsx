import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Patient } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';


export const Patients: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Permissions par rôle
  const canCreate = ['superuser', 'admin', 'secretary', 'doctor'].includes(user?.role || '');
  const canEdit = ['superuser', 'admin', 'secretary', 'doctor'].includes(user?.role || '');
  const canDelete = ['superuser', 'admin', 'secretary'].includes(user?.role || '');
  const canViewAll = ['superuser', 'admin', 'doctor', 'secretary', 'accountant'].includes(user?.role || '');

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        search: searchTerm || undefined,
      };
      
      const response = await api.getPatients(params);
      setPatients(response.results);
      setTotalPages(Math.ceil(response.count / 20)); // Assuming 20 per page
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      toast.error('Erreur lors du chargement des patients');
      setPatients([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      await api.createPatient(patientData);
      setShowCreateModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
    }
  };

  const handleUpdatePatient = async (id: number, patientData: Partial<Patient>) => {
    try {
      await api.updatePatient(id, patientData);
      setEditingPatient(null);
      fetchPatients();
    } catch (error) {
      console.error('Erreur lors de la modification du patient:', error);
    }
  };

  const handleDeletePatient = async (id: number) => {
    const ok = await confirm({
      title: 'Supprimer le patient',
      message: 'Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deletePatient(id);
      fetchPatients();
      toast.success('Patient supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      toast.error('Erreur lors de la suppression du patient');
    }
  };


  if (!canViewAll) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          Accès non autorisé
        </h3>
        <p className="text-neutral-600">
          Vous n'avez pas les permissions pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7a8345]/10 to-[#5a6332]/10 rounded-2xl p-6 border border-[#7a8345]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7a8345] to-[#5a6332] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Gestion des Patients</h1>
              <p className="text-neutral-600">Gérez efficacement les informations des patients</p>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7a8345] to-[#5a6332] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5" />
              Nouveau Patient
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF]/95">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7a8345] w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un patient par nom, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#7a8345]/20 rounded-xl focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border-2 border-[#5a6332]/20 rounded-xl hover:bg-gradient-to-r hover:from-[#5a6332]/5 hover:to-[#7a8345]/5 transition-all duration-300 font-medium text-neutral-700">
              <Filter className="w-5 h-5 text-[#5a6332]" />
              Filtres Avancés
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF]/95">
        <CardHeader className="bg-gradient-to-r from-[#7a8345]/5 to-[#5a6332]/5 border-b border-[#7a8345]/10">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7a8345] to-[#5a6332] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#7a8345] to-[#5a6332] bg-clip-text text-transparent font-bold">
              Liste des Patients ({patients.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-neutral-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-neutral-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <Badge variant="default" size="sm">
                          ID: {patient.id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                        {patient.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {patient.phone_number}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </div>
                        )}
                        {patient.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {patient.address}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        Créé le {formatDate(patient.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPatient(patient); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-[#7a8345]/10 to-[#5a6332]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#7a8345]" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-3">
                Aucun patient trouvé
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                {searchTerm ? 'Aucun patient ne correspond à votre recherche. Essayez avec d\'autres termes.' : 'Commencez par ajouter votre premier patient pour démarrer la gestion.'}
              </p>
              {canCreate && !searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7a8345] to-[#5a6332] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-medium mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter votre premier patient
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2 text-sm text-neutral-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Create Patient Modal */}
      {showCreateModal && (
        <PatientModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePatient}
        />
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <PatientModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSubmit={(data: Partial<Patient>) => handleUpdatePatient(editingPatient.id, data)}
        />
      )}
    </div>
  );
};

// Modal Component for Create/Edit Patient
interface PatientModalProps {
  patient?: Patient;
  onClose: () => void;
  onSubmit: (data: Partial<Patient>) => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    phone_number: patient?.phone_number || '',
    email: patient?.email || '',
    address: patient?.address || '',
    age: patient?.age || '',
    gender: patient?.gender || 'M',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert age to number if provided
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age.toString()) : undefined
    };
    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#7a8345]/20" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#7a8345]/5 to-[#5a6332]/5 px-5 py-3 border-b border-[#7a8345]/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7a8345] to-[#5a6332] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-[#7a8345] to-[#5a6332] bg-clip-text text-transparent">
              {patient ? 'Modifier le Patient' : 'Nouveau Patient'}
            </h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#7a8345]/20 rounded-lg focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all text-sm"
                placeholder="Entrez le prénom"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#7a8345]/20 rounded-lg focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all text-sm"
                placeholder="Entrez le nom"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#5a6332]/20 rounded-lg focus:ring-2 focus:ring-[#5a6332]/30 focus:border-[#5a6332] transition-all text-sm"
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#7a8345]/20 rounded-lg focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all text-sm"
                placeholder="exemple@email.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Âge
              </label>
              <input
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                min="0"
                max="150"
                className="w-full px-3 py-2 border border-[#5a6332]/20 rounded-lg focus:ring-2 focus:ring-[#5a6332]/30 focus:border-[#5a6332] transition-all text-sm"
                placeholder="Ex: 25"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Genre *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#7a8345]/20 rounded-lg focus:ring-2 focus:ring-[#7a8345]/30 focus:border-[#7a8345] transition-all text-sm"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Adresse
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-[#5a6332]/20 rounded-lg focus:ring-2 focus:ring-[#5a6332]/30 focus:border-[#5a6332] transition-all text-sm resize-none"
              placeholder="Adresse complète du patient"
            />
          </div>
          
          
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all font-medium text-neutral-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-gradient-to-r from-[#7a8345] to-[#5a6332] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              {patient ? 'Modifier le Patient' : 'Créer le Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
