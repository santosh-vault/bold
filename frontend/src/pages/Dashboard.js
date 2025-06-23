import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Items',
      value: analytics?.total_items || 0,
      icon: 'bi-bag-heart',
      color: 'bg-primary',
      change: '+2 this week'
    },
    {
      title: 'Wardrobe Value',
      value: `$${(analytics?.total_value || 0).toFixed(2)}`,
      icon: 'bi-currency-dollar',
      color: 'bg-success',
      change: '+$89 this month'
    },
    {
      title: 'Outfits Created',
      value: analytics?.total_outfits || 0,
      icon: 'bi-palette',
      color: 'bg-info',
      change: '+1 this week'
    },
    {
      title: 'Avg. Wear Count',
      value: (analytics?.avg_wear_count || 0).toFixed(1),
      icon: 'bi-graph-up',
      color: 'bg-warning',
      change: 'Great usage!'
    }
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark">Dashboard</h1>
        <p className="text-muted mb-0">Welcome back! Here's your style overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        {statsCards.map((stat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className={`card text-white ${stat.color} h-100`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className={`${stat.icon} fs-1 opacity-75`}></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fs-6 fw-medium">{stat.title}</div>
                    <div className="fs-2 fw-bold">{stat.value}</div>
                    <div className="small opacity-75">{stat.change}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Data */}
      <div className="row g-4 mb-5">
        {/* Category Breakdown */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Category Breakdown</h5>
            </div>
            <div className="card-body">
              {analytics?.category_data?.length > 0 ? (
                <div className="category-chart">
                  {analytics.category_data.map((category, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fw-medium">{category.category}</span>
                      <div className="d-flex align-items-center">
                        <div className="progress me-3" style={{ width: '120px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${(category.count / analytics.total_items) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-muted">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No items in your wardrobe yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Most Worn Items */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Most Worn Items</h5>
            </div>
            <div className="card-body">
              {analytics?.most_worn?.length > 0 ? (
                <div className="activity-list">
                  {analytics.most_worn.slice(0, 5).map((item, index) => (
                    <div key={index} className="d-flex align-items-center mb-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="rounded me-3"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                        }}
                      />
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">{item.name}</p>
                        <small className="text-muted">{item.category}</small>
                        <div className="mt-1">
                          <span className="badge bg-primary">{item.wear_count} times</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No items worn yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items to Wear More */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Items to Wear More</h5>
            </div>
            <div className="card-body">
              {analytics?.least_worn?.length > 0 ? (
                <div className="row g-3">
                  {analytics.least_worn.slice(0, 6).map((item, index) => (
                    <div key={index} className="col-md-4 col-lg-2">
                      <div className="text-center">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="rounded mb-2"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                          }}
                        />
                        <p className="mb-1 small fw-medium">{item.name}</p>
                        <span className="badge bg-warning">{item.wear_count} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">All items are well-worn!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;