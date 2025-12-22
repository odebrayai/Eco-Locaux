import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, Commerce } from './supabase';
import { Search, Loader2, MapPin, Phone, Mail, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommercesPage() {
  const navigate = useNavigate();
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  useEffect(() => {
    loadCommerces();
  }, []);

  const loadCommerces = async () => {
    try {
      const { data, error } = await supabase
        .from('commerces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommerces(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommerces = commerces.filter((c) => {
    const matchesSearch =
      c.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      c.adresse?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !filterType || c.type_commerce === filterType;
    const matchesStatut = !filterStatut || c.statut === filterStatut;
    return matchesSearch && matchesType && matchesStatut;
  });

  const resetFilters = () => {
    setSearchText('');
    setFilterType('');
    setFilterStatut('');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            Mes Commerces
            <span className="ml-2 px-3 py-1 bg-[#FF8C3A]/20 text-[#FF8C3A] text-sm font-semibold rounded-full">
              {filteredCommerces.length}
            </span>
          </h1>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
        >
          Nouvelle recherche
        </Link>
      </div>

      <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, adresse..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] transition-all"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
          >
            <option value="">Tous les types</option>
            <option value="Boulangerie">Boulangerie</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Pizzeria">Pizzeria</option>
            <option value="Poissonnerie">Poissonnerie</option>
            <option value="Pressing">Pressing</option>
            <option value="Boucherie">Boucherie</option>
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#FF8C3A] transition-all"
          >
            <option value="">Tous les statuts</option>
            <option value="À contacter">À contacter</option>
            <option value="En cours">En cours</option>
            <option value="RDV planifié">RDV planifié</option>
            <option value="Converti">Converti</option>
            <option value="Perdu">Perdu</option>
          </select>
        </div>

        {(searchText || filterType || filterStatut) && (
          <button
            onClick={resetFilters}
            className="mt-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
        </div>
      ) : filteredCommerces.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun commerce trouvé</h3>
          <p className="text-gray-400">Lancez une recherche pour ajouter des commerces</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCommerces.map((commerce) => (
            <div
              key={commerce.id}
              className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 hover:border-[#FF8C3A]/50 transition-all cursor-pointer group"
              onClick={() => navigate(`/commerces/${commerce.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">🏪</span>
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-400/20 text-green-400">
                  {commerce.scoring_ia}/10
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-[#FF8C3A] transition-colors">
                {commerce.nom}
              </h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{commerce.adresse}</p>

              {commerce.note && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{commerce.note}</span>
                  <span className="text-gray-500">({commerce.nombre_avis} avis)</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF8C3A]/20 text-[#FF8C3A]">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/commerces/${commerce.id}`);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
