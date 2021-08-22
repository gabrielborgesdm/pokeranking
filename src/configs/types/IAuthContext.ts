import { AxiosInstance } from 'axios'
import React from 'react'
import { IUserResponse } from './IUser'

export type ICookiesType = {
  token?: string;
  username?: string;
  lang?: string;
}

export type IAuthContextType = {
  checkIsAuthenticated: ()=> void;
  login: (token: string, username: string) => void;
  recoverUserInformation: () => Promise<IUserResponse | null>;
  logout: () => void;
  getCookies: () => ICookiesType;
  setLang: (lang: string) => void;
  getAxios: () => AxiosInstance;
}

export interface IAuthProvider {
  children: React.ReactNode;
}
