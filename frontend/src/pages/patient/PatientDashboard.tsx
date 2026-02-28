import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, User, Key, LogOut, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { PatientReport, PatientLoginResponse } from '@/types';
import { formatDate, formatDateTime, downloadBlob } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import cimefLogo from '@/assets/images/cimef.png';

export const PatientDashboard: React.FC = () => {
  const toast = useToast();
  const [patientData, setPatientData] = useState<PatientLoginResponse | null>(null);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les données patient depuis le sessionStorage
    const sessionData = sessionStorage.getItem('patient_session');
    if (!sessionData) {
      navigate('/patient');
      return;
    }

    try {
      const data: PatientLoginResponse = JSON.parse(sessionData);
      setPatientData(data);
      
      // Charger les rapports (simulé pour l'instant)
      setReports(data.files || []);
    } catch (error) {
      console.error('Erreur lors du parsing des données patient:', error);
      navigate('/patient');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('patient_session');
    navigate('/patient');
  };

  const handleDownload = async (reportId: number, filename: string) => {
    setDownloadingId(reportId);
    try {
      const blob = await api.downloadPatientReport(reportId);
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du fichier');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#636B2F]/10 via-[#FFFFFF] to-[#3F4A1F]/10">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#636B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#636B2F]/10 via-[#FFFFFF] to-[#3F4A1F]/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] border-b border-[#636B2F]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                <img
                  src={cimefLogo}
                  alt="CIMEF Logo"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-[#636B2F] font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Portail Patient</h1>
                <p className="text-sm text-white/80">CIMEF</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {patientData.patient.full_name}
                </p>
                <p className="text-xs text-white/80">
                  {patientData.patient.phone_number}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-white/40 rounded-lg hover:bg-white/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF]/95">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-3">
                Bienvenue, {patientData.patient.full_name}
              </h2>
              <p className="text-neutral-600 max-w-lg mx-auto">
                Accédez à vos résultats d'examens médicaux en toute sécurité
              </p>
            </CardContent>
          </Card>

          {/* Patient Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Informations</p>
                    <p className="font-semibold text-neutral-900">
                      {patientData.patient.full_name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {patientData.patient.phone_number}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3F4A1F] to-[#636B2F] rounded-lg flex items-center justify-center shadow-lg">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Accès</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        Permanent
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {patientData.access_info.access_count} connexions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Dernière connexion</p>
                    <p className="font-semibold text-neutral-900">
                      {patientData.access_info.last_accessed 
                        ? formatDateTime(patientData.access_info.last_accessed)
                        : 'Première connexion'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Section */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#636B2F]" />
                Mes Résultats d'Examens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FFFFFF] to-[#636B2F]/5 rounded-lg border border-[#636B2F]/20 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            Compte rendu d'examen
                          </p>
                          <p className="text-sm text-neutral-600">
                            Créé le {formatDate(report.created_at)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={report.is_active ? "success" : "danger"}
                              size="sm"
                            >
                              {report.is_active ? "Disponible" : "Non disponible"}
                            </Badge>
                            <span className="text-xs text-neutral-500">
                              {report.download_count} téléchargement(s)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {report.is_active ? (
                          <Button
                            size="sm"
                            onClick={() => handleDownload(report.id, `rapport_${report.id}.pdf`)}
                            loading={downloadingId === report.id}
                            disabled={downloadingId !== null}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            Non disponible
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    Aucun résultat disponible
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Vos résultats d'examens apparaîtront ici dès qu'ils seront prêts.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 text-[#636B2F] rounded-lg border border-[#636B2F]/20">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">En attente de résultats</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="border-[#636B2F]/20 bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-[#636B2F] mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Informations importantes
                  </h3>
                  <ul className="text-sm text-neutral-700 space-y-1">
                    <li>• Vos identifiants d'accès sont <strong>permanents et réutilisables</strong></li>
                    <li>• Vous pouvez vous reconnecter à tout moment avec les mêmes identifiants</li>
                    <li>• Vos données sont sécurisées et accessibles uniquement par vous</li>
                    <li>• En cas de problème, contactez le cabinet médical</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
