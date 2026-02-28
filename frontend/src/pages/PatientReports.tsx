import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Search, Filter, X, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface PatientReport {
  id: number;
  patient_access: number;
  patient_name: string;
  access_key: string;
  report_file: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  download_count: number;
}

interface PatientAccess {
  id: number;
  patient: {
    id: number;
    full_name: string;
  };
  patient_name: string;
  access_key: string;
  is_active: boolean;
}

const PatientReports: React.FC = () => {
  const { user } = useAuth();
  
  // Permissions
  const canUpload = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'secretary';
  const canDelete = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'secretary';
  
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [patientAccesses, setPatientAccesses] = useState<PatientAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    patient_access_id: '',
    file: null as File | null
  });

  useEffect(() => {
    fetchReports();
    fetchPatientAccesses();
  }, [searchTerm, filterActive]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getPatientReports();
      const reportsData = response.results || response || [];
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      setReports([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientAccesses = async () => {
    try {
      const response = await api.getPatients();
      console.log('DEBUG: Réponse getPatients:', response);
      
      // Gérer à la fois les réponses paginées et les tableaux simples
      const patientsData = Array.isArray(response) ? response : 
                         (response as any)?.results || [];
      
      const mockAccesses = patientsData.map((patient: any) => ({
        id: patient.id,
        patient: patient,
        patient_name: patient.full_name,
        access_key: `KEY_${patient.id}`,
        is_active: true
      }));
      
      console.log('DEBUG: mockAccesses:', mockAccesses);
      setPatientAccesses(mockAccesses);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      setPatientAccesses([]); // Fallback to empty array on error
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.patient_access_id) {
      alert('Veuillez sélectionner un patient et un fichier');
      return;
    }

    try {
      setUploading(true);
      
      // Convertir l'ID en nombre
      const patientId = parseInt(uploadForm.patient_access_id, 10);
      
      // 1. Générer ou récupérer un accès patient
      let patientAccess: PatientAccess;
      console.log('DEBUG: Génération de l\'accès patient...');
      try {
        patientAccess = await api.generatePatientAccess(patientId);
        console.log('DEBUG: Accès patient généré/récupéré:', patientAccess);
      } catch (accessError) {
        console.error('DEBUG: Erreur lors de la génération de l\'accès patient:', accessError);
        throw new Error('Impossible de générer ou de récupérer l\'accès patient');
      }

      // 2. Préparer l'upload avec l'ID d'accès
      const formData = new FormData();
      formData.append('report_file', uploadForm.file);
      formData.append('patient_access', patientAccess.id.toString());

      console.log('DEBUG: Données envoyées:', {
        patient_access: patientAccess.id,
        file: uploadForm.file.name,
        size: uploadForm.file.size
      });

      // 3. Envoyer la requête d'upload
      console.log('DEBUG: Envoi de la requête d\'upload...');
      try {
        const response = await api.createPatientReport(formData);
        console.log('DEBUG: Réponse API:', response);

        // Réinitialiser le formulaire et rafraîchir la liste
        setShowUploadModal(false);
        setUploadForm({ patient_access_id: '', file: null });
        await fetchReports();
        
        // Afficher un message de succès
        alert('Compte rendu uploadé avec succès');
      } catch (uploadError: any) {
        console.error('DEBUG: Erreur lors de l\'appel API:', uploadError);
        console.error('Détails de l\'erreur:', uploadError.response?.data);
        
        // Afficher un message d'erreur plus détaillé
        let errorMessage = 'Erreur inconnue lors de l\'upload';
        
        if (uploadError.response) {
          // Erreur avec réponse du serveur
          if (uploadError.response.data) {
            if (typeof uploadError.response.data === 'string') {
              errorMessage = uploadError.response.data;
            } else if (uploadError.response.data.detail) {
              errorMessage = uploadError.response.data.detail;
            } else if (uploadError.response.data.patient_access) {
              errorMessage = `Erreur de validation: ${uploadError.response.data.patient_access[0]}`;
            } else if (uploadError.response.data.report_file) {
              errorMessage = `Erreur de fichier: ${uploadError.response.data.report_file[0]}`;
            } else if (uploadError.response.status === 400) {
              errorMessage = 'Requête invalide. Vérifiez les données saisies.';
            } else if (uploadError.response.status === 403) {
              errorMessage = 'Vous n\'avez pas la permission d\'effectuer cette action.';
            } else if (uploadError.response.status === 404) {
              errorMessage = 'Ressource non trouvée. Le patient ou l\'accès spécifié n\'existe pas.';
            }
          }
        } else if (uploadError.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion internet.';
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          errorMessage = `Erreur de configuration de la requête: ${uploadError.message}`;
        }
        
        alert(`Erreur lors de l'upload: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Erreur inattendue:', error);
      alert(`Une erreur inattendue s'est produite: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (reportId: number) => {
    try {
      await api.togglePatientReportActive(reportId);
      fetchReports();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte rendu ?')) {
      try {
        await api.deletePatientReport(reportId);
        fetchReports();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patient_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      report.access_key
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filterActive === '' || 
      (filterActive === 'active' && report.is_active) ||
      (filterActive === 'inactive' && !report.is_active);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || 'Fichier';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#636B2F]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête avec design AdminDashboard */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Comptes Rendus Patients</h1>
              <p className="text-neutral-600">Gestion des comptes rendus médicaux pour les patients</p>
            </div>
          </div>
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-medium"
            >
              <Upload className="w-5 h-5" />
              Uploader un compte rendu
            </button>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres modernisée */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-[#636B2F]/20 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#636B2F] h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par nom de patient ou clé d'accès..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#636B2F]/30 rounded-xl focus:ring-2 focus:ring-[#636B2F]/50 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-[#3F4A1F]/30 rounded-xl hover:bg-[#3F4A1F]/10 transition-all duration-300 text-[#3F4A1F] font-medium backdrop-blur-sm"
          >
            <Filter className="h-5 w-5" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-[#636B2F]/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Statut
                </label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#636B2F]/30 rounded-xl focus:ring-2 focus:ring-[#636B2F]/50 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques avec design AdminDashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#636B2F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#636B2F]/80 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#636B2F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Actifs</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {reports.filter(r => r.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#3F4A1F]/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3F4A1F] to-[#3F4A1F]/80 rounded-xl flex items-center justify-center shadow-lg">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Téléchargements</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#3F4A1F] to-[#636B2F] bg-clip-text text-transparent">
                {reports.reduce((sum, r) => sum + r.download_count, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-orange-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Ce mois</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {reports.filter(r => 
                  new Date(r.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des rapports modernisée */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-[#636B2F]/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#636B2F]/20">
            <thead className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Fichier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Clé d'accès
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Téléchargements
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-[#636B2F]/10">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-[#636B2F]/5 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-neutral-800">
                      {report.patient_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#636B2F]/20 to-[#3F4A1F]/20 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-[#636B2F]" />
                      </div>
                      <span className="text-sm text-neutral-700 font-medium">
                        {getFileName(report.report_file)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 px-3 py-1 rounded-lg text-neutral-700 border border-[#636B2F]/20">
                      {report.access_key}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#3F4A1F]/10 to-[#3F4A1F]/20 text-[#3F4A1F] border border-[#3F4A1F]/20">
                      {report.download_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                      report.is_active 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' 
                        : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                    }`}>
                      {report.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 hover:scale-110"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#636B2F]/20 to-[#3F4A1F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-[#636B2F]" />
              </div>
              <p className="text-neutral-500 font-medium">Aucun compte rendu trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'upload modernisé */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl max-w-md w-full shadow-2xl border border-[#636B2F]/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-3 border-b border-[#636B2F]/20 bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
                  Uploader un compte rendu
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 px-5 py-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Patient
                </label>
                <select
                  value={uploadForm.patient_access_id}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patient_access_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patientAccesses.map((access) => (
                    <option key={access.id} value={access.id}>
                      {access.patient?.full_name || access.patient_name || 'Patient inconnu'} ({access.access_key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Fichier du compte rendu
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setUploadForm(prev => ({ 
                    ...prev, 
                    file: e.target.files?.[0] || null 
                  }))}
                  className="w-full px-3 py-2 border border-[#3F4A1F]/20 rounded-lg focus:ring-2 focus:ring-[#3F4A1F]/30 focus:border-[#3F4A1F] transition-all text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gradient-to-r file:from-[#636B2F] file:to-[#3F4A1F] file:text-white"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1 bg-[#636B2F]/5 px-2 py-1 rounded border border-[#636B2F]/10">
                  Formats acceptés: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#636B2F]/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Upload...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Uploader
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReports;
