import useSWR from "swr"
import { PaymentStatsSummary } from "../pages/api/stats"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function useFetchData(): {
  data: PaymentStatsSummary
  isLoading: boolean
  isError: any
} {
  const { data, error } = useSWR(`/api/stats`, fetcher, { refreshInterval: 30 * 1000 })

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}
