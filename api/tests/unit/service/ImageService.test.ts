import { ImageService } from '../../../src/service/ImageService'
import translateStub from '../../stubs/TranslateStub'
import { makeImage } from '../../object-mother/ImageObjectMother'

describe('Image Service', () => {
  const imageService = new ImageService(translateStub)

  it('it should return true when uploading an image', async () => {
    const imageMock = makeImage()
    const stub = jest.spyOn(imageMock, 'mv')

    await imageService.uploadImage(imageMock)

    expect(stub).toHaveBeenCalled()
  })

  it('it should fail because the image size is too big', async () => {
    const imageMock = makeImage({ size: 5 * 1024 * 1024 })

    try {
      await imageService.uploadImage(imageMock)
    } catch (error: any) {
      expect(error.message).toBe('invalid_image_size')
    }
  })

  it('it should fail because the image type is invalid', async () => {
    const imageMock = makeImage({ mimetype: 'wrong/type' })

    try {
      await imageService.uploadImage(imageMock)
    } catch (error: any) {
      expect(error.message).toBe('invalid_image_format')
    }
  })
})
