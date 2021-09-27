import { faSave, faSpinner } from '@fortawesome/fontawesome-free-solid'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import fileDownload from 'js-file-download'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import CustomButton from '../../components/CustomButton'
import MainContainerComponent from '../../components/MainContainerComponent'
import PokemonAddModal from '../../components/PokemonAddModal'
import PokemonBoxes from '../../components/PokemonBoxes'
import { STATUS } from '../../configs/APIConfig'
import { PAGE_URL, REQUEST_URL } from '../../configs/AppConfig'
import { IPokemon } from '../../configs/types/IPokemon'
import { IUserResponse } from '../../configs/types/IUser'
import { convertPokemonsToCSV } from '../../helpers/CsvHelpers'
import { AuthContext } from '../../models/AuthContext'
import {
  checkIsAuthenticated,
  serverSideRedirection
} from '../../services/AuthService'
import { CustomPokerankingNav } from '../../styles/pages/pokemons'
import { colors } from '../../styles/theme'

const Pokemons: React.FC = () => {
  const router = useRouter()
  const { getAxios, getCookies } = useContext(AuthContext)
  const { slug: user } = router.query
  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')
  const [userPokemons, setUserPokemons] = useState<Array<IPokemon>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [isRankingFromAuthUser] = useState(getCookies().username === user)

  useEffect(() => {
    fetchPokemons()
  }, [])

  const fetchPokemons = async () => {
    const data = await handleGetPokemons()
    if (data?.success) {
      setUserPokemons(data.user.pokemons)
    } else if (data?.status === STATUS.NOT_FOUND) {
      router.replace(PAGE_URL.USERS)
    } else if (data?.status) {
      alert(data.message)
    }
    setIsLoading(false)
  }

  const handleGetPokemons = async () => {
    let data: IUserResponse
    try {
      const response = await getAxios().get(`${REQUEST_URL.USERS}/${user}`)
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const onAddPokemon = (pokemon: IPokemon, pokemonIndex: number) => {
    const newPokemons = [...userPokemons]
    newPokemons.splice(pokemonIndex, 0, pokemon)
    setUserPokemons(newPokemons)
    setHasChanges(true)
  }

  const onUpdatePokemon = (pokemon: IPokemon, nextIndex: number) => {
    const oldPokemon = userPokemons.filter(
      oldPokemon => oldPokemon.id === pokemon.id
    )
    if (!oldPokemon.length) return
    const oldIndex = userPokemons.indexOf(oldPokemon[0])
    const newPokemons = [...userPokemons]
    newPokemons.splice(oldIndex, 1)
    if (nextIndex !== -1) {
      newPokemons.splice(nextIndex, 0, pokemon)
    }
    setUserPokemons(newPokemons)
    setHasChanges(true)
  }

  const handleSaveChangesClick = async () => {
    setIsLoading(true)
    const response = await submitUpdateRequest()
    if (response?.success) {
      setHasChanges(false)
    } else {
      alert(response?.message || c('server-error'))
    }
    setIsLoading(false)
  }

  const submitUpdateRequest = async (): Promise<IUserResponse> => {
    let data = null
    const axios = getAxios()
    try {
      const response = await axios.put(`${REQUEST_URL.USERS}/${user}/update`, {
        user: {
          pokemons: userPokemons.map(pokemon => {
            const pokemonObject = { pokemon: pokemon.id }
            if (pokemon.note) {
              pokemonObject.note = pokemon.note
            }
            return pokemonObject
          })
        }
      })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const downloadPokemonRanking = () => {
    const csvData = convertPokemonsToCSV(userPokemons, getCookies().lang)
    fileDownload(csvData, `${user}-pokemon-ranking.csv`)
  }

  return (
    <div>
      <MainContainerComponent>
        <Row>
          <Col className="d-flex flex-column justify-space-between p-2 my-2">
            <CustomPokerankingNav>
              <Row>
                <Col
                  className="nav-title justify-content-center text-center mb-2 mb-md-0 justify-content-md-start"
                  xs={12}
                  md={6}
                >
                  <h3>
                    {t('ranking-of')} {user}
                  </h3>
                </Col>
                <Col
                  className="nav-buttons justify-content-center justify-content-md-end"
                  xs={12}
                  md={6}
                >
                  <CustomButton
                    color={colors.green}
                    type="button"
                    isDisabled={!userPokemons.length}
                    isLoading={isLoading}
                    onClick={downloadPokemonRanking}
                    tooltip={c('download-ranking')}
                  >
                    <FontAwesomeIcon icon={faFileCsv} />
                  </CustomButton>
                  {isRankingFromAuthUser && (
                    <>
                      <PokemonAddModal
                        userPokemons={userPokemons}
                        onAddPokemon={onAddPokemon}
                        isLoading={isLoading}
                      />
                      {hasChanges ? (
                        <CustomButton
                          color={colors.red}
                          type="button"
                          isLoading={isLoading}
                          onClick={handleSaveChangesClick}
                          className="ml-10px"
                        >
                          <FontAwesomeIcon icon={faSave} />
                          &nbsp;
                          {c('save-changes')}
                        </CustomButton>
                      ) : (
                        <CustomButton
                          color={colors.red}
                          isDisabled={true}
                          isLoading={isLoading}
                          type="button"
                          className="ml-10px"
                        >
                          <FontAwesomeIcon icon={faSave} />
                          &nbsp;
                          {c('changes-saved')}
                        </CustomButton>
                      )}
                    </>
                  )}
                </Col>
              </Row>
              <span></span>
            </CustomPokerankingNav>
          </Col>
        </Row>
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
        ) : userPokemons.length ? (
          <PokemonBoxes
            userPokemons={userPokemons}
            onUpdatePokemon={onUpdatePokemon}
            isLoading={isLoading}
            isRankingFromAuthUser={isRankingFromAuthUser}
          />
        ) : (
          <h3 className="text-center mt-2">{t('no-pokemons-were-added')}</h3>
        )}
      </MainContainerComponent>
    </div>
  )
}

export default Pokemons

export const getServerSideProps: GetServerSideProps = async context => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
