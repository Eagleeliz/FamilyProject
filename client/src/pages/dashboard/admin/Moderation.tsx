import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { personService } from '@/services/person.service';
import AdminCard from '@/components/dashboard/admin/AdminCard';
import Button from '@/components/common/Button';
import { formatRelativeDate, getInitials } from '@/utils/helpers';

export default function Moderation() {
  const queryClient = useQueryClient();

  const { data: pendingPersons, isLoading: personsLoading } = useQuery({
    queryKey: ['pending-persons'],
    queryFn: async () => {
      const response = await personService.search('', 1, 100);
      return response.data?.filter((p) => p.status === 'pending') || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approvePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-persons'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: adminService.rejectPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-persons'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Moderation Queue</h1>

        {personsLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : pendingPersons && pendingPersons.length > 0 ? (
          <div className="space-y-4">
            {pendingPersons.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AdminCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {person.profileImageUrl ? (
                        <img
                          src={person.profileImageUrl}
                          alt={`${person.firstName} ${person.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary font-semibold">
                          {getInitials(person.firstName, person.lastName)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {person.firstName} {person.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {person.dateOfBirth && <span>Born: {person.dateOfBirth}</span>}
                          {person.familyName && <span>Family: {person.familyName}</span>}
                          <span>Added {formatRelativeDate(person.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(person.id)}
                        isLoading={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => rejectMutation.mutate(person.id)}
                        isLoading={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </AdminCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <AdminCard className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500">No pending items to moderate</p>
          </AdminCard>
        )}
      </motion.div>
    </div>
  );
}
