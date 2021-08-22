
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import { parseCookies } from 'nookies'
import useSWR from 'swr'
import { STORAGE } from '../configs/AppConfig'

export function useFetch<Data = any, Error = any> (url: string, context?: GetServerSidePropsContext) {
  const { data, error, mutate } = useSWR<Data, Error>(url, async url => {
    const token = parseCookies(context)[STORAGE.USER_TOKEN]
    const lang = parseCookies(context)[STORAGE.LANG]
    axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
    axios.defaults.headers.common['Accept-Language'] = lang || 'en'
    const response = await axios.get(url)
    return response.data
  })

  return { data, error, mutate }
}
