import TopPokemonMapper from '../../../src/configs/mappers/TopPokemonMapper'
import { topPokemonDocument } from '../../fixtures/TopPokemonFixtures'

test('map topPokemonDocument to topPokemonResponse', () => {
  const sut = TopPokemonMapper.toResponse(topPokemonDocument)

  expect(sut.pokemon.name).toBe(topPokemonDocument.pokemon.name)
  expect(sut.comments[0].postId).toBe(topPokemonDocument.comments[0].post._id)
  expect(sut.comments[0].username).toBe(topPokemonDocument.comments[0].user.username)
  expect(sut.position).toBe(topPokemonDocument.position)
  expect(sut.userVotes[0].username).toBe(topPokemonDocument.userVotes[0].username)
})
