import { faEdit } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { FormEvent, useState } from 'react'
import { Form, OverlayTrigger, Popover } from 'react-bootstrap'
import { IPokemonType } from '../configs/types/IPokemon'
import { CustomPokemonPopover } from '../styles/pages/pokemons'
import CustomButton from './CustomButton'

export interface IPokemonEditButton {
  pokemon: IPokemonType;
  currentPosition: number;
  pokemonsLength: number;
  onUpdatePosition: (pokemon: IPokemonType, nextIndex: number) => void;
}

const PokemonEditButton: React.FC<IPokemonEditButton> = ({ pokemon, currentPosition, onUpdatePosition, pokemonsLength }: IPokemonEditButton) => {
  const [pokemonPosition, setPokemonPosition] = useState(currentPosition)
  const { t: c } = useTranslation('common')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onUpdatePosition(pokemon, pokemonPosition - 1)
  }

  const placement = 'right'
  return (
    <OverlayTrigger
      trigger="click"
      key={pokemon.id}
      placement={placement}
      overlay={
        <CustomPokemonPopover id={`popover-${pokemon.id}`} style={{ width: 400 }}>
          <Popover.Header as="h3">{pokemon.name}</Popover.Header>
          <Popover.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{c('position')}</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={pokemonsLength}
                  value={pokemonPosition}
                  onChange={e => setPokemonPosition(parseInt(e.target.value))}
                  required
                />
              </Form.Group>
              <Form.Group>
                <CustomButton>
                  {c('change')}
                </CustomButton>
              </Form.Group>

            </Form>
          </Popover.Body>
        </CustomPokemonPopover>
      }
    >
      <div>
        <FontAwesomeIcon icon={faEdit} />
      </div>
    </OverlayTrigger>
  )
}

export default PokemonEditButton
