export default {
  expo: {
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          sounds: ['./assets/notification-sound.wav']
        }
      ]
    ],
    extra: {
      oneSignalAppId: process.env.ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID',
    },
  },
}; 