import { IModel } from './IModel'

export interface IUser extends IModel{
  username: string,
  email?: string,
  bio?: string,
  password?: string,
  role?: string
}

export interface IUserAdd {
  username: string,
  email: string,
  bio?: string,
  password: string,
}

export interface IUserUpdate {
  bio?: string,
  password?: string
}
