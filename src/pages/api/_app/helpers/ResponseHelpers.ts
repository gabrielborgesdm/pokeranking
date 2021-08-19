import { NextApiResponse } from 'next'
import { MESSAGES } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { IResponse } from '../../../../configs/types/IResponse'

export const sendResponse = (req: IRequest, res: NextApiResponse, message: IResponse, additionalData: object = {}) => {
  const lang = req.headers['accept-language'] || 'en'
  return res.status(message.code).json({ ...message, ...additionalData, message: MESSAGES[lang][message.status] })
}
