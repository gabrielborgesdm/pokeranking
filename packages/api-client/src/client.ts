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

export type CustomFetchOptions = RequestInit & {
  baseUrl?: string;
  token?: string;
};

/**
 * Custom fetch function for Orval
 * This is the mutator function that Orval will use for all API calls
 * Accepts optional baseUrl and token for server-side usage (e.g., NextAuth)
 * Falls back to module-level values when not provided
 */
export const customFetch = async <T>(
  url: string,
  options?: CustomFetchOptions,
): Promise<T> => {
  const { baseUrl, token, ...fetchOptions } = options ?? {};

  // Build full URL - use provided baseUrl or fall back to module-level
  const resolvedBaseUrl = baseUrl ?? baseURL;
  const fullUrl = url.startsWith('http') ? url : `${resolvedBaseUrl}${url}`;

  // Build headers
  const headers = new Headers(fetchOptions?.headers);

  // Set default content type if not set and we have a body
  if (fetchOptions?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token - use provided token or fall back to module-level
  const resolvedToken = token ?? authToken;
  if (resolvedToken) {
    headers.set('Authorization', `Bearer ${resolvedToken}`);
  }

  // Make the request
  const response = await fetch(fullUrl, {
    ...fetchOptions,
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
