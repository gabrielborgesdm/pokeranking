import { NextApiResponse } from 'next'
import { MESSAGES } from '../../../../config/APIConfig'
import { IMessage } from '../../../../config/types/IMessage'
import { IRequest } from '../../../../config/types/IRequest'

export const sendResponse = (req: IRequest, res: NextApiResponse, message: IMessage, additionalData: object = {}) => {
  const lang = req.headers['accept-language'] || 'en'
  return res.status(message.code).json({ ...message, ...additionalData, message: MESSAGES[lang][message.status] })
}
