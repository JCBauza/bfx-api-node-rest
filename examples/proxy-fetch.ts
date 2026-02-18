/**
 * Use a proxy for all API requests via a custom fetch function.
 *
 * Requires: npm install undici
 *
 * Usage: PROXY_URL=http://proxy:8080 npx tsx examples/proxy-fetch.ts
 */
import { ProxyAgent } from 'undici'
import { RESTv2 } from '@jcbit/bfx-api-node-rest'

const proxyUrl = process.env.PROXY_URL || 'http://localhost:8080'
const dispatcher = new ProxyAgent(proxyUrl)

const rest = new RESTv2({
  transform: true,
  fetch: (url, opts) => fetch(url, { ...opts, dispatcher } as RequestInit)
})

const ticker = await rest.ticker({ symbol: 'tBTCUSD' })
console.log('BTC/USD ticker (via proxy):', ticker)
