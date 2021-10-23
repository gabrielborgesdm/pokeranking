import { NextApiResponse } from 'next'
import { IRequest } from '../../../configs/types/IRequest'
import { loadImage } from '../_app/controllers/ImageController'
import withMiddlewares, {
  VALIDATION
} from '../_app/middlewares/WithMiddlewares'
import { ImageSchema } from '../_app/models/schemas/ImageSchema'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await loadImage(req, res)
}

export default withMiddlewares(handler, {
  name: VALIDATION,
  parameters: [null, ImageSchema]
})
