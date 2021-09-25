import fs from 'fs'
import { join } from 'path'
import getConfig from 'next/config'

export const imagePath = join(getConfig().serverRuntimeConfig.PROJECT_ROOT, 'src/assets/images/pokemons')

export const removeBase64Header = (base64: string): string => {
  const base64Array = base64.split(',')
  return base64Array[base64Array.length - 1]
}

export const writeImage = (imageName: string, base64: string): boolean => {
  const fullImagePath = join(imagePath, imageName)
  base64 = removeBase64Header(base64)
  try {
    fs.writeFileSync(fullImagePath, base64, { encoding: 'base64' })
  } catch (error) {
    console.log(error)
    return
  }
  return true
}

export const removeImage = (imageRelativePath: string) : boolean => {
  const fullImagePath = join(imagePath, imageRelativePath)
  if (!fs.existsSync(fullImagePath)) return null
  try {
    fs.unlinkSync(fullImagePath)
  } catch (error) {
    console.log(error)
    return null
  }
  return true
}
