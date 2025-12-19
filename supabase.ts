import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types TypeScript pour les tables
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: 'admin' | 'commercial';
  telephone: string | null;
  avatar_url: string | null;
  actif: boolean;
}

export interface Commerce {
  id: string;
  created_at: string;
  updated_at: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  site_web: string | null;
  place_id: string | null;
  url_google_maps: string | null;
  note: number | null;
  nombre_avis: number;
  panier_moyen: string | null;
  type_commerce: 'Boulangerie' | 'Restaurant' | 'Pizzeria' | 'Poissonnerie' | 'Pressing' | 'Boucherie' | null;
  categorie: string | null;
  contact_nom: string | null;
  contact_poste: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  enrichi_gemini: boolean;
  scoring_ia: number;
  statut: 'À contacter' | 'En cours' | 'RDV planifié' | 'Converti' | 'Perdu';
  commercial_id: string | null;
  priorite: 'Basse' | 'Normale' | 'Haute';
  notes_internes: string | null;
  ville_recherche: string | null;
  date_scraping: string | null;
  // Relation
  commercial?: Profile;
}

export interface RDV {
  id: string;
  created_at: string;
  updated_at: string;
  commerce_id: string;
  commercial_id: string | null;
  date_rdv: string;
  heure: string;
  duree: number;
  type_rdv: 'Prospection' | 'Suivi' | 'Signature' | 'Autre';
  lieu: string | null;
  statut: 'En attente' | 'Confirmé' | 'Annulé' | 'Terminé';
  notes: string | null;
  rappel_envoye: boolean;
  // Relations
  commerce?: Commerce;
  commercial?: Profile;
}

export interface HistoriqueAction {
  id: string;
  created_at: string;
  commerce_id: string | null;
  commercial_id: string | null;
  type_action: 'recherche' | 'creation' | 'modification' | 'suppression' | 'rdv_cree' | 'rdv_modifie' | 'statut_change' | 'assignation';
  description: string | null;
  metadata: Record<string, any> | null;
}

// Helper functions
export const getCommerces = async (filters?: {
  type_commerce?: string;
  statut?: string;
  commercial_id?: string;
  search?: string;
}) => {
  let query = supabase
    .from('commerces')
    .select('*, commercial:profiles(id, nom, prenom, avatar_url)')
    .order('created_at', { ascending: false });

  if (filters?.type_commerce && filters.type_commerce !== 'all') {
    query = query.eq('type_commerce', filters.type_commerce);
  }
  if (filters?.statut && filters.statut !== 'all') {
    query = query.eq('statut', filters.statut);
  }
  if (filters?.commercial_id && filters.commercial_id !== 'all') {
    query = query.eq('commercial_id', filters.commercial_id);
  }
  if (filters?.search) {
    query = query.or(`nom.ilike.%${filters.search}%,adresse.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Commerce[];
};

export const getCommerce = async (id: string) => {
  const { data, error } = await supabase
    .from('commerces')
    .select('*, commercial:profiles(id, nom, prenom, avatar_url)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Commerce;
};

export const updateCommerce = async (id: string, updates: Partial<Commerce>) => {
  const { data, error } = await supabase
    .from('commerces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Commerce;
};

export const deleteCommerce = async (id: string) => {
  const { error } = await supabase
    .from('commerces')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getRDVs = async (filters?: {
  commercial_id?: string;
  statut?: string;
  date_from?: string;
  date_to?: string;
}) => {
  let query = supabase
    .from('rdv')
    .select('*, commerce:commerces(id, nom, type_commerce, adresse), commercial:profiles(id, nom, prenom, avatar_url)')
    .order('date_rdv', { ascending: true })
    .order('heure', { ascending: true });

  if (filters?.commercial_id && filters.commercial_id !== 'all') {
    query = query.eq('commercial_id', filters.commercial_id);
  }
  if (filters?.statut && filters.statut !== 'all') {
    query = query.eq('statut', filters.statut);
  }
  if (filters?.date_from) {
    query = query.gte('date_rdv', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('date_rdv', filters.date_to);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as RDV[];
};

export const createRDV = async (rdv: Omit<RDV, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('rdv')
    .insert(rdv)
    .select()
    .single();
  
  if (error) throw error;
  return data as RDV;
};

export const updateRDV = async (id: string, updates: Partial<RDV>) => {
  const { data, error } = await supabase
    .from('rdv')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as RDV;
};

export const deleteRDV = async (id: string) => {
  const { error } = await supabase
    .from('rdv')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getProfiles = async (activeOnly = true) => {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('nom', { ascending: true });

  if (activeOnly) {
    query = query.eq('actif', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
};

export const logAction = async (action: Omit<HistoriqueAction, 'id' | 'created_at'>) => {
  const { error } = await supabase
    .from('historique_actions')
    .insert(action);
  
  if (error) console.error('Error logging action:', error);
};
