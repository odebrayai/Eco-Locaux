import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Stats {
  totalCommerces: number;
  convertis: number;
  perdus: number;
  enCours: number;
  rdvPlanifies: number;
  tauxConversion: number;
}

interface TypeStats {
  type: string;
  count: number;
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCommerces: 0,
    convertis: 0,
    perdus: 0,
    enCours: 0,
    rdvPlanifies: 0,
    tauxConversion: 0,
  });
  const [typeStats, setTypeStats] = useState<TypeStats[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { count: total } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true });

      const { count: convertis } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Converti');

      const { count: perdus } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Perdu');

      const { count: enCours } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'En cours');

      const { count: rdvPlanifies } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'RDV planifié');

      const tauxConversion = total && total > 0 ? Math.round(((convertis || 0) / total) * 100) : 0;

      setStats({
        totalCommerces: total || 0,
        convertis: convertis || 0,
        perdus: perdus || 0,
        enCours: enCours || 0,
        rdvPlanifies: rdvPlanifies || 0,
        tauxConversion,
      });

      const { data: commerces } = await supabase
        .from('commerces')
        .select('type_commerce');

      const typeCounts: { [key: string]: number } = {};
      commerces?.forEach((c) => {
        const type = c.type_commerce || 'Autre';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const typeStatsArray = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
      }));
      setTypeStats(typeStatsArray);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
      </div>
    );
  }

  const maxCount = Math.max(...typeStats.map((t) => t.count), 1);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#FF8C3A]" />
          Statistiques
        </h1>
        <p className="text-gray-400 mt-2">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <p className="text-gray-400 text-sm mb-2">Total Commerces</p>
          <p className="text-4xl font-bold text-white">{stats.totalCommerces}</p>
        </div>

        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <p className="text-gray-400 text-sm mb-2">Taux de Conversion</p>
          <p className="text-4xl font-bold text-green-400">{stats.tauxConversion}%</p>
        </div>

        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <p className="text-gray-400 text-sm mb-2">Convertis</p>
          <p className="text-4xl font-bold text-emerald-400">{stats.convertis}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Répartition par statut</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">À contacter</span>
                <span className="text-white font-semibold">
                  {stats.totalCommerces -
                    stats.convertis -
                    stats.perdus -
                    stats.enCours -
                    stats.rdvPlanifies}
                </span>
              </div>
              <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500"
                  style={{
                    width: `${
                      ((stats.totalCommerces -
                        stats.convertis -
                        stats.perdus -
                        stats.enCours -
                        stats.rdvPlanifies) /
                        stats.totalCommerces) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">En cours</span>
                <span className="text-white font-semibold">{stats.enCours}</span>
              </div>
              <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{
                    width: `${(stats.enCours / stats.totalCommerces) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">RDV planifié</span>
                <span className="text-white font-semibold">{stats.rdvPlanifies}</span>
              </div>
              <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${(stats.rdvPlanifies / stats.totalCommerces) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Converti</span>
                <span className="text-white font-semibold">{stats.convertis}</span>
              </div>
              <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${(stats.convertis / stats.totalCommerces) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Perdu</span>
                <span className="text-white font-semibold">{stats.perdus}</span>
              </div>
              <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${(stats.perdus / stats.totalCommerces) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Répartition par type</h2>
          <div className="space-y-4">
            {typeStats.map((stat) => (
              <div key={stat.type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{stat.type}</span>
                  <span className="text-white font-semibold">{stat.count}</span>
                </div>
                <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#547235] to-[#FF8C3A]"
                    style={{
                      width: `${(stat.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
