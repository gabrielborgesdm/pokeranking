import axios, { AxiosStatic } from 'axios'
import { LOCAL_STORAGE } from '../../config/AppConfig'

export const useAxios = () : AxiosStatic => {
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
