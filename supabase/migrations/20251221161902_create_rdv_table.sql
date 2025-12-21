/*
  # Create RDV (rendez-vous/appointments) table
  
  1. New Tables
    - `rdv`
      - Appointment records linked to commerces and commercials
      - Tracks appointment type, status, and reminders
*/

CREATE TABLE IF NOT EXISTS rdv (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  commerce_id uuid NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  commercial_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  date_rdv date NOT NULL,
  heure text NOT NULL,
  duree integer DEFAULT 30,
  type_rdv text CHECK (type_rdv IN ('Prospection', 'Suivi', 'Signature', 'Autre')),
  lieu text,
  statut text DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Confirmé', 'Annulé', 'Terminé')),
  notes text,
  rappel_envoye boolean DEFAULT false
);

ALTER TABLE rdv ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all rdv"
  ON rdv FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create rdv"
  ON rdv FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and assigned commercial can update rdv"
  ON rdv FOR UPDATE
  TO authenticated
  USING (
    commercial_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins and assigned commercial can delete rdv"
  ON rdv FOR DELETE
  TO authenticated
  USING (
    commercial_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
