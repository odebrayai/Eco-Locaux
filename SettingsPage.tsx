import { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase';
import { Settings, User, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');

  useEffect(() => {
    if (profile) {
      setPrenom(profile.prenom || '');
      setNom(profile.nom || '');
      setTelephone(profile.telephone || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          prenom,
          nom,
          telephone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profil mis à jour');
      window.location.reload();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#FF8C3A]" />
          Paramètres
        </h1>
        <p className="text-gray-400 mt-2">Gérez vos informations personnelles</p>
      </div>

      <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white text-2xl font-semibold">
            {profile?.prenom?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {profile?.prenom} {profile?.nom}
            </h2>
            <p className="text-gray-400">{profile?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FF8C3A]/20 text-[#FF8C3A]">
              {profile?.role === 'admin' ? 'Admin' : 'Commercial'}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informations du compte</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Rôle</span>
            <span className="text-white font-medium">
              {profile?.role === 'admin' ? 'Administrateur' : 'Commercial'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Statut</span>
            <span className="text-green-400 font-medium">
              {profile?.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Membre depuis</span>
            <span className="text-white font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
