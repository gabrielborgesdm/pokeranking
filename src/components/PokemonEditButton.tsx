import { faEdit, faEye, faTimes, faTimesCircle, faTrash } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { FormEvent, useState } from 'react'
import { FloatingLabel, Form, OverlayTrigger, Popover } from 'react-bootstrap'
import { IPokemon } from '../configs/types/IPokemon'
import { CustomPokemonPopover, CustomPokemonPopoverHeader } from '../styles/pages/pokemons'
import { colors } from '../styles/theme'
import CustomButton from './CustomButton'

export interface IPokemonEditButton {
  pokemon: IPokemon;
  currentPosition: number;
  pokemonsLength: number;
  onUpdatePokemon: (pokemon: IPokemon, nextIndex: number) => void;
  isRankingFromAuthUser: boolean;
}

const PokemonEditButton: React.FC<IPokemonEditButton> = ({ pokemon, currentPosition, onUpdatePokemon, pokemonsLength, isRankingFromAuthUser }: IPokemonEditButton) => {
  const [newPosition, setNewPosition] = useState(currentPosition)
  const [newNote, setNewNote] = useState(pokemon.note || '')
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const newPokemon = { ...pokemon }
    newPokemon.note = newNote
    onUpdatePokemon(newPokemon, newPosition - 1)
    setIsVisible(false)
  }

  const handleRemovePokemon = () => {
    if (window.confirm(`${t('do-you-want-to-remove-the-pokemon')} ${pokemon.name}?`)) {
      onUpdatePokemon(pokemon, -1)
      setIsVisible(false)
    }
  }

  const getPopoverPlacement = (elementClass: string) => {
    const element: HTMLElement = document.querySelector(elementClass)
    let isNearEdge = false
    if (element) {
      const edgePercentage = 100 * (element.offsetWidth + element.offsetLeft) / window.innerWidth
      isNearEdge = edgePercentage > 65
    }
    return isNearEdge ? 'left' : 'right'
  }

  const placement = getPopoverPlacement(`#pokemon-${pokemon.id}-box`)
  return (
    <OverlayTrigger
      trigger="click"
      key={pokemon.id}
      placement={placement}
      show={isVisible}
      overlay={
        <CustomPokemonPopover id={`popover-${pokemon.id}`} style={{ width: 400 }}>
          <CustomPokemonPopoverHeader>
              {isRankingFromAuthUser && (
                <FontAwesomeIcon icon={faTrash} color="#fff" onClick={() => handleRemovePokemon()}/>
              )}
              <span>{pokemon.name}</span>
              <FontAwesomeIcon icon={faTimesCircle} color="#fff" className="ml-10px" onClick={() => setIsVisible(false)}/>
          </CustomPokemonPopoverHeader>
          <Popover.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{c('position')}</Form.Label>
                <Form.Control
                  readOnly={!isRankingFromAuthUser}
                  type="number"
                  min={1}
                  max={pokemonsLength}
                  value={newPosition}
                  onChange={e => setNewPosition(parseInt(e.target.value))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
              <FloatingLabel controlId={`pokemon-${pokemon.name}-note`} label={c('note')}>
                <Form.Control
                  readOnly={!isRankingFromAuthUser}
                  as="textarea"
                  placeholder={c('leave-a-note')}
                  maxLength={100}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{ height: '100px', resize: 'none' }}
                />
              </FloatingLabel>
              </Form.Group>
              {isRankingFromAuthUser && (
                <Form.Group>
                  <CustomButton className="w-100">
                    {c('change')}
                  </CustomButton>
                </Form.Group>
              )}

            </Form>
          </Popover.Body>
        </CustomPokemonPopover>
      }
    >
      <div onClick={() => setIsVisible(!isVisible)}>
        <FontAwesomeIcon icon={isRankingFromAuthUser ? faEdit : faEye} />
      </div>
    </OverlayTrigger>
  )
}

export default PokemonEditButton
