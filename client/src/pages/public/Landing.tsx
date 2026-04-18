import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';

export default function Landing() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Build Your Family Tree',
      description: 'Create and manage comprehensive family trees with an intuitive visual interface.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Define Relationships',
      description: 'Add parents, children, siblings, and spouses to connect your family members.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Smart Search',
      description: 'Search through all families and find relatives with powerful filtering.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Dynamic Cousins',
      description: 'Automatically calculate and display cousins across multiple generations.',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-b from-primary-light to-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold mb-6">
              Trace Your Family's <span className="text-primary">Legacy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Build and explore your family tree with our intuitive genealogy platform.
              Connect generations, discover relationships, and preserve your heritage.
            </p>
            <div className="flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/search"
                    className="px-8 py-3 bg-white text-primary font-semibold rounded-lg border-2 border-primary hover:bg-primary-light transition-colors"
                  >
                    Explore Demo
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                  JD
                </div>
                <div className="w-8 h-0.5 bg-border" />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-lg font-bold text-primary">
                    MR
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Spouse</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-lg font-bold text-primary">
                  AS
                </div>
                <div className="text-xs text-gray-500 mt-1">Child</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-lg font-bold text-primary">
                  KL
                </div>
                <div className="text-xs text-gray-500 mt-1">Child</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 text-lg">
              Everything you need to document and explore your family history
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Start Building Your Tree Today</h2>
            <p className="text-gray-600 text-lg mb-8">
              Join thousands of families documenting their heritage
            </p>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Create Free Account
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
