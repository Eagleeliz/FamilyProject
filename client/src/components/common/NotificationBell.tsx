import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types';
import JoinRequestModal from './JoinRequestModal';

interface NotificationBellProps {
  onClose?: () => void;
}

export default function NotificationBell({ onClose }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom + 8);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);

    if (notification.type === 'join_request' && notification.relatedId) {
      setSelectedNotification(notification);
      setShowJoinModal(true);
    } else if (notification.type === 'member_approved' && notification.relatedId) {
      navigate(`/dashboard/family/${notification.relatedId}`);
      if (onClose) onClose();
    } else {
      if (onClose) onClose();
    }
  };

  const NotificationList = ({ notifications }: { notifications: Notification[] }) => (
    <div className="max-h-96 overflow-y-auto">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              !notification.isRead ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                {notification.type === 'join_request' && (
                  <p className="text-xs text-primary mt-1 font-medium">Tap to accept or reject</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-gray-500">No notifications yet</div>
      )}
    </div>
  );

  const DropdownHeader = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-800">Notifications</h3>
      {unreadCount?.data !== undefined && unreadCount.data > 0 && (
        <button
          onClick={() => markAllReadMutation.mutate()}
          className="text-sm text-primary hover:underline"
        >
          Mark all read
        </button>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount?.data !== undefined && unreadCount.data > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount.data > 9 ? '9+' : unreadCount.data}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile */}
          <div
            ref={dropdownRef}
            className="sm:hidden fixed left-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200"
            style={{ top: dropdownTop }}
          >
            <DropdownHeader />
            <NotificationList notifications={notifications?.data ?? []} />
          </div>

          {/* Desktop */}
          <div className="hidden sm:block absolute right-0 mt-2 w-80 z-50 bg-white rounded-lg shadow-lg border border-gray-200">
            <DropdownHeader />
            <NotificationList notifications={notifications?.data ?? []} />
          </div>
        </>
      )}

      {showJoinModal && selectedNotification && (
        <JoinRequestModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedNotification(null);
            if (onClose) onClose();
          }}
          familyId={selectedNotification.relatedId!}
          userId={selectedNotification.userId}
          userName={selectedNotification.message?.split(' ').slice(0, 2).join(' ')}
        />
      )}
    </div>
  );
}