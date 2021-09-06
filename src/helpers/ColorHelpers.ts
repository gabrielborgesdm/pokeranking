import { colors } from '../styles/theme'

const pagesLastColorPosition = {}

export const getThemedColors = (pageName: string) => {
  const { green, blue, white, orange } = colors
  const backgrounds = [green, blue, orange]
  let currentPosition = getPageLastColorPosition(pageName)
  updatePageLastColorPosition(pageName, currentPosition + 1)
  if (getPageLastColorPosition(pageName) === backgrounds.length) updatePageLastColorPosition(pageName, 0)
  currentPosition = getPageLastColorPosition(pageName)
  return { color: white, backgroundColor: backgrounds[currentPosition] }
}

const getPageLastColorPosition = (pageName: string): number => {
  if (!pagesLastColorPosition[pageName]) {
    pagesLastColorPosition[pageName] = 0
  }
  return pagesLastColorPosition[pageName]
}

const updatePageLastColorPosition = (pageName: string, newPosition: number) => {
  pagesLastColorPosition[pageName] = newPosition
}
