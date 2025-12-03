import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { PAGE_URL } from '../configs/AppConfig'

const Home: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    checkAuthenticationAndRedirect()
  }, [])

  const checkAuthenticationAndRedirect = () => {
    router.push(PAGE_URL.USERS)
  }

  return <></>
}

export default Home
