import BadRequestException from '../model/exception/BadRequestException'
import { publicDirectory } from '../helper/ApiHelper'
import path from 'path'
import { type UploadedFile } from 'express-fileupload'
import LoggerService from './LoggingService'
import InternalServerError from '../model/exception/InternalServerError'

export class ImageService {
  translate: (key: string) => string
  logger = new LoggerService('ImageService')

  constructor (translate: (key: string) => string) {
    this.translate = translate
  }

  async uploadImage (image: UploadedFile): Promise<void> {
    this.validateImageType(image)
    this.validateImageSize(image)

    try {
      await image.mv(path.join(publicDirectory, image.name))
    } catch (error) {
      this.logger.log(`Couldn't upload image ${image.name}`, JSON.stringify(image), error)
      throw new InternalServerError(this.translate('upload_error'))
    }
  }

  private validateImageType (image: UploadedFile): void {
    if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
      throw new BadRequestException(this.translate('invalid_image_format'))
    }
  }

  private validateImageSize (image: UploadedFile): void {
    if (image.size > 5 * 1024 * 1024) {
      throw new BadRequestException(this.translate('invalid_image_size'))
    }
  }
}
