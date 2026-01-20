import { apiUrl } from './config';

/**
 * Wrapper around fetch that automatically uses the correct API base URL
 * Use this instead of fetch() directly for API calls
 */
export const apiFetch = (path: string, options?: RequestInit): Promise<Response> => {
  return fetch(apiUrl(path), {
    ...options,
    credentials: 'include', // Important for session cookies
  });
};
