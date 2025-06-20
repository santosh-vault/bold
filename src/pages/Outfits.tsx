import React, { useState } from 'react';
import { Plus, Star, Calendar, Eye, AlertCircle, BarChart3, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '../contexts/AppContext';
import { outfitSchema, OutfitFormData } from '../lib/validations';
import Card from '../components/Card';
import Button from '../components/Button';

const Outfits: React.FC = () => {
  const { outfits, outfitsLoading, wardrobeItems, addOutfit, deleteOutfit } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const occasions = ['Casual', 'Work', 'Formal', 'Party', 'Date', 'Travel', 'Exercise'];
  const seasons = ['All seasons', 'Spring', 'Summer', 'Fall', 'Winter'];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OutfitFormData>({
    resolver: zodResolver(outfitSchema),
    defaultValues: {
      season: 'All seasons',
    },
  });

  const onSubmit = async (data: OutfitFormData) => {
    try {
      setLoading(true);
      setError('');

      await addOutfit(
        {
          name: data.name,
          occasion: data.occasion,
          season: data.season,
          rating: data.rating,
        },
        selectedItems
      );

      reset();
      setSelectedItems([]);
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create outfit');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(itemId);
      if (isSelected) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      try {
        await deleteOutfit(id);
      } catch (err: any) {
        alert('Failed to delete outfit: ' + err.message);
      }
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (outfitsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your outfits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Outfits</h1>
          <p className="text-gray-600 mt-1">Create and manage your outfit combinations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Outfit
        </Button>
      </div>

      {/* Outfits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outfits.map((outfit) => (
          <Card key={outfit.id} hover className="overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100 relative">
              <div className="grid grid-cols-2 gap-1 h-full p-2">
                {outfit.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="bg-white rounded overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                  </div>
                ))}
              </div>
              {outfit.items.length > 4 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  +{outfit.items.length - 4} more
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{outfit.name}</h3>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {outfit.occasion}
                </span>
                <span>{outfit.season}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {renderStars(outfit.rating || undefined)}
                  <span className="text-xs text-gray-500">
                    {outfit.items.length} items
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(outfit.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {outfits.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No outfits yet</h3>
          <p className="text-gray-600 mb-4">Create your first outfit by combining items from your wardrobe.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Outfit
          </Button>
        </div>
      )}

      {/* Create Outfit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Outfit</h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center mb-4">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outfit Name
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Casual Friday"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occasion
                    </label>
                    <select
                      {...register('occasion')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.occasion ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select occasion</option>
                      {occasions.map(occasion => (
                        <option key={occasion} value={occasion}>{occasion}</option>
                      ))}
                    </select>
                    {errors.occasion && (
                      <p className="mt-1 text-sm text-red-600">{errors.occasion.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season
                    </label>
                    <select
                      {...register('season')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {seasons.map(season => (
                        <option key={season} value={season}>{season}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Items ({selectedItems.length} selected)
                  </label>
                  
                  {wardrobeItems.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No wardrobe items found. Add some items to your wardrobe first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {wardrobeItems.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <div className="aspect-square">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                                }}
                              />
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {errors.items && (
                    <p className="mt-2 text-sm text-red-600">{errors.items.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      reset();
                      setSelectedItems([]);
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || selectedItems.length === 0}
                  >
                    {loading ? 'Creating...' : 'Create Outfit'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Outfits;