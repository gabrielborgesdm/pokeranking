import { UserRole } from '../../src/common/enums/user-role.enum';

export interface UserFixtureData {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  profilePic?: string;
  pokemon?: string[];
  isActive?: boolean;
}

/**
 * Pre-defined admin user for testing
 */
export const ADMIN_USER: UserFixtureData = {
  email: 'admin@test.com',
  username: 'admin_user',
  password: 'admin123456',
  role: UserRole.Admin,
  isActive: true,
};

/**
 * Pre-defined regular user for testing
 */
export const REGULAR_USER: UserFixtureData = {
  email: 'user@test.com',
  username: 'regular_user',
  password: 'user123456',
  role: UserRole.Member,
  isActive: true,
};

/**
 * Another regular user for multi-user scenarios
 */
export const ANOTHER_USER: UserFixtureData = {
  email: 'another@test.com',
  username: 'another_user',
  password: 'another123456',
  role: UserRole.Member,
  isActive: true,
};

/**
 * Factory function for creating custom user data
 * @param overrides - Partial user data to override defaults
 */
export function createUserData(
  overrides: Partial<UserFixtureData> = {},
): UserFixtureData {
  return {
    email: overrides.email || 'test@test.com',
    username: overrides.username || 'test_user',
    password: overrides.password || 'test123456',
    role: overrides.role || UserRole.Member,
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    ...overrides,
  };
}
