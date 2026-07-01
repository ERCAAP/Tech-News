import OneSignal from 'onesignal-node';

const client = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID!,
  process.env.ONESIGNAL_API_KEY!
);

interface NotificationData {
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function sendNotification({ title, message, data }: NotificationData) {
  try {
    const notification = {
      headings: { en: title },
      contents: { en: message },
      data,
      included_segments: ['Subscribed Users']
    };

    const response = await client.createNotification(notification);
    console.log('OneSignal notification sent:', response);
    return response;
  } catch (error) {
    console.error('OneSignal notification error:', error);
    throw error;
  }
} 