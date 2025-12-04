import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import {
  SupportMessage,
  SupportMessageSchema,
} from './schemas/support-message.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportMessage.name, schema: SupportMessageSchema },
    ]),
    EmailModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
