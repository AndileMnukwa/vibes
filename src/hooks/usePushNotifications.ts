
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { checkPushNotificationSupport } from './push-notifications/supportUtils';
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  createPushSubscription, 
  unsubscribeFromPush 
} from './push-notifications/serviceWorkerUtils';
import { 
  savePushSubscription, 
  deletePushSubscription, 
  getUserPushSubscription 
} from './push-notifications/databaseUtils';
import { sendTestNotification } from './push-notifications/notificationService';
import type { PushSubscription } from './push-notifications/types';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = checkPushNotificationSupport();
    setIsSupported(supported);
    
    if (!supported) {
      console.log('Push notifications are not supported in this browser');
    }
  }, []);

  // Check existing subscription
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user || !isSupported) return;

      try {
        const data = await getUserPushSubscription(user.id);
        if (data) {
          setSubscription(data);
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    };

    checkExistingSubscription();
  }, [user, isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user || !isSupported || isSubscribed) return;

    setIsLoading(true);
    
    try {
      // Register service worker
      const registration = await registerServiceWorker();
      
      // Request notification permission
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Push notifications permission was denied.',
          variant: 'destructive',
        });
        return;
      }

      // Create push subscription
      const pushSubscription = await createPushSubscription(registration);

      // Convert PushSubscriptionJSON to JSON and save to database
      const subscriptionJson = pushSubscription.toJSON();
      const data = await savePushSubscription(user.id, subscriptionJson);

      setSubscription(data);
      setIsSubscribed(true);
      
      toast({
        title: 'Subscribed!',
        description: 'You will now receive push notifications.',
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Failed to subscribe to push notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, isSubscribed, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user || !isSubscribed || !subscription) return;

    setIsLoading(true);

    try {
      // Remove from database
      await deletePushSubscription(subscription.id);

      // Unsubscribe from browser
      await unsubscribeFromPush();

      setSubscription(null);
      setIsSubscribed(false);
      
      toast({
        title: 'Unsubscribed',
        description: 'You will no longer receive push notifications.',
      });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: 'Unsubscribe Failed',
        description: 'Failed to unsubscribe from push notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isSubscribed, subscription, toast]);

  // Send test notification (for development)
  const sendTestNotificationHandler = useCallback(async () => {
    if (!isSubscribed || !subscription) return;

    try {
      await sendTestNotification(subscription.subscription, {
        title: 'Test Notification',
        body: 'This is a test push notification!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
      });

      toast({
        title: 'Test Sent',
        description: 'Test notification sent successfully!',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      });
    }
  }, [isSubscribed, subscription, toast]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscription,
    subscribe,
    unsubscribe,
    sendTestNotification: sendTestNotificationHandler,
  };
};
