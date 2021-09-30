import { NextApiResponse } from 'next'
import { IMAGE_NOT_FOUND } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { getImage } from '../helpers/ImageHelpers'
import { sendImage, sendResponse } from '../helpers/ResponseHelpers'

export const loadImage = async (req: IRequest, res: NextApiResponse) => {
  const { slug: imageRelativePath } : any = req.query
  const image = getImage(imageRelativePath)
  if (!image) return sendResponse(req, res, IMAGE_NOT_FOUND)
  return sendImage(res, image)
}
