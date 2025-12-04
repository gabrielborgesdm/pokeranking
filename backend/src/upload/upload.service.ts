import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

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
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.isConfigured = !!(cloudName && apiKey && apiSecret);

    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.logger.log('Cloudinary configured successfully');
    } else {
      this.logger.warn(
        'Cloudinary is not configured. Image uploads will not work.',
      );
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.isConfigured) {
      throw new BadRequestException(
        'Image upload is not configured. Please set Cloudinary credentials.',
      );
    }

    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pokemon',
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            reject(new BadRequestException('Failed to upload image'));
            return;
          }
          if (!result) {
            reject(new BadRequestException('Upload failed: no result'));
            return;
          }
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
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
