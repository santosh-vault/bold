import React, { useState } from 'react';
import { Plus, Search, Filter, SlidersHorizontal, BarChart3, Sparkles, Edit2, Trash2, Eye, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAdvancedWardrobe } from '../hooks/useAdvancedWardrobe';
import { wardrobeItemSchema, WardrobeItemFormData } from '../lib/validations';
import { FilterCriteria } from '../lib/algorithms';
import Card from '../components/Card';
import Button from '../components/Button';

const AdvancedWardrobe: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    sortOptions,
    filterCriteria,
    setFilterCriteria,
    clearFilters,
    resetSearch,
    addItem,
    updateItem,
    deleteItem,
    analytics,
    smartSuggestions,
    generateRecommendations
  } = useAdvancedWardrobe();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const categories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
  const colors = ['All', 'Black', 'White', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Pink', 'Purple', 'Yellow', 'Orange'];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WardrobeItemFormData>({
    resolver: zodResolver(wardrobeItemSchema),
    defaultValues: {
      category: 'Tops',
      tags: [],
    },
  });

  const onSubmit = async (data: WardrobeItemFormData) => {
    try {
      setAddLoading(true);
      setAddError('');

      if (editingItem) {
        await updateItem(editingItem.id, {
          ...data,
          tags: data.tags || [],
        });
      } else {
        await addItem({
          ...data,
          tags: data.tags || [],
        });
      }

      reset();
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err: any) {
      setAddError(err.message || 'Failed to save item');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('category', item.category);
    setValue('color', item.color);
    setValue('brand', item.brand || '');
    setValue('price', item.price || undefined);
    setValue('image_url', item.image_url);
    setValue('tags', item.tags || []);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
      } catch (err: any) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilterCriteria(prev => ({
      ...prev,
      [key]: value === 'All' ? undefined : value
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilterCriteria(prev => ({
      ...prev,
      priceRange: min === 0 && max === 1000 ? undefined : [min, max]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Wardrobe</h1>
          <p className="text-gray-600 mt-1">
            {items.length} items • {Object.keys(analytics.categoryDistribution).length} categories
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Smart Suggestions</h3>
              <ul className="space-y-1">
                {smartSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wardrobe Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{analytics.totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">${analytics.totalValue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{analytics.averageWearCount.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Avg. Wear Count</p>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-lg">
              <p className="text-2xl font-bold text-rose-600">{Object.keys(analytics.brandDistribution).length}</p>
              <p className="text-sm text-gray-600">Brands</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Category Distribution</h4>
              <div className="space-y-2">
                {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(count / analytics.totalItems) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Colors</h4>
              <div className="space-y-2">
                {Object.entries(analytics.colorDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([color, count]) => (
                    <div key={color} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700 capitalize">{color}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, brand, color, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={`${sortOption.key}-${sortOption.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              const option = sortOptions.find(opt => opt.key === key && opt.direction === direction);
              if (option) setSortOption(option);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {sortOptions.map((option, index) => (
              <option key={index} value={`${option.key}-${option.direction}`}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-purple-50 border-purple-300' : ''}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCriteria.category || 'All'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={filterCriteria.color || 'All'}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                placeholder="Filter by brand"
                value={filterCriteria.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || 0;
                    const max = filterCriteria.priceRange?.[1] || 1000;
                    handlePriceRangeChange(min, max);
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || 1000;
                    const min = filterCriteria.priceRange?.[0] || 0;
                    handlePriceRangeChange(min, max);
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={resetSearch}>
              Reset Search
            </Button>
          </div>
        </Card>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} hover className="overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.category} • {item.color}</p>
              {item.brand && (
                <p className="text-xs text-gray-500 mb-2">{item.brand}</p>
              )}
              {item.price && (
                <p className="text-sm font-medium text-green-600 mb-2">${item.price}</p>
              )}
              <p className="text-xs text-gray-500 mb-3">Worn {item.wear_count} times</p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigate(`/wardrobe/item/${item.id}/recommendations`)}
                    className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                    title="AI Recommendations"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.keys(filterCriteria).length > 0
              ? 'Try adjusting your search or filters.'
              : 'Start building your wardrobe by adding your first item.'}
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            
            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {addError}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Blue Denim Jacket"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  {...register('category')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  {...register('color')}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.color ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Navy Blue"
                />
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand (Optional)
                </label>
                <input
                  {...register('brand')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Levi's"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Optional)
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  {...register('image_url')}
                  type="url"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.image_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    reset();
                    setAddError('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addLoading}>
                  {addLoading ? (editingItem ? 'Updating...' : 'Adding...') : (editingItem ? 'Update Item' : 'Add Item')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedWardrobe;