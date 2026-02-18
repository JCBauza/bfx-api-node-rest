/**
 * List active funding offers and submit a new one.
 *
 * Usage: BFX_API_KEY=... BFX_API_SECRET=... npx tsx examples/funding-offers.ts
 */
import { RESTv2 } from 'bfx-api-node-rest'
import Models from 'bfx-api-node-models'

const { FundingOffer } = Models

const rest = new RESTv2({
  apiKey: process.env.BFX_API_KEY,
  apiSecret: process.env.BFX_API_SECRET,
  transform: true
})

// List current funding offers for USD
const offers = await rest.fundingOffers({ symbol: 'fUSD' })
console.log('Active funding offers:', offers)

// Submit a new funding offer
const offer = new FundingOffer({
  type: 'LIMIT',
  symbol: 'fUSD',
  rate: 0.0001,   // daily rate
  amount: 50,
  period: 2       // days
})

console.log('Submitting funding offer...')
const result = await rest.submitFundingOffer({ offer })
console.log('Funding offer submitted:', result)
