import type { NextApiRequest, NextApiResponse } from "next"

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
  let minTxAmountInSats = merchantStats[0].minTxAmountInSats || 0
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentStatsSummary>,
) {
  const merchantStats = getMockMerchantStats()
  const aggregateStats = aggregateMerchantStats(merchantStats)

  setTimeout(() => res.status(200).json(aggregateStats), 823)
}
