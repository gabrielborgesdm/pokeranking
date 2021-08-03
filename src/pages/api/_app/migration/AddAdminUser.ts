import { hashPassword } from '../helper/AuthenticationHelpers'
import UserRepository from '../repository/UserRepository'

export const addAdminUser = async () => {
  const userRepository = new UserRepository()
  await userRepository.store({
    username: 'admin',
    email: 'admin@admin.com',
    password: await hashPassword('admin')
  })
}
