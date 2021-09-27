const withPlugins = require('next-compose-plugins')
const nextTranslate = require('next-translate')

const nextConfig = {
  esModule: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  }

}

module.exports = withPlugins([nextTranslate], nextConfig)
