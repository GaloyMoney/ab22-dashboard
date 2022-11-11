import { GraphQLClient, gql } from "graphql-request"

const transactionListFragment = gql`
  fragment TransactionList on TransactionConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        __typename
        id
        status
        direction
        memo
        createdAt

        settlementAmount
        settlementFee
        settlementCurrency
        settlementPrice {
          base
          offset
          currencyUnit
          formattedAmount
        }
      }
    }
  }
`

const transactionListForDefaultAccount = gql`
  query transactionListForDefaultAccount(
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      defaultAccount {
        id
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
  ${transactionListFragment}
`

export type TxStatus = "FAILURE" | "PENDING" | "SUCCESS"
export type TxDirection = "RECEIVE" | "SEND"
export type WalletCurrency = "BTC" | "USD"
export type ExchangeCurrencyUnit = "BTCSAT" | "USDCENT"

export type Transaction = {
  readonly __typename: "Transaction"
  readonly id: string
  readonly status: TxStatus
  readonly direction: TxDirection
  readonly memo?: string | null
  readonly createdAt: number
  readonly settlementAmount: number
  readonly settlementFee: number
  readonly settlementCurrency: WalletCurrency
  readonly settlementPrice: {
    readonly __typename?: "Price"
    readonly base: number
    readonly offset: number
    readonly currencyUnit: ExchangeCurrencyUnit
    readonly formattedAmount: string
  }
}

export const getTransactions = async ({
  galoyEndpoint,
  authToken,
}: {
  galoyEndpoint: string
  authToken: string
}): Promise<Transaction[]> => {
  const client = new GraphQLClient(galoyEndpoint, {
    headers: { Authorization: `Bearer ${authToken}` },
  })

  return await client
    .request(transactionListForDefaultAccount, { first: 100000 })
    .then((data) =>
      data.me.defaultAccount.transactions.edges.map(
        (edge: { node: Transaction }) => edge.node,
      ),
    )
    .catch((err) => console.error(err))
}
