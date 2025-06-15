
export const checkPushNotificationSupport = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};
