/**
 * Public Client-Side Environment Configuration
 * Sensitive credentials (Gemini API keys, DB passwords, Payment secrets) are strictly backend-only.
 */
export const ENV = {
  APP_NAME: 'Nexgile-TravAI',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  IS_DEV: import.meta.env.DEV,
  DEFAULT_LOCALE: 'en-IN',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_CURRENCY_SYMBOL: '₹',
  DEFAULT_TIMEZONE: 'Asia/Kolkata',
  DEFAULT_TIMEZONE_LABEL: 'India Standard Time (IST)',
  TIMEOUT_MS: 15000,
};
