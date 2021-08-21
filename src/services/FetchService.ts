import axios from '../services/AxiosService'
import useSWR from 'swr'

export function useFetch<Data = any, Error = any> (url: string) {
  const { data, error, mutate } = useSWR<Data, Error>(url, async url => {
    const response = await axios.get(url)
    return response.data
  })

  return { data, error, mutate }
}
