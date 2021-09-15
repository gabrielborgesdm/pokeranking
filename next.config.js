const withImages = require('next-images')
const nextTranslate = require('next-translate')

module.exports = nextTranslate({
  esModule: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  }
})
