import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Eye, EyeOff, Filter, X, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superuser' | 'admin' | 'doctor' | 'secretary' | 'accountant';
  department: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'superuser' | 'admin' | 'doctor' | 'secretary' | 'accountant';
    department: string;
    password: string;
    is_active: boolean;
  }>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'doctor',
    department: '',
    password: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
      } else {
        await api.createUser(formData);
      }
      
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department,
      password: '',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    const ok = await confirm({
      title: 'Supprimer l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deleteUser(userId);
      fetchUsers();
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'secretary',
      department: '',
      password: '',
      is_active: true
    });
    setShowPassword(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superuser': return 'Superutilisateur';
      case 'admin': return 'Administrateur';
      case 'doctor': return 'Médecin';
      case 'secretary': return 'Secrétaire';
      case 'accountant': return 'Comptable';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superuser': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-[#636B2F]/10 text-[#3F4A1F]';
      case 'doctor': return 'bg-[#8FA24A]/15 text-[#3F4A1F]';
      case 'secretary': return 'bg-[#AFC36D]/20 text-[#3F4A1F]';
      case 'accountant': return 'bg-amber-100 text-amber-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setShowFilters(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
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
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Gestion des Utilisateurs</h1>
              <p className="text-neutral-600">Gérez les comptes utilisateurs et leurs permissions</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-semibold"
          >
            <UserPlus className="h-4 w-4" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-[#636B2F]/20 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#636B2F]/50 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, nom d'utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border-2 border-[#636B2F]/20 rounded-xl hover:bg-[#636B2F]/5 transition-all duration-300 text-[#3F4A1F] font-medium"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#636B2F]/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#3F4A1F] mb-1">
                  Rôle
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#636B2F]/20 rounded-xl focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all duration-300"
                >
                  <option value="">Tous les rôles</option>
                  <option value="superuser">Superutilisateur</option>
                  <option value="admin">Administrateur</option>
                  <option value="doctor">Médecin</option>
                  <option value="secretary">Secrétaire</option>
                  <option value="accountant">Comptable</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-[#636B2F] hover:text-[#3F4A1F] font-medium"
              >
                <X className="h-4 w-4" />
                Effacer les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-[#636B2F]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#636B2F]/10">
            <thead className="bg-gradient-to-r from-[#636B2F] to-[#3F4A1F]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#636B2F]/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#636B2F]/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-neutral-800">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {user.email}
                      </div>
                      <div className="text-xs text-neutral-400">
                        @{user.username}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 font-medium">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-[#636B2F] hover:text-[#3F4A1F] p-1 hover:bg-[#636B2F]/10 rounded-lg transition-all duration-200"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 p-1"
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
        </div>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl w-full max-w-md shadow-2xl border border-[#636B2F]/20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#636B2F]/10 to-[#3F4A1F]/10 px-5 py-3 border-b border-[#636B2F]/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#636B2F] to-[#3F4A1F] rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] bg-clip-text text-transparent">
                  {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h3>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#636B2F]/50 hover:text-[#636B2F]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'superuser' | 'admin' | 'doctor' | 'secretary' | 'accountant'})}
                    className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                    required
                  >
                    <option value="secretary">Secrétaire</option>
                    <option value="doctor">Médecin</option>
                    <option value="accountant">Comptable</option>
                    <option value="admin">Administrateur</option>
                    <option value="superuser">Superutilisateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3F4A1F] mb-1">
                    Département
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-[#636B2F]/20 rounded-lg focus:ring-2 focus:ring-[#636B2F]/30 focus:border-[#636B2F] transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 rounded border border-[#636B2F]/30 text-[#636B2F] focus:ring-[#636B2F]/30 focus:ring-1"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm font-semibold text-neutral-700">
                  Compte actif
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm border border-[#636B2F]/20 rounded-lg text-[#3F4A1F] hover:bg-[#636B2F]/5 font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-[#636B2F] to-[#3F4A1F] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
