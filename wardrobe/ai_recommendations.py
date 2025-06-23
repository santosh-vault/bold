import openai
import json
import requests
from django.conf import settings
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class AIRecommendationEngine:
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
    
    def get_recommendations_for_item(self, item, user_wardrobe_items) -> Dict[str, Any]:
        """
        Generate AI-powered recommendations for a wardrobe item
        """
        try:
            # Get existing wardrobe matches
            existing_matches = self._find_existing_matches(item, user_wardrobe_items)
            
            # Get AI-powered shopping suggestions
            shopping_suggestions = self._get_ai_shopping_suggestions(item)
            
            # Generate style analysis
            style_analysis = self._analyze_item_style(item)
            
            return {
                'item_id': item.id,
                'item_name': item.name,
                'style_analysis': style_analysis,
                'existing_matches': existing_matches,
                'shopping_suggestions': shopping_suggestions,
                'confidence_score': self._calculate_confidence_score(existing_matches, shopping_suggestions)
            }
        
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return self._get_fallback_recommendations(item, user_wardrobe_items)
    
    def _find_existing_matches(self, item, user_items) -> List[Dict]:
        """Find matching items in user's existing wardrobe"""
        matches = []
        
        for wardrobe_item in user_items:
            compatibility_score = self._calculate_compatibility(item, wardrobe_item)
            if compatibility_score > 0.6:
                matches.append({
                    'id': wardrobe_item.id,
                    'name': wardrobe_item.name,
                    'category': wardrobe_item.category,
                    'color': wardrobe_item.color,
                    'brand': wardrobe_item.brand,
                    'image_url': wardrobe_item.image_url,
                    'compatibility_score': compatibility_score,
                    'reason': self._get_compatibility_reason(item, wardrobe_item)
                })
        
        return sorted(matches, key=lambda x: x['compatibility_score'], reverse=True)[:5]
    
    def _calculate_compatibility(self, item1, item2) -> float:
        """Calculate compatibility score between two items"""
        score = 0.0
        
        # Color compatibility
        if self._colors_match(item1.color, item2.color):
            score += 0.3
        
        # Category compatibility
        if self._categories_compatible(item1.category, item2.category):
            score += 0.4
        
        # Style compatibility (based on tags and brand)
        if self._styles_compatible(item1, item2):
            score += 0.3
        
        return min(score, 1.0)
    
    def _colors_match(self, color1: str, color2: str) -> bool:
        """Check if colors are compatible"""
        neutral_colors = ['white', 'black', 'gray', 'grey', 'beige', 'cream', 'navy']
        complementary_pairs = [
            ('blue', 'white'), ('black', 'white'), ('navy', 'white'),
            ('red', 'black'), ('blue', 'denim'), ('brown', 'cream')
        ]
        
        color1_lower = color1.lower()
        color2_lower = color2.lower()
        
        # Same color family
        if color1_lower == color2_lower:
            return True
        
        # Neutral colors go with everything
        if color1_lower in neutral_colors or color2_lower in neutral_colors:
            return True
        
        # Check complementary pairs
        for pair in complementary_pairs:
            if (color1_lower in pair[0] and color2_lower in pair[1]) or \
               (color1_lower in pair[1] and color2_lower in pair[0]):
                return True
        
        return False
    
    def _categories_compatible(self, cat1: str, cat2: str) -> bool:
        """Check if categories work well together"""
        compatible_combinations = {
            'Tops': ['Bottoms', 'Outerwear', 'Accessories'],
            'Bottoms': ['Tops', 'Shoes', 'Accessories'],
            'Outerwear': ['Tops', 'Bottoms', 'Accessories'],
            'Shoes': ['Bottoms', 'Accessories'],
            'Accessories': ['Tops', 'Bottoms', 'Outerwear', 'Shoes']
        }
        
        return cat2 in compatible_combinations.get(cat1, [])
    
    def _styles_compatible(self, item1, item2) -> bool:
        """Check if items have compatible styles"""
        # Simple implementation - can be enhanced with ML
        common_tags = set(item1.tags).intersection(set(item2.tags))
        return len(common_tags) > 0 or (item1.brand and item1.brand == item2.brand)
    
    def _get_compatibility_reason(self, item1, item2) -> str:
        """Generate a reason for why items are compatible"""
        reasons = []
        
        if self._colors_match(item1.color, item2.color):
            reasons.append(f"Colors {item1.color} and {item2.color} complement each other")
        
        if self._categories_compatible(item1.category, item2.category):
            reasons.append(f"{item1.category} pairs well with {item2.category}")
        
        common_tags = set(item1.tags).intersection(set(item2.tags))
        if common_tags:
            reasons.append(f"Shared style: {', '.join(common_tags)}")
        
        return '; '.join(reasons) if reasons else "Good overall style match"
    
    def _get_ai_shopping_suggestions(self, item) -> List[Dict]:
        """Get AI-powered shopping suggestions from external sources"""
        if not self.openai_api_key:
            return self._get_mock_shopping_suggestions(item)
        
        try:
            # Create a prompt for OpenAI
            prompt = f"""
            I have a {item.category.lower()} that is {item.color} in color, made by {item.brand or 'unknown brand'}.
            The item is called "{item.name}".
            
            Please suggest 5 complementary clothing items that would pair well with this item.
            For each suggestion, provide:
            1. Item name
            2. Category
            3. Suggested colors
            4. Price range
            5. Why it pairs well
            
            Format the response as JSON with this structure:
            {{
                "suggestions": [
                    {{
                        "name": "item name",
                        "category": "category",
                        "colors": ["color1", "color2"],
                        "price_range": "price range",
                        "reason": "why it pairs well",
                        "style": "style description"
                    }}
                ]
            }}
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional fashion stylist and personal shopper."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            suggestions_data = json.loads(ai_response)
            
            # Enhance suggestions with mock product data
            enhanced_suggestions = []
            for suggestion in suggestions_data.get('suggestions', []):
                enhanced_suggestions.append({
                    **suggestion,
                    'image_url': self._get_mock_product_image(suggestion['category']),
                    'store': self._get_suggested_store(suggestion.get('price_range', '')),
                    'link': '#',  # In real implementation, this would be actual product links
                    'price': self._extract_price_from_range(suggestion.get('price_range', ''))
                })
            
            return enhanced_suggestions[:5]
        
        except Exception as e:
            logger.error(f"Error getting AI suggestions: {str(e)}")
            return self._get_mock_shopping_suggestions(item)
    
    def _get_mock_shopping_suggestions(self, item) -> List[Dict]:
        """Fallback mock suggestions when AI is not available"""
        suggestions_map = {
            'Tops': [
                {
                    'name': 'Classic Denim Jeans',
                    'category': 'Bottoms',
                    'colors': ['blue', 'black', 'white'],
                    'price_range': '$50-80',
                    'price': 65.00,
                    'reason': 'Versatile bottoms that pair with most tops',
                    'style': 'Casual',
                    'image_url': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'store': 'Levi\'s',
                    'link': '#'
                },
                {
                    'name': 'Tailored Blazer',
                    'category': 'Outerwear',
                    'colors': ['navy', 'black', 'gray'],
                    'price_range': '$80-120',
                    'price': 95.00,
                    'reason': 'Elevates any casual top for professional settings',
                    'style': 'Professional',
                    'image_url': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'store': 'Zara',
                    'link': '#'
                }
            ],
            'Bottoms': [
                {
                    'name': 'Cotton Button-Down Shirt',
                    'category': 'Tops',
                    'colors': ['white', 'light blue', 'pink'],
                    'price_range': '$40-70',
                    'price': 55.00,
                    'reason': 'Classic top that works with most bottom styles',
                    'style': 'Classic',
                    'image_url': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'store': 'Uniqlo',
                    'link': '#'
                },
                {
                    'name': 'Leather Ankle Boots',
                    'category': 'Shoes',
                    'colors': ['brown', 'black', 'tan'],
                    'price_range': '$80-150',
                    'price': 110.00,
                    'reason': 'Versatile footwear that complements most bottom styles',
                    'style': 'Versatile',
                    'image_url': 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'store': 'Cole Haan',
                    'link': '#'
                }
            ]
        }
        
        return suggestions_map.get(item.category, [
            {
                'name': 'Versatile Accessory',
                'category': 'Accessories',
                'colors': ['neutral'],
                'price_range': '$20-50',
                'price': 35.00,
                'reason': 'Complements your style',
                'style': 'Universal',
                'image_url': 'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=400',
                'store': 'H&M',
                'link': '#'
            }
        ])
    
    def _analyze_item_style(self, item) -> Dict[str, Any]:
        """Analyze the style characteristics of an item"""
        style_keywords = {
            'casual': ['casual', 'relaxed', 'comfortable', 'everyday'],
            'formal': ['formal', 'dress', 'business', 'professional'],
            'trendy': ['trendy', 'fashion', 'modern', 'contemporary'],
            'classic': ['classic', 'timeless', 'traditional', 'elegant']
        }
        
        item_text = f"{item.name} {' '.join(item.tags)}".lower()
        detected_styles = []
        
        for style, keywords in style_keywords.items():
            if any(keyword in item_text for keyword in keywords):
                detected_styles.append(style)
        
        if not detected_styles:
            detected_styles = ['versatile']
        
        return {
            'primary_style': detected_styles[0] if detected_styles else 'versatile',
            'style_tags': detected_styles,
            'formality_level': self._determine_formality(item),
            'versatility_score': self._calculate_versatility(item),
            'seasonal_suitability': self._determine_seasonality(item)
        }
    
    def _determine_formality(self, item) -> str:
        """Determine the formality level of an item"""
        formal_indicators = ['suit', 'dress', 'blazer', 'formal', 'business']
        casual_indicators = ['jeans', 'casual', 't-shirt', 'sneakers', 'hoodie']
        
        item_text = f"{item.name} {' '.join(item.tags)}".lower()
        
        if any(indicator in item_text for indicator in formal_indicators):
            return 'formal'
        elif any(indicator in item_text for indicator in casual_indicators):
            return 'casual'
        else:
            return 'smart-casual'
    
    def _calculate_versatility(self, item) -> float:
        """Calculate how versatile an item is (0-1 scale)"""
        versatile_colors = ['black', 'white', 'navy', 'gray', 'beige']
        versatile_categories = ['Tops', 'Bottoms']
        
        score = 0.5  # Base score
        
        if item.color.lower() in versatile_colors:
            score += 0.3
        
        if item.category in versatile_categories:
            score += 0.2
        
        return min(score, 1.0)
    
    def _determine_seasonality(self, item) -> List[str]:
        """Determine which seasons an item is suitable for"""
        seasonal_keywords = {
            'spring': ['light', 'cotton', 'spring'],
            'summer': ['summer', 'shorts', 'tank', 'sandals', 'light'],
            'fall': ['fall', 'autumn', 'jacket', 'boots'],
            'winter': ['winter', 'coat', 'warm', 'wool', 'heavy']
        }
        
        item_text = f"{item.name} {' '.join(item.tags)}".lower()
        suitable_seasons = []
        
        for season, keywords in seasonal_keywords.items():
            if any(keyword in item_text for keyword in keywords):
                suitable_seasons.append(season)
        
        if not suitable_seasons:
            suitable_seasons = ['all-season']
        
        return suitable_seasons
    
    def _calculate_confidence_score(self, existing_matches, shopping_suggestions) -> float:
        """Calculate overall confidence in recommendations"""
        base_score = 0.7
        
        if existing_matches:
            base_score += 0.2
        
        if shopping_suggestions:
            base_score += 0.1
        
        return min(base_score, 1.0)
    
    def _get_mock_product_image(self, category: str) -> str:
        """Get mock product images for different categories"""
        image_map = {
            'Tops': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
            'Bottoms': 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
            'Outerwear': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
            'Shoes': 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400',
            'Accessories': 'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=400'
        }
        return image_map.get(category, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400')
    
    def _get_suggested_store(self, price_range: str) -> str:
        """Suggest appropriate stores based on price range"""
        if '$20' in price_range or '$30' in price_range:
            return 'H&M'
        elif '$50' in price_range or '$60' in price_range:
            return 'Zara'
        elif '$80' in price_range or '$100' in price_range:
            return 'Banana Republic'
        else:
            return 'Nordstrom'
    
    def _extract_price_from_range(self, price_range: str) -> float:
        """Extract a representative price from a price range"""
        import re
        numbers = re.findall(r'\d+', price_range)
        if len(numbers) >= 2:
            return (int(numbers[0]) + int(numbers[1])) / 2
        elif len(numbers) == 1:
            return float(numbers[0])
        return 50.0  # Default price
    
    def _get_fallback_recommendations(self, item, user_items) -> Dict[str, Any]:
        """Provide fallback recommendations when AI fails"""
        return {
            'item_id': item.id,
            'item_name': item.name,
            'style_analysis': {
                'primary_style': 'versatile',
                'style_tags': ['classic'],
                'formality_level': 'smart-casual',
                'versatility_score': 0.7,
                'seasonal_suitability': ['all-season']
            },
            'existing_matches': self._find_existing_matches(item, user_items),
            'shopping_suggestions': self._get_mock_shopping_suggestions(item),
            'confidence_score': 0.6
        }