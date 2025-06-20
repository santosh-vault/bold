import React from 'react';
import { BarChart3, TrendingUp, Shirt, Calendar } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Card from '../components/Card';

const Dashboard: React.FC = () => {
  const { wardrobeStats, wardrobeItems, outfits, wardrobeLoading, outfitsLoading } = useApp();

  if (wardrobeLoading || outfitsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Items',
      value: wardrobeStats.totalItems,
      icon: Shirt,
      color: 'bg-purple-100 text-purple-600',
      change: '+2 this week'
    },
    {
      title: 'Wardrobe Value',
      value: `$${wardrobeStats.totalValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
      change: '+$89 this month'
    },
    {
      title: 'Outfits Created',
      value: outfits.length,
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      change: '+1 this week'
    },
    {
      title: 'Monthly Budget',
      value: `$${wardrobeStats.monthlySpending}`,
      icon: Calendar,
      color: 'bg-rose-100 text-rose-600',
      change: '$50 remaining'
    }
  ];

  const categoryData = Object.entries(wardrobeStats.categoryBreakdown);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your style overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              {categoryData.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(count / wardrobeStats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No items in your wardrobe yet.</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {wardrobeItems.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Added "{item.name}"</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {outfits.slice(0, 2).map((outfit, index) => (
              <div key={outfit.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created "{outfit.name}" outfit</p>
                  <p className="text-xs text-gray-500">
                    {new Date(outfit.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {wardrobeItems.length === 0 && outfits.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Most and Least Worn Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Worn Item */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Worn Item</h3>
          {wardrobeStats.mostWornItem ? (
            <div className="flex items-center space-x-4">
              <img
                src={wardrobeStats.mostWornItem.image_url}
                alt={wardrobeStats.mostWornItem.name}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                }}
              />
              <div>
                <p className="font-medium text-gray-900">{wardrobeStats.mostWornItem.name}</p>
                <p className="text-sm text-gray-600">{wardrobeStats.mostWornItem.category}</p>
                <p className="text-sm text-purple-600 font-medium">
                  Worn {wardrobeStats.mostWornItem.wear_count} times
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No items worn yet.</p>
          )}
        </Card>

        {/* Items to Wear More */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items to Wear More</h3>
          {wardrobeStats.leastWornItems.length > 0 ? (
            <div className="space-y-3">
              {wardrobeStats.leastWornItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Worn {item.wear_count} times</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">All items are well-worn!</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;