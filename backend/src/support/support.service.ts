import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportMessage } from './schemas/support-message.schema';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { EmailService } from '../email/email.service';

interface UserInfo {
  _id: Types.ObjectId;
  username: string;
  email: string;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectModel(SupportMessage.name)
    private readonly supportMessageModel: Model<SupportMessage>,
    private readonly emailService: EmailService,
  ) {}

  async create(
    dto: CreateSupportMessageDto,
    user: UserInfo,
  ): Promise<SupportMessage> {
    const supportMessage = new this.supportMessageModel({
      user: user._id,
      username: user.username,
      email: user.email,
      message: dto.message,
    });

    const saved = await supportMessage.save();

    // Send email notification to support (fire and forget)
    this.emailService
      .sendSupportNotification(user.username, user.email, dto.message)
      .catch((error) => {
        this.logger.error('Failed to send support notification email', error);
      });

    this.logger.log(
      `Support message created by user ${user.username} (${user._id.toString()})`,
    );

    return saved;
  }
}
