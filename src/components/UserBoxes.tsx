import Image from 'next/image'
import React from 'react'
import { Col } from 'react-bootstrap'
import { IUserType } from '../configs/types/IUser'
import { IUserBoxes } from '../configs/types/IUserBox'
import { CustomUserBox, CustomUserBoxRow, CustomUserBoxTitle } from '../styles/pages/users'
import { colors } from '../styles/theme'

const UserBoxes: React.FC<IUserBoxes> = ({ users }: IUserBoxes) => {
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

  return (
      <CustomUserBoxRow>
        {(users && users.length > 0 && users.map((user: IUserType) => (
          <Col xs={12} md={4} key={user.username}>
            <CustomUserBox style={getRandomBoxColors()}>
              <Image src={user.avatar} width={80} height={80}/>
              <CustomUserBoxTitle>{user.username}</CustomUserBoxTitle>
            </CustomUserBox>
          </Col>
        )))}
    </CustomUserBoxRow>
  )
}

export default UserBoxes
