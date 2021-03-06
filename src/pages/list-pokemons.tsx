import { faSearch, faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { useContext, useEffect, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import CustomButton from '../components/CustomButton'
import MainContainerComponent from '../components/MainContainerComponent'
import PokemonsListingBoxes from '../components/PokemonsListingBoxes'
import { REQUEST_URL } from '../configs/AppConfig'
import { IPokemonsResponse } from '../configs/types/IPokemon'
import { IUser } from '../configs/types/IUser'
import { AuthContext } from '../models/AuthContext'
import { CustomPokerankingNav } from '../styles/pages/pokemons'

const Pokemons: React.FC = () => {
  const { recoverUserInformation } = useContext(AuthContext)
  const { getAxios } = useContext(AuthContext)
  const [filteredPokemon, setFilteredPokemon] = useState('')
  const [filteredPokemons, setFilteredPokemons] = useState([])
  const [user, setUser] = useState<IUser>()
  const [isLoading, setIsLoading] = useState(true)
  const [pokemons, setPokemons] = useState([])

  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')

  useEffect(() => {
    updatePokemons()
  }, [])

  const updatePokemons = async () => {
    setIsLoading(true)
    const data = await handleGetPokemons()
    if (data?.success) {
      const user = await recoverUserInformation()
      setUser(user)
      setPokemons(data.pokemons)
      setFilteredPokemons(data.pokemons)
    }
    setIsLoading(false)
  }
  const handleGetPokemons = async () => {
    let data: IPokemonsResponse
    try {
      const response = await getAxios().get(REQUEST_URL.POKEMONS)
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const filterPokemons = () => {
    if (!filteredPokemon.length) {
      setFilteredPokemons(pokemons)
      return
    }
    const filteredPokemons = pokemons.filter(pokemon => {
      const pokemonName: string = pokemon.name.toLowerCase()
      return pokemonName.includes(filteredPokemon.toLowerCase())
    })
    setFilteredPokemons(filteredPokemons)
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    filterPokemons()
  }

  return (
    <div>
      <MainContainerComponent>
        <Row>
          <Col className="d-flex flex-column justify-space-between p-2 my-2">
            <CustomPokerankingNav>
              <Form onSubmit={handleSubmit}>
                <Form.Group as={Row}>
                  <Col
                    sm={12}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <h3>{t('pokemons-list')}</h3>

                    <div className="d-flex align-items-center">
                      {/*
                        {user?.role === USER_ROLES.ADMIN && <PokemonAddModal />}
                      */}
                      <Form.Control
                        type="text"
                        value={filteredPokemon}
                        className="ml-10px"
                        onChange={e => setFilteredPokemon(e.target.value)}
                        placeholder={t('search-for-a-pokemon')}
                        maxLength={70}
                      />
                      <CustomButton className="py-2 ml-10px">
                        <FontAwesomeIcon icon={faSearch} />
                      </CustomButton>
                    </div>
                  </Col>
                </Form.Group>
              </Form>
            </CustomPokerankingNav>
            {isLoading ? (
              <div className="text-center">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin={true}
                  size="3x"
                  className="m-3"
                />
                &nbsp;
                <h1 className="mb-0">{c('loading')}</h1>
              </div>
            ) : filteredPokemons.length ? (
              <PokemonsListingBoxes
                isLoading={isLoading}
                pokemons={filteredPokemons}
                user={user}
                reloadPokemons={updatePokemons}
              />
            ) : (
              <h3 className="text-center mt-2">
                {t('no-pokemons-were-added')}
              </h3>
            )}
          </Col>
        </Row>
      </MainContainerComponent>
    </div>
  )
}

export default Pokemons
