import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function useFetchData() {
  const { data, error } = useSWR(`/api/stats`, fetcher, { refreshInterval: 3600 })

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}
