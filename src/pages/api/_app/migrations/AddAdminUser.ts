import { hashPassword } from '../helpers/AuthenticationHelpers'
import UserRepository from '../repositories/UserRepository'

export const addAdminUser = async () => {
  const userRepository = new UserRepository()
  await userRepository.store({
    username: 'admin',
    email: 'admin@admin.com',
    password: await hashPassword('admin')
  })
}
