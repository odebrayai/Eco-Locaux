import { useState } from 'react';
import { useAuth } from './auth-context';
import { MapPin, Rocket, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES_COMMERCE = [
  { value: 'Boulangerie', icon: '🥖', label: 'Boulangerie' },
  { value: 'Restaurant', icon: '🍽️', label: 'Restaurant' },
  { value: 'Pizzeria', icon: '🍕', label: 'Pizzeria' },
  { value: 'Poissonnerie', icon: '🐟', label: 'Poissonnerie' },
  { value: 'Pressing', icon: '👔', label: 'Pressing' },
  { value: 'Boucherie', icon: '🥩', label: 'Boucherie' },
];

// URL du webhook n8n - À REMPLACER
const N8N_WEBHOOK_URL = 'https://n8n.srv1194290.hstgr.cloud/webhook/prospect-search';

export default function SearchPage() {
  const { user } = useAuth();
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ville: ville,
          type_etablissement: typeCommerce,
          nombre_resultats: nombreResultats,
          commercial_id: user?.id,
        }),
      });

      if (response.ok) {
        toast.success(
          `✅ Recherche lancée ! ${nombreResultats} ${typeCommerce}(s) à ${ville} en cours d'analyse...`,
          { duration: 6000 }
        );
        // Reset form
        setVille('');
        setTypeCommerce('');
        setNombreResultats(10);
      } else {
        throw new Error('Erreur webhook');
      }
    } catch (error) {
      toast.error('❌ Erreur lors de la recherche. Vérifiez votre connexion.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl">🗺️</span>
          Recherche de Commerces
        </h1>
        <p className="text-gray-400 text-lg">
          Trouvez et analysez des établissements avec l'IA
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[#1a1a25] rounded-2xl border border-white/10 p-6 lg:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Ville / Code Postal */}
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

          {/* Type de commerce */}
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
                      ? 'bg-cyan-400/10 border-cyan-400 text-[#FF8C3A] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'bg-[#12121a] border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <span className="text-3xl">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de résultats */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !ville || !typeCommerce}
            className="w-full py-4 bg-gradient-to-r from-[#547235] to-[#FF8C3A] text-white text-lg font-bold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FF8C3A]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,140,58,0.3)]"
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

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-[#1a1a25] rounded-xl p-4 border border-white/5 text-center">
          <span className="text-2xl mb-2 block">⚡</span>
          <span className="text-xs text-gray-500 block">Analyse IA</span>
          <span className="text-sm font-semibold text-[#FF8C3A]">Gemini</span>
        </div>
        <div className="bg-[#1a1a25] rounded-xl p-4 border border-white/5 text-center">
          <span className="text-2xl mb-2 block">📊</span>
          <span className="text-xs text-gray-500 block">Source</span>
          <span className="text-sm font-semibold text-[#FF8C3A]">Google Maps</span>
        </div>
        <div className="bg-[#1a1a25] rounded-xl p-4 border border-white/5 text-center">
          <span className="text-2xl mb-2 block">💾</span>
          <span className="text-xs text-gray-500 block">CRM</span>
          <span className="text-sm font-semibold text-[#FF8C3A]">Supabase</span>
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #547235 0%, #FF8C3A 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(255, 140, 58, 0.5);
          transition: transform 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #547235 0%, #FF8C3A 100%);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 20px rgba(255, 140, 58, 0.5);
        }
      `}</style>
    </div>
  );
}
