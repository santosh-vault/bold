export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wardrobe_items: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          color: string
          brand: string | null
          price: number | null
          image_url: string
          tags: string[]
          wear_count: number
          last_worn: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          color: string
          brand?: string | null
          price?: number | null
          image_url: string
          tags?: string[]
          wear_count?: number
          last_worn?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          color?: string
          brand?: string | null
          price?: number | null
          image_url?: string
          tags?: string[]
          wear_count?: number
          last_worn?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string
          occasion: string
          season: string
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          occasion: string
          season?: string
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          occasion?: string
          season?: string
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          wardrobe_item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          wardrobe_item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          wardrobe_item_id?: string
          created_at?: string
        }
      }
    }
  }
}