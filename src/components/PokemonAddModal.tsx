import { faPlus } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { FormEvent, useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { REQUEST_URL } from '../configs/AppConfig'
import { IPokemon, IPokemonsResponse } from '../configs/types/IPokemon'
import { useFetch } from '../services/FetchService'
import FormButton from './FormButton'
import { PokemonsSelectList } from './PokemonsSelectList'

interface IPokemonAddModal {
  onAddPokemon: (pokemon: IPokemon, pokemonIndex: number) => void;
  userPokemons: Array<IPokemon>
}

const PokemonAddModal: React.FC<IPokemonAddModal> = ({ onAddPokemon, userPokemons }: IPokemonAddModal) => {
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [pokemonPosition, setPokemonPosition] = useState(1)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')

  useEffect(() => {
    setPokemonPosition(userPokemons.length + 1)
  }, [userPokemons])

  const handleSubmit = (e: FormEvent) => {
    console.log('salve')
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

        <PokemonsSelectList userPokemons={userPokemons} selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} />
        <Form.Group>
          <FormButton variant="primary" disabled={!checkFormIsValid()}>
            <FontAwesomeIcon icon={faPlus} />&nbsp;
            {t('add-pokemon')}
          </FormButton>
        </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
    <FormButton variant="primary" onClick={() => setIsModalVisible(true)} type="button">
      <FontAwesomeIcon icon={faPlus} />
    </FormButton>
    </>
  )
}

export default PokemonAddModal
