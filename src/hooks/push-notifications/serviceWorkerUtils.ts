
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  return await navigator.serviceWorker.register('/sw.js');
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  return await Notification.requestPermission();
};

export const createPushSubscription = async (registration: ServiceWorkerRegistration): Promise<PushSubscription> => {
  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'your-vapid-public-key', // Replace with actual VAPID key
  });
};

export const unsubscribeFromPush = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    const pushSubscription = await registration.pushManager.getSubscription();
    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
};
