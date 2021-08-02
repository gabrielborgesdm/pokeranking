import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import useTranslation from 'next-translate/useTranslation'
import GlobalStyle from '../styles/global'
import theme from '../styles/theme'
import Head from 'next/head'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const { t } = useTranslation('common')
  return (

  <ThemeProvider theme={theme}>
    <Head>
      <meta name="description" content={t('description')} />
      <title>{t('title')}</title>
    </Head>
    <Component {...pageProps} />
    <GlobalStyle />
  </ThemeProvider>
  )
}

export default MyApp
