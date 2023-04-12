import { parseCookies } from 'nookies'
import { STORAGE, PAGE_URL } from '../configs/AppConfig'

export const checkIsAuthenticated = (context: any) => {
  return !!parseCookies(context)[STORAGE.USER_TOKEN]
}

export const serverSideRedirection = {
  redirect: {
    destination: PAGE_URL.LOGIN,
    permanent: false
  }
}
