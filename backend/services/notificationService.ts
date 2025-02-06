import { SNS } from 'aws-sdk';

const sns = new SNS({
  region: process.env.AWS_REGION
});

export async function sendNotification(userId: string, message: string, type: string = 'general') {
  try {
    const params = {
      Message: JSON.stringify({
        userId,
        message,
        type,
        timestamp: new Date().toISOString()
      }),
      TopicArn: process.env.SNS_TOPIC_ARN
    };

    await sns.publish(params).promise();
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
} 