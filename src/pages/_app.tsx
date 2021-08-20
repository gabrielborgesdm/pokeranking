import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import useTranslation from 'next-translate/useTranslation'
import GlobalStyle from '../styles/global'
import theme from '../styles/theme'
import Head from 'next/head'
import { AuthProvider } from '../models/AuthContext'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: any) => {
  const { t } = useTranslation('common')

  return (
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <Head>
        <meta name="description" content={t('description')} />
        <title>{t('title')}</title>
      </Head>
      <Component {...pageProps} />
      <GlobalStyle />
    </ThemeProvider>
  </AuthProvider>
  )
}

export default MyApp
