import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { toDto } from '../common/utils/transform.util';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @RateLimit()
  // LocalAuthGuard validates username/password and attaches user to request
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @Public()
  @RateLimit()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('accept-language') lang?: string,
  ) {
    const result = await this.authService.register(
      registerDto,
      undefined,
      lang,
    );

    return {
      user: toDto(UserResponseDto, result.user),
    };
  }

  @Post('register-admin')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new admin user (admin only)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Admin user registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerAdmin(
    @Body() registerDto: RegisterDto,
    @Headers('accept-language') lang?: string,
  ) {
    const result = await this.authService.register(
      registerDto,
      UserRole.Admin,
      lang,
    );

    return {
      user: toDto(UserResponseDto, result.user),
    };
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOneWithProfile(req.user._id);
    return toDto(UserResponseDto, user);
  }

  @Public()
  @RateLimit()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with 6-digit code' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid verification code or email',
  })
  @ApiResponse({ status: 429, description: 'Too many verification attempts' })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponseDto> {
    const user = await this.authService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.code,
    );

    const { access_token } = this.authService.login({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Email verified successfully',
      user: toDto(UserResponseDto, user),
      access_token,
    };
  }

  @Public()
  @RateLimit()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Email is already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many resend attempts' })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
    @Headers('accept-language') lang: string | undefined,
  ): Promise<{ message: string }> {
    await this.authService.resendVerificationCode(
      resendVerificationDto.email,
      lang,
    );

    return {
      message: 'Verification code sent successfully',
    };
  }

  @Public()
  @RateLimit()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if user exists',
  })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Headers('accept-language') lang?: string,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto.email, lang);

    // Always return success to prevent user enumeration
    return {
      message:
        'If an account exists with this email, you will receive a password reset link.',
    };
  }

  @Public()
  @RateLimit()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );

    return {
      message: 'Password reset successfully',
    };
  }
}
