import { parseCookies, setCookie } from 'nookies'
import { STORAGE } from '../configs/AppConfig'

export const addAccountCookies = (token: string, username: string) => {
  setCookie(undefined, STORAGE.USER_TOKEN, token, {
    maxAge: 60 * 60 * 24 * 7
  })

  setCookie(undefined, STORAGE.USER_USERNAME, username, {
    maxAge: 60 * 60 * 24 * 7
  })
}

export const getAccountCookies = () => {
  return {
    token: parseCookies()[STORAGE.USER_TOKEN],
    username: parseCookies()[STORAGE.USER_USERNAME],
    lang: parseCookies()[STORAGE.LANG]
  }
}

export const addLanguageCookies = (lang: string) => {
  setCookie(undefined, STORAGE.LANG, lang, {
    maxAge: 60 * 60 * 24 * 7
  })
}

export const removeAccountCookies = () => {
  setCookie(undefined, STORAGE.USER_TOKEN, '')
  setCookie(undefined, STORAGE.USER_USERNAME, '')
}
