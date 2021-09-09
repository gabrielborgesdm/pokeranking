import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import MainContainerComponent from '../../components/MainContainerComponent'
import PokemonAddModal from '../../components/PokemonAddModal'
import PokemonBoxes from '../../components/PokemonBoxes'
import { REQUEST_URL } from '../../configs/AppConfig'
import { IPokemon } from '../../configs/types/IPokemon'
import { IUserResponse } from '../../configs/types/IUser'
import { checkIsAuthenticated, serverSideRedirection } from '../../services/AuthService'
import { useFetch } from '../../services/FetchService'

const Pokemons: React.FC = () => {
  const router = useRouter()
  const { slug: user } = router.query
  const { data } = useFetch<IUserResponse>(`${REQUEST_URL.USERS}/${user}`)
  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')
  const [userPokemons, setUserPokemons] = useState<Array<IPokemon>>([])
  const [isLoading, setIsLoading] = useState(true)
  const id = 0

  useEffect(() => {
    updatePokemons()
  }, [data])

  const updatePokemons = () => {
    if (data?.success) {
      setUserPokemons(data.user.pokemons)
      setIsLoading(false)
    }
  }

  const onAddPokemon = (pokemon: IPokemon, pokemonIndex: number) => {
    console.log('top')
    const newPokemons = [...userPokemons]
    newPokemons.splice(pokemonIndex, 0, pokemon)
    setUserPokemons(newPokemons)
  }

  const onUpdatePosition = (pokemon: IPokemon, nextIndex: number) => {
    const oldIndex = userPokemons.indexOf(pokemon)
    const newPokemons = [...userPokemons]
    newPokemons.splice(oldIndex, 1)
    newPokemons.splice(nextIndex, 0, pokemon)
    setUserPokemons(newPokemons)
  }

  return (
    <div>
      <MainContainerComponent>
        <Row>
          <Col xs={12} className=" mx-auto p-2 my-2">
            <div className="bg-dark p-3 d-flex align-items-center justify-content-between">
              <span>{t('pokemon-ranking')}</span>
              <div>
                <PokemonAddModal userPokemons={userPokemons} onAddPokemon={onAddPokemon} />
              </div>
            </div>
          </Col>
        </Row>
        <PokemonBoxes pokemons={userPokemons} onUpdatePosition={onUpdatePosition} />
      </MainContainerComponent>
    </div>
  )
}

export default Pokemons

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
