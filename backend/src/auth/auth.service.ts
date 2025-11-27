import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto, currentUser?: any) {
    // Count total users in database
    const userCount = await this.usersService.count();

    let role = UserRole.Member; // Default role

    // Determine final role based on business rules
    if (userCount === 0) {
      // First user becomes admin automatically
      role = UserRole.Admin;
    } else if (currentUser && currentUser.role === UserRole.Admin) {
      // Authenticated admin can create users with requested role
      role = registerDto.role || UserRole.Member;
    }
    // Otherwise, role remains Member (ignore requested role)

    // Create user with determined role
    const user = await this.usersService.create({
      ...registerDto,
      role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user.toObject();

    // Return access token for the new user
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign({
        sub: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }),
    };
  }
}
