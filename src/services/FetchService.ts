
import { useContext } from 'react'
import useSWR from 'swr'
import { AuthContext } from '../models/AuthContext'

export function useFetch<Data = any, Error = any> (url: string) {
  const { getAxios } = useContext(AuthContext)
  const { data, error, mutate } = useSWR<Data, Error>(url, async url => {
    const response = await getAxios().get(url)
    return response.data
  })

  return { data, error, mutate }
}
