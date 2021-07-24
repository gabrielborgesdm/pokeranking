import mongoose from '../config/DatabaseConfig'
import { IUserPokemons } from '../config/type/IPokemon'
import { Schema } from 'mongoose'

const UserPokemonsModel = new mongoose.Schema<IUserPokemons>({
  user: { type: Schema.Types.ObjectId, ref: 'Users', require: true },
  pokemons: { type: Array },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const UserPokemons = mongoose.models.UserPokemons || mongoose.model<IUserPokemons>('UserPokemons', UserPokemonsModel)
export default UserPokemons
