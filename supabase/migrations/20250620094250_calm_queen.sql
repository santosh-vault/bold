/*
  # Initial Schema for Wardrobe Management System

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `wardrobe_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `category` (text)
      - `color` (text)
      - `brand` (text, optional)
      - `price` (decimal, optional)
      - `image_url` (text)
      - `tags` (text array)
      - `wear_count` (integer, default 0)
      - `last_worn` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `outfits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `occasion` (text)
      - `season` (text)
      - `rating` (integer, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `outfit_items`
      - `id` (uuid, primary key)
      - `outfit_id` (uuid, references outfits)
      - `wardrobe_item_id` (uuid, references wardrobe_items)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wardrobe_items table
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  color text NOT NULL,
  brand text,
  price decimal(10,2),
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  wear_count integer DEFAULT 0,
  last_worn date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  occasion text NOT NULL,
  season text NOT NULL DEFAULT 'All seasons',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create outfit_items junction table
CREATE TABLE IF NOT EXISTS outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id uuid REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  wardrobe_item_id uuid REFERENCES wardrobe_items(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(outfit_id, wardrobe_item_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));


CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- Create policies for wardrobe_items
CREATE POLICY "Users can view own wardrobe items"
  ON wardrobe_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON wardrobe_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items"
  ON wardrobe_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON wardrobe_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for outfits
CREATE POLICY "Users can view own outfits"
  ON outfits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
  ON outfits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits"
  ON outfits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
  ON outfits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for outfit_items
CREATE POLICY "Users can view own outfit items"
  ON outfit_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own outfit items"
  ON outfit_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own outfit items"
  ON outfit_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_wardrobe_item_id ON outfit_items(wardrobe_item_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wardrobe_items_updated_at
  BEFORE UPDATE ON wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();