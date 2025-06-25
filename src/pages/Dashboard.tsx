import React, { useState, useEffect } from 'react'
import { 
  Shirt, 
  Palette, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Star
} from 'lucide-react'
import { supabase, WardrobeItem, Outfit } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

interface DashboardStats {
  totalItems: number
  totalOutfits: number
  recentlyAdded: number
  favoriteItems: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalOutfits: 0,
    recentlyAdded: 0,
    favoriteItems: 0
  })
  const [recentItems, setRecentItems] = useState<WardrobeItem[]>([])
  const [recentOutfits, setRecentOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch wardrobe items
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      // Fetch outfits
      const { data: outfits, error: outfitsError } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (outfitsError) throw outfitsError

      // Calculate stats
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const recentlyAdded = items?.filter(item => 
        new Date(item.created_at!) > weekAgo
      ).length || 0

      setStats({
        totalItems: items?.length || 0,
        totalOutfits: outfits?.length || 0,
        recentlyAdded,
        favoriteItems: items?.filter(item => (item.wear_count || 0) > 5).length || 0
      })

      setRecentItems(items?.slice(0, 6) || [])
      setRecentOutfits(outfits?.slice(0, 4) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Shirt,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Outfits Created',
      value: stats.totalOutfits,
      icon: Palette,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Added This Week',
      value: stats.recentlyAdded,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Favorite Items',
      value: stats.favoriteItems,
      icon: Star,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ]

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your wardrobe.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Items */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Items</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
          <div className="card-content">
            {recentItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recentItems.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shirt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items yet. Start building your wardrobe!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Outfits */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Outfits</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
          <div className="card-content">
            {recentOutfits.length > 0 ? (
              <div className="space-y-4">
                {recentOutfits.map((outfit) => (
                  <div key={outfit.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Palette className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{outfit.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{outfit.occasion}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {outfit.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{outfit.rating}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400">
                        {format(new Date(outfit.created_at!), 'MMM d')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No outfits yet. Create your first outfit!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="card p-4 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Add Item</h3>
                <p className="text-xs text-gray-500">Add new clothing item</p>
              </div>
            </div>
          </button>
          
          <button className="card p-4 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Create Outfit</h3>
                <p className="text-xs text-gray-500">Plan a new outfit</p>
              </div>
            </div>
          </button>
          
          <button className="card p-4 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Browse Items</h3>
                <p className="text-xs text-gray-500">View your wardrobe</p>
              </div>
            </div>
          </button>
          
          <button className="card p-4 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Plan Week</h3>
                <p className="text-xs text-gray-500">Weekly outfit planning</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}