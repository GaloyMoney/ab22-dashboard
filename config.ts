export const MERCHANT_TOKEN = process.env.MERCHANT_SESSION_TOKEN || ""
export const GRAPHQL_URL =
  process.env.GRAPHQL_URL || "https://api.mainnet.galoy.io/graphql"
export const MEMO_TO_MERCHANT: Record<string, string> = {
  AB22Kebab: "Kebab",
  AB22Swag: "Swag",
  AB22Burger: "Burger",
}
export const CONFERENCE_START = new Date(
  process.env.CONFERENCE_START || "2022-10-03T00:00:00",
)
