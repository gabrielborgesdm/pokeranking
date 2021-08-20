import React, { FormEvent, useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { AccountContainer, FullScreenContainer, YellowLink } from '../styles/common'
import Image from 'next/image'
import { Form } from 'react-bootstrap'
import { PAGE_URL, REQUEST_URL } from '../configs/AppConfig'
import { useRouter } from 'next/router'
import StatusBar from '../components/StatusBar'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import axios from '../services/AxiosService'
import FormButton from '../components/FormButton'

import { AuthContext } from '../models/AuthContext'
import { ILoginResponse } from '../configs/types/ILogin'

const Login: React.FC = () => {
  const { t } = useTranslation('login')
  const { t: c } = useTranslation('common')
  const router = useRouter()
  const { login, logout } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<IStatus>({ message: '', type: IStatusType.Success })
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
      router.push(PAGE_URL.USERS)
    } else if (data) {
      setStatus({ message: data.message, type: IStatusType.Warning })
    } else {
      setStatus({ message: c('server-error'), type: IStatusType.Danger })
    }
    setIsLoading(false)
  }

  const submitRequest = async (): Promise<ILoginResponse> => {
    let data = null
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
          <Image src="/images/pokeranking.png" width="656" height="184" quality="100" layout="responsive" />
          <StatusBar message={status.message} type={status.type} />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{c('email')}</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c('enter-your-email-address')} maxLength={70} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{c('password')}</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={c('enter-your-password')} maxLength={60} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href={PAGE_URL.CREATE_ACCOUNT}>
                <YellowLink>{t('no-account-create-one')}</YellowLink>
              </Link>
            </Form.Group>
            <FormButton isLoading={isLoading} title={c('enter')} />
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default Login
