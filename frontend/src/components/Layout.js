import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'bi-house-door' },
    { name: 'Wardrobe', href: '/wardrobe', icon: 'bi-bag-heart' },
    { name: 'Outfits', href: '/outfits', icon: 'bi-palette' },
    { name: 'Analytics', href: '/analytics', icon: 'bi-bar-chart' },
  ];

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <i className="bi bi-bag-heart-fill text-primary fs-2 me-2"></i>
            <span className="fs-4 fw-bold">StyleVault</span>
          </div>
        </div>
        
        <nav className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name} className="nav-item mb-2">
                  <Link
                    to={item.href}
                    className={`nav-link d-flex align-items-center ${
                      isActive ? 'active' : 'text-dark'
                    }`}
                  >
                    <i className={`${item.icon} me-3`}></i>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-top">
          <div className="d-flex align-items-center bg-light rounded p-2">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-circle"
                  width="32"
                  height="32"
                />
              ) : (
                <i className="bi bi-person-circle fs-4 text-muted"></i>
              )}
            </div>
            <div className="flex-grow-1 ms-2 min-w-0">
              <p className="mb-0 fw-medium text-truncate">
                {user?.name || user?.username}
              </p>
              <p className="mb-0 small text-muted text-truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger ms-2"
              title="Logout"
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content flex-grow-1">
        {children}
      </div>
    </div>
  );
};

export default Layout;