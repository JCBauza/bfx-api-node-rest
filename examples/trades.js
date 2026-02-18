import Debug from 'debug'
import { RESTv2 } from '../dist/index.js'

process.env.DEBUG = '*'

const debug = Debug('bfx:api:rest:examples:trades')
const rest = new RESTv2({ transform: true })

const SYMBOL = 'tBTCUSD'

const run = async () => {
  const trades = await rest.trades({ symbol: SYMBOL })
  const [lastTrade] = trades

  debug('recv %d trades for %s', trades.length, SYMBOL)
  debug('last %s', JSON.stringify({
    mts: new Date(lastTrade.mts).toLocaleString(),
    price: lastTrade.price,
    amount: lastTrade.amount,
    id: lastTrade.id
  }, null, 2))
}

run().catch(e => debug('error: %s', e.stack))
