import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdvancedWardrobe from './pages/AdvancedWardrobe';
import ItemRecommendations from './pages/ItemRecommendations';
import Outfits from './pages/Outfits';
import Recommendations from './pages/Recommendations';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useApp();
  
  if (authLoading) {
    return <LoadingSpinner />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authLoading } = useApp();
  
  if (authLoading) {
    return <LoadingSpinner />;
  }
  
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppContent: React.FC = () => {
  const { authLoading } = useApp();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wardrobe"
          element={
            <ProtectedRoute>
              <AdvancedWardrobe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wardrobe/item/:itemId/recommendations"
          element={
            <ProtectedRoute>
              <ItemRecommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/outfits"
          element={
            <ProtectedRoute>
              <Outfits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;