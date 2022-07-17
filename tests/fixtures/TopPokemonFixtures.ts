import { commentDocument } from './CommentFixtures'

export const topPokemonDocument = {
  pokemon: {
    _id: '03e063e1-91ff-4660-8bf2-7b0f7b345c99',
    name: 'pokemon',
    image: 'pokemon.png',
    id: 123
  },
  position: 1,
  userVotes: [
    {
      username: 'user_a',
      position: 1
    },
    {
      username: 'user_b',
      position: 124
    }
  ],
  comments: [commentDocument]
}
