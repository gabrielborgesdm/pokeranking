import mongoose from 'mongoose'
import { type Pokemon } from '../domain/PokemonDomain'
import { POKEMON_TABLE_NAME } from '../domain/PokemonDomain'

const PokemonSchema = new mongoose.Schema<Pokemon>({
  name: { type: String, require: true },
  image: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model<Pokemon>(POKEMON_TABLE_NAME, PokemonSchema)
