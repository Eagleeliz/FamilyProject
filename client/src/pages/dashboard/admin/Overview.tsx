import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import AdminCard from '@/components/dashboard/admin/AdminCard';

export default function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: adminService.getAnalytics,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.data?.totalUsers || 0, color: 'bg-blue-500' },
    { label: 'Active Users', value: data?.data?.activeUsers || 0, color: 'bg-green-500' },
    { label: 'Blocked Users', value: data?.data?.blockedUsers || 0, color: 'bg-red-500' },
    { label: 'Total Families', value: data?.data?.totalFamilies || 0, color: 'bg-purple-500' },
    { label: 'Pending Families', value: data?.data?.pendingFamilies || 0, color: 'bg-yellow-500' },
    { label: 'Total Persons', value: data?.data?.totalPersons || 0, color: 'bg-indigo-500' },
    { label: 'Pending Persons', value: data?.data?.pendingPersons || 0, color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AdminCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AdminCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Signups</h2>
            {data?.data?.recentSignups && data.data.recentSignups.length > 0 ? (
              <div className="space-y-2">
                {data.data.recentSignups.slice(-7).map((signup) => (
                  <div key={signup.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{signup.date}</span>
                    <span className="font-medium">{signup.count} users</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent signups</p>
            )}
          </AdminCard>

          <AdminCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Families</h2>
            {data?.data?.recentFamilies && data.data.recentFamilies.length > 0 ? (
              <div className="space-y-2">
                {data.data.recentFamilies.slice(-7).map((family) => (
                  <div key={family.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{family.date}</span>
                    <span className="font-medium">{family.count} families</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent families</p>
            )}
          </AdminCard>
        </div>
      </motion.div>
    </div>
  );
}
