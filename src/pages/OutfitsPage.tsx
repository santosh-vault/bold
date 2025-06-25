import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Star, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  Palette
} from 'lucide-react'
import { supabase, Outfit, OutfitWithItems, WardrobeItem } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface OutfitForm {
  name: string
  occasion: string
  season: string
  rating?: number
  item_ids: string[]
}

const occasions = [
  'work', 'casual', 'formal', 'party', 'date', 'travel', 
  'exercise', 'home', 'shopping', 'meeting', 'event', 'other'
]

const seasons = ['spring', 'summer', 'fall', 'winter', 'all seasons']

export default function OutfitsPage() {
  const { user } = useAuth()
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([])
  const [filteredOutfits, setFilteredOutfits] = useState<OutfitWithItems[]>([])
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOccasion, setSelectedOccasion] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OutfitForm>()

  const watchedRating = watch('rating')

  useEffect(() => {
    if (user) {
      fetchOutfits()
      fetchWardrobeItems()
    }
  }, [user])

  useEffect(() => {
    filterOutfits()
  }, [outfits, searchTerm, selectedOccasion, selectedSeason])

  const fetchOutfits = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            *,
            wardrobe_items (*)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOutfits(data || [])
    } catch (error) {
      console.error('Error fetching outfits:', error)
      toast.error('Failed to load outfits')
    } finally {
      setLoading(false)
    }
  }

  const fetchWardrobeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('name')

      if (error) throw error
      setWardrobeItems(data || [])
    } catch (error) {
      console.error('Error fetching wardrobe items:', error)
    }
  }

  const filterOutfits = () => {
    let filtered = outfits

    if (searchTerm) {
      filtered = filtered.filter(outfit =>
        outfit.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedOccasion) {
      filtered = filtered.filter(outfit => outfit.occasion === selectedOccasion)
    }

    if (selectedSeason) {
      filtered = filtered.filter(outfit => outfit.season === selectedSeason)
    }

    setFilteredOutfits(filtered)
  }

  const onSubmit = async (data: OutfitForm) => {
    try {
      if (selectedItems.length === 0) {
        toast.error('Please select at least one item for the outfit')
        return
      }

      const outfitData = {
        name: data.name,
        occasion: data.occasion,
        season: data.season,
        rating: data.rating || null,
        user_id: user!.id,
      }

      let outfitId: string

      if (editingOutfit) {
        const { error } = await supabase
          .from('outfits')
          .update(outfitData)
          .eq('id', editingOutfit.id)

        if (error) throw error

        // Delete existing outfit items
        await supabase
          .from('outfit_items')
          .delete()
          .eq('outfit_id', editingOutfit.id)

        outfitId = editingOutfit.id
        toast.success('Outfit updated successfully!')
      } else {
        const { data: newOutfit, error } = await supabase
          .from('outfits')
          .insert([outfitData])
          .select()
          .single()

        if (error) throw error
        outfitId = newOutfit.id
        toast.success('Outfit created successfully!')
      }

      // Add outfit items
      const outfitItems = selectedItems.map(itemId => ({
        outfit_id: outfitId,
        wardrobe_item_id: itemId,
      }))

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItems)

      if (itemsError) throw itemsError

      setShowAddModal(false)
      setEditingOutfit(null)
      setSelectedItems([])
      reset()
      fetchOutfits()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save outfit')
    }
  }

  const handleEdit = async (outfit: Outfit) => {
    setEditingOutfit(outfit)
    setValue('name', outfit.name)
    setValue('occasion', outfit.occasion)
    setValue('season', outfit.season)
    setValue('rating', outfit.rating || undefined)

    // Fetch outfit items
    const { data: outfitItems, error } = await supabase
      .from('outfit_items')
      .select('wardrobe_item_id')
      .eq('outfit_id', outfit.id)

    if (error) {
      console.error('Error fetching outfit items:', error)
    } else {
      setSelectedItems(outfitItems.map(item => item.wardrobe_item_id))
    }

    setShowAddModal(true)
  }

  const handleDelete = async (outfit: Outfit) => {
    if (!confirm('Are you sure you want to delete this outfit?')) return

    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfit.id)

      if (error) throw error
      toast.success('Outfit deleted successfully!')
      fetchOutfits()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete outfit')
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingOutfit(null)
    setSelectedItems([])
    reset()
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Outfits</h1>
          <p className="text-gray-600">{filteredOutfits.length} outfits</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Outfit</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search outfits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="input"
              >
                <option value="">All Occasions</option>
                {occasions.map(occasion => (
                  <option key={occasion} value={occasion} className="capitalize">
                    {occasion}
                  </option>
                ))}
              </select>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="input"
              >
                <option value="">All Seasons</option>
                {seasons.map(season => (
                  <option key={season} value={season} className="capitalize">
                    {season}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Outfits Grid */}
      {filteredOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map((outfit) => (
            <div key={outfit.id} className="card group hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{outfit.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {outfit.occasion} • {outfit.season}
                    </p>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(outfit)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(outfit)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {outfit.rating && (
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < outfit.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Outfit Items Preview */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {outfit.outfit_items.slice(0, 3).map((outfitItem) => (
                    <div key={outfitItem.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={outfitItem.wardrobe_items.image_url}
                        alt={outfitItem.wardrobe_items.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {outfit.outfit_items.length > 3 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">+{outfit.outfit_items.length - 3}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{outfit.outfit_items.length} items</span>
                  <span>{format(new Date(outfit.created_at!), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No outfits found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedOccasion || selectedSeason
              ? 'Try adjusting your filters or search terms.'
              : 'Start creating outfits by combining your wardrobe items.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Outfit</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingOutfit ? 'Edit Outfit' : 'Create New Outfit'}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outfit Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="input"
                      placeholder="e.g., Summer Office Look"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occasion *
                    </label>
                    <select
                      {...register('occasion', { required: 'Occasion is required' })}
                      className="input"
                    >
                      <option value="">Select occasion</option>
                      {occasions.map(occasion => (
                        <option key={occasion} value={occasion} className="capitalize">
                          {occasion}
                        </option>
                      ))}
                    </select>
                    {errors.occasion && (
                      <p className="mt-1 text-sm text-red-600">{errors.occasion.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Season *
                    </label>
                    <select
                      {...register('season', { required: 'Season is required' })}
                      className="input"
                    >
                      <option value="">Select season</option>
                      {seasons.map(season => (
                        <option key={season} value={season} className="capitalize">
                          {season}
                        </option>
                      ))}
                    </select>
                    {errors.season && (
                      <p className="mt-1 text-sm text-red-600">{errors.season.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setValue('rating', rating)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              watchedRating && rating <= watchedRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      {watchedRating && (
                        <button
                          type="button"
                          onClick={() => setValue('rating', undefined)}
                          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Items for Outfit *
                  </label>
                  {wardrobeItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {wardrobeItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleItemSelection(item.id)}
                          className={`cursor-pointer rounded-lg border-2 transition-all ${
                            selectedItems.includes(item.id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                      <p className="text-gray-500">No wardrobe items available. Add some items first!</p>
                    </div>
                  )}
                  {selectedItems.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingOutfit ? 'Update Outfit' : 'Create Outfit'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}