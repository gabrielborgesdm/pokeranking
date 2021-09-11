import React from 'react'
import { Row } from 'react-bootstrap'
import { IPokemon, IPokemonType } from '../configs/types/IPokemon'
import { getThemedColors } from '../helpers/ColorHelpers'
import Image from 'next/image'
import { CustomPokemonBox, CustomPokemonBoxTitle, CustomPokemonContainer, CustomPokemonToolsBox } from '../styles/pages/pokemons'
import PokemonEditButton from './PokemonEditButton'

export interface IPokemonBoxes {
  userPokemons: Array<IPokemon>;
  onUpdatePokemon: (pokemon: IPokemon, nextIndex: number) => void;
  isLoading: boolean;
}

const PokemonBoxes: React.FC<IPokemonBoxes> = ({ userPokemons, onUpdatePokemon }: IPokemonBoxes) => {
  return (
    <Row>
      {(userPokemons && userPokemons.length > 0 && userPokemons.map((pokemon, index) => (
        <CustomPokemonContainer xs={12} md={4} lg={3} xl={2} key={pokemon.name + index} id={`pokemon-${pokemon.id}-box`}>
          <CustomPokemonBox style={getThemedColors('pokemons')}>
            <Image src={pokemon.image} width={80} height={80}/>
            <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center ">
              <CustomPokemonBoxTitle>{pokemon.name}</CustomPokemonBoxTitle>
            </div>
            <CustomPokemonToolsBox>
              <CustomPokemonBoxTitle className="px-2">{index + 1}º</CustomPokemonBoxTitle>
              <PokemonEditButton pokemon={pokemon} currentPosition={index + 1} pokemonsLength={userPokemons.length} onUpdatePokemon={onUpdatePokemon} />
            </CustomPokemonToolsBox>
          </CustomPokemonBox>
        </CustomPokemonContainer>
      )))}
    </Row>
  )
}

export default PokemonBoxes
