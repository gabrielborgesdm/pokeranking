import React, { memo, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'

import { IPokemon } from '../configs/types/IPokemon'
import { IUserResponse } from '../configs/types/IUser'
import { getThemedColors } from '../helpers/ColorHelpers'
import { getPokemonImagePath } from '../helpers/PokemonHelpers'
import { handleScrollAndGetNumberOfElementsToRender, scrollBackToTop } from '../helpers/ScrollHelpers'
import users from '../pages/users'
import { CustomBoxRow, PokemonListingContainer } from '../styles/common'
import {
  CustomPokemonBox,
  CustomPokemonBoxTitle,
  CustomPokemonContainer,
  CustomPokemonToolsBox
} from '../styles/pages/pokemons'
import { FullscreenImageModal } from './FullscreenImageModal'
import PokemonEditModal from './PokemonEditModal'

export interface IPokemonsListingBoxes {
  pokemons: Array<IPokemon>
  user: IUserResponse
  isLoading: boolean
  reloadPokemons: Function
}

const PokemonsListingBoxes: React.FC<IPokemonsListingBoxes> = ({
  pokemons,
  user,
  reloadPokemons
}: IPokemonsListingBoxes) => {
  const [numberOfPokemonsRendered, setNumberOfPokemonsRendered] = useState(50)
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)
  const [fullscreenPokemonImageURL, setFullscreenPokemonImageURL] = useState('')
  const [fullscreenPokemonName, setFullscreenPokemonName] = useState('')
  const [pokemonToEdit, setPokemonToEdit] = useState(null)

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
    setFullscreenPokemonImageURL(getPokemonImagePath(pokemon.image))
    setFullscreenPokemonName(pokemon.name)
    setIsImageModalVisible(true)
  }

  const updatePokemon = (pokemonToEdit: IPokemon | null) => {
    setPokemonToEdit(pokemonToEdit)
    reloadPokemons()
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
                      src={getPokemonImagePath(pokemon?.image)}
                      width={80}
                      height={80}
                      className="pokemon-image cursor-zoom-in"
                      onClick={() => {
                        handleViewClick(pokemon)
                      }}
                    />
                    <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center ">
                      <CustomPokemonBoxTitle>
                        {pokemon.name}
                      </CustomPokemonBoxTitle>
                    </div>
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
      {pokemonToEdit && (
        <PokemonEditModal
          pokemonToEdit={pokemonToEdit}
          setPokemonToEdit={updatePokemon}
        />
      )}
    </CustomBoxRow>
  )
}

export default memo(PokemonsListingBoxes)
