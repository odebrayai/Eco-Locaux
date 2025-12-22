import { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import {
  supabase,
  RDV,
  Commerce,
  getRDVs,
  createRDV,
  updateRDV,
  deleteRDV,
} from './supabase';
import {
  Plus,
  X,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES_RDV = [
  { value: 'Prospection', label: 'Prospection' },
  { value: 'Suivi', label: 'Suivi' },
  { value: 'Signature', label: 'Signature' },
  { value: 'Autre', label: 'Autre' },
];

const STATUTS_RDV = [
  { value: 'En attente', label: 'En attente', color: 'bg-yellow-400/20 text-yellow-400', borderColor: 'border-l-yellow-400' },
  { value: 'Confirmé', label: 'Confirmé', color: 'bg-green-400/20 text-green-400', borderColor: 'border-l-green-400' },
  { value: 'Annulé', label: 'Annulé', color: 'bg-red-400/20 text-red-400', borderColor: 'border-l-red-400' },
  { value: 'Terminé', label: 'Terminé', color: 'bg-gray-400/20 text-gray-400', borderColor: 'border-l-gray-400' },
];

export default function AgendaPage() {
  const { user, isAdmin } = useAuth();
  const [rdvs, setRdvs] = useState<RDV[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRdv, setEditingRdv] = useState<RDV | null>(null);
  const [filterStatut, setFilterStatut] = useState('all');

  const stats = {
    total: rdvs.length,
    confirmes: rdvs.filter((r) => r.statut === 'Confirmé').length,
    enAttente: rdvs.filter((r) => r.statut === 'En attente').length,
    annules: rdvs.filter((r) => r.statut === 'Annulé').length,
  };

  useEffect(() => {
    loadData();
  }, [filterStatut]);

  const loadData = async () => {
    try {
      const [rdvsData, commercesData] = await Promise.all([
        getRDVs({
          commercial_id: isAdmin ? 'all' : user?.id,
          statut: filterStatut,
        }),
        supabase.from('commerces').select('id, nom, type_commerce').order('nom'),
      ]);
      setRdvs(rdvsData);
      setCommerces(commercesData.data as Commerce[] || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRdv = async (data: any) => {
    try {
      if (editingRdv) {
        await updateRDV(editingRdv.id, data);
        toast.success('RDV mis à jour');
      } else {
        await createRDV({ ...data, commercial_id: user?.id });
        toast.success('RDV créé avec succès');
      }
      setShowModal(false);
      setEditingRdv(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteRdv = async (id: string) => {
    if (!confirm('Supprimer ce RDV ?')) return;
    try {
      await deleteRDV(id);
      toast.success('RDV supprimé');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const rdvsByDate = rdvs.reduce((acc, rdv) => {
    const date = rdv.date_rdv;
    if (!acc[date]) acc[date] = [];
    acc[date].push(rdv);
    return acc;
  }, {} as Record<string, RDV[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getStatutStyle = (statut: string) => {
    return STATUTS_RDV.find((s) => s.value === statut) || STATUTS_RDV[0];
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📅</span>
          Agenda des Rendez-vous
        </h1>
        <button
          onClick={() => { setEditingRdv(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,140,58,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Nouveau RDV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 text-center">
          <span className="text-3xl font-bold text-white block">{stats.total}</span>
          <span className="text-sm text-gray-400">Total RDV</span>
        </div>
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 text-center">
          <span className="text-3xl font-bold text-green-400 block">{stats.confirmes}</span>
          <span className="text-sm text-gray-400">Confirmés</span>
        </div>
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 text-center">
          <span className="text-3xl font-bold text-yellow-400 block">{stats.enAttente}</span>
          <span className="text-sm text-gray-400">En attente</span>
        </div>
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 text-center">
          <span className="text-3xl font-bold text-red-400 block">{stats.annules}</span>
          <span className="text-sm text-gray-400">Annulés</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatut('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            filterStatut === 'all'
              ? 'bg-cyan-400/20 text-[#FF8C3A] border border-cyan-400/30'
              : 'bg-[#1a1a25] text-gray-400 border border-white/10 hover:border-white/20'
          }`}
        >
          Tous
        </button>
        {STATUTS_RDV.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatut(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filterStatut === s.value
                ? `${s.color} border border-current`
                : 'bg-[#1a1a25] text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Liste des RDV */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
        </div>
      ) : rdvs.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun rendez-vous</h3>
          <p className="text-gray-400">Créez votre premier RDV pour commencer</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(rdvsByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateRdvs]: [string, RDV[]]) => (
              <div key={date} className="bg-[#1a1a25] rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-[#12121a] px-5 py-3 border-b border-white/10">
                  <h3 className="font-semibold text-white capitalize">{formatDate(date)}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {dateRdvs.map((rdv) => {
                    const statutStyle = getStatutStyle(rdv.statut);
                    return (
                      <div
                        key={rdv.id}
                        className={`flex items-center gap-4 p-4 bg-[#12121a] rounded-xl border-l-4 ${statutStyle.borderColor} hover:bg-white/5 transition-colors`}
                      >
                        {/* Heure */}
                        <div className="text-center min-w-[60px]">
                          <span className="text-xl font-bold text-white block">{rdv.heure}</span>
                          <span className="text-xs text-gray-500">{rdv.duree} min</span>
                        </div>

                        {/* Infos */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {rdv.commerce?.nom || 'Commerce inconnu'}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {rdv.type_rdv} {rdv.lieu && `• ${rdv.lieu}`}
                          </p>
                          {rdv.notes && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{rdv.notes}</p>
                          )}
                        </div>

                        {/* Statut */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statutStyle.color}`}>
                          {rdv.statut}
                        </span>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingRdv(rdv); setShowModal(true); }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRdv(rdv.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setEditingRdv(null); setShowModal(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#547235] to-[#FF8C3A] rounded-full flex items-center justify-center text-white text-2xl shadow-[0_0_30px_rgba(255,140,58,0.4)] hover:scale-110 transition-transform lg:hidden"
      >
        +
      </button>

      {/* Modal */}
      {showModal && (
        <RdvModal
          rdv={editingRdv}
          commerces={commerces}
          onClose={() => { setShowModal(false); setEditingRdv(null); }}
          onSave={handleSaveRdv}
        />
      )}
    </div>
  );
}

// Modal RDV
function RdvModal({
  rdv,
  commerces,
  onClose,
  onSave,
}: {
  rdv: RDV | null;
  commerces: Commerce[];
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [commerceId, setCommerceId] = useState(rdv?.commerce_id || '');
  const [dateRdv, setDateRdv] = useState(rdv?.date_rdv || '');
  const [heure, setHeure] = useState(rdv?.heure || '09:00');
  const [duree, setDuree] = useState(rdv?.duree || 30);
  const [typeRdv, setTypeRdv] = useState<'Prospection' | 'Suivi' | 'Signature' | 'Autre'>(rdv?.type_rdv || 'Prospection');
  const [lieu, setLieu] = useState(rdv?.lieu || '');
  const [statut, setStatut] = useState<'En attente' | 'Confirmé' | 'Annulé' | 'Terminé'>(rdv?.statut || 'En attente');
  const [notes, setNotes] = useState(rdv?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commerceId || !dateRdv || !heure) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    onSave({
      commerce_id: commerceId,
      date_rdv: dateRdv,
      heure,
      duree,
      type_rdv: typeRdv,
      lieu,
      statut,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a25] rounded-2xl border border-white/10 w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {rdv ? 'Modifier le RDV' : 'Nouveau RDV'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Commerce */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Commerce *</label>
            <select
              value={commerceId}
              onChange={(e) => setCommerceId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A]"
            >
              <option value="">Sélectionner un commerce</option>
              {commerces.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Date et Heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Date *</label>
              <input
                type="date"
                value={dateRdv}
                onChange={(e) => setDateRdv(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A]"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Heure *</label>
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A]"
              />
            </div>
          </div>

          {/* Durée et Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Durée (min)</label>
              <input
                type="number"
                value={duree}
                onChange={(e) => setDuree(parseInt(e.target.value))}
                min="15"
                step="15"
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A]"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Type</label>
              <select
                value={typeRdv}
                onChange={(e) => setTypeRdv(e.target.value as 'Prospection' | 'Suivi' | 'Signature' | 'Autre')}
                className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A]"
              >
                {TYPES_RDV.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lieu */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Lieu</label>
            <input
              type="text"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              placeholder="Adresse ou lieu du RDV"
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A]"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Statut</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as 'En attente' | 'Confirmé' | 'Annulé' | 'Terminé')}
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF8C3A]"
            >
              {STATUTS_RDV.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes sur ce RDV..."
              className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              {rdv ? 'Sauvegarder' : 'Créer le RDV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
