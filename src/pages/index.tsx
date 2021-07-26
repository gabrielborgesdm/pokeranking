import React from 'react'
import Head from 'next/head'
import Image from 'next/image'

const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Pokeranking</title>
        <meta name="description" content="Pokemon ranking" />
      </Head>

      <main>
        <h1>
          Salve
        </h1>
        <Image src="/pokemons/001.png" alt="Picture of the author" width={200} height={200}/>
      </main>
    </div>
  )
}

export default Home
