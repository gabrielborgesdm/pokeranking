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

type SupportedLanguage = 'en' | 'pt-BR';

interface EmailTemplates {
  verifyEmail: HandlebarsTemplateDelegate;
  resetPassword: HandlebarsTemplateDelegate;
  supportNotification: HandlebarsTemplateDelegate;
}

interface EmailSubjects {
  verifyEmail: string;
  resetPassword: string;
}

const EMAIL_SUBJECTS: Record<SupportedLanguage, EmailSubjects> = {
  en: {
    verifyEmail: 'Verify your email address',
    resetPassword: 'Reset your password',
  },
  'pt-BR': {
    verifyEmail: 'Verifique seu endereço de e-mail',
    resetPassword: 'Redefinir sua senha',
  },
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly supportEmail: string | undefined;
  private readonly emailVerificationRequired: boolean;
  private readonly templates: Record<SupportedLanguage, EmailTemplates>;

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

    // Load and compile templates for all languages
    const templatesDir = join(__dirname, 'templates');

    this.templates = {
      en: this.loadTemplates(templatesDir, ''),
      'pt-BR': this.loadTemplates(templatesDir, '.pt-BR'),
    };
  }

  private loadTemplates(templatesDir: string, suffix: string): EmailTemplates {
    const verifyEmailHtml = readFileSync(
      join(templatesDir, `verify-email${suffix}.hbs`),
      'utf-8',
    );
    const resetPasswordHtml = readFileSync(
      join(templatesDir, `reset-password${suffix}.hbs`),
      'utf-8',
    );
    const supportNotificationHtml = readFileSync(
      join(templatesDir, `support-notification${suffix}.hbs`),
      'utf-8',
    );

    return {
      verifyEmail: Handlebars.compile(verifyEmailHtml),
      resetPassword: Handlebars.compile(resetPasswordHtml),
      supportNotification: Handlebars.compile(supportNotificationHtml),
    };
  }

  private getLanguage(lang?: string): SupportedLanguage {
    if (lang?.startsWith('pt')) {
      return 'pt-BR';
    }
    return 'en';
  }

  async sendVerificationEmail(
    user: User,
    code: string,
    lang?: string,
  ): Promise<boolean> {
    if (!this.emailVerificationRequired) {
      this.logger.debug(
        'Email verification is disabled, skipping verification email',
      );
      return true;
    }

    try {
      const language = this.getLanguage(lang);
      const verificationUrl = `${this.frontendUrl}/verify-email?email=${encodeURIComponent(user.email)}&code=${code}`;

      const html = this.templates[language].verifyEmail({
        name: user.username,
        email: user.email,
        code,
        verificationUrl,
        year: new Date().getFullYear(),
      });

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: EMAIL_SUBJECTS[language].verifyEmail,
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

  async sendPasswordResetEmail(
    user: User,
    token: string,
    lang?: string,
  ): Promise<boolean> {
    try {
      const language = this.getLanguage(lang);
      const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

      const html = this.templates[language].resetPassword({
        name: user.username,
        email: user.email,
        resetUrl,
        year: new Date().getFullYear(),
      });

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: EMAIL_SUBJECTS[language].resetPassword,
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
    lang?: string,
  ): Promise<boolean> {
    if (!this.supportEmail) {
      this.logger.log(
        'Support email not configured, skipping support notification',
      );
      return true;
    }

    try {
      const language = this.getLanguage(lang);
      const html = this.templates[language].supportNotification({
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
