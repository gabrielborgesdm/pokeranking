import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { TK } from '../i18n/constants/translation-keys';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
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
import { withTransaction } from '../common/utils/transaction.util';
import * as crypto from 'crypto';
import ms from 'ms';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectConnection() private connection: Connection,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByUsernameOrEmail(identifier);

    if (!user) {
      this.logger.warn(`Login failed: user not found - ${identifier}`);
      return null;
    }

    const isPasswordValid = await this.usersService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password - ${identifier}`);
      return null;
    }

    if (!user.isActive) {
      this.logger.warn(`Login failed: email not verified - ${identifier}`);
      throw new UnauthorizedException({ key: TK.AUTH.EMAIL_NOT_VERIFIED });
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

    this.logger.log(`User logged in: ${user.username}`);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    registerDto: RegisterDto,
    requestedRole?: UserRole,
    lang?: string,
  ): Promise<RegisterResponseDto> {
    const emailVerificationRequired = this.configService.get<boolean>(
      'EMAIL_VERIFICATION_REQUIRED',
      true,
    );

    const result = await withTransaction(this.connection, async (session) => {
      // Check if an active user already exists with the same email
      const existingByEmail = await this.usersService.findByEmail(
        registerDto.email,
        { session },
      );
      if (existingByEmail?.isActive) {
        throw new ConflictException({
          key: TK.USERS.EMAIL_EXISTS,
        });
      }

      // Check if an active user already exists with the same username
      const existingByUsername = await this.usersService.findByUsername(
        registerDto.username,
        { session },
      );
      if (existingByUsername?.isActive) {
        throw new ConflictException({
          key: TK.USERS.USERNAME_EXISTS,
        });
      }

      // Remove any inactive users with the same email or username
      await this.usersService.deleteInactiveByEmailOrUsername(
        registerDto.email,
        registerDto.username,
        { session },
      );

      const userCount = await this.usersService.count({ session });

      // Use requested role if provided, otherwise default based on user count
      const role = requestedRole
        ? requestedRole
        : userCount === 0
          ? UserRole.Admin
          : UserRole.Member;

      const newUser = await this.usersService.create(
        { ...registerDto, role },
        { session },
      );

      newUser.isActive = !emailVerificationRequired;

      if (emailVerificationRequired) {
        await this.generateAndSendVerificationCode(
          newUser,
          lang,
          session ?? undefined,
        );
      } else {
        await newUser.save({ session });
      }

      return newUser;
    });

    this.logger.log(`New user registered: ${result.username}`);

    return {
      user: toDto(UserResponseDto, result),
    };
  }

  async verifyEmail(email: string, code: string): Promise<User> {
    return withTransaction(this.connection, async (session) => {
      const user = await this.usersService.findByEmailAndVerificationCode(
        email,
        code,
        { session },
      );

      if (!user) {
        throw new NotFoundException({ key: TK.AUTH.INVALID_VERIFICATION_CODE });
      }

      // Clear verification fields and activate user
      user.isActive = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ session });

      this.logger.log(`Email verified: ${user.username}`);

      return user;
    });
  }

  async forgotPassword(email: string, lang?: string): Promise<void> {
    await withTransaction(this.connection, async (session) => {
      const user = await this.usersService.findByEmail(email, { session });

      if (!user) {
        // To prevent user enumeration, we don't throw an error here
        return;
      }

      const token = this.generateToken();
      const tokenExpiration = Date.now() + ms('1h');

      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(tokenExpiration);

      await user.save({ session });

      // Send email within transaction - if it fails, token is rolled back
      await this.emailService.sendPasswordResetEmail(user, token, lang);

      this.logger.log(`Password reset requested: ${user.username}`);
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await withTransaction(this.connection, async (session) => {
      const user = await this.usersService.findByPasswordResetToken(token, {
        session,
      });

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

      await user.save({ session });

      this.logger.log(`Password reset completed: ${user.username}`);
    });
  }

  async resendVerificationCode(email: string, lang?: string): Promise<void> {
    await withTransaction(this.connection, async (session) => {
      const user = await this.usersService.findByEmail(email, { session });

      if (!user) {
        throw new NotFoundException({ key: TK.USERS.NOT_FOUND });
      }

      if (user.isActive) {
        throw new BadRequestException({ key: TK.AUTH.EMAIL_ALREADY_VERIFIED });
      }

      await this.generateAndSendVerificationCode(
        user,
        lang,
        session ?? undefined,
      );
    });
  }

  private async generateAndSendVerificationCode(
    user: User,
    lang?: string,
    session?: import('mongoose').ClientSession,
  ): Promise<void> {
    const code = this.generateVerificationCode();
    const tokenExpiration = Date.now() + ms('1d');

    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(tokenExpiration);
    await user.save({ session });

    await this.emailService.sendVerificationEmail(user, code, lang);
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
