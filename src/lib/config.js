/**
 * config.js — Central place for all environment variables.
 * Import from here instead of reading process.env directly in components/lib files.
 *
 * All public (browser-visible) vars must be prefixed with NEXT_PUBLIC_ in .env.local
 */

const config = {
  // API
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api',

  // App
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Protine Web',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8888/api',

  // Razorpay
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',

  // Feature flags
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

export default config;
