export const MERCHANT_TOKEN = process.env.MERCHANT_SESSION_TOKEN || ""
export const GRAPHQL_URL =
  process.env.GRAPHQL_URL || "https://api.mainnet.galoy.io/graphql"
export const MEMO_TO_MERCHANT: Record<string, string> = {
  AB22Kebabs: "Kebab",
  AB22Swag: "Swag",
  AB22Burgers: "Burger",
  AB22Ceviche: "Ceviche",
  AB22Pupusas: "Pupusa",
  AB22Wraps: "Wraps",
}
export const CONFERENCE_START = new Date(
  process.env.CONFERENCE_START || "2022-10-03T00:00:00",
)
