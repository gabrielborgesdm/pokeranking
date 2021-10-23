const withPlugins = require('next-compose-plugins')
const nextTranslate = require('next-translate')

const nextConfig = {
  esModule: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  }
}

module.exports = withPlugins([nextTranslate], nextConfig)
