import React from 'react'
import { Row } from 'react-bootstrap'
import { IPokemon, IPokemonType } from '../configs/types/IPokemon'
import { getThemedColors } from '../helpers/ColorHelpers'
import Image from 'next/image'
import { CustomPokemonBox, CustomPokemonBoxTitle, CustomPokemonContainer, CustomPokemonToolsBox } from '../styles/pages/pokemons'
import PokemonEditButton from './PokemonEditButton'

export interface IPokemonBoxes {
  pokemons: Array<IPokemon>;
  setPokemons: (pokemons: Array<IPokemon>) => void;
}

const PokemonBoxes: React.FC<IPokemonBoxes> = ({ pokemons, setPokemons }: IPokemonBoxes) => {
  const onUpdatePosition = (pokemon: IPokemonType, nextPosition: number) => {
    const index = nextPosition - 1
    const oldIndex = pokemons.indexOf(pokemon)
    const newPokemons = [...pokemons]
    newPokemons.splice(oldIndex, 1)
    newPokemons.splice(index, 0, pokemon)
    setPokemons(newPokemons)
  }

  return (
    <Row>
      {(pokemons && pokemons.length > 0 && pokemons.map((pokemon, index) => (
        <CustomPokemonContainer xs={12} md={4} lg={3} xl={2} key={pokemon.name + index} >
          <CustomPokemonBox style={getThemedColors('pokemons')}>
            <Image src={pokemon.image} width={80} height={80}/>
            <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center ">
              <CustomPokemonBoxTitle>{pokemon.name}</CustomPokemonBoxTitle>
            </div>
            <CustomPokemonToolsBox>
              <PokemonEditButton pokemon={pokemon} currentPosition={index + 1} pokemonsLength={pokemons.length} onUpdatePosition={onUpdatePosition} />
            </CustomPokemonToolsBox>
          </CustomPokemonBox>
        </CustomPokemonContainer>
      )))}
    </Row>
  )
}

export default PokemonBoxes
