import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Commerce, Profile } from './supabase';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Save,
  ArrowLeft,
  Loader2,
  Facebook,
  Linkedin,
  Instagram,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUTS = ['À contacter', 'En cours', 'RDV planifié', 'Converti', 'Perdu'];
const PRIORITES = ['Basse', 'Normale', 'Haute'];

export default function CommerceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [commercials, setCommercials] = useState<Profile[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadCommerce();
      loadCommercials();
    }
  }, [id]);

  const loadCommerce = async () => {
    try {
      const { data, error } = await supabase
        .from('commerces')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCommerce(data);
        setNotes(data.notes_internes || '');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate('/commerces');
    } finally {
      setLoading(false);
    }
  };

  const loadCommercials = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('actif', true)
        .order('prenom');

      if (error) throw error;
      setCommercials(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!commerce) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('commerces')
        .update({
          ...commerce,
          notes_internes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commerce.id);

      if (error) throw error;
      toast.success('Commerce mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Commerce, value: any) => {
    if (commerce) {
      setCommerce({ ...commerce, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Commerce introuvable</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Converti':
        return 'bg-green-500/20 text-green-400';
      case 'RDV planifié':
        return 'bg-blue-500/20 text-blue-400';
      case 'En cours':
        return 'bg-orange-500/20 text-orange-400';
      case 'Perdu':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute':
        return 'bg-red-500/20 text-red-400';
      case 'Normale':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/commerces')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commerces
        </button>
        <h1 className="text-3xl font-bold text-white">Fiche Commerce</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nom du commerce
                </label>
                <input
                  type="text"
                  value={commerce.nom}
                  onChange={(e) => updateField('nom', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type de commerce
                </label>
                <select
                  value={commerce.type_commerce || ''}
                  onChange={(e) => updateField('type_commerce', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                >
                  <option value="">Sélectionner</option>
                  <option value="Boulangerie">Boulangerie</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Pizzeria">Pizzeria</option>
                  <option value="Poissonnerie">Poissonnerie</option>
                  <option value="Pressing">Pressing</option>
                  <option value="Boucherie">Boucherie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Adresse
                </label>
                <input
                  type="text"
                  value={commerce.adresse || ''}
                  onChange={(e) => updateField('adresse', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                />
                {commerce.url_google_maps && (
                  <a
                    href={commerce.url_google_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#FF8C3A] hover:text-[#ff7a1f] mt-2 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    Voir sur Google Maps
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={commerce.telephone || ''}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={commerce.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Site web
                </label>
                <input
                  type="url"
                  value={commerce.site_web || ''}
                  onChange={(e) => updateField('site_web', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Réseaux sociaux</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Facebook className="w-4 h-4 inline mr-1" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={commerce.facebook || ''}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Instagram className="w-4 h-4 inline mr-1" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={commerce.instagram || ''}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Linkedin className="w-4 h-4 inline mr-1" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={commerce.linkedin || ''}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Notes & Commentaires</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Ajoutez vos notes ici..."
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8C3A] transition-all resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Statut & Suivi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
                <select
                  value={commerce.statut}
                  onChange={(e) => updateField('statut', e.target.value)}
                  className={`w-full px-4 py-2.5 border border-white/10 rounded-lg font-medium focus:outline-none focus:border-[#FF8C3A] transition-all ${getStatusColor(
                    commerce.statut
                  )}`}
                >
                  {STATUTS.map((statut) => (
                    <option key={statut} value={statut}>
                      {statut}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Priorité</label>
                <select
                  value={commerce.priorite}
                  onChange={(e) => updateField('priorite', e.target.value)}
                  className={`w-full px-4 py-2.5 border border-white/10 rounded-lg font-medium focus:outline-none focus:border-[#FF8C3A] transition-all ${getPriorityColor(
                    commerce.priorite
                  )}`}
                >
                  {PRIORITES.map((priorite) => (
                    <option key={priorite} value={priorite}>
                      {priorite}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Commercial assigné
                </label>
                <select
                  value={commerce.commercial_id || ''}
                  onChange={(e) => updateField('commercial_id', e.target.value || null)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
                >
                  <option value="">Non assigné</option>
                  {commercials.map((commercial) => (
                    <option key={commercial.id} value={commercial.id}>
                      {commercial.prenom} {commercial.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Métriques Google</h2>
            <div className="space-y-4">
              {commerce.note && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Note Google
                  </label>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-bold text-white">{commerce.note}</span>
                    <span className="text-gray-500">/ 5</span>
                  </div>
                </div>
              )}

              {commerce.nombre_avis !== null && commerce.nombre_avis > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nombre d'avis
                  </label>
                  <p className="text-xl font-semibold text-white">{commerce.nombre_avis}</p>
                </div>
              )}

              {commerce.panier_moyen && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Panier moyen
                  </label>
                  <p className="text-xl font-semibold text-white">{commerce.panier_moyen}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Score IA
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{commerce.scoring_ia}</span>
                  <span className="text-gray-500">/ 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 mt-6 p-4 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-end gap-4">
        <button
          onClick={() => navigate('/commerces')}
          className="px-6 py-2.5 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all"
        >
          Annuler
        </button>
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
  );
}
