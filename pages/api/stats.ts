import moment from "moment"
import type { NextApiRequest, NextApiResponse } from "next"
import {
  CONFERENCE_START,
  GRAPHQL_URL,
  MEMO_TO_MERCHANT,
  MERCHANT_TOKEN,
} from "../../config"
import { getTransactions, Transaction } from "../../services/transactions"

type PaymentStats = {
  satsSpent: number
  txCount: number
  avgTxAmountInSats: number
  maxTxAmountInSats: number
  minTxAmountInSats: number
}

type MerchantStats = {
  name: string
  recentTxs: {
    amountInSats: number
    date: Date
  }[]
} & PaymentStats

type TxSummary = {
  merchant: string
  amountInSats: number
  date: Date
}

export type PaymentStatsSummary = {
  merchantStats: MerchantStats[]
  recentTxs: TxSummary[]
} & PaymentStats

const aggregateMerchantStats = (merchantStats: MerchantStats[]): PaymentStatsSummary => {
  let satsSpent = 0
  let txCount = 0
  let maxTxAmountInSats = 0
  let minTxAmountInSats = merchantStats[0]?.minTxAmountInSats || 0
  let recentTxs: TxSummary[] = []

  for (const merchant of merchantStats) {
    satsSpent += merchant.satsSpent
    txCount += merchant.txCount
    maxTxAmountInSats = Math.max(maxTxAmountInSats, merchant.maxTxAmountInSats)
    minTxAmountInSats =
      minTxAmountInSats && merchant.minTxAmountInSats
        ? Math.min(minTxAmountInSats, merchant.minTxAmountInSats)
        : minTxAmountInSats || merchant.minTxAmountInSats
    merchant.recentTxs.forEach((tx) =>
      recentTxs.push({
        merchant: merchant.name,
        amountInSats: tx.amountInSats,
        date: tx.date,
      }),
    )
  }

  return {
    satsSpent,
    txCount,
    maxTxAmountInSats,
    minTxAmountInSats,
    avgTxAmountInSats: Math.round(satsSpent / txCount),
    merchantStats,
    recentTxs: recentTxs
      .sort((tx1, tx2) => tx2.date.getTime() - tx1.date.getTime())
      .slice(0, Math.min(recentTxs.length, 5)),
  }
}
const RECENT_TX_LENGTH = 5

const merchantStatsFromTransactions = (transactions: Transaction[]): MerchantStats[] => {
  const filteredTransactions = transactions
    .filter((tx) => {
      return moment.unix(tx.createdAt).isAfter(moment(CONFERENCE_START))
    })
    .filter((tx) => tx.direction === "RECEIVE" && tx.status === "SUCCESS")
    .sort((tx1, tx2) => tx2.createdAt - tx1.createdAt)

  const merchantTransactions: Record<string, Transaction[]> = {}

  for (const [, value] of Object.entries(MEMO_TO_MERCHANT)) {
    merchantTransactions[value] = []
  }

  filteredTransactions.forEach((tx) => {
    const merchant = tx.memo && MEMO_TO_MERCHANT[tx.memo]
    const merchantList = merchant ? merchantTransactions[merchant] : null
    if (merchantList) {
      merchantList.push(tx)
    }
  })

  const merchantStats: MerchantStats[] = []
  for (const merchant in merchantTransactions) {
    const merchantTxList = merchantTransactions[merchant]

    let totalSatsSpent = 0
    let maxTxAmountInSats = 0
    let minTxAmountInSats = merchantTxList[0]?.settlementAmount || 0

    merchantTxList.forEach((tx) => {
      totalSatsSpent += tx.settlementAmount
      maxTxAmountInSats = Math.max(maxTxAmountInSats, tx.settlementAmount)
      minTxAmountInSats = Math.min(minTxAmountInSats, tx.settlementAmount)
    })

    const recentTxs = merchantTxList.slice(
      0,
      Math.min(merchantTxList.length, RECENT_TX_LENGTH),
    )

    merchantStats.push({
      name: merchant,
      maxTxAmountInSats,
      minTxAmountInSats,
      txCount: merchantTxList.length,
      satsSpent: totalSatsSpent,
      avgTxAmountInSats: Math.round(totalSatsSpent / merchantTxList.length),
      recentTxs: recentTxs.map((tx) => {
        return {
          amountInSats: tx.settlementAmount,
          date: moment.unix(tx.createdAt).toDate(),
        }
      }),
    })
  }

  return merchantStats
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentStatsSummary>,
) {
  const transactions = await getTransactions({
    galoyEndpoint: GRAPHQL_URL,
    authToken: MERCHANT_TOKEN,
  })
  console.log(transactions)
  const merchantStats = merchantStatsFromTransactions(transactions)
  const aggregateStats = aggregateMerchantStats(merchantStats)

  res.status(200).json(aggregateStats)
}

