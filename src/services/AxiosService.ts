import axios, { AxiosStatic } from 'axios'
import { LOCAL_STORAGE } from '../configs/AppConfig'

export const getAxiosInstance = () : AxiosStatic => {
  const axiosInstance = axios
  setAxiosDefaults(axiosInstance)
  return axiosInstance
}

const setAxiosDefaults = (axios: AxiosStatic) => {
  const token = localStorage.getItem(LOCAL_STORAGE.TOKEN)
  const lang = localStorage.getItem(LOCAL_STORAGE.LANG)
  axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
  axios.defaults.headers.common['Accept-Language'] = lang || 'en'
}
