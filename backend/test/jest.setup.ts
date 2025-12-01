import { getInMemoryRedis } from './mocks/in-memory-redis';

/**
 * Mock @upstash/redis to use in-memory implementation for tests
 */
jest.mock('@upstash/redis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => {
      return getInMemoryRedis();
    }),
  };
});

/**
 * Mock Resend client to avoid actual email sending in tests
 */
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
        },
      };
    }),
  };
});
