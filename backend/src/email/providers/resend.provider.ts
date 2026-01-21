import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from './email-provider.interface';
import { getProviderConfig, ProviderConfig } from './email-provider.utils';

@Injectable()
export class ResendProvider implements EmailProvider {
  readonly id = 'resend';
  readonly name = 'Resend';

  private readonly logger = new Logger(ResendProvider.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string | null = null;
  private readonly config: ProviderConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getProviderConfig(configService, this.id);

    if (this.config.isActive) {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

      if (apiKey && fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
        this.logger.log(
          `Resend provider initialized (priority: ${this.config.priority})`,
        );
      } else {
        this.logger.warn(
          'Resend provider is listed in EMAIL_PROVIDERS but RESEND_API_KEY or RESEND_FROM_EMAIL is not set',
        );
      }
    }
  }

  isActive(): boolean {
    return this.config.isActive && this.resend !== null && this.fromEmail !== null;
  }

  getPriority(): number {
    return this.config.priority;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.resend) {
      return {
        success: false,
        error: 'Resend client not initialized',
      };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail!,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
