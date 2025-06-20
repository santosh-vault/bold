// Advanced algorithms for wardrobe management
export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface FilterCriteria {
  category?: string;
  color?: string;
  brand?: string;
  priceRange?: [number, number];
  wearCountRange?: [number, number];
  tags?: string[];
  season?: string;
}

// Advanced sorting algorithms
export class WardrobeSorter {
  static quickSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(item => compareFn(item, pivot) < 0);
    const middle = arr.filter(item => compareFn(item, pivot) === 0);
    const right = arr.filter(item => compareFn(item, pivot) > 0);
    
    return [
      ...this.quickSort(left, compareFn),
      ...middle,
      ...this.quickSort(right, compareFn)
    ];
  }

  static mergeSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), compareFn);
    const right = this.mergeSort(arr.slice(mid), compareFn);
    
    return this.merge(left, right, compareFn);
  }

  private static merge<T>(left: T[], right: T[], compareFn: (a: T, b: T) => number): T[] {
    const result: T[] = [];
    let leftIndex = 0;
    let rightIndex = 0;
    
    while (leftIndex < left.length && rightIndex < right.length) {
      if (compareFn(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }
    
    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  }

  static heapSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    const sorted = [...arr];
    const n = sorted.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(sorted, n, i, compareFn);
    }
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      [sorted[0], sorted[i]] = [sorted[i], sorted[0]];
      this.heapify(sorted, i, 0, compareFn);
    }
    
    return sorted;
  }

  private static heapify<T>(arr: T[], n: number, i: number, compareFn: (a: T, b: T) => number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && compareFn(arr[left], arr[largest]) > 0) {
      largest = left;
    }
    
    if (right < n && compareFn(arr[right], arr[largest]) > 0) {
      largest = right;
    }
    
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      this.heapify(arr, n, largest, compareFn);
    }
  }
}

// Advanced search algorithms
export class WardrobeSearcher {
  // Fuzzy search using Levenshtein distance
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static fuzzySearch<T>(items: T[], query: string, getSearchText: (item: T) => string, threshold = 0.6): T[] {
    if (!query.trim()) return items;
    
    const results = items.map(item => {
      const text = getSearchText(item).toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact match gets highest score
      if (text.includes(queryLower)) {
        return { item, score: 1 };
      }
      
      // Calculate fuzzy match score
      const distance = this.levenshteinDistance(queryLower, text);
      const maxLength = Math.max(queryLower.length, text.length);
      const score = 1 - (distance / maxLength);
      
      return { item, score };
    });
    
    return results
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
  }

  // Binary search for sorted arrays
  static binarySearch<T>(arr: T[], target: T, compareFn: (a: T, b: T) => number): number {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compareFn(arr[mid], target);
      
      if (comparison === 0) return mid;
      if (comparison < 0) left = mid + 1;
      else right = mid - 1;
    }
    
