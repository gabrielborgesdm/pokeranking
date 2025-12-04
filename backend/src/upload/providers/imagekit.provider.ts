import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';
import { BaseImageProvider, UploadResult } from './base-image.provider';

@Injectable()
export class ImageKitProvider extends BaseImageProvider {
  private readonly logger = new Logger(ImageKitProvider.name);
  private readonly imagekit: ImageKit | null = null;
  readonly name = 'imagekit';
  readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    super();
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');

    this.isConfigured = !!(publicKey && privateKey && urlEndpoint);

    if (this.isConfigured) {
      this.imagekit = new ImageKit({
        publicKey: publicKey!,
        privateKey: privateKey!,
        urlEndpoint: urlEndpoint!,
      });
      this.logger.log('ImageKit configured successfully');
    } else {
      this.logger.warn(
        'ImageKit is not configured. Image uploads will not work.',
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    if (!this.imagekit) {
      throw new Error('ImageKit is not configured');
    }

    try {
      const result = await this.imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder,
      });

      return {
        url: result.url,
        publicId: result.fileId,
      };
    } catch (error) {
      this.logger.error('ImageKit upload failed', error);
      throw new Error('Failed to upload image');
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.imagekit) {
      this.logger.warn('ImageKit not configured, cannot delete image');
      return false;
    }

    try {
      // Extract fileId from ImageKit URL
      const fileId = await this.extractFileId(imageUrl);
      if (!fileId) {
        this.logger.warn(`Could not extract fileId from URL: ${imageUrl}`);
        return false;
      }

      await this.imagekit.deleteFile(fileId);
      this.logger.log(`Successfully deleted image: ${fileId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${imageUrl}`, error);
      return false;
    }
  }

  private async extractFileId(imageUrl: string): Promise<string | null> {
    if (!this.imagekit) {
      return null;
    }

    try {
      const url = new URL(imageUrl);
      // Extract path without leading slash
      const filePath = url.pathname.slice(1);

      // Use ImageKit API to search for file by name/path
      const files = await this.imagekit.listFiles({
        name: filePath.split('/').pop(),
        limit: 1,
      });

      if (files && files.length > 0) {
        const file = files[0] as { fileId?: string };
        // Only FileObject has fileId, not FolderObject
        if (file.fileId) {
          return file.fileId;
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}
