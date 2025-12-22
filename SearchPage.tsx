import { useState } from 'react';
import { MapPin, Rocket, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES_COMMERCE = [
  { value: 'Boulangerie', icon: '🥖', label: 'Boulangerie' },
  { value: 'Pressing', icon: '👔', label: 'Pressing' },
  { value: 'Boucherie', icon: '🥩', label: 'Boucherie' },
  { value: 'Poissonnerie', icon: '🐟', label: 'Poissonnerie' },
  { value: 'Restaurant', icon: '🍽️', label: 'Restaurant' },
  { value: 'Pizzeria', icon: '🍕', label: 'Pizzeria' },
];

const N8N_WEBHOOK_URL = 'https://n8n.srv1194290.hstgr.cloud/webhook/prospect-search';

export default function SearchPage() {
  const [ville, setVille] = useState('');
  const [typeCommerce, setTypeCommerce] = useState('');
  const [nombreResultats, setNombreResultats] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ville || !typeCommerce) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ville,
          type_etablissement: typeCommerce,
          nombre_resultats: nombreResultats,
        }),
      });

      if (response.ok) {
        toast.success(
          `Recherche lancée ! ${nombreResultats} ${typeCommerce}(s) à ${ville}`,
          { duration: 6000 }
        );
        setVille('');
        setTypeCommerce('');
        setNombreResultats(10);
      } else {
        throw new Error('Erreur webhook');
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          🗺️ Recherche de Commerces
        </h1>
        <p className="text-gray-400 text-lg">
          Trouvez des établissements exposés aux coûts énergétiques
        </p>
      </div>

      <div className="bg-[#1a1a25] rounded-2xl border border-white/10 p-6 lg:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <MapPin className="w-4 h-4 text-[#FF8C3A]" />
              Ville ou Code Postal
            </label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex: Paris, 75001, Lyon..."
              className="w-full px-5 py-4 bg-[#12121a] border-2 border-white/10 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#FF8C3A] focus:ring-2 focus:ring-[#FF8C3A]/20 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <span className="text-[#FF8C3A]">🏪</span>
              Type de Commerce
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TYPES_COMMERCE.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTypeCommerce(type.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    typeCommerce === type.value
                      ? 'bg-[#FF8C3A]/10 border-[#FF8C3A] text-[#FF8C3A]'
                      : 'bg-[#12121a] border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <span className="text-3xl">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-3">
              <span className="flex items-center gap-2">
                <span className="text-[#FF8C3A]">🔢</span>
                Nombre de commerces
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white text-sm font-bold rounded-full">
                {nombreResultats}
              </span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={nombreResultats}
              onChange={(e) => setNombreResultats(parseInt(e.target.value))}
              className="w-full h-2 bg-[#12121a] rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ville || !typeCommerce}
            className="w-full py-4 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white text-lg font-bold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FF8C3A]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Rocket className="w-6 h-6" />
                Lancer la Recherche
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #547235 0%, #FF8C3A 100%);
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #547235 0%, #FF8C3A 100%);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
