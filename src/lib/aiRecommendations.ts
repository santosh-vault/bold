// AI-powered clothing recommendations with optimized performance
import { ColorAnalyzer, StyleMatcher } from './algorithms';

export interface AIRecommendation {
  id: string;
  baseItem: any;
  recommendedItems: RecommendedItem[];
  confidence: number;
  reasoning: string;
  style: string;
  occasion: string;
}

export interface RecommendedItem {
  category: string;
  suggestedColors: string[];
  suggestedStyles: string[];
  compatibilityScore: number;
  reasoning: string;
  existingMatches?: any[];
}

export class AIRecommendationEngine {
  private static styleDatabase = {
    'Minimalist': {
      colors: ['white', 'black', 'gray', 'beige', 'navy'],
      patterns: ['solid', 'subtle'],
      silhouettes: ['clean', 'structured', 'simple']
    },
    'Bohemian': {
      colors: ['earth tones', 'warm', 'rust', 'olive', 'cream'],
      patterns: ['floral', 'paisley', 'ethnic'],
      silhouettes: ['flowy', 'loose', 'layered']
    },
    'Classic': {
      colors: ['navy', 'white', 'black', 'brown', 'gray'],
      patterns: ['stripes', 'solid', 'subtle check'],
      silhouettes: ['tailored', 'structured', 'timeless']
    },
    'Edgy': {
      colors: ['black', 'dark', 'metallic', 'bold'],
      patterns: ['geometric', 'abstract', 'bold'],
      silhouettes: ['fitted', 'asymmetric', 'structured']
    }
  };

  // Cache for color analysis to improve performance
  private static colorCache = new Map<string, string[]>();

  static async generateRecommendations(
    baseItem: any, 
    wardrobeItems: any[], 
    userPreferences?: any
  ): Promise<AIRecommendation> {
    // Use cached colors or analyze if not cached
    let dominantColors = this.colorCache.get(baseItem.image_url);
    if (!dominantColors) {
      dominantColors = await this.extractDominantColorsOptimized(baseItem.image_url);
      this.colorCache.set(baseItem.image_url, dominantColors);
    }

    const complementaryColors = ColorAnalyzer.getComplementaryColors(dominantColors[0]);
    
    // Determine style based on item characteristics
    const detectedStyle = this.detectItemStyle(baseItem);
    
    // Generate recommendations for each category
    const recommendations = await this.generateCategoryRecommendations(
      baseItem,
      wardrobeItems,
      dominantColors,
      complementaryColors,
      detectedStyle
    );

    return {
      id: `rec_${Date.now()}`,
      baseItem,
      recommendedItems: recommendations,
      confidence: this.calculateOverallConfidence(recommendations),
      reasoning: this.generateReasoningText(baseItem, recommendations, detectedStyle),
      style: detectedStyle,
      occasion: this.suggestOccasion(baseItem, detectedStyle)
    };
  }

