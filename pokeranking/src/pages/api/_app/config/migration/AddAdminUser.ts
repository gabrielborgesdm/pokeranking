import UserRepository from '../../repository/UserRepository'

export const addAdminUser = async () => {
  const userRepository = new UserRepository()
  await userRepository.store({
    username: 'admin',
    email: 'admin@admin.com',
    password: 'admin'
  })
}
