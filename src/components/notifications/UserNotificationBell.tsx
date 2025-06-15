
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useUserNotifications } from '@/hooks/useUserNotifications';

export const UserNotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount } = useUserNotifications();

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={handleClick}
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
