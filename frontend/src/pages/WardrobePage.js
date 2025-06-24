import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const WardrobePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    color: '',
    brand: '',
    price: '',
    image_url: '',
    tags: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const categories = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/wardrobe-items/');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormErrors({});

      const submitData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      };

      await axios.post('/api/wardrobe-items/', submitData);
      
      // Reset form and close modal
      setFormData({
        name: '',
        category: 'Tops',
        color: '',
        brand: '',
        price: '',
        image_url: '',
        tags: '',
      });
      setShowAddModal(false);
      
      // Refresh items list
      fetchItems();
    } catch (error) {
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        setFormErrors({ general: 'Failed to add item' });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/wardrobe-items/${id}/`);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const handleWearIncrement = async (id) => {
    try {
      await axios.post(`/api/wardrobe-items/${id}/wear/`);
      fetchItems();
    } catch (error) {
      console.error('Error incrementing wear count:', error);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark">My Wardrobe</h1>
          <p className="text-muted mb-0">Manage and organize your clothing collection</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <i className="bi bi-plus-circle me-2"></i>Add Item
        </button>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="wardrobe-item-card">
                <div className="item-image">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h6 className="fw-semibold mb-1">{item.name}</h6>
                  <p className="text-muted small mb-1">{item.category} • {item.color}</p>
                  {item.brand && (
                    <p className="text-muted small mb-1">{item.brand}</p>
                  )}
                  {item.price && (
                    <p className="text-success small fw-medium mb-1">${item.price}</p>
                  )}
                  <p className="text-muted small mb-2">Worn {item.wear_count} times</p>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-2">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="badge bg-primary-subtle text-primary me-1 mb-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group" role="group">
                      <button
                        onClick={() => handleWearIncrement(item.id)}
                        className="btn btn-sm btn-outline-success"
                        title="Mark as worn"
                      >
                        <i className="bi bi-check-circle"></i>
                      </button>
                      <Link
                        to={`/wardrobe/item/${item.id}/recommendations`}
                        className="btn btn-sm btn-outline-primary"
                        title="AI Recommendations"
                      >
                        <i className="bi bi-stars"></i>
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
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
          <i className="bi bi-bag-heart display-1 text-muted mb-4"></i>
          <h3 className="fw-semibold mb-3">No items yet</h3>
          <p className="text-muted mb-4">Start building your wardrobe by adding your first item.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <i className="bi bi-plus-circle me-2"></i>Add Your First Item
          </button>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Item</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formErrors.general && (
                    <div className="alert alert-danger">{formErrors.general}</div>
                  )}
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Name</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Blue Denim Jacket"
                        required
                      />
                      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select
                        className={`form-select ${formErrors.category ? 'is-invalid' : ''}`}
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {formErrors.category && <div className="invalid-feedback">{formErrors.category}</div>}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Color</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.color ? 'is-invalid' : ''}`}
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="e.g., Navy Blue"
                        required
                      />
                      {formErrors.color && <div className="invalid-feedback">{formErrors.color}</div>}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Brand (Optional)</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.brand ? 'is-invalid' : ''}`}
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="e.g., Levi's"
                      />
                      {formErrors.brand && <div className="invalid-feedback">{formErrors.brand}</div>}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Price (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                      {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Tags (Optional)</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.tags ? 'is-invalid' : ''}`}
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="casual, summer, comfortable"
                      />
                      <div className="form-text">Separate tags with commas</div>
                      {formErrors.tags && <div className="invalid-feedback">{formErrors.tags}</div>}
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Image URL</label>
                      <input
                        type="url"
                        className={`form-control ${formErrors.image_url ? 'is-invalid' : ''}`}
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                      {formErrors.image_url && <div className="invalid-feedback">{formErrors.image_url}</div>}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      'Add Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobePage;