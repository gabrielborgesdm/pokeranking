import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { PAGE_URL } from '../configs/AppConfig'

const Home: React.FC = () => {
  const router = useRouter()
  useEffect(() => {
    router.push(PAGE_URL.LOGIN)
  }, [])

  return <></>
}

export default Home
