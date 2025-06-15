
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Eye, EyeOff, MapPin } from 'lucide-react';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Layout from '@/components/layout/Layout';

const UserNotifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useUserNotifications();

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : !notification.read
  );

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.type === 'new_event' && notification.data?.event_id) {
      navigate(`/events/${notification.data.event_id}`);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'event_reminder':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'review_response':
        return <Bell className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationDetails = (notification: any) => {
    if (notification.type === 'new_event' && notification.data) {
      return {
        location: notification.data.location,
        date: notification.data.event_date,
      };
    }
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with the latest events and activities
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
                variant="outline"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Notifications
                <Badge variant="secondary">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                Unread
                <Badge variant="destructive">{unreadCount}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground text-center">
                      {filter === 'unread' 
                        ? "You're all caught up! No unread notifications." 
                        : "You don't have any notifications yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const details = getNotificationDetails(notification);
                    
                    return (
                      <Card 
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.read ? 'border-l-4 border-l-purple-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              
                              {details && (
                                <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
                                  {details.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{details.location}</span>
                                    </div>
                                  )}
                                  {details.date && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(details.date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default UserNotifications;
