export const MERCHANT_TOKEN = process.env.MERCHANT_SESSION_TOKEN || ""
export const GRAPHQL_URL =
  process.env.GRAPHQL_URL || "https://api.mainnet.galoy.io/graphql"
export const MEMO_TO_MERCHANT: Record<string, string> = {
  AB22Burgers: "Burgers",
  AB22Ceviches: "Ceviches",
  AB22Swag: "Swag",
  AB22Pupusas: "Pupusas",
  AB22Wraps: "Wraps",
  AB22Bar1: "Bar 1",
  AB22Bar2: "Bar 2"
}
export const CONFERENCE_START = new Date(
  process.env.CONFERENCE_START || "2022-10-03T00:00:00",
)
