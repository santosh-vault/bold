import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useAuth } from './useAuth';

type WardrobeItem = Database['public']['Tables']['wardrobe_items']['Row'];
type WardrobeItemInsert = Database['public']['Tables']['wardrobe_items']['Insert'];
type WardrobeItemUpdate = Database['public']['Tables']['wardrobe_items']['Update'];

export const useWardrobeItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (err) {
      console.error('Error fetching wardrobe items:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (item: Omit<WardrobeItemInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert({
        ...item,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    setItems(prev => [data, ...prev]);
    return data;
  }, [user]);

  const updateItem = useCallback(async (id: string, updates: WardrobeItemUpdate) => {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setItems(prev => prev.map(item => item.id === id ? data : item));
    return data;
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const incrementWearCount = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    await updateItem(id, {
      wear_count: item.wear_count + 1,
      last_worn: new Date().toISOString().split('T')[0],
    });
  }, [items, updateItem]);

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    incrementWearCount,
  };
};