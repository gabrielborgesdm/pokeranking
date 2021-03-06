import { AxiosInstance } from 'axios'
import React from 'react'
import { IUser } from './IUser'

export type ICookiesType = {
  token?: string
  username?: string
  lang?: string
}

export type IAuthContextType = {
  login: (token: string, username: string) => void
  checkIsAuthenticated: () => boolean
  recoverUserInformation: () => Promise<IUser | null>
  logout: () => void
  getCookies: () => ICookiesType
  setLang: (lang: string) => void
  getAxios: () => AxiosInstance
}

export interface IAuthProvider {
  children: React.ReactNode
}
