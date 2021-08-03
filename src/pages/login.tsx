import React, { FormEvent, useState } from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { AccountContainer, FullScreenContainer, YellowLink } from '../styles/common'
import Image from 'next/image'
import { Form } from 'react-bootstrap'
import axios from 'axios'
import { ILoginResponse } from '../config/types/IUser'
import { LOCAL_STORAGE } from '../config/AppConfig'
import { useRouter } from 'next/router'
import FormButton from '../components/templates/FormButton'

const Login: React.FC = () => {
  const { t } = useTranslation('login')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const data: ILoginResponse = await submitLoginRequest()
    if (data.token) {
      localStorage.setItem(LOCAL_STORAGE.TOKEN, data.token)
      cleanForm()
      router.push('/login')
    }
  }

  const submitLoginRequest = async () => {
    let data = null
    try {
      const response = await axios.post('/api/users/login', { email, password })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const cleanForm = () => {
    setEmail('')
    setPassword('')
  }

  return (
    <div>
      <FullScreenContainer>
        <AccountContainer>
          <Image src="/images/pokeranking.png" width="656" height="184" quality="100" layout="responsive" />
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