const mockAggregateStats = {
  satsSpent: 215119,
  txCount: 20,
  maxTxAmountInSats: 112413,
  minTxAmountInSats: 5,
  avgTxAmountInSats: 10756,
  merchantStats: [
    {
      name: "Other",
      maxTxAmountInSats: 21087,
      minTxAmountInSats: 5,
      txCount: 14,
      satsSpent: 21311,
      avgTxAmountInSats: 1522,
      recentTxs: [
        { amountInSats: 5, date: "2022-11-10T18:55:17.000Z" },
        { amountInSats: 5, date: "2022-11-10T18:03:59.000Z" },
        { amountInSats: 5, date: "2022-11-09T23:36:53.000Z" },
        { amountInSats: 164, date: "2022-11-09T04:36:25.000Z" },
        { amountInSats: 5, date: "2022-11-08T20:43:19.000Z" },
      ],
    },
    {
      name: "Swag",
      maxTxAmountInSats: 112413,
      minTxAmountInSats: 112413,
      txCount: 1,
      satsSpent: 112413,
      avgTxAmountInSats: 112413,
      recentTxs: [{ amountInSats: 112413, date: "2022-11-10T15:12:37.000Z" }],
    },
    {
      name: "Pupusa",
      maxTxAmountInSats: 5614,
      minTxAmountInSats: 5614,
      txCount: 1,
      satsSpent: 5614,
      avgTxAmountInSats: 5614,
      recentTxs: [{ amountInSats: 5614, date: "2022-11-10T15:11:56.000Z" }],
    },
    {
      name: "Ceviche",
      maxTxAmountInSats: 22410,
      minTxAmountInSats: 22410,
      txCount: 1,
      satsSpent: 22410,
      avgTxAmountInSats: 22410,
      recentTxs: [{ amountInSats: 22410, date: "2022-11-10T15:11:24.000Z" }],
    },
    {
      name: "Burger",
      maxTxAmountInSats: 19564,
      minTxAmountInSats: 19564,
      txCount: 1,
      satsSpent: 19564,
      avgTxAmountInSats: 19564,
      recentTxs: [{ amountInSats: 19564, date: "2022-11-10T15:10:33.000Z" }],
    },
    {
      name: "Kebab",
      maxTxAmountInSats: 22552,
      minTxAmountInSats: 11255,
      txCount: 2,
      satsSpent: 33807,
      avgTxAmountInSats: 16904,
      recentTxs: [
        { amountInSats: 22552, date: "2022-11-10T15:05:47.000Z" },
        { amountInSats: 11255, date: "2022-11-10T15:05:10.000Z" },
      ],
    },
  ],
  recentTxs: [
    { merchant: "Other", amountInSats: 5, date: "2022-11-10T18:55:17.000Z" },
    { merchant: "Other", amountInSats: 5, date: "2022-11-10T18:03:59.000Z" },
    { merchant: "Swag", amountInSats: 112413, date: "2022-11-10T15:12:37.000Z" },
    { merchant: "Pupusa", amountInSats: 5614, date: "2022-11-10T15:11:56.000Z" },
    { merchant: "Ceviche", amountInSats: 22410, date: "2022-11-10T15:11:24.000Z" },
  ],
}
