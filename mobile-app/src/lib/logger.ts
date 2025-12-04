// Simple logger for React Native
// Replace console logging in production with a proper service

export const apiLogger = {
  info: (message: string, data?: object) => {
    if (__DEV__) {
      console.log(`[API INFO] ${message}`, data || "");
    }
  },
  error: (message: string, data?: object) => {
    if (__DEV__) {
      console.error(`[API ERROR] ${message}`, data || "");
    }
  },
  warn: (message: string, data?: object) => {
    if (__DEV__) {
      console.warn(`[API WARN] ${message}`, data || "");
    }
  },
};
