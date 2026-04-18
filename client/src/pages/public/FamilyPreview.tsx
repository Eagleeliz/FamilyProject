import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { familyService } from '@/services/family.service';
import { personService } from '@/services/person.service';
import { useAuthStore } from '@/store/auth.store';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import type { TreeNode } from '@/types';
import { getInitials } from '@/utils/helpers';

export default function FamilyPreview() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [joinRequested, setJoinRequested] = useState(false);

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

  const joinMutation = useMutation({
    mutationFn: () => familyService.joinRequest(id!),
    onSuccess: () => {
      setJoinRequested(true);
    },
  });

  if (familyLoading || treeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading family tree...</div>
      </div>
    );
  }

  if (!family?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Family Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderNode = (node: TreeNode, depth = 0) => {
    if (!node) return null;

    return (
      <motion.div
        key={node.person.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.1 }}
        className="flex flex-col items-center"
      >
        <div className="bg-white border-2 border-primary rounded-xl p-4 shadow-sm min-w-[200px]">
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
          <h3 className="font-semibold text-center">
            {node.person.firstName} {node.person.lastName}
          </h3>
          {node.person.dateOfBirth && (
            <p className="text-sm text-gray-500 text-center">
              {new Date(node.person.dateOfBirth).getFullYear()}
              {node.person.dateOfDeath && ` - ${new Date(node.person.dateOfDeath).getFullYear()}`}
            </p>
          )}
        </div>

        {node.spouse && (
          <>
            <div className="text-gray-400 my-2">♥</div>
            <div className="bg-white border border-border rounded-xl p-4 shadow-sm min-w-[200px]">
              {node.spouse.profileImageUrl ? (
                <img
                  src={node.spouse.profileImageUrl}
                  alt={`${node.spouse.firstName} ${node.spouse.lastName}`}
                  className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-surface rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-gray-600">
                  {getInitials(node.spouse.firstName, node.spouse.lastName)}
                </div>
              )}
              <h3 className="font-semibold text-center">
                {node.spouse.firstName} {node.spouse.lastName}
              </h3>
              <p className="text-xs text-gray-500 text-center">Spouse</p>
            </div>
          </>
        )}

        {node.children.length > 0 && (
          <div className="mt-8 flex gap-4">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{family.data.name}</h1>
          {family.data.description && (
            <p className="text-gray-600">{family.data.description}</p>
          )}
          {family.data.memberCount !== undefined && (
            <p className="text-sm text-gray-500 mt-2">
              {family.data.memberCount} members
            </p>
          )}
        </div>

        {treeData?.data && treeData.data.length > 0 ? (
          <div className="flex justify-center overflow-x-auto pb-8">
            <div className="flex flex-col items-center">
              {treeData.data.map((rootNode) => renderNode(rootNode))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No family members to display yet.</p>
          </Card>
        )}

        <div className="mt-12 text-center">
          {user ? (
            joinRequested ? (
              <p className="text-green-600 font-medium">Join request submitted!</p>
            ) : (
              <Button 
                onClick={() => joinMutation.mutate()} 
                isLoading={joinMutation.isPending}
              >
                Request to Join
              </Button>
            )
          ) : (
            <Link to="/login">
              <Button>Login to Join</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
