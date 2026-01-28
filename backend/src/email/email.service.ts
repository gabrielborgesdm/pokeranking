import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/schemas/user.schema';
import { TK } from '../i18n/constants/translation-keys';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import {
  EmailProvider,
  SendEmailOptions,
  ResendProvider,
  NodemailerProvider,
} from './providers';
import {
  NODEMAILER_PROVIDER,
  NODEMAILER2_PROVIDER,
} from './email.constants';

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
  private readonly providers: EmailProvider[] = [];
  private readonly frontendUrl: string;
  private readonly supportEmail: string | undefined;
  private readonly emailVerificationRequired: boolean;
  private readonly templates: Record<SupportedLanguage, EmailTemplates>;

  constructor(
    private readonly configService: ConfigService,
    private readonly resendProvider: ResendProvider,
    @Inject(NODEMAILER_PROVIDER)
    private readonly nodemailerProvider: NodemailerProvider,
    @Inject(NODEMAILER2_PROVIDER)
    private readonly nodemailer2Provider: NodemailerProvider,
  ) {
    this.frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
    this.emailVerificationRequired = this.configService.get<boolean>(
      'EMAIL_VERIFICATION_REQUIRED',
      true,
    );

    // Register all providers
    const allProviders: EmailProvider[] = [
      this.resendProvider,
      this.nodemailerProvider,
      this.nodemailer2Provider,
    ];

    // Filter active providers and sort by priority (lower index = higher priority)
    this.providers = allProviders
      .filter((p) => p.isActive())
      .sort((a, b) => a.getPriority() - b.getPriority());

    if (this.providers.length === 0) {
      this.logger.warn(
        'No email providers configured. Set EMAIL_PROVIDERS env variable.',
      );
    }

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

  /**
   * Sends an email using the configured providers in priority order.
   * Falls back to the next provider if one fails.
   */
  private async sendEmail(options: SendEmailOptions): Promise<void> {
    if (this.providers.length === 0) {
      throw new ServiceUnavailableException({
        key: TK.COMMON.EMAIL_SEND_FAILED,
      });
    }

    const errors: string[] = [];

    for (const provider of this.providers) {
      this.logger.debug(`Attempting to send email via ${provider.name}`);

      const result = await provider.send(options);

      if (result.success) {
        this.logger.debug(
          `Email sent successfully via ${provider.name} (ID: ${result.messageId})`,
        );
        return;
      }

      errors.push(`${provider.name}: ${result.error}`);
      this.logger.error(
        `Failed to send email via ${provider.name}: ${result.error}`,
      );
    }

    this.logger.error(
      `All email providers failed. Errors: ${errors.join('; ')}`,
    );
    throw new ServiceUnavailableException({
      key: TK.COMMON.EMAIL_SEND_FAILED,
    });
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

    const language = this.getLanguage(lang);
    const verificationUrl = `${this.frontendUrl}/verify-email?email=${encodeURIComponent(user.email)}&code=${code}`;

    const html = this.templates[language].verifyEmail({
      name: user.username,
      email: user.email,
      code,
      verificationUrl,
      year: new Date().getFullYear(),
    });

    await this.sendEmail({
      to: user.email,
      subject: EMAIL_SUBJECTS[language].verifyEmail,
      html,
    });

    this.logger.debug(`Verification email sent to ${user.email}`);
    return true;
  }

  async sendPasswordResetEmail(
    user: User,
    token: string,
    lang?: string,
  ): Promise<boolean> {
    const language = this.getLanguage(lang);
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const html = this.templates[language].resetPassword({
      name: user.username,
      email: user.email,
      resetUrl,
      year: new Date().getFullYear(),
    });

    await this.sendEmail({
      to: user.email,
      subject: EMAIL_SUBJECTS[language].resetPassword,
      html,
    });

    this.logger.debug(`Password reset email sent to ${user.email}`);
    return true;
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

      await this.sendEmail({
        to: this.supportEmail,
        replyTo: userEmail,
        subject: `[Support] New feedback from ${username}`,
        html,
      });

      this.logger.debug(`Support notification sent to ${this.supportEmail}`);
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
