import mongoose from '../../../../configs/DatabaseConfig'
import { IPokemonDocument } from '../../../../configs/types/IPokemon'
const AutoIncrement = require('mongoose-sequence')(mongoose)

const PokemonModel = new mongoose.Schema<IPokemonDocument>({
  name: { type: String, require: true },
  image: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

if (!mongoose.models.Pokemons) {
  PokemonModel.plugin(AutoIncrement, { inc_field: 'id' })
}

const Pokemon = mongoose.models.Pokemons || mongoose.model<IPokemonDocument>('Pokemons', PokemonModel)
export default Pokemon
