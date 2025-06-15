
import { supabase } from '@/integrations/supabase/client';
import type { PushNotificationPayload } from './types';

export const sendTestNotification = async (
  subscription: any,
  payload: PushNotificationPayload
): Promise<void> => {
  const { error } = await supabase.functions.invoke('send-push-notification', {
    body: {
      subscription,
      payload,
    },
  });

  if (error) {
    throw error;
  }
};
