import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { getInitials } from '@/utils/helpers';

export default function MyProfile() {
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data);
        setMessage('Profile updated successfully!');
      }
    },
    onError: (error: Error) => {
      setMessage(error.message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: Error) => {
      setMessage(error.message);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {message && (
          <div className="bg-primary-light text-primary px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl font-bold text-white">
              {user && getInitials(user.firstName, user.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-surface rounded-full text-sm font-medium">
                {user?.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </form>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />
            <Button type="submit" isLoading={passwordMutation.isPending}>
              Change Password
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
