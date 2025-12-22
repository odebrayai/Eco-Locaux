import { useState } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase';
import { User, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [nom, setNom] = useState(profile?.nom || '');
  const [prenom, setPrenom] = useState(profile?.prenom || '');
  const [telephone, setTelephone] = useState(profile?.telephone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nom, prenom, telephone })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {prenom?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-gray-400">{profile?.email}</p>
        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            profile?.role === 'admin'
              ? 'bg-violet-400/20 text-violet-400'
              : 'bg-cyan-400/20 text-[#FF8C3A]'
          }`}
        >
          {profile?.role === 'admin' ? 'Administrateur' : 'Commercial'}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-[#1a1a25] rounded-2xl border border-white/10 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#FF8C3A]" />
          Informations personnelles
        </h2>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-8 py-4 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Sauvegarder
            </>
          )}
        </button>
      </form>
    </div>
  );
}
