import mongoose from '../../../../configs/DatabaseConfig'
import { IUserDocument } from '../../../../configs/types/IUser'
import { ITopPokemonDocument } from '../../../../configs/types/ITopPokemon'

const topPokemonSchema = new mongoose.Schema<ITopPokemonDocument>({
  pokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemons', require: true },
  position: { type: Number, require: true },
  userVotes: { type: Array, require: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const TopPokemon =
  mongoose.models.TopPokemons ||
  mongoose.model<IUserDocument>('TopPokemons', topPokemonSchema)
export default TopPokemon
