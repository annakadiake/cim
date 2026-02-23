import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Database, Shield, Bell, Globe, Palette, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SystemSettings {
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  hospital_email: string;
  currency: string;
  timezone: string;
  language: string;
  date_format: string;
  backup_frequency: string;
  auto_backup: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  invoice_prefix: string;
  invoice_counter: number;
  payment_methods: string[];
  theme: 'light' | 'dark' | 'auto';
  logo_url?: string;
}

const Settings: React.FC = () => {
  const { } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettings>({
    hospital_name: 'CIMEF - Centre d\'Imagerie Médicale',
    hospital_address: 'Tivaouane, Sénégal',
    hospital_phone: '+221 77 300 26 97',
    hospital_email: 'cimeftivaouane@gmail.com',
    currency: 'FCFA',
    timezone: 'Africa/Dakar',
    language: 'fr',
    date_format: 'DD/MM/YYYY',
    backup_frequency: 'daily',
    auto_backup: true,
    email_notifications: true,
    sms_notifications: false,
    invoice_prefix: 'INV',
    invoice_counter: 1000,
    payment_methods: ['cash', 'card', 'transfer', 'mobile'],
    theme: 'light'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof SystemSettings, value: string, checked: boolean) => {
    setSettings(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'billing', label: 'Facturation', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'backup', label: 'Sauvegarde', icon: RefreshCw }
  ];

  const inputClass = "w-full px-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300 bg-white/80 backdrop-blur-sm";
  const labelClass = "block text-sm font-semibold text-[#3F4A1F] mb-2";
  const checkboxClass = "w-5 h-5 rounded-lg border-2 border-[#636B2F]/30 text-[#636B2F] focus:ring-[#636B2F]/30 focus:ring-2 transition-all duration-300";
  const sectionTitleClass = "text-lg font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent";

  if (loading && !settings.hospital_name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#636B2F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-2xl p-6 border border-[#636B2F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Paramètres du Système</h1>
              <p className="text-neutral-600">Configurez les paramètres généraux de votre établissement</p>
            </div>
          </div>
          <button
            onClick={saveSettings}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 ${
              saved 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : saved ? (
              <>
                <Save className="h-4 w-4" />
                Sauvegardé !
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-[#636B2F]/20 overflow-hidden">
        {/* Onglets */}
        <div className="border-b border-[#636B2F]/20 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5">
          <nav className="flex space-x-1 px-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#636B2F] text-[#636B2F] bg-white/50'
                      : 'border-transparent text-neutral-500 hover:text-[#636B2F] hover:border-[#636B2F]/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className={sectionTitleClass}>Informations générales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Nom de l'établissement</label>
                  <input
                    type="text"
                    value={settings.hospital_name}
                    onChange={(e) => handleInputChange('hospital_name', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Adresse</label>
                  <input
                    type="text"
                    value={settings.hospital_address}
                    onChange={(e) => handleInputChange('hospital_address', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    type="tel"
                    value={settings.hospital_phone}
                    onChange={(e) => handleInputChange('hospital_phone', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={settings.hospital_email}
                    onChange={(e) => handleInputChange('hospital_email', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Devise</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className={inputClass}
                  >
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Fuseau horaire</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className={inputClass}
                  >
                    <option value="Africa/Dakar">Afrique/Dakar</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className={sectionTitleClass}>Paramètres de facturation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Préfixe des factures</label>
                  <input
                    type="text"
                    value={settings.invoice_prefix}
                    onChange={(e) => handleInputChange('invoice_prefix', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Numéro de facture suivant</label>
                  <input
                    type="number"
                    value={settings.invoice_counter}
                    onChange={(e) => handleInputChange('invoice_counter', parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Méthodes de paiement acceptées</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 p-4 rounded-xl border border-[#636B2F]/10">
                  {[
                    { value: 'cash', label: 'Espèces' },
                    { value: 'card', label: 'Carte bancaire' },
                    { value: 'transfer', label: 'Virement' },
                    { value: 'mobile', label: 'Mobile Money' },
                    { value: 'check', label: 'Chèque' },
                    { value: 'insurance', label: 'Assurance' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment_methods.includes(method.value)}
                        onChange={(e) => handleArrayChange('payment_methods', method.value, e.target.checked)}
                        className={checkboxClass}
                      />
                      <span className="text-sm font-medium text-neutral-700">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className={sectionTitleClass}>Paramètres de notification</h3>
              
              <div className="space-y-4 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 p-6 rounded-xl border border-[#636B2F]/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className={checkboxClass}
                  />
                  <span className="text-sm font-semibold text-neutral-700">Notifications par email</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms_notifications}
                    onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                    className={checkboxClass}
                  />
                  <span className="text-sm font-semibold text-neutral-700">Notifications par SMS</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className={sectionTitleClass}>Paramètres de sécurité</h3>
              
              <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 border border-[#636B2F]/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-[#636B2F] mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#3F4A1F]">
                      Configuration avancée
                    </h3>
                    <div className="mt-2 text-sm text-neutral-600">
                      <p>
                        Les paramètres de sécurité avancés sont gérés au niveau du serveur.
                        Contactez votre administrateur système pour modifier ces paramètres.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className={sectionTitleClass}>Apparence</h3>
              
              <div>
                <label className={labelClass}>Thème</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className={inputClass}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className={sectionTitleClass}>Sauvegarde automatique</h3>
              
              <div className="space-y-4 bg-gradient-to-r from-[#636B2F]/5 to-[#3F4A1F]/5 p-6 rounded-xl border border-[#636B2F]/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_backup}
                    onChange={(e) => handleInputChange('auto_backup', e.target.checked)}
                    className={checkboxClass}
                  />
                  <span className="text-sm font-semibold text-neutral-700">Activer la sauvegarde automatique</span>
                </label>

                {settings.auto_backup && (
                  <div className="mt-4">
                    <label className={labelClass}>Fréquence de sauvegarde</label>
                    <select
                      value={settings.backup_frequency}
                      onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                      className={inputClass}
                    >
                      <option value="hourly">Toutes les heures</option>
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border-t border-[#636B2F]/10 pt-6">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-semibold">
                  <Database className="h-4 w-4" />
                  Créer une sauvegarde maintenant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
