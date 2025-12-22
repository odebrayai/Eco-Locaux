import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  role: 'admin' | 'commercial';
  actif: boolean;
  created_at: string;
}

export interface Commerce {
  id: string;
  nom: string;
  type_commerce: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  site_web: string | null;
  url_google_maps: string | null;
  note: number | null;
  nombre_avis: number | null;
  scoring_ia: number;
  statut: string;
  priorite: string;
  commercial_id: string | null;
  notes_internes: string | null;
  created_at: string;
}
