import { NextApiResponse } from 'next'
import { MESSAGES } from '../../../../configs/APIConfig'
import { IMessage } from '../../../../configs/types/IMessage'
import { IRequest } from '../../../../configs/types/IRequest'

export const sendResponse = (req: IRequest, res: NextApiResponse, message: IMessage, additionalData: object = {}) => {
  const lang = req.headers['accept-language'] || 'en'
  return res.status(message.code).json({ ...message, ...additionalData, message: MESSAGES[lang][message.status] })
}
