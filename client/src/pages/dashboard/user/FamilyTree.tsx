import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyService } from '@/services/family.service';
import { personService } from '@/services/person.service';
import { relationshipService } from '@/services/relationship.service';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { getInitials, formatDate } from '@/utils/helpers';
import type { TreeNode, Person } from '@/types';

export default function FamilyTree() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRelModal, setShowRelModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(searchParams.get('tab') === 'pending');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newPerson, setNewPerson] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    dateOfDeath: '',
  });

  const [newRelation, setNewRelation] = useState({
    relatedPersonId: '',
    relationshipType: 'parent' as 'parent' | 'child' | 'sibling' | 'spouse',
  });

  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ['family', id],
    queryFn: () => familyService.getById(id!),
    enabled: !!id,
  });

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ['tree', id],
    queryFn: () => personService.getFamilyTree(id!),
    enabled: !!id,
  });

  const { data: pendingMembers } = useQuery({
    queryKey: ['pending-members', id],
    queryFn: () => familyService.getPendingMembers(id!),
    enabled: !!id && showPendingModal,
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      setProcessingUserId(userId);
      await familyService.approveMember(id!, userId);
    },
    onSuccess: (_data, userId) => {
      const member = pendingMembers?.data?.find(m => m.userId === userId);
      setSuccessMessage(`${member?.firstName} ${member?.lastName} has been approved!`);
      queryClient.invalidateQueries({ queryKey: ['pending-members', id] });
      queryClient.invalidateQueries({ queryKey: ['family', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setProcessingUserId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: () => {
      setProcessingUserId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      setProcessingUserId(userId);
      await familyService.rejectMember(id!, userId);
    },
    onSuccess: (_data, userId) => {
      const member = pendingMembers?.data?.find(m => m.userId === userId);
      setSuccessMessage(`${member?.firstName} ${member?.lastName}'s request has been rejected.`);
      queryClient.invalidateQueries({ queryKey: ['pending-members', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setProcessingUserId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: () => {
      setProcessingUserId(null);
    },
  });

  const allPersons = useMemo(() => {
    if (!treeData?.data) return [];
    const persons: Person[] = [];
    const collectPersons = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        persons.push(node.person);
        if (node.spouse) persons.push(node.spouse);
        persons.push(...node.siblings);
        collectPersons(node.children);
        collectPersons(node.parents);
      }
    };
    collectPersons(treeData.data);
    return [...new Map(persons.map((p) => [p.id, p])).values()];
  }, [treeData]);

  const addPersonMutation = useMutation({
    mutationFn: personService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree', id] });
      queryClient.invalidateQueries({ queryKey: ['family', id] });
      setShowAddModal(false);
      setNewPerson({ firstName: '', lastName: '', dateOfBirth: '', dateOfDeath: '' });
    },
  });

  const addRelationMutation = useMutation({
    mutationFn: relationshipService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree', id] });
      setShowRelModal(false);
      setSelectedPerson(null);
      setNewRelation({ relatedPersonId: '', relationshipType: 'parent' });
    },
  });

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    addPersonMutation.mutate({
      ...newPerson,
      familyId: id!,
    });
  };

  const handleAddRelation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    addRelationMutation.mutate({
      personId: selectedPerson.id,
      ...newRelation,
    });
  };

  const openRelModal = (person: Person) => {
    setSelectedPerson(person);
    setShowRelModal(true);
  };

  if (familyLoading || treeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading family tree...</div>
      </div>
    );
  }

  const renderNode = (node: TreeNode, depth = 0) => {
    return (
      <motion.div
        key={node.person.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <div
          className="bg-white border-2 border-primary rounded-xl p-4 shadow-sm min-w-[180px] cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/dashboard/person/${node.person.id}/relatives`)}
        >
          {node.person.profileImageUrl ? (
            <img
              src={node.person.profileImageUrl}
              alt={`${node.person.firstName} ${node.person.lastName}`}
              className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-light rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-primary">
              {getInitials(node.person.firstName, node.person.lastName)}
            </div>
          )}
          <h3 className="font-semibold text-center text-sm">
            {node.person.firstName} {node.person.lastName}
          </h3>
          {node.person.dateOfBirth && (
            <p className="text-xs text-gray-500 text-center">
              {formatDate(node.person.dateOfBirth)?.split(' ')[0]}
            </p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openRelModal(node.person);
            }}
            className="mt-2 text-xs text-primary hover:underline"
          >
            + Add Relationship
          </button>
        </div>

        <AnimatePresence>
          {(node.spouse || node.siblings.length > 0 || node.children.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex gap-2 items-center text-gray-400">
                {node.spouse && (
                  <>
                    <div className="text-red-400">♥</div>
                    <div className="bg-white border rounded-xl p-3 shadow-sm min-w-[120px]">
                      {node.spouse.profileImageUrl ? (
                        <img
                          src={node.spouse.profileImageUrl}
                          alt={`${node.spouse.firstName} ${node.spouse.lastName}`}
                          className="w-10 h-10 rounded-full mx-auto mb-1 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-surface rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-bold text-gray-600">
                          {getInitials(node.spouse.firstName, node.spouse.lastName)}
                        </div>
                      )}
                      <p className="text-xs text-center font-medium">
                        {node.spouse.firstName}
                      </p>
                      <p className="text-xs text-center text-gray-400">Spouse</p>
                    </div>
                  </>
                )}
              </div>

              {node.children.length > 0 && (
                <>
                  <div className="w-0.5 h-6 bg-border mx-auto my-2" />
                  <div className="flex gap-4">
                    {node.children.map((child) => renderNode(child, depth + 1))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-1">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">{family?.data?.name}</h1>
            {family?.data?.description && (
              <p className="text-gray-600">{family.data.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowPendingModal(true)}>
              Pending Requests
            </Button>
            <Button onClick={() => setShowAddModal(true)}>+ Add Member</Button>
          </div>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-max flex justify-center">
            {treeData?.data && treeData.data.length > 0 ? (
              <div className="flex flex-col items-center gap-8">
                {treeData.data.map((rootNode) => renderNode(rootNode))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">No family members yet.</p>
                <Button onClick={() => setShowAddModal(true)}>Add First Member</Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Family Member"
      >
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newPerson.firstName}
              onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={newPerson.lastName}
              onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            label="Date of Birth"
            type="date"
            value={newPerson.dateOfBirth}
            onChange={(e) => setNewPerson({ ...newPerson, dateOfBirth: e.target.value })}
          />
          <Input
            label="Date of Death (if applicable)"
            type="date"
            value={newPerson.dateOfDeath}
            onChange={(e) => setNewPerson({ ...newPerson, dateOfDeath: e.target.value })}
          />
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addPersonMutation.isPending}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showRelModal}
        onClose={() => setShowRelModal(false)}
        title="Add Relationship"
      >
        <form onSubmit={handleAddRelation} className="space-y-4">
          {selectedPerson && (
            <div className="bg-surface p-4 rounded-lg">
              <p className="text-sm text-gray-500">Adding relationship for:</p>
              <p className="font-semibold">
                {selectedPerson.firstName} {selectedPerson.lastName}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              value={newRelation.relationshipType}
              onChange={(e) =>
                setNewRelation({
                  ...newRelation,
                  relationshipType: e.target.value as 'parent' | 'child' | 'sibling' | 'spouse',
                })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-primary"
            >
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="spouse">Spouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person
            </label>
            <select
              value={newRelation.relatedPersonId}
              onChange={(e) =>
                setNewRelation({ ...newRelation, relatedPersonId: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-primary"
              required
            >
              <option value="">Select a person...</option>
              {allPersons
                .filter((p) => p.id !== selectedPerson?.id)
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" type="button" onClick={() => setShowRelModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addRelationMutation.isPending}>
              Add Relationship
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPendingModal}
        onClose={() => {
          setShowPendingModal(false);
          navigate('.', { replace: true });
        }}
        title="Pending Join Requests"
      >
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {pendingMembers?.data && pendingMembers.data.length > 0 ? (
          <div className="space-y-4">
            {pendingMembers.data.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <p className="font-medium">{member.firstName} {member.lastName}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => rejectMutation.mutate(member.userId)}
                    isLoading={processingUserId === member.userId && rejectMutation.isPending}
                    disabled={processingUserId !== null}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(member.userId)}
                    isLoading={processingUserId === member.userId && approveMutation.isPending}
                    disabled={processingUserId !== null}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No pending join requests</p>
        )}
      </Modal>
    </div>
  );
}
