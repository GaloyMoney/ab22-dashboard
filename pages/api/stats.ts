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

const getMockMerchantStats = () => {
  const mockMerchantStats: MerchantStats[] = [
    {
      name: "Swag",
      satsSpent: 932234,
      txCount: 32,
      maxTxAmountInSats: 23323,
      minTxAmountInSats: 2322,
      avgTxAmountInSats: 12212,
      recentTxs: [],
    },
    {
      name: "Kebab",
      satsSpent: 1032234,
      txCount: 12,
      maxTxAmountInSats: 43323,
      minTxAmountInSats: 2372,
      avgTxAmountInSats: 13212,
      recentTxs: [],
    },
    {
      name: "Pupusa",
      satsSpent: 432234,
      txCount: 22,
      maxTxAmountInSats: 423323,
      minTxAmountInSats: 2322,
      avgTxAmountInSats: 23212,
      recentTxs: [],
    },
    {
      name: "burger",
      satsSpent: 932234,
      txCount: 34,
      maxTxAmountInSats: 42323,
      minTxAmountInSats: 222,
      avgTxAmountInSats: 13212,
      recentTxs: [],
    },
  ]
  return mockMerchantStats
}

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
    minTxAmountInSats = Math.min(minTxAmountInSats, merchant.minTxAmountInSats)
  }

  return {
    satsSpent,
    txCount,
    maxTxAmountInSats,
    minTxAmountInSats,
    avgTxAmountInSats: Math.round(satsSpent / txCount),
    merchantStats,
    recentTxs,
  }
}
const RECENT_TX_LENGTH = 5

const merchantStatsFromTransactions = (transactions: Transaction[]): MerchantStats[] => {
  const filteredTransactions = transactions
    .filter((tx) => {
      return moment.unix(tx.createdAt).isAfter(moment(CONFERENCE_START))
    })
    .filter((tx) => tx.direction === "RECEIVE" && tx.status === "SUCCESS")
    .sort((tx1, tx2) => tx1.createdAt - tx2.createdAt)

  const merchantTransactions: Record<string, Transaction[]> = {}
  

  filteredTransactions.forEach((tx) => {
    const merchant = (tx.memo && MEMO_TO_MERCHANT[tx.memo]) || "Other"
    const merchantList = merchantTransactions[merchant] || []
    merchantList.push(tx)
    merchantTransactions[merchant] = merchantList
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

    const recentTxs =
      merchantTxList.length <= RECENT_TX_LENGTH
        ? merchantTxList
        : merchantTxList.slice(merchantTxList.length - RECENT_TX_LENGTH)

    merchantStats.push({
      name: merchant,
      maxTxAmountInSats,
      minTxAmountInSats,
      txCount: merchantTxList.length,
      satsSpent: totalSatsSpent,
      avgTxAmountInSats: Math.round(totalSatsSpent / merchantTxList.length),
      recentTxs: recentTxs.map((tx) => {
        return { amountInSats: tx.settlementAmount, date: moment.unix(tx.createdAt).toDate() }
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
  const merchantStats = merchantStatsFromTransactions(transactions)
  // const merchantStats = getMockMerchantStats()
  const aggregateStats = aggregateMerchantStats(merchantStats)
  res.status(200).json(aggregateStats)
}
