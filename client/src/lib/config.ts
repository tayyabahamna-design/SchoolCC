import { Capacitor } from '@capacitor/core';

/**
 * Get the API base URL based on the platform
 * - In web mode: uses relative URLs (same origin)
 * - In native mobile: points to your production server
 */
export const getApiBaseUrl = (): string => {
  // Check if running in native mobile app
  if (Capacitor.isNativePlatform()) {
    // Production server URL
    return 'https://taleemhub-rawalpindi.replit.app';
  }

  // For web, use relative URLs (works with your current setup)
  return '';
};

/**
 * Helper to build full API URLs
 */
export const apiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
