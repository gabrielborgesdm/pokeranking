import CommentDocumentMapper from '../../../src/configs/mappers/CommentDocumentMapper'
import { commentDocument } from '../../fixtures/CommentFixtures'

test('map commentDocument to commentResponse', () => {
  const mapper = new CommentDocumentMapper()

  const sut = mapper.mapObject(mapper.maps.toResponse, commentDocument)

  expect(sut.username).toBe(commentDocument.user.username)
  expect(sut.postId).toBe(commentDocument.post._id)
})
