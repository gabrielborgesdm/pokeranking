import React from 'react'
import Image from 'next/image'
import { CustomPokemonAvatar } from '../styles/pages/account'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faSpinner } from '@fortawesome/fontawesome-free-solid'
import { colors } from '../styles/theme'
import CustomButton from './CustomButton'

export interface IPokemonAvatar {
  avatar: string;
  isLoading: boolean;
}

const PokemonAvatar: React.FC<IPokemonAvatar> = ({ avatar, isLoading }: IPokemonAvatar) => {
  return (
    <CustomPokemonAvatar className="mx-2 mx-md-0">
      <div className="toolbox">
        {!isLoading &&
          <FontAwesomeIcon icon={faEdit} color={colors.orange} size="2x" />
        }
      </div>
      {!isLoading
        ? <Image src={avatar || '/pokeball.svg'} width={250} height={250} />
        : <FontAwesomeIcon icon={faSpinner} spin size="8x"/>
      }
    </CustomPokemonAvatar>
  )
}

export default PokemonAvatar
