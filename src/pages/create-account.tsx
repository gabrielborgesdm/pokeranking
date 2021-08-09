import React, { FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { AccountContainer, FullScreenContainer, YellowLink } from '../styles/common'
import Image from 'next/image'
import { Form } from 'react-bootstrap'
import { ILoginResponse } from '../config/types/IUser'
import { PAGE_URL, REQUEST_URL } from '../config/AppConfig'
import { useRouter } from 'next/router'
import FormButton from '../components/common/FormButton'
import { removeStorageToken, setStorageToken } from '../components/helper/StorageHelpers'
import StatusBar from '../components/common/StatusBar'
import { IStatus, IStatusType } from '../config/types/IStatus'
import { getAxiosInstance } from '../components/service/AxiosService'
import { UsernameRegex } from '../config/Regex'

const CreateAccount: React.FC = () => {
  const { t } = useTranslation('create-account')
  const { t: c } = useTranslation('common')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [status, setStatus] = useState<IStatus>({ message: '', type: IStatusType.Success })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    removeStorageToken()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const data: ILoginResponse = await submitLoginRequest()
    if (data?.token) {
      setStorageToken(data.token)
      router.push('/login')
    } else if (data) {
      setStatus({ message: data.message, type: IStatusType.Warning })
    } else {
      setStatus({ message: c('server-error'), type: IStatusType.Danger })
    }
    setIsLoading(false)
  }

  const submitLoginRequest = async () => {
    let data = null
    setStatus({ ...status, message: '' })
    try {
      const axios = getAxiosInstance()
      const response = await axios.post(REQUEST_URL.LOGIN, { email, password })
      data = response?.data
    } catch (error) {
      console.log(error)
    }
    return data
  }

  const updateUsername = (value: string) => {
    setUsername(oldUsername => value.match(UsernameRegex) || !value.length ? value : oldUsername)
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
              <Form.Text className="text-muted">
                {c('we-will-not-share-your-email')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{c('username')}</Form.Label>
              <Form.Control type="text" value={username} onChange={e => updateUsername(e.target.value)} placeholder={c('enter-your-username')} maxLength={30} required />
              <Form.Text className="text-muted">
                {c('your-username-cannot-contain-special-characters')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{c('password')}</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={c('enter-your-password')} maxLength={60} required />
              <Form.Text className="text-muted">
                {c('enter-a-safe-password')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{c('repeat-password')}</Form.Label>
              <Form.Control type="password" value={rePassword} onChange={e => setRePassword(e.target.value)} placeholder={c('enter-your-password')} maxLength={60} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href={PAGE_URL.LOGIN}>
                <YellowLink>{t('have-account-login')}</YellowLink>
              </Link>
            </Form.Group>
            <FormButton isLoading={isLoading} title={c('create-account')} />
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default CreateAccount
