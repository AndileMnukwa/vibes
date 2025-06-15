
import { supabase } from '@/integrations/supabase/client';
import type { PushSubscription as PushSubscriptionType } from './types';

export const savePushSubscription = async (userId: string, subscription: PushSubscriptionJSON): Promise<PushSubscriptionType> => {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: userId,
      subscription: subscription as any, // Cast to any to handle Json type
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deletePushSubscription = async (subscriptionId: string): Promise<void> => {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('id', subscriptionId);

  if (error) {
    throw error;
  }
};

export const getUserPushSubscription = async (userId: string): Promise<PushSubscriptionType | null> => {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking subscription:', error);
    return null;
  }

  return data;
};
