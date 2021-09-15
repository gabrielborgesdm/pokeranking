import { faEdit, faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import React, { FormEvent, useState } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { IPokemon } from '../configs/types/IPokemon'
import { CustomPokemonAvatar } from '../styles/pages/account'
import CustomButton from './CustomButton'
import { PokemonsSelectList } from './PokemonsSelectList'

interface IPokemonEditAvatarModal {
  onUpdateAvatar: (pokemon: IPokemon) => void;
  avatar: string;
  isLoading: boolean;
}

const PokemonEditAvatarModal: React.FC<IPokemonEditAvatarModal> = ({ onUpdateAvatar, avatar, isLoading }: IPokemonEditAvatarModal) => {
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const { t } = useTranslation('pokemons')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onUpdateAvatar(selectedPokemon)
    setIsModalVisible(false)
    setSelectedPokemon(null)
  }

  return (
    <>
    <Modal
      size="lg"
      show={isModalVisible}
      onHide={() => setIsModalVisible(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {t('change-avatar')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Form onSubmit={handleSubmit}>
        <CustomPokemonAvatar className="mx-auto">
          {selectedPokemon || avatar
            ? <Image src={selectedPokemon?.image || avatar} width={250} height={250} />
            : <FontAwesomeIcon icon={faSpinner} spin size="8x"/>
          }
        </CustomPokemonAvatar>
        <PokemonsSelectList userPokemons={[]} selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} />
        <Form.Group>
          <CustomButton isDisabled={!selectedPokemon}>
            <FontAwesomeIcon icon={faEdit} />&nbsp;
            {t('change-avatar')}
          </CustomButton>
        </Form.Group>
      </Form>
      </Modal.Body>
    </Modal>
    <CustomButton isLoading={isLoading} onClick={() => setIsModalVisible(true)} type="button" className="ml-10px" tooltip={t('change-avatar')}>
      <FontAwesomeIcon icon={faEdit} />
    </CustomButton>
    </>
  )
}

export default PokemonEditAvatarModal
