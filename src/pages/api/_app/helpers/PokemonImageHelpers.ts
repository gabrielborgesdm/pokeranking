import fs from 'fs'
import getConfig from 'next/config'

const relativePath = 'pokemons'
export const imagePath = `${getConfig().serverRuntimeConfig.PROJECT_ROOT}/public/${relativePath}`

export const getImage = (imageName: string): Buffer | null => {
  const fullImagePath = `${imagePath}/${imageName}`
  if (!fs.existsSync(fullImagePath)) return
  const imageBuffer = fs.readFileSync(fullImagePath)
  return imageBuffer
}

export const getRelativePath = (image: string) => `/${relativePath}/${image}`
