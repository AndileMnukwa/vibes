
export interface PushSubscription {
  id: string;
  user_id: string;
  subscription: any;
  created_at: string;
  updated_at: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
}
