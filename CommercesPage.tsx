import { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import {
  supabase,
  Commerce,
  Profile,
  getCommerces,
  updateCommerce,
  deleteCommerce,
} from './supabase';
import {
  Search,
  Download,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  MoreVertical,
  X,
  Trash2,
  Edit,
  Calendar,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES_COMMERCE = [
  { value: 'all', icon: '🏪', label: 'Tous' },
  { value: 'Boulangerie', icon: '🥖', label: 'Boulangerie' },
  { value: 'Restaurant', icon: '🍽️', label: 'Restaurant' },
  { value: 'Pizzeria', icon: '🍕', label: 'Pizzeria' },
  { value: 'Poissonnerie', icon: '🐟', label: 'Poissonnerie' },
  { value: 'Pressing', icon: '👔', label: 'Pressing' },
  { value: 'Boucherie', icon: '🥩', label: 'Boucherie' },
];

const STATUTS = [
  { value: 'all', label: 'Tous les statuts', color: '' },
  { value: 'À contacter', label: 'À contacter', color: 'bg-cyan-400/20 text-[#FF8C3A]' },
  { value: 'En cours', label: 'En cours', color: 'bg-yellow-400/20 text-yellow-400' },
  { value: 'RDV planifié', label: 'RDV planifié', color: 'bg-violet-400/20 text-violet-400' },
  { value: 'Converti', label: 'Converti', color: 'bg-green-400/20 text-green-400' },
  { value: 'Perdu', label: 'Perdu', color: 'bg-gray-400/20 text-gray-400' },
];

const PRIORITES = [
  { value: 'Basse', label: 'Basse', color: 'text-gray-400' },
  { value: 'Normale', label: 'Normale', color: 'text-blue-400' },
  { value: 'Haute', label: 'Haute', color: 'text-red-400' },
];

export default function CommercesPage() {
  const { isAdmin, user } = useAuth();
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [commerciaux, setCommerciaux] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null);

  // Filtres
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterCommercial, setFilterCommercial] = useState('all');

  // Charger les données
  useEffect(() => {
    loadData();
    
    // Realtime subscription
    const channel = supabase
      .channel('commerces-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commerces' },
        () => {
          loadCommerces();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterType, filterStatut, filterCommercial, searchText]);

  const loadData = async () => {
    await Promise.all([loadCommerces(), loadCommerciaux()]);
  };

  const loadCommerces = async () => {
    try {
      const data = await getCommerces({
        type_commerce: filterType,
        statut: filterStatut,
        commercial_id: isAdmin ? filterCommercial : user?.id,
        search: searchText,
      });
      setCommerces(data);
    } catch (error) {
      console.error('Error loading commerces:', error);
      toast.error('Erreur lors du chargement des commerces');
    } finally {
      setLoading(false);
    }
  };

  const loadCommerciaux = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('actif', true)
        .order('nom');
      setCommerciaux(data || []);
    } catch (error) {
      console.error('Error loading commerciaux:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Adresse', 'Téléphone', 'Email', 'Type', 'Statut', 'Note', 'Commercial'];
    const rows = commerces.map((c) => [
      c.nom,
      c.adresse || '',
      c.telephone || '',
      c.email || '',
      c.type_commerce || '',
      c.statut,
      c.note?.toString() || '',
      c.commercial ? `${c.commercial.prenom} ${c.commercial.nom}` : '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commerces_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export CSV téléchargé !');
  };

  const handleUpdateCommerce = async (id: string, updates: Partial<Commerce>) => {
    try {
      await updateCommerce(id, updates);
      toast.success('Commerce mis à jour');
      loadCommerces();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCommerce = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commerce ?')) return;

    try {
      await deleteCommerce(id);
      toast.success('Commerce supprimé');
      setSelectedCommerce(null);
      loadCommerces();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getTypeIcon = (type: string | null) => {
    const found = TYPES_COMMERCE.find((t) => t.value === type);
    return found?.icon || '🏪';
  };

  const getStatutStyle = (statut: string) => {
    const found = STATUTS.find((s) => s.value === statut);
    return found?.color || 'bg-gray-400/20 text-gray-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-400/20 text-green-400';
    if (score >= 5) return 'bg-yellow-400/20 text-yellow-400';
    return 'bg-red-400/20 text-red-400';
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            Mes Commerces
            <span className="ml-2 px-3 py-1 bg-cyan-400/20 text-[#FF8C3A] text-sm font-semibold rounded-full">
              {commerces.length}
            </span>
          </h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a25] border border-white/10 rounded-xl text-gray-300 hover:text-white hover:border-white/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche texte */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, adresse..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] transition-all"
            />
          </div>

          {/* Filtre type */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {TYPES_COMMERCE.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  filterType === type.value
                    ? 'bg-cyan-400/20 text-[#FF8C3A] border border-[#FF8C3A]/30'
                    : 'bg-[#12121a] text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{type.icon}</span>
                <span className="text-sm hidden md:inline">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Filtre statut */}
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-[#FF8C3A] transition-all"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Filtre commercial (admin only) */}
          {isAdmin && (
            <select
              value={filterCommercial}
              onChange={(e) => setFilterCommercial(e.target.value)}
              className="px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-[#FF8C3A] transition-all"
            >
              <option value="all">Tous les commerciaux</option>
              {commerciaux.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Liste des commerces */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
        </div>
      ) : commerces.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun commerce trouvé</h3>
          <p className="text-gray-400">Lancez une recherche pour ajouter des commerces</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {commerces.map((commerce) => (
            <div
              key={commerce.id}
              onClick={() => setSelectedCommerce(commerce)}
              className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 cursor-pointer hover:border-[#FF8C3A]/50 hover:shadow-[0_0_30px_rgba(255,140,58,0.1)] transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{getTypeIcon(commerce.type_commerce)}</span>
                <div className="flex items-center gap-2">
                  {commerce.priorite === 'Haute' && (
                    <span className="text-red-400 text-lg">🔴</span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${getScoreColor(
                      commerce.scoring_ia
                    )}`}
                  >
                    {commerce.scoring_ia}/10
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-[#FF8C3A] transition-colors">
                {commerce.nom}
              </h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{commerce.adresse}</p>

              {/* Note Google */}
              {commerce.note && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{commerce.note}</span>
                  <span className="text-gray-500">({commerce.nombre_avis} avis)</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutStyle(commerce.statut)}`}>
                  {commerce.statut}
                </span>
                <div className="flex items-center gap-1">
                  {commerce.telephone && (
                    <a
                      href={`tel:${commerce.telephone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                    </a>
                  )}
                  {commerce.email && (
                    <a
                      href={`mailto:${commerce.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                    </a>
                  )}
                  {commerce.url_google_maps && (
                    <a
                      href={commerce.url_google_maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                    </a>
                  )}
                  {commerce.site_web && (
                    <a
                      href={commerce.site_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Globe className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détail */}
      {selectedCommerce && (
        <CommerceModal
          commerce={selectedCommerce}
          commerciaux={commerciaux}
          onClose={() => setSelectedCommerce(null)}
          onUpdate={handleUpdateCommerce}
          onDelete={handleDeleteCommerce}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

// Composant Modal
function CommerceModal({
  commerce,
  commerciaux,
  onClose,
  onUpdate,
  onDelete,
  isAdmin,
}: {
  commerce: Commerce;
  commerciaux: Profile[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Commerce>) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const [statut, setStatut] = useState(commerce.statut);
  const [priorite, setPriorite] = useState(commerce.priorite);
  const [commercialId, setCommercialId] = useState(commerce.commercial_id || '');
  const [notes, setNotes] = useState(commerce.notes_internes || '');

  const handleSave = () => {
    onUpdate(commerce.id, {
      statut,
      priorite,
      commercial_id: commercialId || null,
      notes_internes: notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a25] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a25] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">
              {TYPES_COMMERCE.find((t) => t.value === commerce.type_commerce)?.icon || '🏪'}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{commerce.nom}</h2>
              <p className="text-sm text-gray-400">{commerce.type_commerce}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Infos de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">Adresse</label>
              <p className="text-white">{commerce.adresse || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Téléphone</label>
              <p className="text-white">{commerce.telephone || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Email</label>
              <p className="text-white">{commerce.email || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Note Google</label>
              <p className="text-white flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {commerce.note || '-'} ({commerce.nombre_avis} avis)
              </p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          {(commerce.linkedin || commerce.facebook || commerce.instagram) && (
            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Réseaux sociaux</label>
              <div className="flex gap-2">
                {commerce.linkedin && (
                  <a
                    href={commerce.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {commerce.facebook && (
                  <a
                    href={commerce.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {commerce.instagram && (
                  <a
                    href={commerce.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm hover:bg-pink-500/30 transition-colors"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Gestion prospection */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Gestion</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Statut */}
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as Commerce['statut'])}
                  className="w-full px-3 py-2 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A]"
                >
                  {STATUTS.filter((s) => s.value !== 'all').map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Priorité</label>
                <select
                  value={priorite}
                  onChange={(e) => setPriorite(e.target.value as Commerce['priorite'])}
                  className="w-full px-3 py-2 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A]"
                >
                  {PRIORITES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commercial */}
              <div>
                <label className="text-xs text-gray-500 uppercase mb-2 block">Commercial</label>
                <select
                  value={commercialId}
                  onChange={(e) => setCommercialId(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] disabled:opacity-50"
                >
                  <option value="">Non assigné</option>
                  {commerciaux.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="text-xs text-gray-500 uppercase mb-2 block">Notes internes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ajouter des notes..."
                className="w-full px-3 py-2 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a25] border-t border-white/10 p-6 flex items-center justify-between">
          <button
            onClick={() => onDelete(commerce.id)}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
