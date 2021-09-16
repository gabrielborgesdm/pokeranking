import { colors } from '../styles/theme'

const { green, blue, white, orange, red } = colors
const backgrounds = [green, blue, orange, red]

export const getThemedColors = (index: number) => {
  return { color: white, backgroundColor: backgrounds[getBackgroundIndex(index)] }
}

const getBackgroundIndex = (index: number) => {
  let backgroundIndex = index % backgrounds.length
  backgroundIndex = backgroundIndex > backgrounds.length ? backgroundIndex - 1 : backgroundIndex
  return backgroundIndex
}
