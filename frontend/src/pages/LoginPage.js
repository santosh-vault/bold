import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Left side - Form */}
      <div className="col-lg-6 d-flex align-items-center justify-content-center">
        <div className="w-100" style={{ maxWidth: '400px', padding: '2rem' }}>
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none text-dark">
              <i className="bi bi-bag-heart-fill text-primary" style={{ fontSize: '3rem' }}></i>
              <h2 className="fw-bold mt-2">StyleVault</h2>
            </Link>
            <h3 className="fw-bold mt-4 mb-2">Welcome back</h3>
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary text-decoration-none">Sign up</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember" />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-primary text-decoration-none">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="col-lg-6 d-none d-lg-block position-relative">
        <img
          className="w-100 h-100 object-fit-cover"
          src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Fashion styling"
        />
        <div className="position-absolute top-0 start-0 w-100 h-100" 
             style={{ background: 'linear-gradient(135deg, rgba(111, 66, 193, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)' }}></div>
      </div>
    </div>
  );
};

export default LoginPage;