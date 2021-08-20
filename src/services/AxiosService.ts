import axios from 'axios'
import { STORAGE } from '../configs/AppConfig'
import { parseCookies } from 'nookies'

const token = parseCookies()[`nextauth.${STORAGE.USER_TOKEN}`]
const lang = parseCookies()[`nextauth.${STORAGE.LANG}`]
axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
axios.defaults.headers.common['Accept-Language'] = lang || 'en'
export default axios
