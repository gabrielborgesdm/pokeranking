// Default base URL - can be overridden
let baseURL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:3000';

// Token storage
let authToken: string | null = null;

/**
 * Set the authentication token for API requests
 */
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

/**
 * Get the current authentication token
 */
export const getAuthToken = () => authToken;

/**
 * Configure the base URL for the API client
 */
export const setBaseURL = (url: string) => {
  baseURL = url;
};

/**
 * Get the current base URL
 */
export const getBaseURL = () => baseURL;

/**
 * API Error response type
 */
export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
  key?: string; // i18n translation key from backend
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: ApiErrorResponse,
  ) {
    super(Array.isArray(data.message) ? data.message.join(', ') : data.message);
    this.name = 'ApiError';
  }
}

/**
 * Check if an error is an API error
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * Custom fetch function for Orval
 * This is the mutator function that Orval will use for all API calls
 * Signature: customFetch(url, options) to match Orval's fetch client
 */
export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  // Build headers
  const headers = new Headers(options?.headers);

  // Set default content type if not set and we have a body
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token if available
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  // Make the request
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle response
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        statusCode: response.status,
        message: response.statusText || 'An error occurred',
      };
    }
    throw new ApiError(response.status, errorData);
  }

  // Handle empty responses (204 No Content, etc.)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { data: undefined, status: response.status, headers: response.headers } as T;
  }

  const text = await response.text();
  if (!text) {
    return { data: undefined, status: response.status, headers: response.headers } as T;
  }

  const data = JSON.parse(text);
  return { data, status: response.status, headers: response.headers } as T;
};

export default customFetch;
