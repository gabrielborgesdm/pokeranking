import axios, { AxiosInstance } from 'axios'
import { removeAccountCookies } from './CookiesHelpers'
import * as Sentry from '@sentry/react'

export const getAxiosInstance = (token: string, lang: string) => {
  axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
  axios.defaults.headers.common['Accept-Language'] = lang || 'en'
  addInterceptors(axios)
  return axios
}

const addInterceptors = (axios: AxiosInstance) => {
  axios.interceptors.response.use(function (response) {
    return response
  }, function (error) {
    if (error.response.status === 403 || error.response.status === 401) {
      removeAccountCookies()
    } else if (error.response.status !== 200) {
      Sentry.captureMessage(error)
    }
    return Promise.reject(error)
  })
}
