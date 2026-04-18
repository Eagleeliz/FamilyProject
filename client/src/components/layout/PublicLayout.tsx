import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';

export default function PublicLayout() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Top row: Logo + Hamburger */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 4-2 8-4 8-8 0-4-4-8-8-8z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">Lineage</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/search" className={`text-sm font-medium transition-colors ${isActive('/search') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>Search</Link>
              <Link to="/about" className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>About</Link>
              <Link to="/contact" className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>Contact</Link>

              {isAuthenticated ? (
                <Link to="/dashboard" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger (mobile only) */}
            <button
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile dropdown — flows naturally below top row */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-border flex flex-col gap-4 pb-2">
              <Link to="/search" className={`text-sm font-medium transition-colors ${isActive('/search') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>Search</Link>
              <Link to="/about" className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>Contact</Link>

              {isAuthenticated ? (
                <Link to="/dashboard" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="bg-white border-t border-border px-4 lg:px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 0-4-4-8-8-8z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Lineage</span>
          </div>
          <div className="text-sm text-gray-500 text-center">
            Track your family history with ease
          </div>
        </div>
      </footer>
    </div>
  );
}