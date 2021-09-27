import path from 'path'
import { IRequest } from '../configs/types/IRequest'

export const getImageURL = (req: IRequest, image: string) => {
  return path.join('api', 'images', image)
}
