import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image to Cloudinary (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, GIF, WebP, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or upload failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }
}
