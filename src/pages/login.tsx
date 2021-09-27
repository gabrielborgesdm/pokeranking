import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import CustomButton from '../components/CustomButton'
import StatusBar from '../components/StatusBar'
import { PAGE_URL, REQUEST_URL } from '../configs/AppConfig'
import { ILoginResponse } from '../configs/types/ILogin'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import { AuthContext } from '../models/AuthContext'
import {
  AccountContainer,
  FullScreenContainer,
  YellowLink
} from '../styles/common'

const Login: React.FC = () => {
  const { t } = useTranslation('login')
  const { t: c } = useTranslation('common')
  const { login, logout, getAxios } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    const data: ILoginResponse = await submitRequest()
    if (data?.token) {
      login(data.token, data.user.username)
      document.location.replace(PAGE_URL.USERS)
    } else if (data) {
      setStatus({ message: data.message, type: IStatusType.Warning })
    } else {
      setStatus({ message: c('server-error'), type: IStatusType.Danger })
    }
    setIsLoading(false)
  }

  const submitRequest = async (): Promise<ILoginResponse> => {
    let data = null
    const axios = getAxios()
    setStatus({ ...status, message: '' })
    try {
      const response = await axios.post(REQUEST_URL.LOGIN, { email, password })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
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
          <StatusBar message={status.message} type={status.type} />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="login-email">{c('email')}</Form.Label>
              <Form.Control
                type="email"
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={c('enter-your-email-address')}
                maxLength={70}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="login-password">{c('password')}</Form.Label>
              <Form.Control
                type="password"
                id="login-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={c('enter-your-password')}
                maxLength={60}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href={PAGE_URL.CREATE_ACCOUNT}>
                <YellowLink>{t('no-account-create-one')}</YellowLink>
              </Link>
            </Form.Group>
            <CustomButton isLoading={isLoading}>{c('enter')}</CustomButton>
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default Login
