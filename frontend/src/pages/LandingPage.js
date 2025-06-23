import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: 'bi-bag-heart',
      title: 'Smart Wardrobe Management',
      description: 'Organize your clothes with intelligent categorization and tracking.'
    },
    {
      icon: 'bi-bar-chart',
      title: 'Outfit Analytics',
      description: 'Get insights on your style preferences and wearing patterns.'
    },
    {
      icon: 'bi-stars',
      title: 'AI Style Recommendations',
      description: 'Discover new outfits curated by AI based on your taste and trends.'
    },
    {
      icon: 'bi-lightning',
      title: 'Quick Outfit Creation',
      description: 'Mix and match your wardrobe items to create perfect outfits.'
    },
    {
      icon: 'bi-shield-check',
      title: 'Secure & Private',
      description: 'Your style data is encrypted and never shared without permission.'
    },
    {
      icon: 'bi-people',
      title: 'Style Community',
      description: 'Connect with fashion enthusiasts and share style inspiration.'
    }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-bag-heart-fill text-primary fs-2 me-2"></i>
            <span className="fw-bold fs-3">StyleVault</span>
          </Link>
          
          <div className="navbar-nav ms-auto">
            <Link className="nav-link me-3" to="/login">Sign In</Link>
            <Link className="btn btn-primary" to="/register">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <h1 className="display-3 fw-bold mb-4">
                Your Personal
                <span className="text-primary"> Style Assistant</span>
              </h1>
              <p className="lead mb-5">
                Transform your wardrobe into a smart, organized collection. Create stunning outfits, 
                track your style journey, and discover new looks with AI-powered recommendations.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/register" className="btn btn-primary btn-lg px-4">
                  Start Your Style Journey
                </Link>
                <button className="btn btn-outline-primary btn-lg px-4">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Stylish wardrobe" 
                className="img-fluid rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-4">Everything You Need for Style Success</h2>
            <p className="lead">Powerful features designed to revolutionize how you manage and style your wardrobe.</p>
          </div>
          
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="text-center p-4 h-100 border rounded-3 bg-light">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" 
                       style={{ width: '64px', height: '64px' }}>
                    <i className={`${feature.icon} fs-3`}></i>
                  </div>
                  <h4 className="fw-semibold mb-3">{feature.title}</h4>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Style?</h2>
          <p className="lead mb-4">Join thousands of users who have already revolutionized their wardrobe management.</p>
          <Link to="/register" className="btn btn-light btn-lg px-5">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <i className="bi bi-bag-heart-fill text-primary fs-3 me-2"></i>
            <span className="fw-bold fs-4">StyleVault</span>
          </div>
          <p className="text-muted mb-0">&copy; 2024 StyleVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;