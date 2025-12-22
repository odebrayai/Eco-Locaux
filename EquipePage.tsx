import { useState, useEffect } from 'react';
import { supabase, Profile } from './supabase';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EquipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">👥</span>
          Gestion de l'équipe
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
        </div>
      ) : (
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Utilisateur</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Rôle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white font-semibold">
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
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF8C3A]/20 text-[#FF8C3A]">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
