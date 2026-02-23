import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Lock, AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        'Nom d\'utilisateur ou mot de passe incorrect'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#636B2F]/10 via-white to-[#3F4A1F]/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white/90 backdrop-blur-sm rounded-2xl mb-4 shadow-xl border border-white/20">
            <img
              src="/src/assets/images/cimef.png"
              alt="CIMEF Logo"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-gradient font-bold text-2xl">RF</span>
          </div>
          
        </div>

        <Card className="shadow-xl bg-white/70 backdrop-blur-sm border border-white/20">
          <CardHeader className="text-center bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 rounded-t-lg">
            <CardTitle className="text-xl bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent font-bold">
              Connexion Personnel
            </CardTitle>
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
                label="Nom d'utilisateur"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                icon={User}
                placeholder="Entrez votre nom d'utilisateur"
                required
                disabled={isLoading}
              />

              <Input
                label="Mot de passe"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                icon={Lock}
                placeholder="Entrez votre mot de passe"
                required
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] hover:from-[#636B2F]/90 hover:to-[#3F4A1F]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                loading={isLoading}
                disabled={!credentials.username || !credentials.password}
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lien vers portail patient */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600 mb-2">
            Vous êtes un patient ?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/patient')}
            className="text-[#3F4A1F] border-[#3F4A1F]/30 hover:bg-[#3F4A1F]/10 hover:border-[#3F4A1F]/50 transition-all duration-200"
          >
            Accéder au portail patient
          </Button>
        </div>
      </div>
    </div>
  );
};
