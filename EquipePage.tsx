import { useState, useEffect } from 'react';
import { supabase, Profile } from './supabase';
import { Loader2, Users, TrendingUp, Target, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface MemberStats {
  id: string;
  profile: Profile;
  commercesCount: number;
  convertisCount: number;
}

export default function EquipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommerces, setTotalCommerces] = useState(0);
  const [avgConversion, setAvgConversion] = useState(0);
  const [nonAssignes, setNonAssignes] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('actif', true)
        .order('prenom');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      const { count: totalCommercesCount } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true });
      setTotalCommerces(totalCommercesCount || 0);

      const { count: convertisCount } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Converti');

      const { count: nonAssignesCount } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .is('commercial_id', null);
      setNonAssignes(nonAssignesCount || 0);

      if (totalCommercesCount && totalCommercesCount > 0) {
        setAvgConversion(Math.round(((convertisCount || 0) / totalCommercesCount) * 100));
      }

      const statsPromises = (profilesData || []).map(async (profile) => {
        const { count: commercesCount } = await supabase
          .from('commerces')
          .select('*', { count: 'exact', head: true })
          .eq('commercial_id', profile.id);

        const { count: convertis } = await supabase
          .from('commerces')
          .select('*', { count: 'exact', head: true })
          .eq('commercial_id', profile.id)
          .eq('statut', 'Converti');

        return {
          id: profile.id,
          profile,
          commercesCount: commercesCount || 0,
          convertisCount: convertis || 0,
        };
      });

      const stats = await Promise.all(statsPromises);
      setMemberStats(stats);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const topPerformers = [...memberStats]
    .sort((a, b) => b.convertisCount - a.convertisCount)
    .slice(0, 3);

  const getTauxConversion = (stats: MemberStats) => {
    if (stats.commercesCount === 0) return 0;
    return Math.round((stats.convertisCount / stats.commercesCount) * 100);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-[#FF8C3A]" />
          Gestion de l'équipe
          <span className="ml-2 px-3 py-1 bg-[#FF8C3A]/20 text-[#FF8C3A] text-sm font-semibold rounded-full">
            {profiles.length} membres
          </span>
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <p className="text-gray-400 text-sm">Commerciaux actifs</p>
              </div>
              <p className="text-3xl font-bold text-white">{profiles.length}</p>
            </div>

            <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">Total commerces</p>
              </div>
              <p className="text-3xl font-bold text-white">{totalCommerces}</p>
            </div>

            <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <p className="text-gray-400 text-sm">Taux conversion moyen</p>
              </div>
              <p className="text-3xl font-bold text-white">{avgConversion}%</p>
            </div>

            <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-orange-400" />
                <p className="text-gray-400 text-sm">Leads non assignés</p>
              </div>
              <p className="text-3xl font-bold text-white">{nonAssignes}</p>
            </div>
          </div>

          {topPerformers.length > 0 && (
            <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Top Performers du mois</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPerformers.map((stats, index) => (
                  <div
                    key={stats.id}
                    className="bg-[#12121a] rounded-xl p-5 border-2 border-white/10 hover:border-[#FF8C3A]/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white text-lg font-semibold">
                        {stats.profile.prenom?.[0] || stats.profile.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {stats.profile.prenom} {stats.profile.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{stats.profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Deals gagnés</span>
                      <span className="text-2xl font-bold text-green-400">
                        {stats.convertisCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1a1a25] rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-[#12121a]">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                      Utilisateur
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                      Rôle
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden lg:table-cell">
                      Commerces
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden lg:table-cell">
                      Convertis
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden xl:table-cell">
                      Taux
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => {
                    const stats = memberStats.find((s) => s.id === profile.id);
                    const tauxConversion = stats ? getTauxConversion(stats) : 0;

                    return (
                      <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#547235] to-[#FF8C3A] flex items-center justify-center text-white font-semibold">
                              {profile.prenom?.[0] || profile.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {profile.prenom} {profile.nom}
                              </p>
                              <p className="text-sm text-gray-500 md:hidden">{profile.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 hidden md:table-cell">
                          {profile.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF8C3A]/20 text-[#FF8C3A]">
                            {profile.role === 'admin' ? 'Admin' : 'Commercial'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-semibold hidden lg:table-cell">
                          {stats?.commercesCount || 0}
                        </td>
                        <td className="px-6 py-4 text-green-400 font-semibold hidden lg:table-cell">
                          {stats?.convertisCount || 0}
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                tauxConversion >= 50
                                  ? 'text-green-400'
                                  : tauxConversion >= 25
                                  ? 'text-yellow-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {tauxConversion}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              profile.actif
                                ? 'bg-green-400/20 text-green-400'
                                : 'bg-gray-400/20 text-gray-400'
                            }`}
                          >
                            {profile.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
