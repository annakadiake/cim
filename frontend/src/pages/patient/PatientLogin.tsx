import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Key, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { PatientLoginCredentials, PatientLoginResponse } from '@/types';
import cimefLogo from '@/assets/images/cimef.png';

export const PatientLogin: React.FC = () => {
  const [credentials, setCredentials] = useState<PatientLoginCredentials>({
    access_key: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response: PatientLoginResponse = await api.patientLogin(credentials);
      
      if (response.success) {
        // Stocker les informations patient dans le sessionStorage
        sessionStorage.setItem('patient_session', JSON.stringify(response));
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'Clé d\'accès ou mot de passe incorrect'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value.toUpperCase() // Convertir en majuscules pour la clé d'accès
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCredentials(prev => ({
      ...prev,
      password: value.toLowerCase() // Convertir en minuscules pour le mot de passe
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 px-4">
      <div className="w-full max-w-md">
        {/* Header avec retour */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/90 backdrop-blur-sm rounded-2xl mb-4 shadow-xl border border-white/20">
            <img
              src={cimefLogo}
              alt="CIMEF Logo"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Portail Patient</h1>
          <p className="text-neutral-600">Accédez à vos résultats d'examens</p>
        </div>

        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-neutral-900">
              Connexion Patient
            </CardTitle>
            <p className="text-sm text-neutral-600 mt-2">
              Utilisez les identifiants fournis par le cabinet médical
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Input
                label="Clé d'accès"
                name="access_key"
                type="text"
                value={credentials.access_key}
                onChange={handleChange}
                icon={Key}
                placeholder="ABC123DEF456"
                maxLength={12}
                required
                disabled={isLoading}
                className="font-mono tracking-wider"
              />

              <Input
                label="Mot de passe"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handlePasswordChange}
                icon={Lock}
                placeholder="abc123de"
                maxLength={8}
                required
                disabled={isLoading}
                className="font-mono"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700"
                loading={isLoading}
                disabled={!credentials.access_key || !credentials.password}
              >
                Accéder à mes résultats
              </Button>
            </form>

            {/* Informations importantes */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="font-medium text-primary-900 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Informations importantes
                </h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Vos identifiants sont <strong>permanents et réutilisables</strong></li>
                  <li>• Conservez-les précieusement pour vos futurs accès</li>
                  <li>• La clé d'accès contient 12 caractères (lettres et chiffres)</li>
                  <li>• Le mot de passe contient 8 caractères (lettres et chiffres)</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-4 text-center">
              <p className="text-xs text-neutral-500">
                Identifiants perdus ou problème d'accès ?
              </p>
              <p className="text-xs text-secondary-600 font-medium">
                Contactez le cabinet médical
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
