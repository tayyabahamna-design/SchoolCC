import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taleemabad.taleemhub',
  appName: 'TaleemHub',
  webDir: 'dist/public',
  server: {
    // This allows your app to make requests to your backend
    androidScheme: 'https',
    // For production, your API calls will go to your Replit server
    cleartext: true
  },
  android: {
    // Allow network requests to your backend
    allowMixedContent: true
  }
};

export default config;
