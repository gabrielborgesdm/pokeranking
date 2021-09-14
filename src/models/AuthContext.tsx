import { AxiosInstance } from 'axios'
import useTranslation from 'next-translate/useTranslation'
import React, { createContext, useEffect } from 'react'
import { REQUEST_URL } from '../configs/AppConfig'
import { IAuthContextType, IAuthProvider, ICookiesType } from '../configs/types/IAuthContext'
import { IUserResponse, IUserType } from '../configs/types/IUser'
import { getAxiosInstance } from '../helpers/AxiosHelpers'
import { addAccountCookies, addLanguageCookies, getAccountCookies, removeAccountCookies } from '../helpers/CookiesHelpers'

export const AuthContext = createContext({} as IAuthContextType)

export const AuthProvider: React.FC = ({ children }: IAuthProvider) => {
  const { lang } = useTranslation('common')

  useEffect(() => {
    runInitialSetup()
  }, [])

  const checkIsAuthenticated = () => {
    return !!getCookies().token
  }

  const runInitialSetup = () => {
    const { lang: storedLangCookie } = getCookies()
    if (storedLangCookie !== lang) {
      setLang(lang)
    }
  }

  const getCookies = (): ICookiesType => {
    return getAccountCookies()
  }

  const getAxios = (): AxiosInstance => {
    const { token, lang } = getCookies()
    return getAxiosInstance(token, lang)
  }

  const login = (token: string, username: string) => {
    addAccountCookies(token, username)
  }

  const setLang = (lang: string) => {
    addLanguageCookies(lang)
  }

  const logout = () => {
    removeAccountCookies()
  }

  const recoverUserInformation = async (): Promise<IUserType | null> => {
    let user = null
    const token = getCookies().token
    if (!token) return null
    const data = await submitUserRequest()
    if (data.success) {
      user = data.user
    }
    return user
  }

  const submitUserRequest = async (): Promise<IUserResponse> => {
    let data = null
    const username = getCookies().username
    try {
      const response = await getAxios().post(`${REQUEST_URL.USERS}/${username}`)
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  return (
    <AuthContext.Provider value={{
      checkIsAuthenticated,
      login,
      logout,
      recoverUserInformation,
      getCookies,
      setLang,
      getAxios
    }}>
      {children}
    </AuthContext.Provider>
  )
}
