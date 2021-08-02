import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { AccountContainer, BlueButton, FullScreenContainer } from '../styles/common'
import Image from 'next/image'
import { Form } from 'react-bootstrap'

const CreateAccount: React.FC = () => {
  const { t } = useTranslation('create-account')
  return (
    <div>
      <FullScreenContainer>
        <AccountContainer>
          <Image src="/images/pokeranking.png" width="656" height="184" quality="100" layout="responsive" />
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('email')}</Form.Label>
              <Form.Control type="email" placeholder={t('enter-your-email-address')} required />
              <Form.Text className="text-muted">
                {t('we-will-not-share-your-email')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('password')}</Form.Label>
              <Form.Control type="password" placeholder={t('enter-your-password')} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Link href="/create-account">
                <a>{t('no-account-create-one')}</a>
              </Link>
            </Form.Group>
            <BlueButton variant="secondary" type="submit">
              {t('enter')}
            </BlueButton>
          </Form>

        </AccountContainer>
      </FullScreenContainer>
    </div>
  )
}

export default CreateAccount