  private static async extractDominantColorsOptimized(imageUrl: string): Promise<string[]> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Reduce canvas size for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const colors = this.analyzeImageDataOptimized(imageData);
        resolve(colors);
      };
      
      img.onerror = () => resolve(['#000000']);
      img.src = imageUrl;
    });
  }

  private static analyzeImageDataOptimized(imageData: ImageData | undefined): string[] {
    if (!imageData) return ['#000000'];
    
    const colorMap = new Map<string, number>();
    const data = imageData.data;
    
    // Sample every 20th pixel for better performance
    for (let i = 0; i < data.length; i += 80) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      if (alpha > 128) { // Skip transparent pixels
        // Quantize colors to reduce variations
        const quantizedR = Math.round(r / 32) * 32;
        const quantizedG = Math.round(g / 32) * 32;
        const quantizedB = Math.round(b / 32) * 32;
        
        const color = this.rgbToHex(quantizedR, quantizedG, quantizedB);
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
      }
    }
    
    // Get top 3 colors for faster processing
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([color]) => color);
  }

  private static detectItemStyle(item: any): string {
    const itemText = `${item.name} ${item.tags.join(' ')} ${item.color}`.toLowerCase();
    
    let maxScore = 0;
    let detectedStyle = 'Classic';
    
    Object.entries(this.styleDatabase).forEach(([style, characteristics]) => {
      let score = 0;
      
      // Check color matches
      characteristics.colors.forEach(color => {
        if (itemText.includes(color.toLowerCase())) score += 2;
      });
      
      // Check pattern matches
      characteristics.patterns.forEach(pattern => {
        if (itemText.includes(pattern.toLowerCase())) score += 1.5;
      });
      
      // Check silhouette matches
      characteristics.silhouettes.forEach(silhouette => {
        if (itemText.includes(silhouette.toLowerCase())) score += 1;
      });
      
      if (score > maxScore) {
        maxScore = score;
        detectedStyle = style;
      }
    });
    
    return detectedStyle;
  }

  private static async generateCategoryRecommendations(
    baseItem: any,
    wardrobeItems: any[],
    dominantColors: string[],
    complementaryColors: string[],
    style: string
  ): Promise<RecommendedItem[]> {
    const recommendations: RecommendedItem[] = [];
    const targetCategories = this.getTargetCategories(baseItem.category);
    
    for (const category of targetCategories) {
      const categoryItems = wardrobeItems.filter(item => item.category === category);
      const existingMatches = this.findExistingMatches(baseItem, categoryItems);
      
      const recommendation: RecommendedItem = {
        category,
        suggestedColors: this.getSuggestedColors(dominantColors, complementaryColors, category),
        suggestedStyles: this.getSuggestedStyles(style, category),
        compatibilityScore: this.calculateCategoryCompatibility(baseItem, category),
        reasoning: this.generateCategoryReasoning(baseItem, category, style),
        existingMatches: existingMatches.slice(0, 3) // Top 3 matches
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }

  private static getTargetCategories(baseCategory: string): string[] {
    const categoryMap = {
      'Tops': ['Bottoms', 'Outerwear', 'Accessories', 'Shoes'],
      'Bottoms': ['Tops', 'Shoes', 'Accessories'],
      'Outerwear': ['Tops', 'Bottoms', 'Accessories'],
      'Shoes': ['Bottoms', 'Accessories'],
      'Accessories': ['Tops', 'Bottoms', 'Outerwear']
    };
    
    return categoryMap[baseCategory as keyof typeof categoryMap] || [];
  }

  private static findExistingMatches(baseItem: any, categoryItems: any[]): any[] {
    return categoryItems
      .map(item => ({
        ...item,
        compatibilityScore: StyleMatcher.calculateCompatibilityScore(baseItem, item)
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .filter(item => item.compatibilityScore > 0.6);
  }

  private static getSuggestedColors(
    dominantColors: string[], 
    complementaryColors: string[], 
    category: string
  ): string[] {
    const suggestions = [...complementaryColors];
    
    // Add neutral colors that work with everything
    const neutrals = ['white', 'black', 'gray', 'beige'];
    suggestions.push(...neutrals);
    
    // Category-specific color suggestions
    if (category === 'Accessories') {
      suggestions.push('gold', 'silver', 'brown');
    } else if (category === 'Shoes') {
      suggestions.push('brown', 'tan', 'burgundy');
    }
    
    return [...new Set(suggestions)].slice(0, 5);
  }

  private static getSuggestedStyles(baseStyle: string, category: string): string[] {
    const styleCharacteristics = this.styleDatabase[baseStyle as keyof typeof this.styleDatabase];
    if (!styleCharacteristics) return ['classic', 'versatile'];
    
    const suggestions = [...styleCharacteristics.silhouettes];
    
    // Add category-specific style suggestions
    if (category === 'Accessories') {
      suggestions.push('statement', 'delicate', 'vintage');
    } else if (category === 'Shoes') {
      suggestions.push('comfortable', 'elegant', 'casual');
    }
    
    return suggestions.slice(0, 4);
  }

  private static calculateCategoryCompatibility(baseItem: any, category: string): number {
    // Base compatibility scores for different category combinations
    const compatibilityMatrix = {
      'Tops': { 'Bottoms': 0.95, 'Outerwear': 0.8, 'Accessories': 0.85, 'Shoes': 0.7 },
      'Bottoms': { 'Tops': 0.95, 'Shoes': 0.9, 'Accessories': 0.8 },
      'Outerwear': { 'Tops': 0.8, 'Bottoms': 0.75, 'Accessories': 0.7 },
      'Shoes': { 'Bottoms': 0.9, 'Accessories': 0.6 },
      'Accessories': { 'Tops': 0.85, 'Bottoms': 0.8, 'Outerwear': 0.7, 'Shoes': 0.6 }
    };
    
    const baseCategory = baseItem.category;
    return compatibilityMatrix[baseCategory as keyof typeof compatibilityMatrix]?.[category as keyof any] || 0.6;
  }

  private static generateCategoryReasoning(baseItem: any, category: string, style: string): string {
    const reasoningTemplates = {
      'Bottoms': `Based on your ${baseItem.name}, ${category.toLowerCase()} in complementary colors would create a balanced look. Consider ${style.toLowerCase()} silhouettes that match the item's aesthetic.`,
      'Tops': `To complement your ${baseItem.name}, look for ${category.toLowerCase()} that share similar style elements while providing visual interest through color or texture contrast.`,
      'Accessories': `${category} can elevate your ${baseItem.name} by adding subtle details that enhance the overall ${style.toLowerCase()} aesthetic without overwhelming the look.`,
      'Shoes': `The right ${category.toLowerCase()} will ground your outfit featuring the ${baseItem.name}, maintaining the ${style.toLowerCase()} vibe while ensuring comfort and style.`,
      'Outerwear': `Layer your ${baseItem.name} with ${category.toLowerCase()} that complements its style while adding functionality and visual depth to your outfit.`
    };
    
    return reasoningTemplates[category as keyof typeof reasoningTemplates] || 
           `This ${category.toLowerCase()} category pairs well with your ${baseItem.name} to create a cohesive ${style.toLowerCase()} look.`;
  }

  private static calculateOverallConfidence(recommendations: RecommendedItem[]): number {
    const avgScore = recommendations.reduce((sum, rec) => sum + rec.compatibilityScore, 0) / recommendations.length;
    const hasExistingMatches = recommendations.some(rec => rec.existingMatches && rec.existingMatches.length > 0);
    
    let confidence = avgScore * 0.7;
    if (hasExistingMatches) confidence += 0.2;
    if (recommendations.length >= 3) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private static generateReasoningText(baseItem: any, recommendations: RecommendedItem[], style: string): string {
    const matchCount = recommendations.reduce((sum, rec) => sum + (rec.existingMatches?.length || 0), 0);
    
    if (matchCount > 0) {
      return `Based on your ${baseItem.name} and ${style.toLowerCase()} style preferences, I found ${matchCount} existing items in your wardrobe that would pair beautifully. The color palette and style elements create a cohesive look perfect for various occasions.`;
    } else {
      return `Your ${baseItem.name} has great potential for ${style.toLowerCase()} styling. I've identified key categories and color combinations that would complement this piece perfectly. Consider adding items in the suggested colors to maximize your outfit possibilities.`;
    }
  }

  private static suggestOccasion(baseItem: any, style: string): string {
    const occasionMap = {
      'Minimalist': 'Professional, Casual, Everyday',
      'Bohemian': 'Casual, Creative, Weekend',
      'Classic': 'Professional, Formal, Versatile',
      'Edgy': 'Night Out, Creative, Statement'
    };
    
    const baseOccasion = occasionMap[style as keyof typeof occasionMap] || 'Versatile';
    
    // Refine based on item category
    if (baseItem.category === 'Outerwear') return 'Layering, Transitional Weather';
    if (baseItem.category === 'Accessories') return 'Accent Piece, Style Enhancement';
    
    return baseOccasion;
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Generate shopping recommendations for missing pieces
  static generateShoppingRecommendations(recommendations: AIRecommendation): any[] {
    const shoppingList: any[] = [];
    
    recommendations.recommendedItems.forEach(rec => {
      if (!rec.existingMatches || rec.existingMatches.length === 0) {
        shoppingList.push({
          category: rec.category,
          suggestedColors: rec.suggestedColors,
          suggestedStyles: rec.suggestedStyles,
          priority: rec.compatibilityScore,
          reasoning: `Add a ${rec.category.toLowerCase()} to complete outfits with your ${recommendations.baseItem.name}`,
          estimatedPrice: this.estimatePrice(rec.category),
          stores: this.suggestStores(rec.category, recommendations.style)
        });
      }
    });
    
    return shoppingList.sort((a, b) => b.priority - a.priority);
  }

  private static estimatePrice(category: string): { min: number; max: number } {
    const priceRanges = {
      'Tops': { min: 25, max: 80 },
      'Bottoms': { min: 40, max: 120 },
      'Outerwear': { min: 60, max: 200 },
      'Shoes': { min: 50, max: 150 },
      'Accessories': { min: 15, max: 60 }
    };
    
    return priceRanges[category as keyof typeof priceRanges] || { min: 20, max: 100 };
  }

  private static suggestStores(category: string, style: string): string[] {
    const storeMap = {
      'Minimalist': ['COS', 'Everlane', 'Uniqlo', 'Zara'],
      'Bohemian': ['Free People', 'Anthropologie', 'Urban Outfitters'],
      'Classic': ['J.Crew', 'Banana Republic', 'Brooks Brothers'],
      'Edgy': ['AllSaints', 'Zara', 'H&M', 'ASOS']
    };
    
    return storeMap[style as keyof typeof storeMap] || ['Zara', 'H&M', 'Uniqlo'];
  }
}