import React from 'react'
import { IUserBox } from '../configs/types/IUserBox'
import { CustomUserBox } from '../styles/pages/users'

const UserBox: React.FC<IUserBox> = ({ user }: IUserBox) => {
  return (
    <CustomUserBox xs={12} md={3} lg>
      {user.username}
    </CustomUserBox>
  )
}

export default UserBox
