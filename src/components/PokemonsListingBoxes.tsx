import React, { memo, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { IPokemon } from '../configs/types/IPokemon'
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

export interface IPokemonsListingBoxes {
  pokemons: Array<IPokemon>
  ActionButtons: any
  isLoading: boolean
}

const PokemonsListingBoxes: React.FC<IPokemonsListingBoxes> = ({
  pokemons,
  ActionButtons,
  isLoading
}: IPokemonsListingBoxes) => {
  const [numberOfPokemonsRendered, setNumberOfPokemonsRendered] = useState(50)

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
                      src={`../../${pokemon.image}`}
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
                      <CustomPokemonBoxTitle className="px-2">
                        {index + 1}º
                      </CustomPokemonBoxTitle>
                      {ActionButtons && ActionButtons}
                    </CustomPokemonToolsBox>
                  </CustomPokemonBox>
                </CustomPokemonContainer>
              ))}
        </Row>
      </PokemonListingContainer>
    </CustomBoxRow>
  )
}

export default memo(PokemonsListingBoxes)
