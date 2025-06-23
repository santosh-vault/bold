import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OutfitsPage = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const response = await axios.get('/api/outfits/');
      setOutfits(response.data);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      try {
        await axios.delete(`/api/outfits/${id}/`);
        fetchOutfits();
      } catch (error) {
        console.error('Error deleting outfit:', error);
        alert('Failed to delete outfit');
      }
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="d-flex">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`bi ${i < rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          ></i>
        ))}
      </div>
    );
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark">My Outfits</h1>
          <p className="text-muted mb-0">Create and manage your outfit combinations</p>
        </div>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Create Outfit
        </button>
      </div>

      {/* Outfits Grid */}
      {outfits.length > 0 ? (
        <div className="row g-4">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-img-top position-relative" style={{ height: '200px', background: '#f8f9fa' }}>
                  <div className="row g-1 h-100 p-2">
                    {outfit.items.slice(0, 4).map((item, index) => (
                      <div key={index} className="col-6">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-100 h-100 object-fit-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {outfit.items.length > 4 && (
                    <div className="position-absolute bottom-0 end-0 bg-dark text-white px-2 py-1 rounded-top-start">
                      +{outfit.items.length - 4} more
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  <h5 className="card-title">{outfit.name}</h5>
                  
                  <div className="d-flex justify-content-between text-muted mb-2">
                    <span>
                      <i className="bi bi-calendar me-1"></i>
                      {outfit.occasion}
                    </span>
                    <span>{outfit.season}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {renderStars(outfit.rating)}
                      <small className="text-muted ms-2">{outfit.items.length} items</small>
                    </div>
                    
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary" title="View">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(outfit.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-palette display-1 text-muted mb-4"></i>
          <h3 className="fw-semibold mb-3">No outfits yet</h3>
          <p className="text-muted mb-4">Create your first outfit by combining items from your wardrobe.</p>
          <button className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Create Your First Outfit
          </button>
        </div>
      )}
    </div>
  );
};

export default OutfitsPage;