import { faExternalLinkAlt, faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { memo, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { PAGE_URL } from '../configs/AppConfig'
import { IUserType } from '../configs/types/IUser'
import { IUserBoxes } from '../configs/types/IUserBox'
import { getThemedColors } from '../helpers/ColorHelpers'
import { CustomBoxRow, CustomContainer, CustomBox, CustomBoxTitle } from '../styles/common'

const UserBoxes: React.FC<IUserBoxes> = ({ users, isLoading }: IUserBoxes) => {
  const router = useRouter()
  const { t } = useTranslation('users')
  const { t: c } = useTranslation('common')
  const [numberOfUsersRendered, setNumberOfUsersRendered] = useState(50)

  useEffect(() => resetListingAfterUsersChange(), [users])

  const resetListingAfterUsersChange = () => {
    setNumberOfUsersRendered(50)
    scrollBackToTop()
  }

  const handleScrollAndLoadUsers = (event) => {
    const usersContainer = event.target
    const isNearBottom = usersContainer.scrollHeight - usersContainer.scrollTop <= usersContainer.clientHeight + 300
    if (isNearBottom) {
      const newNumberOfUsersRendered = numberOfUsersRendered + 30 > users.length ? users.length : numberOfUsersRendered + 30
      setNumberOfUsersRendered(newNumberOfUsersRendered)
    }
  }

  const scrollBackToTop = () => {
    const usersContainer = document.querySelector('.users-container')
    if (!usersContainer) return
    usersContainer.scrollTo(0, 0)
  }

  const navigateToPokemon = (user: string) => {
    router.push(`${PAGE_URL.POKEMONS}/${user}`)
  }

  return (
      <CustomBoxRow>
        <CustomContainer xs={12} className="users-container pb-5" onScroll={(element) => handleScrollAndLoadUsers(element)}>
          <Row>
          {(users && users.length > 0
            ? users.slice(0, numberOfUsersRendered).map((user: IUserType, index: number) => (
              <CustomContainer xs={12} md={4} lg={3} key={user.username + index} onClick={() => navigateToPokemon(user.username)} >
                <CustomBox style={getThemedColors('users')}>
                  <Image src={user.avatar} width={80} height={80} className="pokemon-image"/>
                  <div className="container-name d-flex justify-content-between flex-grow-1 align-items-center">
                    <CustomBoxTitle>{user.username}</CustomBoxTitle>
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </div>
                </CustomBox>
              </CustomContainer>
            ))
            : (
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
                {isLoading
                  ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin={true} size="3x" className="m-3" />&nbsp;
                    <h1 className="mb-0">{c('loading')}</h1>
                  </>
                    )
                  : <h1 className="mb-0">{t('no-trainers-found')}</h1>
                }
              </div>
              ))}
          </Row>
        </CustomContainer>
    </CustomBoxRow>
  )
}

export default memo(UserBoxes)
