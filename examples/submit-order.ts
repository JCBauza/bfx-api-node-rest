/**
 * Submit a new limit order using the Order model.
 *
 * Usage: BFX_API_KEY=... BFX_API_SECRET=... npx tsx examples/submit-order.ts
 */
import { RESTv2 } from 'bfx-api-node-rest'
import Models from 'bfx-api-node-models'

const { Order } = Models

const rest = new RESTv2({
  apiKey: process.env.BFX_API_KEY,
  apiSecret: process.env.BFX_API_SECRET,
  affCode: 'my_aff_code',   // optional affiliate code
  transform: true
})

const order = new Order({
  type: Order.type.EXCHANGE_LIMIT,
  symbol: 'tBTCUSD',
  price: 10000,
  amount: 0.01
})

console.log('Submitting order:', order.toString())
const result = await rest.submitOrder({ order })
console.log('Order submitted:', result)
