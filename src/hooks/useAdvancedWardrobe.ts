import { useState, useEffect, useMemo } from 'react';
import { useWardrobeItems } from './useWardrobeItems';
import { WardrobeSorter, WardrobeSearcher, FilterCriteria, SortOption } from '../lib/algorithms';
import { AIRecommendationEngine, AIRecommendation } from '../lib/aiRecommendations';
import { Database } from '../lib/database.types';

type WardrobeItem = Database['public']['Tables']['wardrobe_items']['Row'];

export const useAdvancedWardrobe = () => {
  const wardrobeHook = useWardrobeItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>({ key: 'created_at', label: 'Date Added', direction: 'desc' });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [aiRecommendations, setAiRecommendations] = useState<Map<string, AIRecommendation>>(new Map());
  const [loadingRecommendations, setLoadingRecommendations] = useState<Set<string>>(new Set());

  // Available sort options
  const sortOptions: SortOption[] = [
    { key: 'created_at', label: 'Date Added', direction: 'desc' },
    { key: 'name', label: 'Name A-Z', direction: 'asc' },
    { key: 'name', label: 'Name Z-A', direction: 'desc' },
    { key: 'wear_count', label: 'Most Worn', direction: 'desc' },
    { key: 'wear_count', label: 'Least Worn', direction: 'asc' },
    { key: 'price', label: 'Price High-Low', direction: 'desc' },
    { key: 'price', label: 'Price Low-High', direction: 'asc' },
    { key: 'category', label: 'Category', direction: 'asc' },
    { key: 'color', label: 'Color', direction: 'asc' },
    { key: 'last_worn', label: 'Recently Worn', direction: 'desc' }
  ];

  // Advanced filtering and sorting
  const processedItems = useMemo(() => {
    let items = [...wardrobeHook.items];

    // Apply search
    if (searchQuery.trim()) {
      items = WardrobeSearcher.fuzzySearch(
        items,
        searchQuery,
        (item) => `${item.name} ${item.brand || ''} ${item.color} ${item.tags.join(' ')}`,
        0.3
      );
    }

    // Apply filters
    items = WardrobeSearcher.advancedFilter(items, filterCriteria, (item) => item);

    // Apply sorting
    const compareFn = (a: WardrobeItem, b: WardrobeItem) => {
      let aValue: any = a[sortOption.key as keyof WardrobeItem];
      let bValue: any = b[sortOption.key as keyof WardrobeItem];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOption.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOption.direction === 'asc' ? 1 : -1;
      return 0;
    };

    // Use merge sort for stable sorting
    return WardrobeSorter.mergeSort(items, compareFn);
  }, [wardrobeHook.items, searchQuery, sortOption, filterCriteria]);

  // Generate AI recommendations for an item
  const generateRecommendations = async (itemId: string) => {
    const item = wardrobeHook.items.find(i => i.id === itemId);
    if (!item || loadingRecommendations.has(itemId)) return;

    setLoadingRecommendations(prev => new Set(prev).add(itemId));

    try {
      const recommendation = await AIRecommendationEngine.generateRecommendations(
        item,
        wardrobeHook.items.filter(i => i.id !== itemId)
      );

      setAiRecommendations(prev => new Map(prev).set(itemId, recommendation));
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoadingRecommendations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Get recommendations for an item
  const getRecommendations = (itemId: string): AIRecommendation | undefined => {
    return aiRecommendations.get(itemId);
  };

  // Analytics and insights
  const analytics = useMemo(() => {
    const items = wardrobeHook.items;
    
    return {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.price || 0), 0),
      averageWearCount: items.length > 0 ? items.reduce((sum, item) => sum + item.wear_count, 0) / items.length : 0,
      
      // Category distribution
      categoryDistribution: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Color analysis
      colorDistribution: items.reduce((acc, item) => {
        const color = item.color.toLowerCase();
        acc[color] = (acc[color] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Brand analysis
      brandDistribution: items.reduce((acc, item) => {
        if (item.brand) {
          acc[item.brand] = (acc[item.brand] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      
      // Wear patterns
      mostWornItems: [...items].sort((a, b) => b.wear_count - a.wear_count).slice(0, 5),
      leastWornItems: [...items].filter(item => item.wear_count < 3).slice(0, 5),
      
      // Price analysis
      priceRanges: {
        under50: items.filter(item => (item.price || 0) < 50).length,
        '50to100': items.filter(item => (item.price || 0) >= 50 && (item.price || 0) < 100).length,
        '100to200': items.filter(item => (item.price || 0) >= 100 && (item.price || 0) < 200).length,
        over200: items.filter(item => (item.price || 0) >= 200).length,
      },
      
      // Seasonal analysis
      seasonalItems: items.reduce((acc, item) => {
        const tags = item.tags.map(tag => tag.toLowerCase());
        if (tags.some(tag => ['summer', 'hot', 'light'].includes(tag))) acc.summer++;
        else if (tags.some(tag => ['winter', 'cold', 'warm', 'heavy'].includes(tag))) acc.winter++;
        else if (tags.some(tag => ['spring', 'fall', 'autumn'].includes(tag))) acc.transitional++;
        else acc.allSeason++;
        return acc;
      }, { summer: 0, winter: 0, transitional: 0, allSeason: 0 })
    };
  }, [wardrobeHook.items]);

  // Smart suggestions
  const smartSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    
    // Suggest items to wear more
    if (analytics.leastWornItems.length > 0) {
      suggestions.push(`You have ${analytics.leastWornItems.length} items worn less than 3 times. Try incorporating them into new outfits!`);
    }
    
    // Suggest category gaps
    const categories = Object.keys(analytics.categoryDistribution);
    const expectedCategories = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
    const missingCategories = expectedCategories.filter(cat => !categories.includes(cat));
    
    if (missingCategories.length > 0) {
      suggestions.push(`Consider adding ${missingCategories.join(', ')} to complete your wardrobe.`);
    }
    
    // Color diversity suggestion
    const colorCount = Object.keys(analytics.colorDistribution).length;
    if (colorCount < 5) {
      suggestions.push('Adding more color variety could increase your outfit possibilities.');
    }
    
    return suggestions;
  }, [analytics]);

  return {
    // Basic wardrobe operations
    ...wardrobeHook,
    
    // Processed data
    items: processedItems,
    
    // Search and filter
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    sortOptions,
    filterCriteria,
    setFilterCriteria,
    
    // AI recommendations
    generateRecommendations,
    getRecommendations,
    loadingRecommendations: loadingRecommendations.size > 0,
    
    // Analytics
    analytics,
    smartSuggestions,
    
    // Utility functions
    clearFilters: () => setFilterCriteria({}),
    resetSearch: () => setSearchQuery(''),
  };
};