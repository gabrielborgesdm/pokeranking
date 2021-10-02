import { faEdit } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { FormEvent, useContext, useState } from 'react'
import { Col, Form, Modal, Row } from 'react-bootstrap'
import { REQUEST_URL } from '../configs/AppConfig'
import { IPokemon } from '../configs/types/IPokemon'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import { convertImageToBase64 } from '../helpers/ImageHelpers'
import { AuthContext } from '../models/AuthContext'
import { colors } from '../styles/theme'
import CustomButton from './CustomButton'
import StatusBar from './StatusBar'

interface IPokemonToEdit {
  pokemonToEdit: IPokemon
  setPokemonToEdit: (pokemon: IPokemon) => void
}

const PokemonEditModal: React.FC<IPokemonToEdit> = ({
  pokemonToEdit,
  setPokemonToEdit
}: IPokemonToEdit) => {
  const [pokemonName, setPokemonName] = useState<string>('')
  const [pokemonImage, setPokemonImage] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<IStatus>({
    message: '',
    type: IStatusType.Success
  })

  const { t } = useTranslation('pokemons')
  const { t: c } = useTranslation('common')
  const { getAxios } = useContext(AuthContext)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!checkFormIsValid()) return
    setIsLoading(true)
    const data = await submitRequest()
    if (data?.success) {
      setStatus({
        message: t('pokemon-updated-with-success'),
        type: IStatusType.Success
      })
      setPokemonImage('')
      setPokemonName('')
      setPokemonToEdit(null)
    } else if (data) {
      setStatus({ message: data.message, type: IStatusType.Warning })
    } else {
      setStatus({ message: c('server-error'), type: IStatusType.Danger })
    }
    setIsLoading(false)
  }

  const submitRequest = async () => {
    let data = null
    setStatus({ ...status, message: '' })
    const payload = { pokemon: {} }
    if (pokemonImage) {
      payload.pokemon.image = pokemonImage.split(',')[1]
    }
    if (pokemonName) {
      payload.pokemon.name = pokemonName
    }
    try {
      const response = await getAxios().put(
        `${REQUEST_URL.POKEMONS}/${pokemonToEdit.id}/update`,
        payload
      )
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const checkFormIsValid = (): boolean => {
    return !!pokemonToEdit && (!!pokemonImage || !!pokemonName)
  }

  const handleChangeImage = async (e: FormEvent) => {
    const image = e.target.files[0]
    const base64Image: string = await convertImageToBase64(image)
    setPokemonImage(base64Image)
  }

  return (
    <>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        show={pokemonToEdit}
        onHide={() => setPokemonToEdit(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {t('update-pokemon')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <StatusBar
                message={status.message}
                type={status.type}
                onClick={status.onClick}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <img
                src={pokemonImage || pokemonToEdit.image}
                id="add-pokemon-img"
                alt="pokemon-image"
                className="img-modal my-2"
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('pokemon-name')}</Form.Label>
                  <Form.Control
                    type="text"
                    min={1}
                    value={pokemonName || pokemonToEdit.name}
                    placeholder={t('enter-pokemon-the-name')}
                    onChange={e => setPokemonName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('pokemon-name')}</Form.Label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={e => handleChangeImage(e)}
                  />
                </Form.Group>

                <Form.Group>
                  <CustomButton
                    isDisabled={!checkFormIsValid()}
                    color={colors.dark}
                    isLoading={isLoading}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    &nbsp;
                    {t('update-pokemon')}
                  </CustomButton>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default PokemonEditModal
