import React, { createContext, useEffect } from 'react'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { REQUEST_URL, STORAGE } from '../configs/AppConfig'
import axios from '../services/AxiosService'
import { IUserResponse } from '../configs/types/IUser'
import { IAuthContextType, IAuthProvider, ICookiesType } from '../configs/types/IAuthContext'
import useTranslation from 'next-translate/useTranslation'

export const AuthContext = createContext({} as IAuthContextType)

export const AuthProvider: React.FC = ({ children }: IAuthProvider) => {
  const { lang } = useTranslation('common')

  useEffect(() => {
    runInitialSetup()
  }, [])

  const runInitialSetup = () => {
    const { lang: storedLangCookie } = getCookies()
    if (storedLangCookie !== lang) {
      setLang(lang)
    }
  }

  const checkIsAuthenticated = () => {
    return !!getCookies().token
  }

  const getCookies = (): ICookiesType => {
    console.log(parseCookies())
    return {
      token: parseCookies()[STORAGE.USER_TOKEN],
      username: parseCookies()[STORAGE.USER_USERNAME],
      lang: parseCookies()[STORAGE.LANG]
    }
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
    destroyCookie(undefined, STORAGE.USER_TOKEN)
    destroyCookie(undefined, STORAGE.USER_USERNAME)
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
      const response = await axios.post(`${REQUEST_URL.USERS}/${username}`)
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
      setLang
    }}>
      {children}
    </AuthContext.Provider>
  )
}
