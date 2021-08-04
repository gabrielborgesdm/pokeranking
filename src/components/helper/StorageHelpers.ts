import { LOCAL_STORAGE } from '../../config/AppConfig'

export const setStorageToken = (token: string) => {
  localStorage.setItem(LOCAL_STORAGE.TOKEN, token)
}

export const isWithStorageToken = (token: string) => {
  return localStorage.getItem(LOCAL_STORAGE.TOKEN) !== null
}

export const removeStorageToken = () => {
  localStorage.removeItem(LOCAL_STORAGE.TOKEN)
}
