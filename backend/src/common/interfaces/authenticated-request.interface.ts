import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
