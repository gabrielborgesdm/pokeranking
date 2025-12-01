import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
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

    if (!user.isActive) {
      throw new UnauthorizedException('Please verify your email to login.');
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

  async register(
    registerDto: RegisterDto,
    requestedRole?: UserRole,
  ): Promise<RegisterResponseDto> {
    const userCount = await this.usersService.count();

    const emailVerificationRequired = this.configService.get<boolean>(
      'EMAIL_VERIFICATION_REQUIRED',

      true,
    );

    // Use requested role if provided, otherwise default based on user count
    const role = requestedRole
      ? requestedRole
      : userCount === 0
        ? UserRole.Admin
        : UserRole.Member;

    const user = await this.usersService.create({
      ...registerDto,

      role,
    });

    user.isActive = !emailVerificationRequired; // Set isActive after user creation

    if (emailVerificationRequired) {
      const code = this.generateVerificationCode();

      const tokenExpiration = Date.now() + ms('1d');

      user.emailVerificationCode = code;

      user.emailVerificationExpires = new Date(tokenExpiration);

      await this.emailService.sendVerificationEmail(user, code);
    }

    await user.save(); // Save after setting isActive and potentially email verification token/expires

    return {
      user: toDto(UserResponseDto, user),
    };
  }

  async verifyEmail(email: string, code: string): Promise<User> {
    const user = await this.usersService.findByEmailAndVerificationCode(
      email,
      code,
    );

    if (!user) {
      throw new NotFoundException('Invalid verification code or email.');
    }

    // Clear verification fields and activate user
    user.isActive = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // To prevent user enumeration, we don't throw an error here

      return;
    }

    const token = this.generateToken();

    const tokenExpiration = Date.now() + ms('1h');

    user.passwordResetToken = token;

    user.passwordResetExpires = new Date(tokenExpiration);

    await user.save();

    await this.emailService.sendPasswordResetEmail(user, token);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      return; // To prevent user enumeration, we don't throw an error here
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return; // To prevent user enumeration, we don't throw an error here
    }

    // Hash the new password before saving
    const hashedPassword = await this.usersService.hashPassword(password);
    user.password = hashedPassword;

    user.passwordResetToken = undefined;

    user.passwordResetExpires = undefined;

    await user.save();
  }

  async resendVerificationCode(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isActive) {
      throw new BadRequestException('Email is already verified.');
    }

    // Generate new code
    const code = this.generateVerificationCode();
    const tokenExpiration = Date.now() + ms('1d');

    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(tokenExpiration);
    await user.save();

    await this.emailService.sendVerificationEmail(user, code);
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateVerificationCode(): string {
    // Generate cryptographically secure 6-digit code
    // Range: 100000-999999 (avoids leading zeros naturally)
    const randomNum = crypto.randomInt(100000, 1000000);
    return randomNum.toString();
  }
}
