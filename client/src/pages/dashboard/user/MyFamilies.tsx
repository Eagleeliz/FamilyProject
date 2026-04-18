import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyService } from '@/services/family.service';
import { useAuthStore } from '@/store/auth.store';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import PaymentModal from '@/components/common/PaymentModal';

export default function MyFamilies() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFamilyForPayment, setSelectedFamilyForPayment] = useState<{ id: string; name: string } | null>(null);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDesc, setNewFamilyDesc] = useState('');
  const [newRootName, setNewRootName] = useState('');
  const [joinFamilyId, setJoinFamilyId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: familyService.getAll,
  });

  const { data: allFamilies } = useQuery({
    queryKey: ['families', 'public'],
    queryFn: () => familyService.getPublic(),
  });

  const createMutation = useMutation({
    mutationFn: familyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setShowCreateModal(false);
      setNewFamilyName('');
      setNewFamilyDesc('');
      setNewRootName('');
    },
  });

  const joinMutation = useMutation({
    mutationFn: familyService.joinRequest,
    onSuccess: () => {
      setShowJoinModal(false);
      setJoinFamilyId('');
      alert('Join request submitted! An admin will review it.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: newFamilyName,
      description: newFamilyDesc || undefined,
      rootPersonName: newRootName || undefined,
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    joinMutation.mutate(joinFamilyId);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold">My Families</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
            Join Family
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>Create Family</Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading families...</div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((family, index) => (
            <motion.div
              key={family.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-6 h-full"
                onClick={() => navigate(`/dashboard/family/${family.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 4-2 8-4 8-8 0-4-4-8-8-8z" />
                    </svg>
                  </div>
                  {family.status === 'pending' && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                      Pending
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-2">{family.name}</h3>
                {family.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{family.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{family.memberCount || 0} members</span>
                  {family.rootPerson && (
                    <span>
                      Root: {family.rootPerson.firstName} {family.rootPerson.lastName}
                    </span>
                  )}
                </div>

                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFamilyForPayment({ id: family.id, name: family.name });
                    setShowPaymentModal(true);
                  }}
                >
                  Make Payment
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No families yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first family tree or join an existing one
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
              Join Family
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>Create Family</Button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Family"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Family Name"
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            placeholder="e.g., The Smith Family"
            required
          />
          <Input
            label="Description (optional)"
            value={newFamilyDesc}
            onChange={(e) => setNewFamilyDesc(e.target.value)}
            placeholder="A brief description"
          />
          <Input
            label="Root Person Name (optional)"
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            placeholder="e.g., John Smith"
          />
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSearchTerm('');
        }}
        title="Join Family"
      >
        <div className="space-y-4">
          <Input
            label="Search Families"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search family names..."
          />
          
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {allFamilies?.data ? (
              allFamilies.data
                .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(family => (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() => setJoinFamilyId(family.id)}
                    className={`w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                      joinFamilyId === family.id ? 'bg-primary-light' : ''
                    }`}
                  >
                    <div className="font-medium">{family.name}</div>
                    {family.description && (
                      <div className="text-sm text-gray-500 truncate">{family.description}</div>
                    )}
                  </button>
                ))
            ) : (
              <div className="p-4 text-gray-500 text-center">No families available</div>
            )}
          </div>

          {joinFamilyId && (
            <p className="text-sm text-green-600">Selected: {allFamilies?.data?.find(f => f.id === joinFamilyId)?.name}</p>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" type="button" onClick={() => setShowJoinModal(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => joinMutation.mutate(joinFamilyId)}
              isLoading={joinMutation.isPending}
              disabled={!joinFamilyId}
            >
              Request to Join
            </Button>
          </div>
        </div>
      </Modal>

      {selectedFamilyForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFamilyForPayment(null);
          }}
          familyId={selectedFamilyForPayment.id}
          familyName={selectedFamilyForPayment.name}
        />
      )}
    </div>
  );
}
