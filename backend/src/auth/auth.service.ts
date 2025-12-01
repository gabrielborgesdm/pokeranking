import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { User } from '../users/schemas/user.schema';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { toDto } from '../common/utils/transform.util';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
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

    return user;
  }

  login(user: AuthenticatedUser): LoginResponseDto {
    const payload: JwtPayload = {
      sub: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Count total users in database
    const userCount = await this.usersService.count();

    // First user becomes admin, all others become members
    const role = userCount === 0 ? UserRole.Admin : UserRole.Member;

    // Create user with determined role
    const user = await this.usersService.create({
      ...registerDto,
      role,
    });

    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Return access token for the new user
    return {
      user: toDto(UserResponseDto, user) as UserResponseDto,
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerAdmin(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Always create admin users via this endpoint
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.Admin,
    });

    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Return access token for the new user
    return {
      user: toDto(UserResponseDto, user) as UserResponseDto,
      access_token: this.jwtService.sign(payload),
    };
  }
}
