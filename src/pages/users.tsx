import { faSearch } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import CustomButton from '../components/CustomButton'
import MainContainerComponent from '../components/MainContainerComponent'
import UserBoxes from '../components/UserBoxes'
import { REQUEST_URL } from '../configs/AppConfig'

import { IUsersResponse, IUserType } from '../configs/types/IUser'
import { checkIsAuthenticated, serverSideRedirection } from '../services/AuthService'
import { useFetch } from '../services/FetchService'

const Users: React.FC = () => {
  const { data } = useFetch<IUsersResponse>(REQUEST_URL.USERS)
  const [filteredUsername, setFilteredUsername] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const { t } = useTranslation('users')
  const { t: c } = useTranslation('common')

  useEffect(() => {
    updateUser()
  }, [data])

  const updateUser = () => {
    if (data?.success) {
      setUsers(data.users)
      setFilteredUsers(data.users)
      setIsLoading(false)
    }
  }

  const filterUsers = (users: Array<IUserType>) => {
    const filteredUsers = users.filter((user) => user.username.includes(filteredUsername.toLowerCase()))
    setFilteredUsers(filteredUsers)
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    filterUsers(users)
  }

  return (
    <div>
      <MainContainerComponent>
          <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mt-4 ml-0">
              <Col sm={12} className="d-flex">
                <Form.Control type="text" value={filteredUsername} onChange={e => setFilteredUsername(e.target.value)} placeholder={t('search-for-a-trainer')} maxLength={70} />
                <CustomButton className="py-2 ml-10px"><FontAwesomeIcon icon={faSearch} /></CustomButton>
              </Col>
            </Form.Group>
          </Form>
        <UserBoxes users={filteredUsers} isLoading={isLoading} />
      </MainContainerComponent>
    </div>
  )
}

export default Users

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!checkIsAuthenticated(context)) return serverSideRedirection
  return { props: {} }
}
