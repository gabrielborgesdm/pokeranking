import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import {
  ResendProvider,
  NodemailerProvider,
  NODEMAILER_CONFIGS,
} from './providers';
import { NODEMAILER_PROVIDER, NODEMAILER2_PROVIDER } from './email.constants';

@Module({
  providers: [
    ResendProvider,
    {
      provide: NODEMAILER_PROVIDER,
      useFactory: (configService: ConfigService) => {
        return new NodemailerProvider(
          configService,
          NODEMAILER_CONFIGS.nodemailer,
        );
      },
      inject: [ConfigService],
    },
    {
      provide: NODEMAILER2_PROVIDER,
      useFactory: (configService: ConfigService) => {
        return new NodemailerProvider(
          configService,
          NODEMAILER_CONFIGS.nodemailer2,
        );
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
