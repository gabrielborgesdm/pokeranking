import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendProvider, NodemailerProvider } from './providers';

@Module({
  providers: [ResendProvider, NodemailerProvider, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
