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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 4-2 8-4 8-8 0-4-4-8-8-8z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">Lineage</span>
          </Link>

          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex absolute lg:relative top-full lg:top-0 left-0 right-0 lg:left-auto lg:right-auto flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 bg-white lg:bg-transparent p-4 lg:p-0 border-b lg:border-b-0 border-border lg:border-none`}>
            <Link
              to="/search"
              className={`text-sm font-medium transition-colors ${
                isActive('/search') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-0">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
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
                <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 4-2 8-4 8-8 0-4-4-8-8-8z" />
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
