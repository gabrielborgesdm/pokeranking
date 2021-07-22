
export interface IUserInterface {
  _id?: string,
  username: string,
  email?: string,
  bio?: string,
  password?: string,
  role?: string
  updatedAt?: number,
  createdAt?: number,
  toObject?: Function
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
