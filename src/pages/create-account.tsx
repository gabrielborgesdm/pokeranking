import React, { FormEvent, useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import {
  AccountContainer,
  FullScreenContainer,
  YellowLink
} from '../styles/common'
import Image from 'next/image'
import { Form } from 'react-bootstrap'
import { PAGE_URL, REQUEST_URL } from '../configs/AppConfig'
import StatusBar from '../components/StatusBar'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import { UsernameRegex } from '../configs/Regex'
import { useRouter } from 'next/router'
import CustomButton from '../components/CustomButton'
import { AuthContext } from '../models/AuthContext'

const CreateAccount: React.FC = () => {
  const { t } = useTranslation('create-account')
  const { t: c } = useTranslation('common')
  const { getAxios, logout } = useContext(AuthContext)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [status, setStatus] = useState<IStatus>({
    message: '',
    type: IStatusType.Success
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    logout()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (isFormValid()) {
      const data = await submitRequest()
      if (data?.success) {
        setStatus({
          message: t('account-created-with-success-click-to-log-in'),
          type: IStatusType.Success,
          onClick: goToLoginPage
        })
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
      setStatus({
        message: c('both-passwords-must-be-the-same'),
        type: IStatusType.Warning
      })
      return false
    }
  }

  const submitRequest = async () => {
    let data = null
    setStatus({ ...status, message: '' })
    try {
      const response = await getAxios().post(REQUEST_URL.CREATE_ACCOUNT, {
        user: { username, password, email }
      })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const updateUsername = (value: string) => {
    setUsername(oldUsername =>
      value.match(UsernameRegex) || !value.length ? value : oldUsername
    )
  }

  const clearForm = () => {
    setEmail('')
    setUsername('')
    setPassword('')
    setRePassword('')
  }

  const goToLoginPage = () => {
    router.push(PAGE_URL.LOGIN)
  }

  return (
    <div>
      <FullScreenContainer>
        <AccountContainer>
          <Image
            src="/images/pokeranking.png"
            width="656"
            height="184"
            quality="100"
            layout="responsive"
          />
          <StatusBar
            message={status.message}
            type={status.type}
            onClick={status.onClick}
          />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="create-account-email">
                {c('email')}
              </Form.Label>
              <Form.Control
                id="create-account-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={c('enter-your-email-address')}
                maxLength={70}
                required
              />
              <Form.Text className="text-muted">
                {c('we-will-not-share-your-email')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="create-account-username">
                {c('username')}
              </Form.Label>
              <Form.Control
                id="create-account-username"
                type="text"
                value={username}
                onChange={e => updateUsername(e.target.value)}
                placeholder={c('enter-your-username')}
                maxLength={30}
                required
              />
              <Form.Text className="text-muted">
                {c('your-username-cannot-contain-special-characters')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="create-account-password">
                {c('password')}
              </Form.Label>
              <Form.Control
                id="create-account-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={c('enter-your-password')}
                maxLength={60}
                required
              />
              <Form.Text className="text-muted">
                {c('enter-a-safe-password')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="create-account-repeat">
                {c('repeat-password')}
              </Form.Label>
              <Form.Control
                id="create-account-repeat"
                type="password"
                value={rePassword}
                onChange={e => setRePassword(e.target.value)}
                placeholder={c('enter-your-password')}
                maxLength={60}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href={PAGE_URL.LOGIN}>
                <YellowLink className='small'>{t('have-account-login')}</YellowLink>
              </Link>
            </Form.Group>
            <hr/>
            <CustomButton isLoading={isLoading}>
              {c('create-account')}
            </CustomButton>
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default CreateAccount
