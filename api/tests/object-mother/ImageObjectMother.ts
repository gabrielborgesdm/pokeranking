import { type UploadedFile } from 'express-fileupload'

export const makeImage = (payload: Partial<UploadedFile> = {}): UploadedFile => {
  const defaultImage = {
    name: 'wizzard',
    mv: async (path: string) => {},
    mimetype: 'image/jpeg',
    encoding: '',
    data: Buffer.from(''),
    tempFilePath: 'string',
    truncated: false,
    size: 4 * 1024 * 1024,
    md5: ''
  }
  return { ...defaultImage, ...payload }
}
