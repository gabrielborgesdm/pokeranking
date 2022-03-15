import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import React, { FormEvent, useContext, useState } from 'react'
import { Form } from 'react-bootstrap'
import CustomButton from '../components/CustomButton'
import StatusBar from '../components/StatusBar'
import { PAGE_URL, REQUEST_URL } from '../configs/AppConfig'
import { IResponse } from '../configs/types/IResponse'
import { IStatus, IStatusType } from '../configs/types/IStatus'
import { AuthContext } from '../models/AuthContext'
import {
  AccountContainer,
  FullScreenContainer,
  YellowLink
} from '../styles/common'

const RecoverPassword: React.FC = () => {
  const { t } = useTranslation('common')
  const { getAxios } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<IStatus>({
    message: '',
    type: IStatusType.Success
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const data: IResponse = await submitRequest()
    if (data?.success) {
      setStatus({ message: t('an-email-has-been-sent-to-you-recover-your-account'), type: IStatusType.Success })
    } else if (data?.message) {
      setStatus({ message: data.message, type: IStatusType.Warning })
    } else {
      setStatus({ message: t('server-error'), type: IStatusType.Danger })
    }
    setIsLoading(false)
  }

  const submitRequest = async (): Promise<IResponse> => {
    let data = null
    const axios = getAxios()
    setStatus({ ...status, message: '' })
    try {
      const response = await axios.post(REQUEST_URL.PASSWORD_RECOVERY, { email })
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
              <h4>{t('enter-your-email-to-recovery-your-password')}</h4>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="password-recovery-email">{t('email')}</Form.Label>
              <Form.Control
                type="email"
                id="password-recovery-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('enter-your-email-address')}
                maxLength={70}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href={PAGE_URL.LOGIN}>
                <YellowLink className='small'>{t('go-back-to-login-screen')}</YellowLink>
              </Link>
            </Form.Group>
            <hr/>
            <CustomButton isLoading={isLoading}>{t('recover-password')}</CustomButton>
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default RecoverPassword
