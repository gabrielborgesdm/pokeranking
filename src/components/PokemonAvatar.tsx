import { faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { IPokemon } from '../configs/types/IPokemon'
import { CustomPokemonAvatar } from '../styles/pages/account'
import PokemonEditAvatarModal from './PokemonEditAvatarModal'

export interface IPokemonAvatar {
  avatar?: string
  onUpdateAvatar?: (pokemon: IPokemon) => void
  isLoading?: boolean
}

const PokemonAvatar: React.FC<IPokemonAvatar> = ({
  avatar,
  isLoading,
  onUpdateAvatar
}: IPokemonAvatar) => {
  return (
    <CustomPokemonAvatar className="mx-2 mx-md-0">
      <div className="toolbox">
        {!isLoading && onUpdateAvatar && (
          <PokemonEditAvatarModal
            avatar={avatar}
            onUpdateAvatar={onUpdateAvatar}
            isLoading={isLoading}
          />
        )}
      </div>
      {!isLoading ? (
        <img src={avatar || '/pokeball.svg'} width={250} height={250} />
      ) : (
        <FontAwesomeIcon icon={faSpinner} spin size="8x" />
      )}
    </CustomPokemonAvatar>
  )
}

export default PokemonAvatar
