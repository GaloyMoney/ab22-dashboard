import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from "victory"

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

  const data: any = []
  const tickValues: any = []
  const tickFormat: any = []
  paymentStats.merchantStats.forEach((ms: any, merchant: number) => {
    data.push({
      merchant: merchant + 1,
      satsSpent: ms.satsSpent,
    })
    tickValues.push(merchant + 1)
    tickFormat.push(ms.name)
  })

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

        <div className={styles.dbBottom}>
          <div className={styles.dbBox}>
            <VictoryChart domainPadding={40}>
              <VictoryAxis tickValues={[1, 2, 3, 4]} tickFormat={tickFormat} />
              <VictoryAxis dependentAxis tickFormat={(x) => `${x / 1_000_000} MS`} />
              <VictoryBar data={data} x="merchant" y="satsSpent" />
            </VictoryChart>
          </div>
          <div className={styles.dbBox}>
            <div className={styles.boxRow}>
              <div className={styles.rowLabel}>Largest Tx</div>
              <div className={styles.rowValue}>{paymentStats.maxTxAmountInSats}</div>
            </div>
            <div className={styles.boxRow}>
              <div className={styles.rowLabel}>Average Tx</div>
              <div className={styles.rowValue}>{paymentStats.avgTxAmountInSats}</div>
            </div>
            <div className={styles.boxRow}>
              <div className={styles.rowLabel}>Smallest Tx</div>
              <div className={styles.rowValue}>{paymentStats.minTxAmountInSats}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
