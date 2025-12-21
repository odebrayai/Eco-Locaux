/*
  # Create commerces table
  
  1. New Tables
    - `commerces`
      - Business/commerce records with contact and scoring information
      - Includes relationship to commercial (sales person)
      - Tracks engagement status and internal notes
      
  2. Security
    - Enable RLS for data isolation
*/

CREATE TABLE IF NOT EXISTS commerces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  nom text NOT NULL,
  adresse text,
  telephone text,
  email text,
  site_web text,
  place_id text,
  url_google_maps text,
  note numeric,
  nombre_avis integer DEFAULT 0,
  panier_moyen text,
  type_commerce text CHECK (type_commerce IN ('Boulangerie', 'Restaurant', 'Pizzeria', 'Poissonnerie', 'Pressing', 'Boucherie')),
  categorie text,
  contact_nom text,
  contact_poste text,
  linkedin text,
  facebook text,
  instagram text,
  enrichi_gemini boolean DEFAULT false,
  scoring_ia numeric DEFAULT 0,
  statut text DEFAULT 'À contacter' CHECK (statut IN ('À contacter', 'En cours', 'RDV planifié', 'Converti', 'Perdu')),
  commercial_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  priorite text DEFAULT 'Normale' CHECK (priorite IN ('Basse', 'Normale', 'Haute')),
  notes_internes text,
  ville_recherche text,
  date_scraping timestamptz
);

ALTER TABLE commerces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all commerces"
  ON commerces FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all commerces"
  ON commerces FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Commercials can manage assigned commerces"
  ON commerces FOR UPDATE
  TO authenticated
  USING (commercial_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can insert commerces"
  ON commerces FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete commerces"
  ON commerces FOR DELETE
  TO authenticated
  USING (commercial_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
