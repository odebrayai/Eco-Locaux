import { useState, useEffect } from 'react';
import { supabase, Commerce } from './supabase';
import { useAuth } from './auth-context';
import { Building2, Calendar, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface KPI {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface RDV {
  id: string;
  date_rdv: string;
  heure: string;
  commerce?: {
    nom: string;
  };
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalCommerces, setTotalCommerces] = useState(0);
  const [rdvSemaine, setRdvSemaine] = useState(0);
  const [tauxConversion, setTauxConversion] = useState(0);
  const [aRelancer, setARelancer] = useState(0);
  const [recentCommerces, setRecentCommerces] = useState<Commerce[]>([]);
  const [prochainRdvs, setProchainRdvs] = useState<RDV[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: commerces, error: commercesError } = await supabase
        .from('commerces')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (commercesError) throw commercesError;
      setRecentCommerces(commerces || []);
      setTotalCommerces(commerces?.length || 0);

      const { count: totalCount } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true });
      setTotalCommerces(totalCount || 0);

      const { count: convertis } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Converti');

      if (totalCount && totalCount > 0) {
        setTauxConversion(Math.round(((convertis || 0) / totalCount) * 100));
      }

      const { count: relance } = await supabase
        .from('commerces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'En cours');
      setARelancer(relance || 0);

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data: rdvs, error: rdvError } = await supabase
        .from('rdv')
        .select(`
          *,
          commerce:commerces(nom)
        `)
        .gte('date_rdv', today.toISOString().split('T')[0])
        .lte('date_rdv', nextWeek.toISOString().split('T')[0])
        .order('date_rdv', { ascending: true })
        .order('heure', { ascending: true })
        .limit(5);

      if (rdvError) throw rdvError;
      setProchainRdvs(rdvs as unknown as RDV[] || []);
      setRdvSemaine(rdvs?.length || 0);

    } catch (error) {
      toast.error('Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const kpis: KPI[] = [
    {
      label: 'Total Commerces',
      value: totalCommerces,
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      label: 'RDV cette semaine',
      value: rdvSemaine,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Taux de conversion',
      value: tauxConversion,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-600',
    },
    {
      label: 'À relancer',
      value: aRelancer,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-600',
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bonjour {profile?.prenom} 👋
        </h1>
        <p className="text-gray-400">Voici un résumé de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-[#1a1a25] rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className="text-3xl font-bold text-white">
                {kpi.value}
                {kpi.label === 'Taux de conversion' && '%'}
              </span>
            </div>
            <p className="text-sm text-gray-400">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Derniers commerces ajoutés</h2>
            <Link
              to="/commerces"
              className="text-sm text-[#FF8C3A] hover:text-[#ff7a1f] transition-colors"
            >
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {recentCommerces.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun commerce</p>
            ) : (
              recentCommerces.map((commerce) => (
                <div
                  key={commerce.id}
                  className="flex items-center gap-3 p-3 bg-[#12121a] rounded-lg hover:bg-[#1e1e2a] transition-colors"
                >
                  <div className="text-2xl">🏪</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{commerce.nom}</p>
                    <p className="text-sm text-gray-500 truncate">{commerce.adresse}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#FF8C3A]/20 text-[#FF8C3A]">
                    {commerce.scoring_ia}/10
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#1a1a25] rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Prochains RDV</h2>
            <Link
              to="/agenda"
              className="text-sm text-[#FF8C3A] hover:text-[#ff7a1f] transition-colors"
            >
              Voir agenda
            </Link>
          </div>
          <div className="space-y-3">
            {prochainRdvs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Aucun rendez-vous</p>
            ) : (
              prochainRdvs.map((rdv) => (
                <div
                  key={rdv.id}
                  className="flex items-center gap-3 p-3 bg-[#12121a] rounded-lg hover:bg-[#1e1e2a] transition-colors"
                >
                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-bold text-white">{formatDate(rdv.date_rdv)}</div>
                    <div className="text-xs text-gray-500">{rdv.heure}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {rdv.commerce?.nom || 'Commerce'}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#FF8C3A]"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
