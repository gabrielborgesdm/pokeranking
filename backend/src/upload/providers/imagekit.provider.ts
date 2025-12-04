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
}
