import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PAGE_URL } from '../configs/AppConfig'
import { AuthContext } from '../models/AuthContext'

const Home: React.FC = () => {
  const router = useRouter()
  const { checkIsAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    checkAuthenticationAndRedirect()
  }, [])

  const checkAuthenticationAndRedirect = () => {
    router.push(checkIsAuthenticated() ? PAGE_URL.USERS : PAGE_URL.LOGIN)
  }

  return <></>
}

export default Home
