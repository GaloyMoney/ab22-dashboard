import Head from "next/head"

import useFetchData from "../hooks/use-fetch"
import styles from "../styles/Home.module.css"

export default function Home() {
  const { data: paymentStats, isLoading, isError } = useFetchData()

  if (isLoading || !paymentStats) {
    return (
      <div className="loader-wrapper">
        <span className="loader"></span>
      </div>
    )
  }

  if (isError) {
    return <div>{isError}</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Ab22 dashboard</title>
        <meta
          name="description"
          content="Statistics Dashboard for Adopting Bitcoin conference 2022"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {paymentStats.satsSpent} sats over {paymentStats.txCount} txs
        </h1>
      </main>
    </div>
  )
}
