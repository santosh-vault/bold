/*
  # Fix RLS Performance Issues

  1. Performance Optimization
    - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
    - This prevents unnecessary re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Updated Policies
    - All profiles table policies optimized
    - All wardrobe_items table policies optimized  
    - All outfits table policies optimized
    - All outfit_items table policies optimized
*/

-- ==========================
-- DROP EXISTING POLICIES
-- ==========================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- WARDROBE ITEMS
DROP POLICY IF EXISTS "Users can view own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can insert own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can update own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can delete own wardrobe items" ON wardrobe_items;

-- OUTFITS
DROP POLICY IF EXISTS "Users can view own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can insert own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can update own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can delete own outfits" ON outfits;

-- OUTFIT ITEMS
DROP POLICY IF EXISTS "Users can view own outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can insert own outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can delete own outfit items" ON outfit_items;

-- ==========================
-- CREATE OPTIMIZED POLICIES
-- ==========================

-- PROFILES - Optimized with subquery
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Users can create profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can delete own profile" ON profiles
FOR DELETE TO authenticated
USING ((select auth.uid()) = id);

-- WARDROBE ITEMS - Optimized with subquery
CREATE POLICY "Users can view own wardrobe items" ON wardrobe_items
FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own wardrobe items" ON wardrobe_items
FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own wardrobe items" ON wardrobe_items
FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own wardrobe items" ON wardrobe_items
FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- OUTFITS - Optimized with subquery
CREATE POLICY "Users can view own outfits" ON outfits
FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own outfits" ON outfits
FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own outfits" ON outfits
FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own outfits" ON outfits
FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- OUTFIT ITEMS - Optimized with subquery and improved EXISTS clause
CREATE POLICY "Users can view own outfit items" ON outfit_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM outfits
    WHERE outfits.id = outfit_items.outfit_id
    AND outfits.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can insert own outfit items" ON outfit_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM outfits
    WHERE outfits.id = outfit_items.outfit_id
    AND outfits.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can delete own outfit items" ON outfit_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM outfits
    WHERE outfits.id = outfit_items.outfit_id
    AND outfits.user_id = (select auth.uid())
  )
);

-- ==========================
-- ADDITIONAL PERFORMANCE OPTIMIZATIONS
-- ==========================

-- Ensure we have optimal indexes for the RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id_optimized ON wardrobe_items(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outfits_user_id_optimized ON outfits(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outfits_id_user_id_composite ON outfits(id, user_id);

-- Analyze tables to update statistics for better query planning
ANALYZE profiles;
ANALYZE wardrobe_items;
ANALYZE outfits;
ANALYZE outfit_items;