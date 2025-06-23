import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsPage = () => {
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

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark">Wardrobe Analytics</h1>
        <p className="text-muted mb-0">Insights into your style patterns and wardrobe composition</p>
      </div>

      {/* Overview Stats */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-bag-heart display-4 mb-3"></i>
              <h3 className="fw-bold">{analytics?.total_items || 0}</h3>
              <p className="mb-0">Total Items</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-palette display-4 mb-3"></i>
              <h3 className="fw-bold">{analytics?.total_outfits || 0}</h3>
              <p className="mb-0">Total Outfits</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-tags display-4 mb-3"></i>
              <h3 className="fw-bold">{analytics?.category_data?.length || 0}</h3>
              <p className="mb-0">Categories</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body text-center">
              <i className="bi bi-currency-dollar display-4 mb-3"></i>
              <h3 className="fw-bold">${(analytics?.total_value || 0).toFixed(0)}</h3>
              <p className="mb-0">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-5">
        {/* Category Analysis */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Category Distribution</h5>
            </div>
            <div className="card-body">
              {analytics?.category_data?.length > 0 ? (
                analytics.category_data.map((category, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-medium">{category.category}</span>
                      <span className="text-muted">{category.count} items</span>
                    </div>
                    <div className="progress mb-1">
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${(category.count / analytics.total_items) * 100}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted small">
                      <span>Value: ${(category.total_value || 0).toFixed(0)}</span>
                      <span>Avg. Wear: {(category.avg_wear || 0).toFixed(1)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Color Analysis */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Top Colors</h5>
            </div>
            <div className="card-body">
              {analytics?.color_data?.length > 0 ? (
                analytics.color_data.map((color, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className="me-3 rounded-circle border" 
                        style={{ 
                          backgroundColor: color.color.toLowerCase(), 
                          width: '24px', 
                          height: '24px' 
                        }}
                      ></div>
                      <span className="fw-medium text-capitalize">{color.color}</span>
                    </div>
                    <span className="text-muted">{color.count} items</span>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">No color data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wear Patterns */}
      <div className="row g-4">
        {/* Most Worn Items */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Most Worn Items</h5>
            </div>
            <div className="card-body">
              {analytics?.most_worn?.length > 0 ? (
                analytics.most_worn.slice(0, 5).map((item, index) => (
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
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted small mb-1">{item.category} • {item.color}</p>
                      <span className="badge bg-primary">{item.wear_count} times</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">No wear data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Least Worn Items */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Items to Wear More</h5>
            </div>
            <div className="card-body">
              {analytics?.least_worn?.length > 0 ? (
                analytics.least_worn.slice(0, 5).map((item, index) => (
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
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted small mb-1">{item.category} • {item.color}</p>
                      <span className="badge bg-warning">{item.wear_count} times</span>
                    </div>
                  </div>
                ))
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

export default AnalyticsPage;