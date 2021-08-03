import { NextApiResponse } from 'next'
import { IMessage } from '../../../../config/types/IMessage'

export const sendResponse = (res: NextApiResponse, message: IMessage, additionalData: object = {}) => {
  return res.status(message.code).json({ ...message, ...additionalData })
}
