import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect } from 'react'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import useTranslation from 'next-translate/useTranslation'
import GlobalStyle from '../styles/global'
import theme from '../styles/theme'
import Head from 'next/head'
import { LOCAL_STORAGE } from '../config/AppConfig'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const { t, lang } = useTranslation('common')

  const runInitialSetup = () => {
    if (localStorage.getItem(LOCAL_STORAGE.LANG) !== lang) localStorage.setItem(LOCAL_STORAGE.LANG, lang)
  }

  useEffect(runInitialSetup, [])
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
