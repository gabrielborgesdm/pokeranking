const withPlugins = require('next-compose-plugins')
const nextTranslate = require('next-translate')

const nextConfig = {
  esModule: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = withPlugins([nextTranslate], nextConfig)
