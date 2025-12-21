/*
  # Create profiles table
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - User ID from auth.users
      - `email` (text, unique) - User email
      - `nom` (text) - Last name
      - `prenom` (text) - First name
      - `role` (text) - Role (admin or commercial)
      - `telephone` (text) - Phone number
      - `avatar_url` (text) - Avatar URL
      - `actif` (boolean) - Whether user is active
      - `created_at` (timestamp) - Creation date
      - `updated_at` (timestamp) - Last update date
      
  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  nom text,
  prenom text,
  role text DEFAULT 'commercial' CHECK (role IN ('admin', 'commercial')),
  telephone text,
  avatar_url text,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
