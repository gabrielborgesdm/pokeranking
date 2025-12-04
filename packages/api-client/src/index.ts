// Re-export client configuration utilities
export {
  setAuthToken,
  getAuthToken,
  setBaseURL,
  getBaseURL,
  setLanguage,
  getLanguage,
  customFetch,
  isApiError,
  ApiError,
  type ApiErrorResponse,
  type CustomFetchOptions,
} from './client';

// Re-export all generated types
export * from '../generated/model';

// Re-export all endpoint hooks by tag
export * from '../generated/endpoints/auth/auth';
export * from '../generated/endpoints/users/users';
export * from '../generated/endpoints/pokemon/pokemon';
export * from '../generated/endpoints/boxes/boxes';
export * from '../generated/endpoints/rankings/rankings';
export * from '../generated/endpoints/support/support';
export * from '../generated/endpoints/upload/upload';
