/*
  # Create historique_actions table
  
  1. New Tables
    - `historique_actions`
      - Audit log for tracking all actions in the system
      - Stores action type, affected entity, and metadata
*/

CREATE TABLE IF NOT EXISTS historique_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  commerce_id uuid REFERENCES commerces(id) ON DELETE SET NULL,
  commercial_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type_action text CHECK (type_action IN ('recherche', 'creation', 'modification', 'suppression', 'rdv_cree', 'rdv_modifie', 'statut_change', 'assignation')),
  description text,
  metadata jsonb
);

ALTER TABLE historique_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all actions"
  ON historique_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert actions"
  ON historique_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);
