import { faExternalLinkAlt, faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { Col } from 'react-bootstrap'
import { PAGE_URL } from '../configs/AppConfig'
import { IUserType } from '../configs/types/IUser'
import { IUserBoxes } from '../configs/types/IUserBox'
import { CustomUserBox, CustomUserBoxRow, CustomUserBoxTitle } from '../styles/pages/users'
import { colors } from '../styles/theme'

const UserBoxes: React.FC<IUserBoxes> = ({ users }: IUserBoxes) => {
  const router = useRouter()
  const { t } = useTranslation('users')
  const { t: c } = useTranslation('common')

  let lastColorPositions = []
  const { green, blue, orange, yellow, red, white, lightGrey } = colors
  const backgrounds = [green, blue, orange, yellow, red]
  const fonts = [white, white, white, lightGrey, white]

  const getRandomBoxColors = () => {
    const colorPosition: number = getColorPosition()
    return { color: fonts[colorPosition], backgroundColor: backgrounds[colorPosition] }
  }

  const getColorPosition = (): number => {
    let index: number
    do {
      index = Math.floor(Math.random() * backgrounds.length)
    } while (lastColorPositions.includes(index))
    lastColorPositions.push(index)
    lastColorPositions = lastColorPositions.slice(-2)
    return index
  }

  const navigateToUser = (user: string) => {
    router.push(`${PAGE_URL.USERS}/${user}`)
  }

  return (
      <CustomUserBoxRow>
        {(users && users.length > 0
          ? users.map((user: IUserType) => (
          <Col xs={12} md={4} key={user.username} onClick={() => navigateToUser(user.username)}>
            <CustomUserBox style={getRandomBoxColors()}>
              <Image src={user.avatar} width={80} height={80}/>
              <div className="d-flex justify-content-between flex-grow-1">
                <CustomUserBoxTitle>{user.username}</CustomUserBoxTitle>
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </div>
            </CustomUserBox>
          </Col>
          ))
          : (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <FontAwesomeIcon icon={faSpinner} spin={true} size="3x" className="m-3" />&nbsp;
              <h1 className="mb-0">{c('loading')}</h1>
            </div>
            ))}
    </CustomUserBoxRow>
  )
}

export default UserBoxes
