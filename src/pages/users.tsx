import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import { FullScreenContainer, MainContainer } from '../styles/common'

const Users: React.FC = () => {
  const { t } = useTranslation('users')
  const { t: c } = useTranslation('common')

  return (
    <div>
      <FullScreenContainer>
        <MainContainer>

        </MainContainer>
      </FullScreenContainer>
    </div>
  )
}

export default Users
