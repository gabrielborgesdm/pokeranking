import { faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { memo, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { PAGE_URL } from '../configs/AppConfig'
import { IUser } from '../configs/types/IUser'
import { IUserBoxes } from '../configs/types/IUserBox'
import { getThemedColors } from '../helpers/ColorHelpers'
import {
  handleScrollAndGetNumberOfElementsToRender,
  scrollBackToTop
} from '../helpers/ScrollHelpers'
import {
  CustomBox,
  CustomBoxRow,
  CustomBoxTitle,
  PokemonListingContainer
} from '../styles/common'
import { CustomPokemonToolsBox } from '../styles/pages/pokemons'

const UserBoxes: React.FC<IUserBoxes> = ({ users, isLoading }: IUserBoxes) => {
  const router = useRouter()
  const { t } = useTranslation('users')
  const { t: c } = useTranslation('common')
  const [numberOfUsersRendered, setNumberOfUsersRendered] = useState(50)

  useEffect(() => resetListingAfterUsersChange(), [users])

  const resetListingAfterUsersChange = () => {
    setNumberOfUsersRendered(50)
    scrollBackToTop()
  }

  const navigateToPokemon = (user: string) => {
    router.push(`${PAGE_URL.POKEMONS}/${user}`)
  }

  const handleScroll = (element: any) => {
    const newElementsAmount = handleScrollAndGetNumberOfElementsToRender(
      element,
      numberOfUsersRendered,
      users.length
    )
    setNumberOfUsersRendered(newElementsAmount)
  }

  const checkIfHasAwards = (index: number, user: IUser) => {
    let classes = ''
    if (index === 0 || user.pokemons.length > 700) {
      classes += 'bg-gold'
    } else if (index === 1 || user.pokemons.length > 400) {
      classes += 'bg-silver'
    } else if (index === 2 || user.pokemons.length > 200) {
      classes += 'bg-bronze'
    }
    return classes
  }

  return (
    <CustomBoxRow>
      <PokemonListingContainer
        xs={12}
        className="container pb-5"
        onScroll={handleScroll}
      >
        <Row>
          {users && users.length > 0 ? (
            users
              .slice(0, numberOfUsersRendered)
              .map((user: IUser, index: number) => (
                <PokemonListingContainer
                  xs={12}
                  md={3}
                  key={user.username + index}
                  onClick={() => navigateToPokemon(user.username)}
                >
                  <CustomBox
                    style={getThemedColors(index)}
                    className={`${checkIfHasAwards(index, user)}`}
                  >
                    <img
                      src={user.avatar}
                      width={80}
                      height={80}
                      className="pokemon-image"
                    />
                    <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center">
                      <CustomBoxTitle>{user.username}</CustomBoxTitle>
                      <CustomPokemonToolsBox>
                        {user.pokemons.length > 0 && (
                          <div className="d-flex flex-row align-items-center">
                            <span>{user.pokemons.length}</span>
                            <img
                              src="/images/pokeball.svg"
                              className="ml-10px"
                              width={25}
                            />
                          </div>
                        )}
                      </CustomPokemonToolsBox>
                    </div>
                  </CustomBox>
                </PokemonListingContainer>
              ))
          ) : (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              {isLoading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin={true}
                    size="3x"
                    className="m-3"
                  />
                  &nbsp;
                  <h1 className="mb-0">{c('loading')}</h1>
                </>
              ) : (
                <h1 className="mb-0">{t('no-trainers-found')}</h1>
              )}
            </div>
          )}
        </Row>
      </PokemonListingContainer>
    </CustomBoxRow>
  )
}

export default memo(UserBoxes)
