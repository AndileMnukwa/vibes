
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for service worker and notification support
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Register service worker
  const registerServiceWorker = async () => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Permission Granted",
          description: "You'll now receive push notifications",
        });
        return true;
      } else {
        toast({
          title: "Permission Denied",
          description: "Push notifications have been disabled",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribe = async () => {
    if (!user || permission !== 'granted') return;

    setIsLoading(true);
    try {
      const registration = await registerServiceWorker();
      if (!registration) throw new Error('Service worker registration failed');

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY, // You'd need to set this
      });

      const subscriptionData: PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
        },
      };

      // Use raw SQL since the types haven't been regenerated yet
      const { error } = await supabase.rpc('exec', {
        sql: `
          INSERT INTO push_subscriptions (user_id, subscription, created_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id) DO UPDATE SET
            subscription = $2,
            updated_at = NOW()
        `,
        args: [user.id, JSON.stringify(subscriptionData)]
      });

      if (error) throw error;

      setSubscription(subscriptionData);
      toast({
        title: "Subscribed",
        description: "You're now subscribed to push notifications",
      });
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to subscribe to push notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }

      // Use raw SQL since the types haven't been regenerated yet
      const { error } = await supabase.rpc('exec', {
        sql: 'DELETE FROM push_subscriptions WHERE user_id = $1',
        args: [user.id]
      });

      if (error) throw error;

      setSubscription(null);
      toast({
        title: "Unsubscribed",
        description: "You've been unsubscribed from push notifications",
      });
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to unsubscribe from push notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send a test notification
  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from VibeCatcher!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};
