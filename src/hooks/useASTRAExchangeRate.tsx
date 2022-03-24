import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import useAPIPolling, { APIPollingOptions } from './polling';

const url = 'https://api.binance.com/api/v1/ticker/24hr?symbol=ASTRAUSDT'
const fetchFunc = () => fetch(url).then(r => r.json())

export const useASTRAExchangeRate = singletonHook({}, () => {
  const [data, setData] = useState<any>({})

  const options: APIPollingOptions<any> = {
    fetchFunc,
    initialState: {},
    delay: 30000
  }
  const res = useAPIPolling(options)

  useEffect(() => {
    setData(res)
  }, [res])

  return data
})