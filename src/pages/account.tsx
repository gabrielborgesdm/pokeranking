import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { FloatingLabel, Form } from 'react-bootstrap'
import CustomButton from '../components/CustomButton'
import MainContainerComponent from '../components/MainContainerComponent'
import PokemonAvatar from '../components/PokemonAvatar'
import StatusBar from '../components/StatusBar'
import { PAGE_URL, REQUEST_URL } from '../configs/AppConfig'
import { IPokemonType } from '../configs/types/IPokemon'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import { IUserType } from '../configs/types/IUser'
import { AuthContext } from '../models/AuthContext'
import { CustomBoxRow, CustomContainer } from '../styles/common'
import { FormContainer } from '../styles/pages/account'
import { colors } from '../styles/theme'

const Account: React.FC = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [bio, setBio] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [status, setStatus] = useState<IStatus>({ message: '', type: IStatusType.Success })
  const [isLoading, setIsLoading] = useState(true)

  const { t } = useTranslation('account')
  const { t: c } = useTranslation('common')
  const { getAxios, recoverUserInformation } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const user: IUserType = await recoverUserInformation()
    if (!user) {
      router.replace(PAGE_URL.LOGIN)
    } else {
      setEmail(user.email)
      setUsername(user.username)
      setAvatar(user.avatar)
      setBio(user.bio)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (isFormValid()) {
      const data = await submitRequest()
      if (data?.success) {
        setStatus({ message: t('account-updated-with-success'), type: IStatusType.Success })
        clearForm()
      } else if (data) {
        setStatus({ message: data.message, type: IStatusType.Warning })
      } else {
        setStatus({ message: c('server-error'), type: IStatusType.Danger })
      }
    }
    setIsLoading(false)
  }

  const isFormValid = (): boolean => {
    const validations = [isPasswordValid]
    let isValid = true
    validations.forEach((callValidationFunction: Function) => {
      if (!callValidationFunction()) {
        isValid = false
      }
    })
    return isValid
  }

  const isPasswordValid = (): boolean => {
    if (password === rePassword) {
      return true
    } else {
      setStatus({ message: c('both-passwords-must-be-the-same'), type: IStatusType.Warning })
      return false
    }
  }

  const submitRequest = async () => {
    let data = null
    setStatus({ ...status, message: '' })
    try {
      const payload: any = { user: {} }
      if (password) payload.user.password = password
      if (bio) payload.user.bio = bio
      if (selectedPokemon) payload.user.avatar = selectedPokemon.id

      const response = await getAxios().put(`${REQUEST_URL.USERS}/${username}/update`, payload)
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const clearForm = () => {
    setPassword('')
    setRePassword('')
  }

  const onUpdateSelectedPokemon = (selectedPokemon: IPokemonType | null) => {
    if (selectedPokemon) setSelectedPokemon(selectedPokemon)
  }

  return (
    <MainContainerComponent>
      <CustomBoxRow>
        <CustomContainer>
        <FormContainer className="mx-auto" xs={10}>
          <StatusBar message={status.message} type={status.type} onClick={status.onClick} />
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <div className="d-flex flex-column flex-sm-row">
                  <div className="d-flex flex-column flex-sm-row align-items-center">
                    <PokemonAvatar avatar={selectedPokemon ? selectedPokemon.image : avatar} isLoading={isLoading} onUpdateAvatar={onUpdateSelectedPokemon} />
                  </div>
                  <div className="d-flex flex-column flex-grow-1 ml-10px mt-3 mt-sm-0">
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="account-email" >{c('email')}</Form.Label>
                      <Form.Control id="account-email"
                        type="email"
                        value={email}
                        readOnly={true}
                        placeholder={c('enter-your-email-address')}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="account-username">{c('username')}</Form.Label>
                      <Form.Control id="account-username" type="text" value={username} readOnly={true} required />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label htmlFor="account-bio">{c('user-bio')}</Form.Label>
                      <div style={{ color: colors.lightGrey }}>
                      <FloatingLabel label={c('user-bio')}>
                        <Form.Control
                          id="account-bio"
                          as="textarea"
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder={c('user-bio')}
                          style={{ height: '70px', resize: 'none' }}
                        />
                      </FloatingLabel>
                  </div>
                    </Form.Group>

                  </div>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="account-password">{t('change-your-password')}</Form.Label>
                <Form.Control id="account-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={c('enter-your-password')}
                  maxLength={60}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="account-re-password">{c('repeat-password')}</Form.Label>
                <Form.Control
                  id="account-re-password"
                  type="password"
                  value={rePassword}
                  onChange={e => setRePassword(e.target.value)}
                  placeholder={c('enter-your-password')}
                  maxLength={60}
                />
              </Form.Group>

              <CustomButton isLoading={isLoading} color={colors.dark}>
                {c('update-account')}
              </CustomButton>
            </Form>
          </FormContainer>
        </CustomContainer>
      </CustomBoxRow>
    </MainContainerComponent>
  )
}

export default Account
