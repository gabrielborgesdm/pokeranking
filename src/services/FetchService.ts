import { parseCookies } from 'nookies'
import useSWR from 'swr'
import { STORAGE } from '../configs/AppConfig'
import { getAxiosInstance } from '../helpers/AxiosHelpers'

export function useFetch<Data = any, Error = any> (url: string, payload?: any) {
  const { data, error, mutate } = useSWR<Data, Error>(url, async url => {
    const token = parseCookies()[STORAGE.USER_TOKEN] || ''
    const lang = parseCookies()[STORAGE.LANG] || 'en'
    const axios = getAxiosInstance(token, lang)
    const response = await axios.get(url, {
      data: payload
    })
    return response.data
  })

  return { data, error, mutate }
}
