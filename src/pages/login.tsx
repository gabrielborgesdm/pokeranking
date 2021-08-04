import React, { FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { AccountContainer, FullScreenContainer, YellowLink } from '../styles/common'
import Image from 'next/image'
import { Form } from 'react-bootstrap'
import axios from 'axios'
import { ILoginResponse } from '../config/types/IUser'
import { REQUEST_URL } from '../config/AppConfig'
import { useRouter } from 'next/router'
import FormButton from '../components/common/FormButton'
import { removeStorageToken, setStorageToken } from '../components/helper/StorageHelpers'
import StatusBar from '../components/common/StatusBar'
import { IStatus, IStatusType } from '../config/types/IStatus'

const Login: React.FC = () => {
  const { t } = useTranslation('login')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus]: IStatus = useState({ message: '', type: IStatusType.Success })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    removeStorageToken()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const data: ILoginResponse = await submitLoginRequest()
    if (data.token) {
      setStorageToken(data.token)
      router.push('/login')
    }
    setIsLoading(false)
  }

  const submitLoginRequest = async () => {
    let data = null
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
              <Form.Label>{t('email')}</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('enter-your-email-address')} required />
              <Form.Text className="text-muted">
                {t('we-will-not-share-your-email')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('password')}</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('enter-your-password')} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href="/create-account">
                <YellowLink>{t('no-account-create-one')}</YellowLink>
              </Link>
            </Form.Group>
            <FormButton isLoading={isLoading} title={t('enter')} />
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default Login
