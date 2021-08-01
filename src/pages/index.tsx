import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

const Home: React.FC = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/login')
  }, [])

  return <></>
}

export default Home
