import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import {
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from './email-provider.interface';
import { getProviderConfig, ProviderConfig } from './email-provider.utils';

@Injectable()
export class NodemailerProvider implements EmailProvider {
  readonly id = 'nodemailer';
  readonly name = 'Nodemailer (SMTP)';

  private readonly logger = new Logger(NodemailerProvider.name);
  private readonly transporter: Transporter | null = null;
  private readonly fromEmail: string | null = null;
  private readonly config: ProviderConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getProviderConfig(configService, this.id);

    if (this.config.isActive) {
      const host = this.configService.get<string>('SMTP_HOST');
      const port = this.configService.get<number>('SMTP_PORT');
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');
      const fromEmail = this.configService.get<string>('SMTP_FROM');

      if (host && port && user && pass && fromEmail) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        });
        this.fromEmail = fromEmail;
        this.logger.log(
          `Nodemailer provider initialized (priority: ${this.config.priority})`,
        );
      } else {
        this.logger.warn(
          'Nodemailer provider is listed in EMAIL_PROVIDERS but SMTP configuration is incomplete',
        );
      }
    }
  }

  isActive(): boolean {
    return this.config.isActive && this.transporter !== null && this.fromEmail !== null;
  }

  getPriority(): number {
    return this.config.priority;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Nodemailer transporter not initialized',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail!,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
