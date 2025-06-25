import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Shirt, 
  Palette, 
  BarChart3, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

const features = [
  {
    icon: Shirt,
    title: 'Digital Wardrobe',
    description: 'Organize and catalog your entire wardrobe with photos, tags, and detailed information.'
  },
  {
    icon: Palette,
    title: 'Outfit Planning',
    description: 'Create and save outfit combinations for different occasions and seasons.'
  },
  {
    icon: BarChart3,
    title: 'Wear Analytics',
    description: 'Track what you wear most and discover patterns in your style choices.'
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Get personalized outfit suggestions based on your style and preferences.'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Fashion Enthusiast',
    content: 'StyleVault has completely transformed how I organize my wardrobe. I never forget what I own anymore!',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Professional',
    content: 'The outfit planning feature saves me so much time in the morning. Perfect for busy professionals.',
    rating: 5
  },
  {
    name: 'Emma Thompson',
    role: 'Style Blogger',
    content: 'The analytics help me understand my style better and make smarter shopping decisions.',
    rating: 5
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shirt className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">StyleVault</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Your Digital
              <span className="text-primary-600 block">Wardrobe Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Organize your clothes, plan outfits, and discover your personal style with our intelligent wardrobe management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/register"
                className="btn-primary px-8 py-3 text-lg inline-flex items-center space-x-2"
              >
                <span>Start Organizing</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="btn-outline px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your style
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From cataloging your wardrobe to planning perfect outfits, StyleVault has all the tools you need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by style enthusiasts
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about StyleVault
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="card p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your wardrobe?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already organized their style with StyleVault.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shirt className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-semibold">StyleVault</span>
            </div>
            <p className="text-gray-400">
              © 2025 StyleVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}