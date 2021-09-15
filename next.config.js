const withPlugins = require('next-compose-plugins')
const nextTranslate = require('next-translate')
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  esModule: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = withPlugins([nextTranslate, withSentryConfig], nextConfig)
