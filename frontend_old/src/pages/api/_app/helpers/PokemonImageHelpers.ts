import fs from 'fs'

const relativePath = 'pokemons'
export const imagePath = `./public/${relativePath}`

export const getImage = (imageName: string): Buffer | null => {
  const fullImagePath = `${imagePath}/${imageName}`
  if (!fs.existsSync(fullImagePath)) return
  const imageBuffer = fs.readFileSync(fullImagePath)
  return imageBuffer
}
