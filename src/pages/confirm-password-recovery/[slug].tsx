import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import CustomButton from '../../components/CustomButton'
import StatusBar from '../../components/StatusBar'
import { PAGE_URL, REQUEST_URL } from '../../configs/AppConfig'
import { IResponse } from '../../configs/types/IResponse'
import { IStatus, IStatusType } from '../../configs/types/IStatus'
import { AuthContext } from '../../models/AuthContext'
import {
  AccountContainer,
  FullScreenContainer
} from '../../styles/common'

const ConfirmPasswordRecovery: React.FC = () => {
  const { t } = useTranslation('common')
  const { getAxios } = useContext(AuthContext)
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [status, setStatus] = useState<IStatus>({
    message: '',
    type: IStatusType.Success
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(getAccessTokenOrRedirect, [])

  function getAccessTokenOrRedirect() {
    const accessToken = router.query.slug as string
    if (!accessToken) {
      router.replace(PAGE_URL.LOGIN)
    } else {
      setAccessToken(accessToken)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid()) {
      return
    }
    setIsLoading(true)
    const data: IResponse = await submitRequest()
    if (data?.success) {
      setStatus({ message: t('password-changed-with-success-log-in-your-account'), type: IStatusType.Success })
    } else if (data?.message) {
      setStatus({ message: data.message, type: IStatusType.Warning })
    } else {
      setStatus({ message: t('server-error'), type: IStatusType.Danger })
    }
    setIsLoading(false)
  }
  const isPasswordValid = (): boolean => {
    if (password === rePassword) {
      return true
    } else {
      setStatus({
        message: t('both-passwords-must-be-the-same'),
        type: IStatusType.Warning
      })
      return false
    }
  }

  const submitRequest = async (): Promise<IResponse> => {
    let data = null
    const axios = getAxios()
    setStatus({ ...status, message: '' })
    try {
      const response = await axios.post(REQUEST_URL.CONFIRM_RECOVERY, { password, accessToken })
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
              <h4>{t('enter-the-new-accounts-password')}</h4>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="create-account-password">
                {t('password')}
              </Form.Label>
              <Form.Control
                id="create-account-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('enter-your-password')}
                maxLength={60}
                required
              />
              <Form.Text className="text-muted">
                {t('enter-a-safe-password')}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="create-account-repeat">
                {t('repeat-password')}
              </Form.Label>
              <Form.Control
                id="create-account-repeat"
                type="password"
                value={rePassword}
                onChange={e => setRePassword(e.target.value)}
                placeholder={t('enter-your-password')}
                maxLength={60}
                required
              />
            </Form.Group>

            <hr/>
            <CustomButton isLoading={isLoading}>{t('confirm-password-recovery')}</CustomButton>
          </Form>
        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default ConfirmPasswordRecovery
