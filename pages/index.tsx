import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
} from "victory"
import Head from "next/head"

import useFetchData from "../hooks/use-fetch"
import styles from "../styles/Home.module.css"
import { useEffect, useRef } from "react"

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export const formatInteger = (value: number) => {
  return integerFormatter.format(value)
}

export default function Home() {
  const { data: paymentStats, isLoading, isError } = useFetchData()

  function usePrevious(value: any) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevPaymentStats = usePrevious({data: paymentStats});
  useEffect(() => {
    if(prevPaymentStats !== paymentStats) {
      playSound()
    }
  }, [paymentStats])


  if (isLoading || !paymentStats) {
    return (
      <div className="loader-wrapper">
        <span className="loader"></span>
      </div>
    )
  }

  if (isError) {
    console.error(isError)
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
  }).slice(0, Math.min(paymentStats.recentTxs.length, 4))

  function playSound() {
    try {
      const env = process.env.NODE_ENV
      let audioUrl = "http://localhost:3000/ding.mp3"
      if(env !== "development"){
        audioUrl = "https://ab22-dashboard.vercel.app/ding.mp3"
      }
      console.log(audioUrl);
      const audio = new Audio(audioUrl);
      audio.muted = true;
      audio.muted = false;
      audio.play();
      console.log( "ding!" );
    } catch(e){
      console.error(e)
    }

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
        <div className={styles.headerContainer}>
          <h1>Adopting Bitcoin Lightning Transactions Feed</h1>
          <img src="BBWLogo.svg" className={styles.BBWLogo} />
        </div>
        <div className={styles.cardContainer}>
          <div className={styles.infoCard}>
            <h2>Transaction volume</h2>
            <div className={styles.bigStats}>
              <p>{formatInteger(paymentStats.satsSpent)} sats</p>
              <p>{formatInteger(paymentStats.txCount)} transactions</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <h2>Latest transactions</h2>
            { paymentStats.txCount > 0 ? <table className={styles.txTable}>
              <thead>
                <tr>
                  <th className={styles.txNumberColumn}>TX Number</th>
                  <th className={styles.amountColumn}>Amount</th>
                  <th className={styles.merchantColumn}>Merchant</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.txNumber}>
                    <td>#{tx.txNumber}</td>
                    <td className={styles.amountColumn}>{formatInteger(tx.amountInSats)} sats</td>
                    <td className={styles.merchantColumn}>{tx.merchant}</td>
                  </tr>
                ))}
              </tbody>
            </table> : <p>No transactions</p>}

          </div>
          <div className={styles.chartCard}>
            <h2>{`Sats volume by merchant`}</h2>
            <VictoryChart width={1000} domainPadding={50}>
              <VictoryAxis
                tickValues={tickValues}
                tickFormat={tickFormat}
                style={{
                  tickLabels: { fontSize: 20, fill: "#535354", fontWeight: 350 },
                }}
              />
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 20, fill: "#535354", fontWeight: 350 },
                  grid: { stroke: "#E5E7EB", strokeWidth: .5 },
                }}
                tickFormat={(value, index)=> value > 1 ? formatInteger(value) : formatInteger((index+1) * 1000000)}
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
            <h2>Transaction statistics</h2>
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
          <p className={styles.hashtag}>
            #SpendSats
          </p>

             <p>Powered by</p>
           <img src="GaloyLogo.svg" className={styles.galoyLogo} />


        </footer>
      </main>
    </div>
  )
}
