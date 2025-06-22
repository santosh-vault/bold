import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useAuth } from './useAuth';

type Outfit = Database['public']['Tables']['outfits']['Row'];
type OutfitInsert = Database['public']['Tables']['outfits']['Insert'];
type OutfitUpdate = Database['public']['Tables']['outfits']['Update'];
type WardrobeItem = Database['public']['Tables']['wardrobe_items']['Row'];

export interface OutfitWithItems extends Outfit {
  items: WardrobeItem[];
}

export const useOutfits = () => {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutfits = useCallback(async () => {
    if (!user) {
      setOutfits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: outfitsData, error: outfitsError } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            wardrobe_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (outfitsError) throw outfitsError;

      const outfitsWithItems: OutfitWithItems[] = (outfitsData || []).map(outfit => ({
        ...outfit,
        items: outfit.outfit_items?.map((oi: any) => oi.wardrobe_items) || [],
      }));

      setOutfits(outfitsWithItems);
    } catch (err) {
      console.error('Error fetching outfits:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const addOutfit = useCallback(async (
    outfit: Omit<OutfitInsert, 'user_id'>,
    itemIds: string[]
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data: outfitData, error: outfitError } = await supabase
      .from('outfits')
      .insert({
        ...outfit,
        user_id: user.id,
      })
      .select()
      .single();

    if (outfitError) throw outfitError;

    // Add outfit items
    const outfitItems = itemIds.map(itemId => ({
      outfit_id: outfitData.id,
      wardrobe_item_id: itemId,
    }));

    const { error: itemsError } = await supabase
      .from('outfit_items')
      .insert(outfitItems);

    if (itemsError) throw itemsError;

    // Fetch the complete outfit with items
    await fetchOutfits();
    return outfitData;
  }, [user, fetchOutfits]);

  const updateOutfit = useCallback(async (id: string, updates: OutfitUpdate) => {
    const { data, error } = await supabase
      .from('outfits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setOutfits(prev => prev.map(outfit => 
      outfit.id === id ? { ...outfit, ...data } : outfit
    ));
    return data;
  }, []);

  const deleteOutfit = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setOutfits(prev => prev.filter(outfit => outfit.id !== id));
  }, []);

  return {
    outfits,
    loading,
    error,
    fetchOutfits,
    addOutfit,
    updateOutfit,
    deleteOutfit,
  };
};