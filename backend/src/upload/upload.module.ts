import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import {
  BaseImageProvider,
  CloudinaryProvider,
  ImageKitProvider,
} from './providers';
import { IMAGE_PROVIDER_TOKEN } from './upload.constants';

export { IMAGE_PROVIDER_TOKEN };

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: IMAGE_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService): BaseImageProvider => {
        const provider = configService.get<string>(
          'IMAGE_PROVIDER',
          'cloudinary',
        );

        switch (provider) {
          case 'imagekit':
            return new ImageKitProvider(configService);
          case 'cloudinary':
          default:
            return new CloudinaryProvider(configService);
        }
      },
      inject: [ConfigService],
    },
    UploadService,
  ],
  exports: [UploadService],
})
export class UploadModule {}
