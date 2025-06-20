import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, BarChart3, Sparkles, Zap, Shield, Users } from 'lucide-react';
import Button from '../components/Button';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Shirt,
      title: 'Smart Wardrobe Management',
      description: 'Organize your clothes with intelligent categorization and tracking.'
    },
    {
      icon: BarChart3,
      title: 'Outfit Analytics',
      description: 'Get insights on your style preferences and wearing patterns.'
    },
    {
      icon: Sparkles,
      title: 'AI Style Recommendations',
      description: 'Discover new outfits curated by AI based on your taste and trends.'
    },
    {
      icon: Zap,
      title: 'Quick Outfit Creation',
      description: 'Mix and match your wardrobe items to create perfect outfits.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your style data is encrypted and never shared without permission.'
    },
    {
      icon: Users,
      title: 'Style Community',
      description: 'Connect with fashion enthusiasts and share style inspiration.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shirt className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">StyleVault</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Personal
              <span className="bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent"> Style Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your wardrobe into a smart, organized collection. Create stunning outfits, 
              track your style journey, and discover new looks with AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Start Your Style Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Stylish wardrobe"
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Style Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to revolutionize how you manage and style your wardrobe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-emerald-100 rounded-2xl mb-6">
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Style?
          </h2>
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Join thousands of users who have already revolutionized their wardrobe management.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Shirt className="h-8 w-8 text-purple-400" />
            <span className="ml-2 text-2xl font-bold">StyleVault</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 StyleVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;