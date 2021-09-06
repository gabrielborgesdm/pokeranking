import React, { createContext, useEffect } from 'react'
import { parseCookies, setCookie } from 'nookies'
import { REQUEST_URL, STORAGE } from '../configs/AppConfig'
import { IUserResponse } from '../configs/types/IUser'
import { IAuthContextType, IAuthProvider, ICookiesType } from '../configs/types/IAuthContext'
import useTranslation from 'next-translate/useTranslation'
import axios, { AxiosInstance } from 'axios'

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
    return {
      token: parseCookies()[STORAGE.USER_TOKEN],
      username: parseCookies()[STORAGE.USER_USERNAME],
      lang: parseCookies()[STORAGE.LANG]
    }
  }

  const getAxios = (): AxiosInstance => {
    const token = parseCookies()[STORAGE.USER_TOKEN]
    const lang = parseCookies()[STORAGE.LANG]
    axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
    axios.defaults.headers.common['Accept-Language'] = lang || 'en'
    return axios
  }

  const login = (token: string, username: string) => {
    setCookie(undefined, STORAGE.USER_TOKEN, token, {
      maxAge: 60 * 60 * 24 * 7
    })

    setCookie(undefined, STORAGE.USER_USERNAME, username, {
      maxAge: 60 * 60 * 24 * 7
    })
  }

  const setLang = (lang: string) => {
    setCookie(undefined, STORAGE.LANG, lang, {
      maxAge: 60 * 60 * 24 * 7
    })
  }

  const logout = () => {
    setCookie(undefined, STORAGE.USER_TOKEN, '')
    setCookie(undefined, STORAGE.USER_USERNAME, '')
  }

  const recoverUserInformation = async (): Promise<IUserResponse | null> => {
    const token = getCookies().token
    if (!token) return null
    return await submitUserRequest()
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
