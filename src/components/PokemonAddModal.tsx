import { faPlus } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { FormEvent, useEffect, useState } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { IPokemon } from '../configs/types/IPokemon'
import { colors } from '../styles/theme'
import CustomButton from './CustomButton'
import PokemonAvatar from './PokemonAvatar'
import { PokemonsSelectList } from './PokemonsSelectList'

interface IPokemonAddModal {
  onAddPokemon: (pokemon: IPokemon, pokemonIndex: number) => void
  userPokemons: Array<IPokemon>
  isLoading: boolean
}

const PokemonAddModal: React.FC<IPokemonAddModal> = ({
  onAddPokemon,
  userPokemons,
  isLoading
}: IPokemonAddModal) => {
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [pokemonPosition, setPokemonPosition] = useState(1)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')

  useEffect(() => {
    setPokemonPosition(userPokemons.length + 1)
  }, [userPokemons])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!checkFormIsValid()) return
    onAddPokemon({ ...selectedPokemon }, pokemonPosition - 1)
    setSelectedPokemon(null)
    setIsModalVisible(false)
  }

  const checkFormIsValid = (): boolean => {
    return selectedPokemon && !!pokemonPosition
  }

  return (
    <>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        show={isModalVisible}
        onHide={() => setIsModalVisible(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {t('add-pokemon')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center">
            <PokemonAvatar avatar={selectedPokemon?.image} />
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{c('position')}</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={userPokemons.length + 1}
                value={pokemonPosition}
                onChange={e => setPokemonPosition(parseInt(e.target.value))}
                required
              />
            </Form.Group>

            <PokemonsSelectList
              userPokemons={userPokemons}
              selectedPokemon={selectedPokemon}
              setSelectedPokemon={setSelectedPokemon}
            />
            <Form.Group>
              <CustomButton
                isDisabled={!checkFormIsValid()}
                color={colors.dark}
              >
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;
                {t('add-pokemon')}
              </CustomButton>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
      <CustomButton
        isLoading={isLoading}
        onClick={() => setIsModalVisible(true)}
        type="button"
        className="ml-10px"
        tooltip={t('add-pokemon')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </CustomButton>
    </>
  )
}

export default PokemonAddModal
