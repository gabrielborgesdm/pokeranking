import { getLang } from './LanguageHelpers'
import { NextApiResponse } from 'next'
import { MESSAGES } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { IResponse } from '../../../../configs/types/IResponse'

export const sendResponse = (
  req: IRequest,
  res: NextApiResponse,
  message: IResponse,
  additionalData: object = {}
) => {
  const lang = getLang(req)
  return res.status(message.code).json({
    ...message,
    ...additionalData,
    message: MESSAGES[lang][message.status]
  })
}

export const sendImage = (res: NextApiResponse, image: Buffer) => {
  res.setHeader('Content-Type', 'image/png')
  return res.send(image)
}
