import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Profile {
  id: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: string
  color: string
  brand?: string
  price?: number
  image_url: string
  tags?: string[]
  wear_count?: number
  last_worn?: string
  created_at?: string
  updated_at?: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  occasion: string
  season: string
  rating?: number
  created_at?: string
  updated_at?: string
}

export interface OutfitItem {
  id: string
  outfit_id: string
  wardrobe_item_id: string
  created_at?: string
}

// Extended types for joins
export interface OutfitWithItems extends Outfit {
  outfit_items: (OutfitItem & {
    wardrobe_items: WardrobeItem
  })[]
}