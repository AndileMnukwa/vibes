
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushSubscription {
  id: string;
  user_id: string;
  subscription: any;
  created_at: string;
  updated_at: string;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (!supported) {
        console.log('Push notifications are not supported in this browser');
      }
    };

    checkSupport();
  }, []);

  // Check existing subscription
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user || !isSupported) return;

      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking subscription:', error);
          return;
        }

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
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Push notifications permission was denied.',
          variant: 'destructive',
        });
        return;
      }

      // Create push subscription
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Save subscription to database
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          subscription: pushSubscription.toJSON(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

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
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscription.id);

      if (error) {
        throw error;
      }

      // Unsubscribe from browser
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const pushSubscription = await registration.pushManager.getSubscription();
        if (pushSubscription) {
          await pushSubscription.unsubscribe();
        }
      }

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
  const sendTestNotification = useCallback(async () => {
    if (!isSubscribed || !subscription) return;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          subscription: subscription.subscription,
          payload: {
            title: 'Test Notification',
            body: 'This is a test push notification!',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
        },
      });

      if (error) {
        throw error;
      }

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
    sendTestNotification,
  };
};
