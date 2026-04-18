import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyService } from '@/services/family.service';
import Modal from './Modal';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  userId?: string;
  userName?: string;
  message?: string;
}

export default function JoinRequestModal({
  isOpen,
  onClose,
  familyId,
  userId,
  userName,
}: JoinRequestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => familyService.approveMember(familyId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsProcessing(false);
      onClose();
      navigate(`/dashboard/family/${familyId}`);
    },
    onError: () => setIsProcessing(false),
  });

  const rejectMutation = useMutation({
    mutationFn: () => familyService.rejectMember(familyId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsProcessing(false);
      onClose();
    },
    onError: () => setIsProcessing(false),
  });

  const handleApprove = () => {
    setIsProcessing(true);
    approveMutation.mutate();
  };

  const handleReject = () => {
    setIsProcessing(true);
    rejectMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Request"
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm sm:text-base">
          {userName ? (
            <>
              <span className="font-medium text-gray-800">{userName}</span> wants to join your family tree.
            </>
          ) : (
            'A user wants to join your family tree.'
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing || !userId}
            className="flex-1 order-2 sm:order-1 px-4 py-2.5 sm:py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isProcessing ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing || !userId}
            className="flex-1 order-1 sm:order-2 px-4 py-2.5 sm:py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      </div>
    </Modal>
  );
}