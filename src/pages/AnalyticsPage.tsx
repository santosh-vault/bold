import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Calendar, 
  Shirt, 
  Star,
  PieChart,
  BarChart3,
  Eye,
  Heart
} from 'lucide-react'
import { supabase, WardrobeItem, Outfit } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

interface Analytics {
  totalItems: number
  totalOutfits: number
  mostWornItems: WardrobeItem[]
  leastWornItems: WardrobeItem[]
  categoryBreakdown: { category: string; count: number }[]
  colorBreakdown: { color: string; count: number }[]
  recentActivity: number
  averageRating: number
  topRatedOutfits: Outfit[]
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<Analytics>({
    totalItems: 0,
    totalOutfits: 0,
    mostWornItems: [],
    leastWornItems: [],
    categoryBreakdown: [],
    colorBreakdown: [],
    recentActivity: 0,
    averageRating: 0,
    topRatedOutfits: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch wardrobe items
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user!.id)

      if (itemsError) throw itemsError

      // Fetch outfits
      const { data: outfits, error: outfitsError } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user!.id)

      if (outfitsError) throw outfitsError

      // Calculate analytics
      const totalItems = items?.length || 0
      const totalOutfits = outfits?.length || 0

      // Most and least worn items
      const sortedByWear = [...(items || [])].sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0))
      const mostWornItems = sortedByWear.slice(0, 5)
      const leastWornItems = sortedByWear.slice(-5).reverse()

      // Category breakdown
      const categoryCount: { [key: string]: number } = {}
      items?.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      })
      const categoryBreakdown = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      // Color breakdown
      const colorCount: { [key: string]: number } = {}
      items?.forEach(item => {
        colorCount[item.color] = (colorCount[item.color] || 0) + 1
      })
      const colorBreakdown = Object.entries(colorCount)
        .map(([color, count]) => ({ color, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 colors

      // Recent activity (items added in last 7 days)
      const weekAgo = subDays(new Date(), 7)
      const recentActivity = items?.filter(item => 
        new Date(item.created_at!) > weekAgo
      ).length || 0

      // Average rating and top rated outfits
      const ratedOutfits = outfits?.filter(outfit => outfit.rating) || []
      const averageRating = ratedOutfits.length > 0 
        ? ratedOutfits.reduce((sum, outfit) => sum + (outfit.rating || 0), 0) / ratedOutfits.length
        : 0
      const topRatedOutfits = [...ratedOutfits]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5)

      setAnalytics({
        totalItems,
        totalOutfits,
        mostWornItems,
        leastWornItems,
        categoryBreakdown,
        colorBreakdown,
        recentActivity,
        averageRating,
        topRatedOutfits
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      black: 'bg-gray-900',
      white: 'bg-gray-100 border border-gray-300',
      gray: 'bg-gray-500',
      brown: 'bg-amber-800',
      beige: 'bg-amber-100',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      navy: 'bg-blue-900',
      multicolor: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
    }
    return colorMap[color] || 'bg-gray-400'
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Insights into your wardrobe and style patterns.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalItems}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shirt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outfits</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOutfits}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Added This Week</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recentActivity}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Outfit Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Items by Category</h2>
            </div>
          </div>
          <div className="card-content">
            {analytics.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {analytics.categoryBreakdown.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-primary-${(index % 3 + 1) * 200}`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(item.count / analytics.totalItems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Color Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Popular Colors</h2>
            </div>
          </div>
          <div className="card-content">
            {analytics.colorBreakdown.length > 0 ? (
              <div className="space-y-3">
                {analytics.colorBreakdown.map((item) => (
                  <div key={item.color} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getColorClass(item.color)}`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{item.color}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(item.count / analytics.totalItems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Worn Items */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Most Worn Items</h2>
            </div>
          </div>
          <div className="card-content">
            {analytics.mostWornItems.length > 0 ? (
              <div className="space-y-4">
                {analytics.mostWornItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.wear_count || 0}</p>
                      <p className="text-xs text-gray-500">times</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No wear data available</p>
            )}
          </div>
        </div>

        {/* Top Rated Outfits */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Top Rated Outfits</h2>
            </div>
          </div>
          <div className="card-content">
            {analytics.topRatedOutfits.length > 0 ? (
              <div className="space-y-4">
                {analytics.topRatedOutfits.map((outfit) => (
                  <div key={outfit.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{outfit.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{outfit.occasion}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (outfit.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No rated outfits yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}