import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryTheme,
} from "victory"
import Head from "next/head"

import useFetchData from "../hooks/use-fetch"
import styles from "../styles/Home.module.css"

const colors = ["white", "orange", "brown", "blue", "green"]

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export const formatInteger = (value: number) => {
  return integerFormatter.format(value)
}

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

  paymentStats.merchantStats
    .sort((m1, m2) => m1.name.localeCompare(m2.name))
    .forEach((ms: any, merchantIndex: number) => {
      data.push({
        merchant: merchantIndex + 1,
        satsSpent: ms.satsSpent,
      })
      tickValues.push(merchantIndex + 1)
      tickFormat.push(ms.name)
    })

  const txs = paymentStats.recentTxs.map((tx, index) => {
    return { txNumber: paymentStats.txCount - index, ...tx }
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
        <div className={styles.headerContainer}>
          <h1>Adopting Bitcoin Lightning Transactions Feed</h1>
          <img src="BBWLogo.svg" className={styles.BBWLogo} />
        </div>
        <div className={styles.cardContainer}>
          <div className={styles.infoCard}>
            <h2>Transactions Volume</h2>
            <div className={styles.bigStats}>
              <p>{formatInteger(paymentStats.satsSpent)} sats</p>
              <p>{formatInteger(paymentStats.txCount)} transactions</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <h2>Latest Transactions</h2>
            <table className={styles.txTable}>
              <thead>
                <tr>
                  <th>TX Number</th>
                  <th>Amount</th>
                  <th>Merchant</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.txNumber}>
                    <td>#{tx.txNumber}</td>
                    <td>{formatInteger(tx.amountInSats)} sats</td>
                    <td>{tx.merchant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartCard}>
            <h2>Transaction volume breakdown by merchant</h2>
            <VictoryChart width={700} domainPadding={40}>
              <VictoryAxis
                tickValues={tickValues}
                tickFormat={tickFormat}
                style={{
                  tickLabels: { fontSize: 20, fill: "#535354" },
                }}
              />
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 20, fill: "#535354" },
                  grid: { stroke: "#E5E7EB", strokeWidth: 1 },
                }}
                dependentAxis
              />
              <VictoryBar
                data={data}
                x="merchant"
                y="satsSpent"
                labelComponent={<VictoryLabel dy={30} />}
                style={{
                  data: {
                    fill: "#536FF2",
                  },
                }}
              />
            </VictoryChart>
          </div>
          <div className={styles.infoCard}>
            <h2>Transaction Statistics</h2>
            <div className={styles.statsContainer}>
              <div className={styles.statsRow}>
                <div className={styles.rowLabel}>Largest Tx</div>
                <div className={styles.rowValue}>
                  {formatInteger(paymentStats.maxTxAmountInSats)} sats
                </div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.rowLabel}>Average Tx</div>
                <div className={styles.rowValue}>
                  {formatInteger(paymentStats.avgTxAmountInSats)} sats
                </div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.rowLabel}>Smallest Tx</div>
                <div className={styles.rowValue}>
                  {formatInteger(paymentStats.minTxAmountInSats)} sats
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>Powered by</p>
          <img src="GaloyLogo.svg" className={styles.galoyLogo} />
        </footer>
      </main>
    </div>
  )
}
