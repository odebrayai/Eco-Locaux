import { useState, useEffect } from 'react';
import { supabase, Commerce } from './supabase';
import { Search, Loader2, MapPin, Phone, Mail, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommercesPage() {
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

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

  const filteredCommerces = commerces.filter((c) =>
    c.nom.toLowerCase().includes(searchText.toLowerCase()) ||
    c.adresse?.toLowerCase().includes(searchText.toLowerCase())
  );

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
      </div>

      <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, adresse..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] transition-all"
          />
        </div>
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
              className="bg-[#1a1a25] rounded-xl border border-white/10 p-5 hover:border-[#FF8C3A]/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">🏪</span>
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-400/20 text-green-400">
                  {commerce.scoring_ia}/10
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 truncate">
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
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                    </a>
                  )}
                  {commerce.email && (
                    <a
                      href={`mailto:${commerce.email}`}
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
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 hover:text-[#FF8C3A]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
