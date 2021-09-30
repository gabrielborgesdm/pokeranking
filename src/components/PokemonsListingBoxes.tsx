import { faEye } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { memo, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { IPokemon } from '../configs/types/IPokemon'
import { IUserResponse } from '../configs/types/IUser'
import { getThemedColors } from '../helpers/ColorHelpers'
import {
  handleScrollAndGetNumberOfElementsToRender,
  scrollBackToTop
} from '../helpers/ScrollHelpers'
import users from '../pages/users'
import { CustomBoxRow, PokemonListingContainer } from '../styles/common'
import {
  CustomPokemonBox,
  CustomPokemonBoxTitle,
  CustomPokemonContainer,
  CustomPokemonToolsBox
} from '../styles/pages/pokemons'
import { FullscreenImageModal } from './FullscreenImageModal'

export interface IPokemonsListingBoxes {
  pokemons: Array<IPokemon>
  user: IUserResponse
  isLoading: boolean
}

const PokemonsListingBoxes: React.FC<IPokemonsListingBoxes> = ({
  pokemons,
  user,
  isLoading
}: IPokemonsListingBoxes) => {
  const [numberOfPokemonsRendered, setNumberOfPokemonsRendered] = useState(50)
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)
  const [fullscreenPokemonImageURL, setFullscreenPokemonImageURL] = useState('')
  const [fullscreenPokemonName, setFullscreenPokemonName] = useState('')

  useEffect(() => resetListingAfterUsersChange(), [users])

  const resetListingAfterUsersChange = () => {
    setNumberOfPokemonsRendered(50)
    scrollBackToTop()
  }

  const handleScroll = (element: any) => {
    const newElementsAmount = handleScrollAndGetNumberOfElementsToRender(
      element,
      numberOfPokemonsRendered,
      pokemons.length
    )
    setNumberOfPokemonsRendered(newElementsAmount)
  }

  const handleViewClick = (pokemon: IPokemon) => {
    setFullscreenPokemonImageURL(pokemon.image)
    setFullscreenPokemonName(pokemon.name)
    setIsImageModalVisible(true)
  }

  return (
    <CustomBoxRow>
      <PokemonListingContainer
        xs={12}
        className="container pb-5"
        onScroll={handleScroll}
      >
        <Row>
          {pokemons &&
            pokemons.length > 0 &&
            pokemons
              .slice(0, numberOfPokemonsRendered)
              .map((pokemon, index) => (
                <CustomPokemonContainer
                  xs={12}
                  md={3}
                  key={pokemon.name + index}
                  id={`pokemon-${pokemon.id}-box`}
                >
                  <CustomPokemonBox style={getThemedColors(index)}>
                    <img
                      src={pokemon.image}
                      width={80}
                      height={80}
                      className="pokemon-image"
                    />
                    <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center ">
                      <CustomPokemonBoxTitle>
                        {pokemon.name}
                      </CustomPokemonBoxTitle>
                    </div>
                    <CustomPokemonToolsBox>
                      <>
                        <div
                          className="mx-3"
                          onClick={() => {
                            handleViewClick(pokemon)
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </div>
                        {/* {user?.role === USER_ROLES.ADMIN && (
                          <div onClick={() => {}}>
                            <FontAwesomeIcon icon={faEdit} />
                          </div>
                        )} */}
                      </>
                    </CustomPokemonToolsBox>
                  </CustomPokemonBox>
                </CustomPokemonContainer>
              ))}
        </Row>
      </PokemonListingContainer>
      <FullscreenImageModal
        imageURL={fullscreenPokemonImageURL}
        modalTitle={fullscreenPokemonName}
        isVisible={isImageModalVisible}
        setIsVisible={setIsImageModalVisible}
      />
    </CustomBoxRow>
  )
}

export default memo(PokemonsListingBoxes)
