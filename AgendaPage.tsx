import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RDV {
  id: string;
  commerce_id: string;
  date_rdv: string;
  heure: string;
  type_rdv: string;
  statut: string;
  commerce?: {
    nom: string;
  };
}

export default function AgendaPage() {
  const [rdvs, setRdvs] = useState<RDV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRdvs();
  }, []);

  const loadRdvs = async () => {
    try {
      const { data, error } = await supabase
        .from('rdv')
        .select(`
          *,
          commerce:commerces(nom)
        `)
        .order('date_rdv', { ascending: true })
        .order('heure', { ascending: true });

      if (error) throw error;
      setRdvs(data as unknown as RDV[] || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const rdvsByDate = rdvs.reduce((acc, rdv) => {
    const date = rdv.date_rdv;
    if (!acc[date]) acc[date] = [];
    acc[date].push(rdv);
    return acc;
  }, {} as Record<string, RDV[]>);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📅</span>
          Agenda des Rendez-vous
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF8C3A] animate-spin" />
        </div>
      ) : rdvs.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun rendez-vous</h3>
          <p className="text-gray-400">Vos rendez-vous apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(rdvsByDate).map(([date, dateRdvs]) => (
            <div key={date} className="bg-[#1a1a25] rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-[#12121a] px-5 py-3 border-b border-white/10">
                <h3 className="font-semibold text-white capitalize">{formatDate(date)}</h3>
              </div>
              <div className="p-4 space-y-3">
                {dateRdvs.map((rdv) => (
                  <div
                    key={rdv.id}
                    className="flex items-center gap-4 p-4 bg-[#12121a] rounded-xl border-l-4 border-l-[#FF8C3A]"
                  >
                    <div className="text-center min-w-[60px]">
                      <span className="text-xl font-bold text-white block">{rdv.heure}</span>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-white">
                        {rdv.commerce?.nom || 'Commerce'}
                      </h4>
                      <p className="text-sm text-gray-400">{rdv.type_rdv}</p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-400/20 text-green-400">
                      {rdv.statut}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
