import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useMutation } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  familyName: string;
}

export default function PaymentModal({ isOpen, onClose, familyId, familyName }: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const paymentMutation = useMutation({
    mutationFn: () => paymentService.initiateSTKPush({
      phoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(1)}`,
      amount: Number(amount),
      familyId,
      accountReference: familyName,
    }),
    onSuccess: (data) => {
      if (data?.data?.ResponseCode === '0') {
        setSuccess('STK push sent to your phone. Please enter your M-Pesa PIN to complete payment.');
        setError('');
        setTimeout(() => {
          onClose();
          setSuccess('');
          setPhoneNumber('');
          setAmount('');
        }, 5000);
      } else {
        const errorMsg = data?.data?.CustomerMessage || data?.data?.ResponseDescription || data?.message || 'Payment failed. Please try again.';
        setError(errorMsg);
      }
    },
    onError: (err: Error) => {
      setError(err.message || 'Payment failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!phoneNumber || !amount) {
      setError('Please fill in all fields');
      return;
    }
    
    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    paymentMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Make Payment - ${familyName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Enter amount and phone number to receive STK push for payment.
        </p>
        
        <Input
          label="Phone Number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., 0712345678"
          required
        />
        
        <Input
          label="Amount (KES)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={paymentMutation.isPending}>
            Pay Now
          </Button>
        </div>
      </form>
    </Modal>
  );
}