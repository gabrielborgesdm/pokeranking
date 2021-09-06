
import axios from 'axios'
import { parseCookies } from 'nookies'
import useSWR from 'swr'
import { STORAGE } from '../configs/AppConfig'

export function useFetch<Data = any, Error = any> (url: string, payload?: any) {
  const { data, error, mutate } = useSWR<Data, Error>(url, async url => {
    const token = parseCookies()[STORAGE.USER_TOKEN]
    const lang = parseCookies()[STORAGE.LANG]
    axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
    axios.defaults.headers.common['Accept-Language'] = lang || 'en'
    const response = await axios.get(url, {
      data: payload
    })
    return response.data
  })

  return { data, error, mutate }
}
