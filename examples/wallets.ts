/**
 * Fetch all wallet balances using authenticated RESTv2.
 *
 * Usage: BFX_API_KEY=... BFX_API_SECRET=... npx tsx examples/wallets.ts
 */
import { RESTv2 } from 'bfx-api-node-rest'

const rest = new RESTv2({
  apiKey: process.env.BFX_API_KEY,
  apiSecret: process.env.BFX_API_SECRET,
  transform: true
})

const wallets = await rest.wallets()
console.log('Wallets:')
for (const w of wallets as any[]) {
  console.log(`  ${w.type} ${w.currency}: ${w.balance}`)
}
