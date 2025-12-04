import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
import { BulkUploadResponseDto } from './dto/bulk-upload-response.dto';

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

  @Post('images')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 50))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload multiple images to Cloudinary (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Image files (JPG, PNG, GIF, WebP, max 5MB each)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded (partial success possible)',
    type: BulkUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No files provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<BulkUploadResponseDto> {
    const results = await this.uploadService.uploadImages(files);
    return {
      results,
      successCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
    };
  }
}
