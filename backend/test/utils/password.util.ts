import * as bcrypt from 'bcrypt';

/**
 * Hash a password for use in tests
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
