import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Bell, Eye, EyeOff, Star } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useAdminNotifications();

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'new_review' && notification.data?.review_id) {
      navigate(`/admin/reviews?reviewId=${notification.data.review_id}`);
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  if (isLoading) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notification.type === 'new_review' && (
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                      <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-sm text-muted-foreground"
              onClick={() => {
                navigate('/admin/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
