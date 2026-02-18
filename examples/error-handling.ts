/**
 * Demonstrates error handling patterns with the REST API.
 *
 * Usage: npx tsx examples/error-handling.ts
 */
import { RESTv2 } from 'bfx-api-node-rest'
import type { APIError } from 'bfx-api-node-rest'

const rest = new RESTv2({ transform: true })

// --- Promise-based error handling ---
try {
  // This will fail because no credentials are provided
  await rest.wallets()
} catch (err) {
  console.log('Expected auth error:', (err as Error).message)
}

// --- Handling API errors with status codes ---
try {
  // Intentionally trigger a bad request
  await rest.ticker({ symbol: 'tINVALID_SYMBOL_THAT_DOES_NOT_EXIST' })
} catch (err) {
  const apiErr = err as APIError
  console.log('API Error:')
  console.log('  message:', apiErr.message)
  if (apiErr.status) console.log('  HTTP status:', apiErr.status)
  if (apiErr.code) console.log('  API code:', apiErr.code)
  if (apiErr.response) console.log('  response:', apiErr.response)
}

// --- Successful public request ---
const ticker = await rest.ticker({ symbol: 'tBTCUSD' })
console.log('\nBTC/USD ticker:', ticker)
