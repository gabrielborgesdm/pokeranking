import { faSave } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import CustomButton from '../../components/CustomButton'
import MainContainerComponent from '../../components/MainContainerComponent'
import PokemonAddModal from '../../components/PokemonAddModal'
import PokemonBoxes from '../../components/PokemonBoxes'
import { REQUEST_URL } from '../../configs/AppConfig'
import { IPokemon } from '../../configs/types/IPokemon'
import { IUserResponse } from '../../configs/types/IUser'
import { AuthContext } from '../../models/AuthContext'
import { checkIsAuthenticated, serverSideRedirection } from '../../services/AuthService'
import { useFetch } from '../../services/FetchService'
import { CustomPokerankingNav } from '../../styles/pages/pokemons'
import { colors } from '../../styles/theme'

const Pokemons: React.FC = () => {
  const router = useRouter()
  const { getAxios } = useContext(AuthContext)
  const { slug: user } = router.query
  const { data } = useFetch<IUserResponse>(`${REQUEST_URL.USERS}/${user}`)
  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')
  const [userPokemons, setUserPokemons] = useState<Array<IPokemon>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

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
    const newPokemons = [...userPokemons]
    newPokemons.splice(pokemonIndex, 0, pokemon)
    setUserPokemons(newPokemons)
    setHasChanges(true)
  }

  const onUpdatePosition = (pokemon: IPokemon, nextIndex: number) => {
    const oldIndex = userPokemons.indexOf(pokemon)
    const newPokemons = [...userPokemons]
    newPokemons.splice(oldIndex, 1)
    newPokemons.splice(nextIndex, 0, pokemon)
    setUserPokemons(newPokemons)
    setHasChanges(true)
  }

  const handleSaveChangesClick = async () => {
    setIsLoading(true)
    const data = await submitUpdateRequest()
    if (data.success) {
      setHasChanges(false)
    } else {
      alert(data?.message || c('server-error'))
    }
    setIsLoading(false)
  }

  const submitUpdateRequest = async (): Promise<IUserResponse> => {
    let data = null
    const axios = getAxios()
    try {
      const response = await axios.put(`${REQUEST_URL.USERS}/${user}/update`, {
        user: {
          pokemons: userPokemons.map(pokemon => (
            { pokemon: pokemon.id, note: pokemon.note }
          ))
        }
      })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  return (
    <div>
      <MainContainerComponent>
        <Row>
          <Col xs={12} className=" mx-auto p-2 my-2">
            <CustomPokerankingNav>
              <Row>
                <Col className="nav-title justify-content-center text-center mb-2 justify-content-md-start" xs={12} md={6}>
                  <h3>{t('pokemon-ranking')}</h3>
                </Col>
                <Col className="nav-buttons justify-content-center justify-content-md-end" xs={12} md={6}>
                    {hasChanges
                      ? (
                          <CustomButton color={colors.red} type="button" isLoading={isLoading} onClick={handleSaveChangesClick}>
                            <FontAwesomeIcon icon={faSave} />&nbsp;
                              {c('save-changes')}
                          </CustomButton>
                        )
                      : (
                          <CustomButton color={colors.red} isDisabled={true} isLoading={isLoading} type="button">
                            <FontAwesomeIcon icon={faSave} />&nbsp;
                            {c('changes-saved')}
                          </CustomButton>
                        )
                    }
                    <PokemonAddModal userPokemons={userPokemons} onAddPokemon={onAddPokemon} isLoading={isLoading} />
                </Col>
              </Row>
              <span></span>

            </CustomPokerankingNav>
          </Col>
        </Row>
        <PokemonBoxes userPokemons={userPokemons} onUpdatePosition={onUpdatePosition} isLoading={isLoading} />
      </MainContainerComponent>
    </div>
  )
}

export default Pokemons

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
