import { IResponse } from './../../../../configs/types/IResponse'
import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import AuthService from '../services/AuthService'
import { getLang } from './../helpers/LanguageHelpers'
import { sendResponse } from './../helpers/ResponseHelpers'

export const recoverPassword = async (req: IRequest, res: NextApiResponse) => {
  const { email } = req.body
  const lang = getLang(req)
  const response: IResponse = await new AuthService(lang, req.headers.host).recoverPassword(email)
  sendResponse(req, res, response)
}
