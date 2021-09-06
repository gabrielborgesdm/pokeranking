import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PAGE_URL } from '../../configs/AppConfig'
import { AuthContext } from '../../models/AuthContext'
import { GetServerSideProps } from 'next'
import { checkIsAuthenticated, serverSideRedirection } from '../../services/AuthService'

const PokemonsHome: React.FC = () => {
  const router = useRouter()
  const { getCookies } = useContext(AuthContext)

  useEffect(() => {
    checkUserAndRedirect()
  }, [])

  const checkUserAndRedirect = () => {
    const username = getCookies().username
    router.push(`${PAGE_URL.POKEMONS}/${username}`)
  }

  return <></>
}

export default PokemonsHome

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
