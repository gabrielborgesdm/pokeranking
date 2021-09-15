import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'
import { Dropdown, Form, FormControl } from 'react-bootstrap'
import { REQUEST_URL } from '../configs/AppConfig'
import { IPokemon, IPokemonsResponse, IPokemonType } from '../configs/types/IPokemon'
import { useFetch } from '../services/FetchService'

interface IPokemonsSelectList {
  userPokemons: Array<IPokemon>;
  selectedPokemon?: IPokemonType;
  setSelectedPokemon: (pokemon: IPokemonType) => void;
}

export const PokemonsSelectList: React.FC<IPokemonsSelectList> = ({ userPokemons, selectedPokemon, setSelectedPokemon }: IPokemonsSelectList) => {
  const { data } = useFetch<IPokemonsResponse>(REQUEST_URL.POKEMONS)

  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')
  const [pokemonFilter, setPokemonFilter] = useState('')
  const [pokemonsList, setPokemonsList] = useState([])

  useEffect(() => {
    if (data?.pokemons) {
      const idsOfUserPokemons = userPokemons.map(pokemon => pokemon.id)
      const newPokemonsList = data.pokemons.filter(pokemon => !idsOfUserPokemons.includes(pokemon.id))
      setPokemonsList(newPokemonsList)
    }
  }, [data])

  const renderCustomToggle = ({ children, onClick }, ref) => {
    const handleClick = (e) => {
      e.preventDefault()
      onClick(e)
    }
    return (
      <Form.Select ref={ref} onClick={handleClick} onMouseDown={(e) => e.preventDefault()}>
        <option>{children}</option>
      </Form.Select>
    )
  }

  const CustomToggle = React.forwardRef(renderCustomToggle)

  const renderCustomMenu = ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <FormControl
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder={t('search-pokemon')}
          onChange={(e) => setPokemonFilter(e.target.value)}
          value={pokemonFilter}
        />
        <ul className="list-unstyled" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {React.Children.toArray(children).length > 0 && (
            React.Children.toArray(children).filter(
              (child) => !pokemonFilter || child.props.children.toLowerCase().startsWith(pokemonFilter)
            )
          )}

        </ul>
      </div>
    )
  }

  const CustomMenu = React.forwardRef(renderCustomMenu)

  return (
     <Form.Group className="mb-3">
          <Form.Label>{c('pokemons')}</Form.Label>
          <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
              {selectedPokemon?.name || t('select-a-pokemon')}
            </Dropdown.Toggle>

            <Dropdown.Menu as={CustomMenu}>
              {(pokemonsList && pokemonsList.length > 0) && pokemonsList.map(pokemon =>
                <Dropdown.Item onClick={() => setSelectedPokemon(pokemon)}
                  key={`list_pokemon_${pokemon.id}`}
                  eventKey={`list_pokemon_${pokemon.id}`}
                  className="d-flex align-items-center"
                  active={pokemon.name === selectedPokemon?.name}>
                  {pokemon.name}
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
      </Form.Group>
  )
}
