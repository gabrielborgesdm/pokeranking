import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { BaseImageProvider, UploadResult } from './base-image.provider';

@Injectable()
export class CloudinaryProvider extends BaseImageProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);
  readonly name = 'cloudinary';
  readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    super();
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

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            reject(new Error('Failed to upload image'));
            return;
          }
          if (!result) {
            reject(new Error('Upload failed: no result'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn('Cloudinary not configured, cannot delete image');
      return false;
    }

    try {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{filename}.{ext}
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        this.logger.warn(`Could not extract public_id from URL: ${imageUrl}`);
        return false;
      }

      const result = (await cloudinary.uploader.destroy(publicId)) as {
        result: string;
      };
      if (result.result === 'ok') {
        this.logger.log(`Successfully deleted image: ${publicId}`);
        return true;
      }

      this.logger.warn(
        `Failed to delete image: ${publicId}, result: ${result.result}`,
      );
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${imageUrl}`, error);
      return false;
    }
  }

  private extractPublicId(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      // Check if it's a Cloudinary URL
      if (!url.hostname.includes('cloudinary.com')) {
        return null;
      }

      // Path format: /image/upload/{version}/{public_id}.{ext}
      // or: /image/upload/{public_id}.{ext}
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex === -1) {
        return null;
      }

      // Get everything after 'upload', skip version if present (starts with 'v' followed by numbers)
      let startIndex = uploadIndex + 1;
      if (pathParts[startIndex]?.match(/^v\d+$/)) {
        startIndex++;
      }

      // Join remaining parts and remove file extension
      const publicIdWithExt = pathParts.slice(startIndex).join('/');
      return publicIdWithExt.replace(/\.[^/.]+$/, '');
    } catch {
      return null;
    }
  }
}
