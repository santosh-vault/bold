import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ItemRecommendationsPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('existing');

  useEffect(() => {
    fetchRecommendations();
  }, [itemId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/wardrobe-items/${itemId}/recommendations/`);
      setRecommendations(response.data);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Generating AI recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button onClick={() => navigate('/wardrobe')} className="btn btn-primary">
          Back to Wardrobe
        </button>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning" role="alert">
          No recommendations available for this item.
        </div>
        <button onClick={() => navigate('/wardrobe')} className="btn btn-primary">
          Back to Wardrobe
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          onClick={() => navigate('/wardrobe')}
          className="btn btn-outline-secondary me-3"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 className="h2 fw-bold mb-1">
            <i className="bi bi-stars text-primary me-2"></i>
            AI Style Recommendations
          </h1>
          <p className="text-muted mb-0">
            Discover perfect matches for your {recommendations.item_name}
          </p>
        </div>
      </div>

      {/* Item Display */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <img
                src={recommendations.item?.image_url}
                alt={recommendations.item_name}
                className="rounded"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                }}
              />
            </div>
            <div className="col">
              <h3 className="mb-1">{recommendations.item_name}</h3>
              <p className="text-muted mb-2">
                {recommendations.item?.category} • {recommendations.item?.color}
              </p>
              <div className="d-flex align-items-center">
                <span className="ai-badge me-3">
                  AI Confidence: {Math.round(recommendations.confidence_score * 100)}%
                </span>
                <span className="badge bg-primary">
                  {recommendations.style_analysis?.primary_style || 'Versatile'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Style Analysis */}
      <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #007bff 100%)' }}>
        <div className="card-body text-white">
          <div className="row align-items-center">
            <div className="col-auto">
              <i className="bi bi-stars display-4"></i>
            </div>
            <div className="col">
              <h3 className="fw-bold mb-2">AI Style Analysis</h3>
              <p className="mb-3">
                This item has a <strong>{recommendations.style_analysis?.formality_level}</strong> formality level
                with <strong>{Math.round((recommendations.style_analysis?.versatility_score || 0.7) * 100)}%</strong> versatility score.
                Perfect for <strong>{recommendations.style_analysis?.seasonal_suitability?.join(', ') || 'all seasons'}</strong>.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {recommendations.style_analysis?.style_tags?.map((tag, index) => (
                  <span key={index} className="badge bg-white text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'existing' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            Your Wardrobe Matches ({recommendations.existing_matches?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
          >
            Shopping Suggestions ({recommendations.shopping_suggestions?.length || 0})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'existing' && (
        <div className="row g-4">
          {recommendations.existing_matches?.length > 0 ? (
            recommendations.existing_matches.map((match) => (
              <div key={match.id} className="col-md-6 col-lg-4">
                <div className="recommendation-card p-3">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={match.image_url}
                      alt={match.name}
                      className="rounded me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{match.name}</h6>
                      <p className="text-muted small mb-1">
                        {match.category} • {match.color}
                      </p>
                      <span className="compatibility-score">
                        {Math.round(match.compatibility_score * 100)}% match
                      </span>
                    </div>
                  </div>
                  <p className="small text-muted mb-0">{match.reason}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-bag-heart display-1 text-muted mb-3"></i>
                <h4>No matching items in your wardrobe</h4>
                <p className="text-muted">Check the shopping suggestions for new items to add!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'shopping' && (
        <div className="row g-4">
          {recommendations.shopping_suggestions?.length > 0 ? (
            recommendations.shopping_suggestions.map((suggestion, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <img
                    src={suggestion.image_url}
                    className="card-img-top"
                    alt={suggestion.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{suggestion.name}</h6>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-heart"></i>
                      </button>
                    </div>
                    
                    <p className="card-text small text-muted mb-2">
                      {suggestion.reason}
                    </p>
                    
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {suggestion.colors?.map((color, colorIndex) => (
                          <span key={colorIndex} className="badge bg-light text-dark">
                            {color}
                          </span>
                        ))}
                      </div>
                      <span className="badge bg-primary">{suggestion.style}</span>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="h6 text-success mb-0">${suggestion.price}</span>
                        <small className="text-muted">{suggestion.store}</small>
                      </div>
                      
                      <div className="d-grid gap-2 d-md-flex">
                        <button className="btn btn-outline-primary btn-sm flex-fill">
                          <i className="bi bi-eye me-1"></i>
                          View
                        </button>
                        <button className="btn btn-primary btn-sm flex-fill">
                          <i className="bi bi-bag me-1"></i>
                          Shop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-heart display-1 text-muted mb-3"></i>
                <h4>Your wardrobe is complete!</h4>
                <p className="text-muted">You have great matches for all recommended categories.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemRecommendationsPage;