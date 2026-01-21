export interface UploadResult {
  url: string;
  publicId?: string;
}

export class MulterFile {
  fieldname!: string;
  originalname!: string;
  encoding!: string;
  mimetype!: string;
  size!: number;
  buffer!: Buffer;
}

export abstract class BaseImageProvider {
  abstract readonly name: string;
  abstract readonly isConfigured: boolean;

  abstract uploadImage(file: MulterFile, folder: string): Promise<UploadResult>;

  /**
   * Delete an image from the provider.
   * @param imageUrl The URL of the image to delete
   * @returns true if deletion was successful, false otherwise
   */
  abstract deleteImage(imageUrl: string): Promise<boolean>;
}
