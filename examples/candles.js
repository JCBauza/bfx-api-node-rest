import Debug from 'debug'
import { RESTv2 } from '../dist/index.js'

process.env.DEBUG = '*'

const debug = Debug('bfx:api:rest:examples:candles')
const rest = new RESTv2({ transform: true })

const SYMBOL = 'tBTCUSD'
const TIME_FRAME = '1m'

const run = async () => {
  const candles = await rest.candles({
    timeframe: TIME_FRAME,
    symbol: SYMBOL,
    section: 'hist',
    query: {
      start: String(Date.now() - (24 * 60 * 60 * 1000)),
      end: String(Date.now()),
      limit: '1000'
    }
  })

  const [lastCandle] = candles

  debug('recv %d candles for %s %s', candles.length, SYMBOL, TIME_FRAME)
  debug('latest %s', JSON.stringify({
    mts: new Date(lastCandle.mts).toLocaleString(),
    open: lastCandle.open,
    high: lastCandle.high,
    low: lastCandle.low,
    close: lastCandle.close,
    volume: lastCandle.volume
  }, null, 2))
}

run().catch(e => debug('error: %s', e.stack))
