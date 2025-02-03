import React from 'react';
import OneSignal from 'react-native-onesignal';
import Constants from 'expo-constants';

const ONESIGNAL_APP_ID = Constants.expoConfig?.extra?.oneSignalAppId;

interface NotificationData {
  title: string;
  message: string;
  data?: Record<string, any>;
}

export function useNotifications() {
  React.useEffect(() => {
    // OneSignal Initialization
    OneSignal.setAppId(ONESIGNAL_APP_ID);
    
    // Prompt for push notifications
    OneSignal.promptForPushNotificationsWithUserResponse();

    // Handle notifications when app is in foreground
    OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
      const notification = notifReceivedEvent.getNotification();
      console.log("OneSignal: notification will show in foreground:", notification);
      notifReceivedEvent.complete(notification);
    });

    // Handle notification opened
    OneSignal.setNotificationOpenedHandler(openedEvent => {
      console.log("OneSignal: notification opened:", openedEvent);
    });
  }, []);

  const sendNotification = async ({ title, message, data }: NotificationData) => {
    try {
      const notification = {
        contents: { en: message },
        headings: { en: title },
        data,
        included_segments: ['Subscribed Users']
      };

      const response = await OneSignal.postNotification(notification);
      console.log('OneSignal Response:', response);
      return response;
    } catch (error) {
      console.error('OneSignal Error:', error);
      throw error;
    }
  };

  return { sendNotification };
} 