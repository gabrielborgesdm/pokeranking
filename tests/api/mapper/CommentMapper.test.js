import CommentMapper from '../../../src/configs/mappers/CommentMapper'
import { commentDocument } from '../../fixtures/CommentFixtures'

test('map commentDocument to commentResponse', () => {
  const sut = CommentMapper.toResponse(commentDocument)

  expect(sut.username).toBe(commentDocument.user.username)
  expect(sut.userId).toBe(commentDocument.user._id)
  expect(sut.postId).toBe(commentDocument.post._id)
})
