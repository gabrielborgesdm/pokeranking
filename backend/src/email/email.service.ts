import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { User } from '../users/schemas/user.schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly emailVerificationRequired: boolean;
  private readonly verifyEmailTemplate: HandlebarsTemplateDelegate;
  private readonly resetPasswordTemplate: HandlebarsTemplateDelegate;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);

    this.fromEmail = this.configService.getOrThrow<string>('RESEND_FROM_EMAIL');
    this.frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    this.emailVerificationRequired = this.configService.get<boolean>(
      'EMAIL_VERIFICATION_REQUIRED',
      true,
    );

    // Load and compile templates
    const templatesDir = join(__dirname, 'templates');
    const verifyEmailHtml = readFileSync(
      join(templatesDir, 'verify-email.hbs'),
      'utf-8',
    );
    const resetPasswordHtml = readFileSync(
      join(templatesDir, 'reset-password.hbs'),
      'utf-8',
    );

    this.verifyEmailTemplate = Handlebars.compile(verifyEmailHtml);
    this.resetPasswordTemplate = Handlebars.compile(resetPasswordHtml);
  }

  async sendVerificationEmail(user: User, code: string): Promise<boolean> {
    if (!this.emailVerificationRequired) {
      this.logger.debug(
        'Email verification is disabled, skipping verification email',
      );
      return true;
    }

    try {
      const verificationUrl = `${this.frontendUrl}/verify-email?email=${encodeURIComponent(user.email)}&code=${code}`;

      const html = this.verifyEmailTemplate({
        name: user.username,
        email: user.email,
        code,
        verificationUrl,
        year: new Date().getFullYear(),
      });

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: 'Verify your email address',
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.debug(
        `Verification email sent to ${user.email} (ID: ${data?.id})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(user: User, token: string): Promise<boolean> {
    try {
      const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

      const html = this.resetPasswordTemplate({
        name: user.username,
        email: user.email,
        resetUrl,
        year: new Date().getFullYear(),
      });

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: 'Reset your password',
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.debug(
        `Password reset email sent to ${user.email} (ID: ${data?.id})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Failed to send password reset email');
    }
  }
}
