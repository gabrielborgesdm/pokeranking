import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import AuthService from '../services/AuthService'
import { IResponse } from './../../../../configs/types/IResponse'
import { getLang } from './../helpers/LanguageHelpers'
import { sendResponse } from './../helpers/ResponseHelpers'

export const recoverPassword = async (req: IRequest, res: NextApiResponse) => {
  const { email } = req.body
  const lang = getLang(req)
  const response: IResponse = await new AuthService(lang, req.headers.host).recoverPassword(email)
  sendResponse(req, res, response)
}

export const confirmPasswordRecovery = async (req: IRequest, res: NextApiResponse) => {
  const { password, accessToken } = req.body
  const lang = getLang(req)
  const response: IResponse = await new AuthService(lang, req.headers.host).confirmPasswordRecovery(password, accessToken)
  console.log(response)
  sendResponse(req, res, response)
}
