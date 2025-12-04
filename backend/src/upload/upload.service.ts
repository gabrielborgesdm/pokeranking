import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { BaseImageProvider } from './providers';
import { IMAGE_PROVIDER_TOKEN } from './upload.constants';
import { BulkUploadItemDto } from './dto/bulk-upload-response.dto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(IMAGE_PROVIDER_TOKEN)
    private readonly imageProvider: BaseImageProvider,
  ) {
    this.logger.log(`Using image provider: ${this.imageProvider.name}`);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.imageProvider.isConfigured) {
      throw new BadRequestException(
        `Image upload is not configured. Please set ${this.imageProvider.name} credentials.`,
      );
    }

    this.validateFile(file);

    try {
      const result = await this.imageProvider.uploadImage(file, 'pokemon');
      return result.url;
    } catch (error) {
      this.logger.error('Image upload failed', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<BulkUploadItemDto[]> {
    if (!this.imageProvider.isConfigured) {
      throw new BadRequestException(
        `Image upload is not configured. Please set ${this.imageProvider.name} credentials.`,
      );
    }

    // Handle empty or undefined files array
    if (!files || files.length === 0) {
      return [];
    }

    // Upload all files in parallel
    const results = await Promise.all(
      files.map(async (file): Promise<BulkUploadItemDto> => {
        try {
          this.validateFile(file);
          const result = await this.imageProvider.uploadImage(file, 'pokemon');
          return {
            filename: file.originalname,
            success: true,
            url: result.url,
          };
        } catch (error) {
          return {
            filename: file.originalname,
            success: false,
            error:
              error instanceof BadRequestException
                ? error.message
                : 'Failed to upload image',
          };
        }
      }),
    );

    return results;
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.imageProvider.isConfigured) {
      this.logger.warn('Image provider not configured, cannot delete image');
      return false;
    }

    try {
      return await this.imageProvider.deleteImage(imageUrl);
    } catch (error) {
      this.logger.error('Image deletion failed', error);
      return false;
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed types: JPG, PNG, GIF, WebP',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 5MB');
    }
  }
}
