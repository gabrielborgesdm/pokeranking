import React, { useState } from 'react'
import { FullscreenImageModal } from './FullscreenImageModal'

type ICustomPokemonImage = {
  avatar: string
  name: string
}

const CustomPokemonImage = ({ avatar, name }: ICustomPokemonImage) => {
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)
  const [fullscreenPokemonImageURL, setFullscreenPokemonImageURL] = useState('')
  const [fullscreenPokemonName, setFullscreenPokemonName] = useState('')

  const handleViewClick = (avatar: string) => {
    setFullscreenPokemonImageURL(avatar)
    setFullscreenPokemonName(name)
    setIsImageModalVisible(true)
  }

  return (
    <>
     <FullscreenImageModal
        imageURL={fullscreenPokemonImageURL}
        modalTitle={fullscreenPokemonName}
        isVisible={isImageModalVisible}
        setIsVisible={setIsImageModalVisible}
      />

      <img
        src={avatar || '/images/who.png'}
        width={250}
        height={250}
        className="pokemon-image cursor-zoom-in"
        onClick={() => {
          handleViewClick(avatar)
        }}
      />
  </>
  )
}

export default CustomPokemonImage
