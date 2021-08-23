import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import MainContainerComponent from '../components/MainContainerComponent'
import UserBoxes from '../components/UserBoxes'
import UserBox from '../components/UserBoxes'
import { REQUEST_URL } from '../configs/AppConfig'

import { IUsersResponse } from '../configs/types/IUser'
import { checkIsAuthenticated, serverSideRedirection } from '../services/AuthService'
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
        <UserBoxes users={users} />
      </MainContainerComponent>
    </div>
  )
}

export default Users

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
