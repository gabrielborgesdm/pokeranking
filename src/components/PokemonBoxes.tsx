import React from 'react'
import { Row } from 'react-bootstrap'
import { IPokemon } from '../configs/types/IPokemon'
import { getThemedColors } from '../helpers/ColorHelpers'
import { CustomBoxRow, PokemonListingContainer } from '../styles/common'
import {
  CustomPokemonBox,
  CustomPokemonBoxTitle,
  CustomPokemonContainer,
  CustomPokemonToolsBox
} from '../styles/pages/pokemons'
import PokemonEditButton from './PokemonEditButton'

export interface IPokemonBoxes {
  userPokemons: Array<IPokemon>
  onUpdatePokemon: (pokemon: IPokemon, nextIndex: number) => void
  isLoading: boolean
  isRankingFromAuthUser: boolean
}

const PokemonBoxes: React.FC<IPokemonBoxes> = ({
  userPokemons,
  onUpdatePokemon,
  isRankingFromAuthUser
}: IPokemonBoxes) => {
  return (
    <CustomBoxRow>
      <PokemonListingContainer xs={12} className="container pb-5">
        <Row>
          {userPokemons &&
            userPokemons.length > 0 &&
            userPokemons.map((pokemon, index) => (
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
                    <CustomPokemonBoxTitle className="px-2">
                      {index + 1}º
                    </CustomPokemonBoxTitle>
                    <PokemonEditButton
                      pokemon={pokemon}
                      currentPosition={index + 1}
                      pokemonsLength={userPokemons.length}
                      onUpdatePokemon={onUpdatePokemon}
                      isRankingFromAuthUser={isRankingFromAuthUser}
                    />
                  </CustomPokemonToolsBox>
                </CustomPokemonBox>
              </CustomPokemonContainer>
            ))}
        </Row>
      </PokemonListingContainer>
    </CustomBoxRow>
  )
}

export default PokemonBoxes
