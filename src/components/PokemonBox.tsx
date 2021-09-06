import Image from 'next/image'
import React, { memo } from 'react'
import { IPokemonBox } from '../configs/types/IPokemonBox'
import { CustomPokemonBox } from '../styles/pages/pokemons'
import { CustomBoxTitle } from '../styles/pages/users'

const PokemonBox: React.FC<IPokemonBox> = ({ pokemon }: IPokemonBox) => {
  return (
    <CustomPokemonBox className="d-flex" >
      <Image src={pokemon.image} width={80} height={80}/>
      <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center">
        <CustomBoxTitle>{pokemon.name}</CustomBoxTitle>
      </div>
    </CustomPokemonBox>
  )
}

export default memo(PokemonBox)
