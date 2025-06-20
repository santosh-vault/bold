import React, { useState } from 'react';
import { Sparkles, ExternalLink, Heart, ShoppingBag, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Recommendations: React.FC = () => {
  const { aiRecommendations } = useApp();
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');

  const styles = ['All', 'Modern Classic', 'Minimalist', 'Bohemian', 'Edgy', 'Romantic'];
  const occasions = ['All', 'Professional', 'Casual', 'Formal', 'Party', 'Travel'];

  const filteredRecommendations = aiRecommendations.filter(rec => {
    const matchesStyle = selectedStyle === 'All' || rec.style === selectedStyle;
    const matchesOccasion = selectedOccasion === 'All' || rec.occasion === selectedOccasion;
    return matchesStyle && matchesOccasion;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            AI Recommendations
          </h1>
          <p className="text-gray-600 mt-1">Personalized outfit suggestions curated just for you</p>
        </div>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          Get New Recommendations
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Styles</option>
            {styles.slice(1).map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Occasions</option>
            {occasions.slice(1).map(occasion => (
              <option key={occasion} value={occasion}>{occasion}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-emerald-50 border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Style Insights</h3>
            <p className="text-gray-700 mb-3">
              Based on your wardrobe analysis, you prefer <strong>classic and versatile</strong> pieces. 
              Your style leans towards <strong>minimalist elegance</strong> with a preference for neutral colors.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Versatile Pieces
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                Classic Styles
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Quality Investment
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {recommendation.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{recommendation.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {recommendation.style}
                    </span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                      {recommendation.occasion}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {recommendation.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.store}</p>
                      <p className="text-lg font-semibold text-green-600">${item.price}</p>
                    </div>
                    <a
                      href={item.link}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Total and Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total outfit cost</p>
                    <p className="text-2xl font-bold text-gray-900">${recommendation.totalPrice}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm">
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Shop All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or get new recommendations.</p>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;