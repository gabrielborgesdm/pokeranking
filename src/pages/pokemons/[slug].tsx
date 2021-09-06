import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'
import MainContainerComponent from '../../components/MainContainerComponent'
import { REQUEST_URL } from '../../configs/AppConfig'
import { useRouter } from 'next/router'
import { IUserResponse } from '../../configs/types/IUser'
import { checkIsAuthenticated, serverSideRedirection } from '../../services/AuthService'
import { useFetch } from '../../services/FetchService'
import { IPokemon } from '../../configs/types/IPokemon'
import PokemonBoxes from '../../components/PokemonBoxes'

const Pokemons: React.FC = () => {
  const router = useRouter()
  const { slug: user } = router.query
  const { data } = useFetch<IUserResponse>(`${REQUEST_URL.USERS}/${user}`)
  const { t } = useTranslation('users')
  const { t: c } = useTranslation('common')
  const [pokemons, setPokemons] = useState<Array<IPokemon>>([])
  const [isLoading, setIsLoading] = useState(true)
  const id = 0

  useEffect(() => {
    updatePokemons()
  }, [data])

  const updatePokemons = () => {
    if (data?.success) {
      setPokemons(data.user.pokemons)
      setIsLoading(false)
    }
  }

  return (
    <div>
      <MainContainerComponent>
        <PokemonBoxes pokemons={pokemons} setPokemons={setPokemons} />
      </MainContainerComponent>
    </div>
  )
}

export default Pokemons

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
