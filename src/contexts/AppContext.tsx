import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthUser } from '../hooks/useAuth';
import { useWardrobeItems } from '../hooks/useWardrobeItems';
import { useOutfits, OutfitWithItems } from '../hooks/useOutfits';
import { Database } from '../lib/database.types';

type WardrobeItem = Database['public']['Tables']['wardrobe_items']['Row'];

interface WardrobeStats {
  totalItems: number;
  totalValue: number;
  mostWornItem: WardrobeItem | null;
  leastWornItems: WardrobeItem[];
  categoryBreakdown: Record<string, number>;
  monthlySpending: number;
}

interface AIRecommendation {
  id: string;
  name: string;
  description: string;
  items: {
    name: string;
    price: number;
    store: string;
    imageUrl: string;
    link: string;
  }[];
  totalPrice: number;
  occasion: string;
  style: string;
}

interface AppContextType {
  // Auth
  user: AuthUser | null;
  authLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<any>;

  // Wardrobe Items
  wardrobeItems: WardrobeItem[];
  wardrobeLoading: boolean;
  wardrobeError: string | null;
  addWardrobeItem: (item: any) => Promise<WardrobeItem>;
  updateWardrobeItem: (id: string, updates: any) => Promise<WardrobeItem>;
  deleteWardrobeItem: (id: string) => Promise<void>;
  incrementWearCount: (id: string) => Promise<void>;

  // Outfits
  outfits: OutfitWithItems[];
  outfitsLoading: boolean;
  outfitsError: string | null;
  addOutfit: (outfit: any, itemIds: string[]) => Promise<any>;
  updateOutfit: (id: string, updates: any) => Promise<any>;
  deleteOutfit: (id: string) => Promise<void>;

  // Computed data
  wardrobeStats: WardrobeStats;
  aiRecommendations: AIRecommendation[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const wardrobeHook = useWardrobeItems();
  const outfitsHook = useOutfits();

  // Mock AI recommendations for now
  const aiRecommendations: AIRecommendation[] = [
    {
      id: '1',
      name: 'Professional Spring Look',
      description: 'Perfect for business meetings and networking events',
      items: [
        {
          name: 'Tailored Blazer',
          price: 120.00,
          store: 'H&M',
          imageUrl: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300',
          link: '#'
        },
        {
          name: 'Silk Blouse',
          price: 85.00,
          store: 'Zara',
          imageUrl: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
          link: '#'
        }
      ],
      totalPrice: 205.00,
      occasion: 'Professional',
      style: 'Modern Classic'
    }
  ];

  // Calculate wardrobe stats
  const wardrobeStats: WardrobeStats = {
    totalItems: wardrobeHook.items.length,
    totalValue: wardrobeHook.items.reduce((sum, item) => sum + (item.price || 0), 0),
    mostWornItem: wardrobeHook.items.reduce((max, item) => 
      item.wear_count > (max?.wear_count || 0) ? item : max, 
      wardrobeHook.items[0] || null
    ),
    leastWornItems: wardrobeHook.items.filter(item => item.wear_count < 5),
    categoryBreakdown: wardrobeHook.items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    monthlySpending: 250.00 // This would be calculated from recent purchases
  };

  const value: AppContextType = {
    // Auth
    user: auth.user,
    authLoading: auth.loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    updateProfile: auth.updateProfile,

    // Wardrobe Items
    wardrobeItems: wardrobeHook.items,
    wardrobeLoading: wardrobeHook.loading,
    wardrobeError: wardrobeHook.error,
    addWardrobeItem: wardrobeHook.addItem,
    updateWardrobeItem: wardrobeHook.updateItem,
    deleteWardrobeItem: wardrobeHook.deleteItem,
    incrementWearCount: wardrobeHook.incrementWearCount,

    // Outfits
    outfits: outfitsHook.outfits,
    outfitsLoading: outfitsHook.loading,
    outfitsError: outfitsHook.error,
    addOutfit: outfitsHook.addOutfit,
    updateOutfit: outfitsHook.updateOutfit,
    deleteOutfit: outfitsHook.deleteOutfit,

    // Computed data
    wardrobeStats,
    aiRecommendations,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};