    return -1;
  }

  // Advanced filtering with multiple criteria
  static advancedFilter<T>(items: T[], criteria: FilterCriteria, getItemData: (item: T) => any): T[] {
    return items.filter(item => {
      const data = getItemData(item);
      
      if (criteria.category && data.category !== criteria.category) return false;
      if (criteria.color && !data.color.toLowerCase().includes(criteria.color.toLowerCase())) return false;
      if (criteria.brand && data.brand && !data.brand.toLowerCase().includes(criteria.brand.toLowerCase())) return false;
      
      if (criteria.priceRange && data.price) {
        const [min, max] = criteria.priceRange;
        if (data.price < min || data.price > max) return false;
      }
      
      if (criteria.wearCountRange) {
        const [min, max] = criteria.wearCountRange;
        if (data.wear_count < min || data.wear_count > max) return false;
      }
      
      if (criteria.tags && criteria.tags.length > 0) {
        const hasMatchingTag = criteria.tags.some(tag => 
          data.tags.some((itemTag: string) => 
            itemTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }
}

// Color analysis algorithms
export class ColorAnalyzer {
  static extractDominantColors(imageUrl: string): Promise<string[]> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const colors = this.analyzeImageData(imageData);
        resolve(colors);
      };
      
      img.onerror = () => resolve(['#000000']);
      img.src = imageUrl;
    });
  }

  private static analyzeImageData(imageData: ImageData | undefined): string[] {
    if (!imageData) return ['#000000'];
    
    const colorMap = new Map<string, number>();
    const data = imageData.data;
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      if (alpha > 128) { // Skip transparent pixels
        const color = this.rgbToHex(r, g, b);
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
      }
    }
    
    // Get top 5 colors
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  static getComplementaryColors(color: string): string[] {
    const rgb = this.hexToRgb(color);
    if (!rgb) return [color];
    
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const complementaryHue = (hsl.h + 180) % 360;
    
    return [
      this.hslToHex(complementaryHue, hsl.s, hsl.l),
      this.hslToHex((complementaryHue + 30) % 360, hsl.s, hsl.l),
      this.hslToHex((complementaryHue - 30 + 360) % 360, hsl.s, hsl.l),
    ];
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private static hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

// Style matching algorithms
export class StyleMatcher {
  private static styleRules = {
    'Casual': {
      categories: ['Tops', 'Bottoms', 'Shoes'],
      colors: ['blue', 'white', 'gray', 'black', 'denim'],
      occasions: ['weekend', 'casual', 'everyday']
    },
    'Formal': {
      categories: ['Outerwear', 'Tops', 'Bottoms', 'Shoes'],
      colors: ['black', 'navy', 'white', 'gray', 'brown'],
      occasions: ['work', 'business', 'formal', 'meeting']
    },
    'Party': {
      categories: ['Tops', 'Bottoms', 'Accessories', 'Shoes'],
      colors: ['red', 'black', 'gold', 'silver', 'bright'],
      occasions: ['party', 'night out', 'celebration']
    }
  };

  static calculateCompatibilityScore(item1: any, item2: any): number {
    let score = 0;
    
    // Color compatibility
    const colorScore = this.calculateColorCompatibility(item1.color, item2.color);
    score += colorScore * 0.4;
    
    // Style compatibility
    const styleScore = this.calculateStyleCompatibility(item1, item2);
    score += styleScore * 0.3;
    
    // Category compatibility
    const categoryScore = this.calculateCategoryCompatibility(item1.category, item2.category);
    score += categoryScore * 0.3;
    
    return Math.min(score, 1);
  }

  private static calculateColorCompatibility(color1: string, color2: string): number {
    const neutralColors = ['white', 'black', 'gray', 'beige', 'cream'];
    const complementaryPairs = [
      ['blue', 'orange'], ['red', 'green'], ['purple', 'yellow'],
      ['navy', 'white'], ['black', 'white']
    ];
    
    const c1 = color1.toLowerCase();
    const c2 = color2.toLowerCase();
    
    // Same color
    if (c1 === c2) return 0.8;
    
    // Neutral combinations
    if (neutralColors.includes(c1) || neutralColors.includes(c2)) return 0.9;
    
    // Complementary colors
    const isComplementary = complementaryPairs.some(pair => 
      (pair.includes(c1) && pair.includes(c2))
    );
    if (isComplementary) return 0.95;
    
    return 0.6; // Default compatibility
  }

  private static calculateStyleCompatibility(item1: any, item2: any): number {
    // Check if items share common tags
    const commonTags = item1.tags.filter((tag: string) => 
      item2.tags.some((tag2: string) => tag2.toLowerCase() === tag.toLowerCase())
    );
    
    return Math.min(commonTags.length * 0.3, 1);
  }

  private static calculateCategoryCompatibility(category1: string, category2: string): number {
    const compatibleCategories = {
      'Tops': ['Bottoms', 'Outerwear', 'Accessories'],
      'Bottoms': ['Tops', 'Shoes', 'Accessories'],
      'Outerwear': ['Tops', 'Bottoms', 'Accessories'],
      'Shoes': ['Bottoms', 'Accessories'],
      'Accessories': ['Tops', 'Bottoms', 'Outerwear', 'Shoes']
    };
    
    if (category1 === category2) return 0.3; // Same category, lower score
    
    const compatible = compatibleCategories[category1 as keyof typeof compatibleCategories];
    return compatible?.includes(category2) ? 1 : 0.5;
  }
}