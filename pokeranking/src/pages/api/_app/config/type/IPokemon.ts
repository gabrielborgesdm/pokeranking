
export interface IPokemon {
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

export interface IPokemonAdd {
  username: string,
  email: string,
  bio?: string,
  password: string,
}

export interface IPokemonUpdate {
  bio?: string,
  password?: string
}
