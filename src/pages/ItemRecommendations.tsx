import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShoppingBag, Heart, ExternalLink, Loader, Star, TrendingUp } from 'lucide-react';
import { useAdvancedWardrobe } from '../hooks/useAdvancedWardrobe';
import { AIRecommendation, AIRecommendationEngine } from '../lib/aiRecommendations';
import Card from '../components/Card';
import Button from '../components/Button';

const ItemRecommendations: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { items, generateRecommendations, getRecommendations, loadingRecommendations } = useAdvancedWardrobe();
  const [activeTab, setActiveTab] = useState<'existing' | 'shopping'>('existing');

  const item = items.find(i => i.id === itemId);
  const recommendations = itemId ? getRecommendations(itemId) : undefined;

  useEffect(() => {
    if (itemId && item && !recommendations && !loadingRecommendations) {
      generateRecommendations(itemId);
    }
  }, [itemId, item, recommendations, loadingRecommendations, generateRecommendations]);

  if (!item) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Item not found</p>
          <Button onClick={() => navigate('/wardrobe')} className="mt-4">
            Back to Wardrobe
          </Button>
        </div>
      </div>
    );
  }

  const renderExistingMatches = (recommendation: AIRecommendation) => (
    <div className="space-y-6">
      {recommendation.recommendedItems.map((recItem, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {recItem.category}
              <div className="ml-2 flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {(recItem.compatibilityScore * 100).toFixed(0)}% match
                </span>
              </div>
            </h3>
            <div className="flex items-center space-x-2">
              {recItem.suggestedColors.slice(0, 3).map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{recItem.reasoning}</p>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Styles:</h4>
            <div className="flex flex-wrap gap-2">
              {recItem.suggestedStyles.map((style, styleIndex) => (
                <span
                  key={styleIndex}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          {recItem.existingMatches && recItem.existingMatches.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Your Matching Items ({recItem.existingMatches.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recItem.existingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/wardrobe/item/${match.id}/recommendations`)}
                  >
                    <img
                      src={match.image_url}
                      alt={match.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{match.name}</p>
                      <p className="text-xs text-gray-500">{match.color}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">
                          {(match.compatibilityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No matching items in your wardrobe</p>
              <p className="text-xs text-gray-500">Check the shopping suggestions tab</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderShoppingSuggestions = (recommendation: AIRecommendation) => {
    const shoppingSuggestions = AIRecommendationEngine.generateShoppingRecommendations(recommendation);

    if (shoppingSuggestions.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wardrobe is complete!</h3>
          <p className="text-gray-600">You have great matches for all recommended categories.</p>
        </div>
      );
    }

    // Group suggestions by category
    const suggestionsByCategory = shoppingSuggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div className="space-y-8">
        {Object.entries(suggestionsByCategory).map(([category, suggestions]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">Recommended</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={suggestion.imageUrl}
                      alt={suggestion.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{suggestion.name}</h4>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">${suggestion.price}</span>
                      <span className="text-sm text-gray-500">{suggestion.store}</span>
                    </div>

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {suggestion.colors.slice(0, 3).map((color: string, colorIndex: number) => (
                          <span
                            key={colorIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.styles.slice(0, 2).map((style: string, styleIndex: number) => (
                          <span
                            key={styleIndex}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => window.open(suggestion.link, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => window.open(suggestion.link, '_blank')}
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Shop
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                        <span>{(suggestion.priority * 100).toFixed(0)}% match with your style</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/wardrobe')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            AI Style Recommendations
          </h1>
          <p className="text-gray-600">Discover perfect matches for your {item.name}</p>
        </div>
      </div>

      {/* Item Display */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
            }}
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
            <p className="text-gray-600">{item.category} • {item.color}</p>
            {item.brand && <p className="text-sm text-gray-500">{item.brand}</p>}
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">Worn {item.wear_count} times</span>
              {item.price && <span className="text-sm text-green-600 font-medium">${item.price}</span>}
            </div>
          </div>
          {recommendations && (
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  {(recommendations.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
              <p className="text-xs text-gray-500">{recommendations.style} Style</p>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loadingRecommendations && (
        <Card className="p-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Style</h3>
            <p className="text-gray-600">Our AI is finding the perfect matches for your item...</p>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && (
        <>
          {/* AI Insight */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-emerald-50 border-purple-200">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Style Analysis</h3>
                <p className="text-gray-700 mb-3">{recommendations.reasoning}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {recommendations.style}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {recommendations.occasion}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('existing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'existing'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Your Wardrobe Matches
              </button>
              <button
                onClick={() => setActiveTab('shopping')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shopping'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shopping Suggestions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'existing' && renderExistingMatches(recommendations)}
            {activeTab === 'shopping' && renderShoppingSuggestions(recommendations)}
          </div>
        </>
      )}
    </div>
  );
};

export default ItemRecommendations;