import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { Router, useRouter } from 'next/router'
import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { Col, FloatingLabel, Form, FormGroup, Row } from 'react-bootstrap'
import CustomButton from '../components/CustomButton'
import MainContainerComponent from '../components/MainContainerComponent'
import PokemonAvatar from '../components/PokemonAvatar'
import StatusBar from '../components/StatusBar'
import { PAGE_URL, REQUEST_URL } from '../configs/AppConfig'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import { IUserType } from '../configs/types/IUser'
import { AuthContext } from '../models/AuthContext'
import { CustomBoxRow, CustomContainer, YellowLink } from '../styles/common'
import { AccountFormContainer } from '../styles/pages/account'
import { colors } from '../styles/theme'

export interface IAccount{

}

const Account: React.FC<IAccount> = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [status, setStatus] = useState<IStatus>({ message: '', type: IStatusType.Success })
  const [isLoading, setIsLoading] = useState(true)

  const { t } = useTranslation('create-account')
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
        setStatus({ message: t('account-created-with-success-click-to-log-in'), type: IStatusType.Success, onClick: goToLoginPage })
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
    console.log(password, rePassword, password === rePassword)
    if (password === rePassword) {
      return true
    } else {
      setStatus({ message: t('both-passwords-must-be-the-same'), type: IStatusType.Warning })
      return false
    }
  }

  const submitRequest = async () => {
    let data = null
    setStatus({ ...status, message: '' })
    try {
      const response = await getAxios().post(REQUEST_URL.CREATE_ACCOUNT, { user: { username, password, email } })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  return (
    <MainContainerComponent>
      <CustomBoxRow>
        <CustomContainer>
        <AccountFormContainer className="mx-auto" xs={10}>
          <StatusBar message={status.message} type={status.type} onClick={status.onClick} />
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <div className="d-flex flex-column flex-sm-row">
                  <div className="d-flex flex-column flex-sm-row align-items-center">
                    <PokemonAvatar avatar={avatar} isLoading={isLoading} />
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
                      <FloatingLabel controlId="user-bio" label={c('user-bio')}>
                        <Form.Control
                          id="account-bio"
                          as="textarea"
                          placeholder={c('write-bio')}
                          style={{ height: '70px', resize: 'none' }}
                        />
                      </FloatingLabel>
                  </div>
                    </Form.Group>

                  </div>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="account-password">{c('password')}</Form.Label>
                <Form.Control id="account-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={c('enter-your-password')}
                  maxLength={60}
                  required
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
                  required
                />
              </Form.Group>

              <CustomButton isLoading={isLoading} color={colors.dark}>
                {c('update-account')}
              </CustomButton>
            </Form>
          </AccountFormContainer>
        </CustomContainer>
      </CustomBoxRow>
    </MainContainerComponent>
  )
}

export default Account
