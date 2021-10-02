import fs from 'fs'

import getConfig from 'next/config'
import { join } from 'path'
import cloudinary from '../services/CloudinaryService'

export const imagePath = join(getConfig().serverRuntimeConfig.PROJECT_ROOT, 'src/assets/images/pokemons')

export const removeBase64Header = (base64: string): string => {
  const base64Array = base64.split(',')
  return `data:image/png;base64,${base64Array[base64Array.length - 1]}`
}

export const writeImage = async (base64: string): Promise<string> => {
  base64 = removeBase64Header(base64)
  return await uploadImage(base64)
}

export const removeImage = async (fileURL: string) : Promise<boolean> => {
  const publicId = getPublicIdFromUrl(fileURL)
  let isOkay = false
  try {
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, function(error, result) {
        if (result) {
          resolve()
          console.log(result)
          isOkay = true
        } else {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.log(error)
  }
  return isOkay
}

const getPublicIdFromUrl = (fileURL: string) => {
  const splittedStringArray = fileURL.split('/')
  let stringValue = splittedStringArray[splittedStringArray.length - 1]
  stringValue = stringValue.split('.')[0]
  return stringValue
}

export const getImage = (imageRelativePath: string) : Buffer | null => {
  const fullImagePath = join(imagePath, imageRelativePath)
  if (!fs.existsSync(fullImagePath)) return
  const imageBuffer = fs.readFileSync(fullImagePath)
  return imageBuffer
}

const uploadImage = async (file: string): Promise<string | null> => {
  let url: string = null
  try {
    url = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file, function(error, result) {
        if (result?.url) {
          resolve(result.url)
        } else {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.log(error)
  }
  return url
}
