import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';

const adminNavLinks = [
  { path: '/admin', label: 'Overview' },
  { path: '/admin/users', label: 'All Users' },
  { path: '/admin/families', label: 'All Families' },
  { path: '/admin/moderation', label: 'Moderation' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 lg:py-4 lg:px-6 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 4-2 8-4 8-8 0-4-4-8-8-8z" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-white hidden sm:block">Lineage</span>
            </Link>

            <button
              className="lg:hidden p-2 text-gray-400"
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

            <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex absolute lg:relative top-full lg:top-0 left-0 lg:left-auto flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-6 bg-gray-900 lg:bg-transparent py-4 lg:py-0 px-4 lg:px-0 border-b lg:border-b-0 border-gray-800 lg:border-none w-full lg:w-auto z-50`}>
              {adminNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                User Dashboard
              </Link>
            </div>
          </div>

          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4 py-4 lg:py-0 px-4 lg:px-0 w-full lg:w-auto z-50`}>
            <span className="text-sm text-gray-400 truncate max-w-[120px] lg:max-w-none">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
