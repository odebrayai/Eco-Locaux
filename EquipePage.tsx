import { useState, useEffect } from 'react';
import { supabase, Profile } from './supabase';
import { useAuth } from './auth-context';
import { Plus, X, Loader2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EquipePage() {
  const { signUp } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nom');
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (profile: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ actif: !profile.actif })
        .eq('id', profile.id);
      if (error) throw error;
      toast.success(profile.actif ? 'Utilisateur désactivé' : 'Utilisateur activé');
      loadProfiles();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCreateUser = async (data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: string;
  }) => {
    try {
      const { error } = await signUp(data.email, data.password, {
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
      });
      if (error) throw error;
      toast.success('Utilisateur créé avec succès');
      setShowModal(false);
      loadProfiles();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">👥</span>
          Gestion de l'équipe
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Ajouter un commercial
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Utilisateur</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Téléphone</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Rôle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-semibold">
                        {profile.prenom?.[0] || profile.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {profile.prenom} {profile.nom}
                        </p>
                        <p className="text-sm text-gray-500 md:hidden">{profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 hidden md:table-cell">{profile.email}</td>
                  <td className="px-6 py-4 text-gray-300 hidden lg:table-cell">{profile.telephone || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile.role === 'admin'
                          ? 'bg-violet-400/20 text-violet-400'
                          : 'bg-cyan-400/20 text-cyan-400'
                      }`}
                    >
                      {profile.role === 'admin' ? 'Admin' : 'Commercial'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile.actif
                          ? 'bg-green-400/20 text-green-400'
                          : 'bg-gray-400/20 text-gray-400'
                      }`}
                    >
                      {profile.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleActif(profile)}
                      className={`p-2 rounded-lg transition-colors ${
                        profile.actif
                          ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400'
                          : 'hover:bg-green-500/10 text-gray-400 hover:text-green-400'
                      }`}
                      title={profile.actif ? 'Désactiver' : 'Activer'}
                    >
                      {profile.actif ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateUser}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: any) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState('commercial');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({ email, password, nom, prenom, role });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a25] rounded-2xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Nouveau commercial</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="commercial">Commercial</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
