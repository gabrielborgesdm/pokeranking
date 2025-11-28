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

  async register(registerDto: RegisterDto) {
    // Count total users in database
    const userCount = await this.usersService.count();

    // First user becomes admin, all others become members
    const role = userCount === 0 ? UserRole.Admin : UserRole.Member;

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

  async registerAdmin(registerDto: RegisterDto) {
    // Always create admin users via this endpoint
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.Admin,
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
