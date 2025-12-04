import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { User } from '../users/schemas/user.schema';
import { TK } from '../i18n/constants/translation-keys';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly supportEmail: string | undefined;
  private readonly emailVerificationRequired: boolean;
  private readonly verifyEmailTemplate: HandlebarsTemplateDelegate;
  private readonly resetPasswordTemplate: HandlebarsTemplateDelegate;
  private readonly supportNotificationTemplate: HandlebarsTemplateDelegate;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);

    this.fromEmail = this.configService.getOrThrow<string>('RESEND_FROM_EMAIL');
    this.frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
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
    const supportNotificationHtml = readFileSync(
      join(templatesDir, 'support-notification.hbs'),
      'utf-8',
    );

    this.verifyEmailTemplate = Handlebars.compile(verifyEmailHtml);
    this.resetPasswordTemplate = Handlebars.compile(resetPasswordHtml);
    this.supportNotificationTemplate = Handlebars.compile(
      supportNotificationHtml,
    );
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
      throw new ServiceUnavailableException({
        key: TK.COMMON.EMAIL_SEND_FAILED,
      });
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
      throw new ServiceUnavailableException({
        key: TK.COMMON.EMAIL_SEND_FAILED,
      });
    }
  }

  async sendSupportNotification(
    username: string,
    userEmail: string,
    message: string,
  ): Promise<boolean> {
    if (!this.supportEmail) {
      this.logger.log(
        'Support email not configured, skipping support notification',
      );
      return true;
    }

    try {
      const html = this.supportNotificationTemplate({
        username,
        userEmail,
        message,
        timestamp: new Date().toISOString(),
        year: new Date().getFullYear(),
      });

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: this.supportEmail,
        replyTo: userEmail,
        subject: `[Support] New feedback from ${username}`,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.debug(
        `Support notification sent to ${this.supportEmail} (ID: ${data?.id})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send support notification email`,
        error instanceof Error ? error.stack : String(error),
      );
      // Don't throw - support notification failure shouldn't break the flow
      return false;
    }
  }
}
