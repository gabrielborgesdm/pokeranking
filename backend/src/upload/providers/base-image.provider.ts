export interface UploadResult {
  url: string;
  publicId?: string;
}

export abstract class BaseImageProvider {
  abstract readonly name: string;
  abstract readonly isConfigured: boolean;

  abstract uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult>;
}
