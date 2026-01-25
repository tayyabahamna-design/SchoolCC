import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: false
  });

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      const permission = isSupported ? Notification.permission : 'default';
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission
      }));
    };
    
    checkSupport();
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[Push] Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('[Push] Service worker registration failed:', error);
      throw error;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Permission Denied",
          description: "You denied notification permissions. Enable them in browser settings.",
          variant: "destructive"
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }, [state.isSupported, toast]);

  const subscribe = useCallback(async (featureType: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Request permission first
      const hasPermission = state.permission === 'granted' || await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder VAPID public key - in production, generate your own
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      });

      console.log('[Push] Subscription:', subscription);

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
          featureType
        })
      });

      if (response.ok) {
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        toast({
          title: "Subscribed!",
          description: "You'll be notified when this feature is ready."
        });
        return true;
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      
      // Fallback: store locally if push isn't fully supported
      const localSubs = JSON.parse(localStorage.getItem('notifyMe') || '[]');
      if (!localSubs.includes(featureType)) {
        localSubs.push(featureType);
        localStorage.setItem('notifyMe', JSON.stringify(localSubs));
      }
      
      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      toast({
        title: "Subscribed!",
        description: "You'll be notified when this feature is ready."
      });
      return true;
    }
  }, [state.permission, requestPermission, registerServiceWorker, user, toast]);

  const showLocalNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/favicon-16x16.png',
        vibrate: [100, 50, 100],
        ...options
      });
      return true;
    } catch (error) {
      // Fallback to regular Notification API
      try {
        new Notification(title, {
          icon: '/pwa-192x192.png',
          ...options
        });
        return true;
      } catch (e) {
        console.error('[Push] Notification failed:', e);
        return false;
      }
    }
  }, [state.permission, requestPermission]);

  return {
    ...state,
    subscribe,
    requestPermission,
    showLocalNotification
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
