import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import MainContainerComponent from '../components/MainContainerComponent'
import UserBox from '../components/UserBox'
import { REQUEST_URL } from '../configs/AppConfig'

import { IUsersResponse, IUserType } from '../configs/types/IUser'
import { useFetch } from '../services/FetchService'

const Users: React.FC = () => {
  const { data } = useFetch<IUsersResponse>(REQUEST_URL.USERS)
  const [users, setUsers] = useState([])

  useEffect(() => {
    updateUser()
  }, [data])

  const updateUser = () => {
    if (data?.success) {
      setUsers(data.users)
    }
  }

  return (
    <div>
      <MainContainerComponent>
        <Row>
          {(users && users.length > 0 && users.map((user: IUserType) => (
            <UserBox key={user.username} user={user} />
          )))}
        </Row>
      </MainContainerComponent>
    </div>
  )
}

export default Users
