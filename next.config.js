const withImages = require('next-images')
const nextTranslate = require('next-translate')

module.exports = nextTranslate(withImages({
  esModule: true,
  reactStrictMode: true
}))
