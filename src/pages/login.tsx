import React from 'react'
import Head from 'next/head'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'

const Login: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div>
      <Head>
        <title>{t('pokeranking')}</title>
        <meta name="description" content={'asd'} />
      </Head>

      <main>
        <h1>
        {t('title')}
        </h1>

        <Image src="/pokemons/001.png" alt="Picture of the author" width={200} height={200}/>
      </main>
    </div>
  )
}

export default Login
