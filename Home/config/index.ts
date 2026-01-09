import Constants from 'expo-constants';

interface AppConfig {
    apiUrl: string;
    appName: string;
    isProduction: boolean;
}

// Determine if running in production
const isProduction = Constants.expoConfig?.extra?.ENV === 'production' ||
    process.env.NODE_ENV === 'production';

// Development configuration
const devConfig: AppConfig = {
    apiUrl: 'https://quickhomies.onrender.com/api', // Your local IP - change if network changes
    appName: 'QuickHomies',
    isProduction: false,
};

// Production configuration
const prodConfig: AppConfig = {
    apiUrl: 'https://quickhomies.onrender.com/api', // Render production API
    appName: 'QuickHomies',
    isProduction: true,
};

const config: AppConfig = isProduction ? prodConfig : devConfig;

// Log current environment (only in development)
if (!config.isProduction) {
    console.log('🔧 Running in DEVELOPMENT mode');
    console.log('📡 API URL:', config.apiUrl);
}

export default config;
