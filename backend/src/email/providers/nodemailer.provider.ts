import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import {
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from './email-provider.interface';
import { getProviderConfig, ProviderConfig } from './email-provider.utils';

export interface NodemailerConfig {
  id: string;
  name: string;
  hostKey: string;
  portKey: string;
  userKey: string;
  passKey: string;
  fromKey: string;
}

export const NODEMAILER_CONFIG = 'NODEMAILER_CONFIG';

const DEFAULT_NODEMAILER_CONFIG: NodemailerConfig = {
  id: 'nodemailer',
  name: 'Nodemailer (SMTP)',
  hostKey: 'SMTP_HOST',
  portKey: 'SMTP_PORT',
  userKey: 'SMTP_USER',
  passKey: 'SMTP_PASS',
  fromKey: 'SMTP_FROM',
};

export const NODEMAILER_CONFIGS: Record<string, NodemailerConfig> = {
  nodemailer: DEFAULT_NODEMAILER_CONFIG,
  nodemailer2: {
    id: 'nodemailer2',
    name: 'Nodemailer 2 (SMTP)',
    hostKey: 'SMTP_HOST_2',
    portKey: 'SMTP_PORT_2',
    userKey: 'SMTP_USER_2',
    passKey: 'SMTP_PASS_2',
    fromKey: 'SMTP_FROM_2',
  },
};

@Injectable()
export class NodemailerProvider implements EmailProvider {
  readonly id: string;
  readonly name: string;

  private readonly logger: Logger;
  private readonly transporter: Transporter | null = null;
  private readonly fromEmail: string | null = null;
  private readonly config: ProviderConfig;

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject(NODEMAILER_CONFIG)
    nodemailerConfig?: NodemailerConfig,
  ) {
    const cfg: NodemailerConfig = nodemailerConfig ?? DEFAULT_NODEMAILER_CONFIG;
    this.id = cfg.id;
    this.name = cfg.name;
    this.logger = new Logger(`NodemailerProvider:${cfg.id}`);
    this.config = getProviderConfig(configService, this.id);

    if (this.config.isActive) {
      const host = this.configService.get<string>(cfg.hostKey);
      const port = this.configService.get<number>(cfg.portKey);
      const user = this.configService.get<string>(cfg.userKey);
      const pass = this.configService.get<string>(cfg.passKey);
      const fromEmail = this.configService.get<string>(cfg.fromKey);

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
          `${this.name} provider initialized (priority: ${this.config.priority})`,
        );
      } else {
        this.logger.warn(
          `${this.name} provider is listed in EMAIL_PROVIDERS but SMTP configuration is incomplete`,
        );
      }
    }
  }

  isActive(): boolean {
    return (
      this.config.isActive &&
      this.transporter !== null &&
      this.fromEmail !== null
    );
  }

  getPriority(): number {
    return this.config.priority;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: `${this.name} transporter not initialized`,
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
