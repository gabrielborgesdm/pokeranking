import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { SupportService } from './support.service';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { SupportMessageResponseDto } from './dto/support-message-response.dto';
import { toDto } from '../common/utils/transform.util';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('support')
@ApiBearerAuth('JWT-auth')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a support/feedback message' })
  @ApiResponse({
    status: 201,
    description: 'Message submitted successfully',
    type: SupportMessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateSupportMessageDto,
    @Request() req: AuthenticatedRequest,
    @Headers('accept-language') lang?: string,
  ): Promise<SupportMessageResponseDto> {
    const message = await this.supportService.create(
      dto,
      {
        _id: new Types.ObjectId(req.user._id),
        username: req.user.username,
        email: req.user.email,
      },
      lang,
    );
    return toDto(SupportMessageResponseDto, message);
  }
}
