# @jcbit/bfx-api-node-rest v8.0.1 — API Reference

Official Bitfinex REST v1 & v2 API client for Node.js (ESM, TypeScript).

---

## Table of Contents

1. [Installation & Quick Start](#installation--quick-start)
2. [RESTv2 Constructor Options](#restv2-constructor-options)
3. [Public Market Data Methods](#public-market-data-methods)
4. [Authenticated - Orders](#authenticated---orders)
5. [Authenticated - Positions](#authenticated---positions)
6. [Authenticated - Funding](#authenticated---funding)
7. [Authenticated - Wallets & Account](#authenticated---wallets--account)
8. [Authenticated - Settings](#authenticated---settings)
9. [Authenticated - Alerts](#authenticated---alerts)
10. [Authenticated - Transfers & Deposits](#authenticated---transfers--deposits)
11. [Authenticated - Auth Tokens](#authenticated---auth-tokens)
12. [Authenticated - Recurring Algo Orders](#authenticated---recurring-algo-orders)
13. [Authenticated - Other](#authenticated---other)
14. [RESTv1 (Deprecated)](#restv1-deprecated)
15. [Error Handling](#error-handling)
16. [Proxy / Custom Fetch](#proxy--custom-fetch)
17. [Models & Transform](#models--transform)
18. [Utility Methods](#utility-methods)

---

## Installation & Quick Start

```bash
npm i --save @jcbit/bfx-api-node-rest
```

Requires **Node.js >= 22.0.0**. The package is ESM-only.

```typescript
import { RESTv2 } from '@jcbit/bfx-api-node-rest'

// Public (unauthenticated) client
const rest = new RESTv2({ transform: true })
const ticker = await rest.ticker({ symbol: 'tBTCUSD' })
console.log(ticker)

// Authenticated client
const authRest = new RESTv2({
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  transform: true
})
const wallets = await authRest.wallets()
console.log(wallets)
```

All methods return a `Promise` and optionally accept a Node-style `(err, result)` callback as the last parameter.

---

## RESTv2 Constructor Options

```typescript
const rest = new RESTv2(opts?: RESTv2Options)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | `''` | Bitfinex API key. Required for authenticated endpoints. |
| `apiSecret` | `string` | `''` | Bitfinex API secret. Required for authenticated endpoints (unless using `authToken`). |
| `authToken` | `string` | `''` | Auth token. If provided, takes priority over `apiKey`/`apiSecret`. |
| `url` | `string` | `'https://api.bitfinex.com'` | Base URL for all requests. |
| `transform` | `boolean` | `false` | When `true`, responses are transformed into model class instances (e.g. `Order`, `Wallet`). |
| `timeout` | `number` | `15000` | Request timeout in milliseconds. Must be an integer. |
| `affCode` | `string \| null` | `undefined` | Affiliate code automatically attached to order submissions. |
| `company` | `string` | `''` | Company identifier appended to currency config keys. |
| `fetch` | `FetchFn` | `globalThis.fetch` | Custom fetch implementation. Use this to provide a proxy agent or mock for testing. |

---

## Public Market Data Methods

These methods do not require authentication.

---

#### ticker(params, cb?)

Get the ticker for a single symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'` or `'fUSD'`. |

**Returns:** `Promise<TradingTicker | FundingTicker>` (when `transform: true`)

```typescript
const ticker = await rest.ticker({ symbol: 'tBTCUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-ticker)

---

#### tickers(params?, cb?)

Get tickers for multiple symbols.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbols` | `string[]` | No | Array of symbols. Defaults to `'ALL'` if empty or omitted. |

**Returns:** `Promise<Array<TradingTicker | FundingTicker>>`

```typescript
const tickers = await rest.tickers({ symbols: ['tBTCUSD', 'tETHUSD'] })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-tickers)

---

#### tickersHistory(params?, cb?)

Get historical tickers.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbols` | `string[]` | No | Array of symbols. Defaults to `'ALL'`. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. Default `250`. |

**Returns:** `Promise<Array<TradingTickerHist | FundingTickerHist>>`

```typescript
const hist = await rest.tickersHistory({
  symbols: ['tBTCUSD'],
  start: Date.now() - 86400000,
  end: Date.now(),
  limit: 100
})
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-tickers-history)

---

#### candles(params, cb?)

Get OHLCV candle data.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.timeframe` | `string` | Yes | Candle timeframe, e.g. `'1m'`, `'5m'`, `'1h'`, `'1D'`. |
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.section` | `string` | Yes | `'last'` or `'hist'`. |
| `params.query` | `Record<string, string>` | No | Query params: `start`, `end`, `limit`, `sort`. |

**Returns:** `Promise<Candle | Candle[]>`

```typescript
const candles = await rest.candles({
  timeframe: '1h',
  symbol: 'tBTCUSD',
  section: 'hist',
  query: { limit: '100', sort: '-1' }
})
```

[API Reference](http://docs.bitfinex.com/v2/reference#rest-public-candles)

---

#### trades(params, cb?)

Get public trades for a symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |
| `params.sort` | `number` | No | Sort direction: `1` for ascending, `-1` for descending. |

**Returns:** `Promise<PublicTrade[]>`

```typescript
const trades = await rest.trades({ symbol: 'tBTCUSD', limit: 50 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-trades)

---

#### orderBook(params, cb?)

Get the order book for a symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.prec` | `string` | Yes | Precision level: `'P0'`, `'P1'`, `'P2'`, `'P3'`, `'P4'`, `'R0'`. |

**Returns:** `Promise<unknown[][]>`

```typescript
const book = await rest.orderBook({ symbol: 'tBTCUSD', prec: 'P0' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-books)

---

#### stats(params, cb?)

Get platform statistics.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.key` | `string` | Yes | Stat key, e.g. `'funding.size:1m:fUSD'`, `'pos.size:1m:tBTCUSD:long'`. |
| `params.context` | `string` | Yes | `'last'` or `'hist'`. |

**Returns:** `Promise<unknown>`

```typescript
const stats = await rest.stats({
  key: 'funding.size:1m:fUSD',
  context: 'hist'
})
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-stats)

---

#### status(params?, cb?)

Get platform operational status.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<number[]>` -- `[1]` means operative, `[0]` means maintenance.

```typescript
const status = await rest.status()
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-platform-status)

---

#### statusMessages(params?, cb?)

Get status messages for derivatives or securities.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.type` | `string` | No | Status type. Default `'deriv'`. |
| `params.keys` | `string[]` | No | Array of symbol keys. Default `['ALL']`. |

**Returns:** `Promise<StatusMessagesDeriv[]>` (when `type` is `'deriv'`)

```typescript
const msgs = await rest.statusMessages({ type: 'deriv', keys: ['ALL'] })
```

[API Reference](https://docs.bitfinex.com/v2/reference#status)

---

#### conf(params?, cb?)

Query Bitfinex configuration entries.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.keys` | `string[]` | No | Config keys, e.g. `['pub:list:pair:exchange']`. Returns `[]` if empty. |

**Returns:** `Promise<unknown[]>`

```typescript
const pairs = await rest.conf({ keys: ['pub:list:pair:exchange'] })
```

---

#### currencies(params?, cb?)

Get list of currencies with full names, pools, and explorers.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<Currency[]>`

```typescript
const currencies = await rest.currencies()
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-currencies)

---

#### symbolDetails(params?, cb?)

Get details for all trading pairs.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.includeFuturePairs` | `boolean` | No | Include futures pairs. Default `true`. |

**Returns:** `Promise<SymbolDetails[]>`

```typescript
const details = await rest.symbolDetails()
```

[API Reference](https://docs.bitfinex.com/reference#rest-public-conf)

---

#### symbols(cb?)

Get a list of valid trading symbol names.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<string[]>`

```typescript
const symbols = await rest.symbols()
// ['tBTCUSD', 'tETHUSD', ...]
```

---

#### inactiveSymbols(cb?)

Get a list of inactive (delisted) symbol names.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<string[]>`

```typescript
const inactive = await rest.inactiveSymbols()
```

---

#### futures(cb?)

Get a list of valid futures symbol names.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<string[]>`

```typescript
const futuresPairs = await rest.futures()
// ['tBTCF0:USTF0', ...]
```

---

#### accountFees(params?, cb?)

Get withdrawal/transaction fees for all currencies (public endpoint).

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<TransactionFee[]>`

```typescript
const fees = await rest.accountFees()
```

---

#### liquidations(params?, cb?)

Get liquidations data.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |
| `params.sort` | `number` | No | Sort direction. |

**Returns:** `Promise<Liquidations[]>`

```typescript
const liqs = await rest.liquidations({ limit: 50 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-public-liquidations)

---

#### marketAveragePrice(params, cb?)

Calculate the average execution price for a trading or funding pair.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.amount` | `number` | Yes | Amount to simulate. |
| `params.period` | `string` | No | Funding period (funding only). |
| `params.rate_limit` | `string` | No | Rate limit (funding only). |

**Returns:** `Promise<unknown[]>`

```typescript
const avg = await rest.marketAveragePrice({ symbol: 'tBTCUSD', amount: 1 })
```

[API Reference](https://docs.bitfinex.com/reference#rest-public-calc-market-average-price)

---

## Authenticated - Orders

All authenticated methods require `apiKey`/`apiSecret` or an `authToken`.

---

#### submitOrder(params, cb?)

Submit a new order. Builds the order packet from an `Order` model instance.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.order` | `Order` | Yes | An `Order` model instance. |

**Returns:** `Promise<Order>` (when `transform: true`, returns the first order from the notification)

```typescript
import Models from 'bfx-api-node-models'
const { Order } = Models

const o = new Order({
  type: Order.type.EXCHANGE_LIMIT,
  symbol: 'tBTCUSD',
  price: 50000,
  amount: 0.01
})
const result = await rest.submitOrder({ order: o })
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-submit-order)

---

#### updateOrder(params, cb?)

Update an existing order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params` | `Record<string, unknown>` | Yes | Fields to update (e.g. `id`, `price`, `amount`, `delta`, `flags`). |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.updateOrder({ id: 12345, price: 51000 })
```

---

#### cancelOrder(params, cb?)

Cancel an order by its ID.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number` | Yes | Order ID. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.cancelOrder({ id: 12345 })
```

---

#### cancelOrderWithCid(params, cb?)

Cancel an order using its client order ID.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.cid` | `number` | Yes | Client order ID. |
| `params.date` | `string` | Yes | Date of the client order ID, e.g. `'2024-01-15'`. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.cancelOrderWithCid({ cid: 67890, date: '2024-01-15' })
```

---

#### cancelOrders(params, cb?)

Cancel multiple orders by their IDs.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ids` | `number[]` | Yes | Array of order IDs to cancel. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.cancelOrders({ ids: [12345, 67890] })
```

---

#### cancelOrderMulti(params, cb?)

Cancel multiple orders using various identifiers.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number[]` | No | Array of order IDs. |
| `params.gid` | `number[]` | No | Array of group IDs. |
| `params.cid` | `number[][]` | No | Array of `[cid, cid_date]` pairs. |
| `params.all` | `number` | No | Set to `1` to cancel all orders. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.cancelOrderMulti({ id: [123, 456] })
// or cancel all
const resultAll = await rest.cancelOrderMulti({ all: 1 })
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-order-cancel-multi)

---

#### activeOrders(params?, cb?)

Get all active orders.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<Order[]>`

```typescript
const orders = await rest.activeOrders()
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-orders)

---

#### activeOrdersWithIds(params, cb?)

Get active orders filtered by specific IDs.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ids` | `number[]` | Yes | Array of order IDs to retrieve. |

**Returns:** `Promise<Order[]>`

```typescript
const orders = await rest.activeOrdersWithIds({ ids: [12345, 67890] })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-orders)

---

#### orderHistory(params?, cb?)

Get order history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Filter by symbol. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<Order[]>`

```typescript
const history = await rest.orderHistory({ symbol: 'tBTCUSD', limit: 25 })
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-orders-history)

---

#### orderHistoryWithIds(params, cb?)

Get order history filtered by specific IDs.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ids` | `number[]` | Yes | Array of order IDs. |

**Returns:** `Promise<Order[]>`

```typescript
const history = await rest.orderHistoryWithIds({ ids: [12345] })
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-orders-history)

---

#### orderTrades(params, cb?)

Get trades generated by an order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.orderId` | `number` | Yes | The order ID. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<Trade[]>`

```typescript
const trades = await rest.orderTrades({ symbol: 'tBTCUSD', orderId: 12345 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-order-trades)

---

#### submitOrderMulti(params, cb?)

Submit multiple new orders simultaneously.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.orders` | `unknown[]` | Yes | Array of `Order` instances or raw order data. |

**Returns:** `Promise<Notification>`

```typescript
const o1 = new Order({ type: Order.type.EXCHANGE_LIMIT, symbol: 'tBTCUSD', price: 50000, amount: 0.01 })
const o2 = new Order({ type: Order.type.EXCHANGE_LIMIT, symbol: 'tETHUSD', price: 3000, amount: 0.1 })
const result = await rest.submitOrderMulti({ orders: [o1, o2] })
```

---

#### updateOrderMulti(params, cb?)

Update multiple orders simultaneously.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.orders` | `unknown[]` | Yes | Array of order update objects (each must contain `id`). |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.updateOrderMulti({
  orders: [
    { id: 123, price: 51000 },
    { id: 456, price: 3100 }
  ]
})
```

---

#### orderMultiOp(params, cb?)

Send multiple order-related operations in a single request. Supports `'on'` (new), `'ou'` (update), `'oc'` (cancel), and `'oc_multi'` operations.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ops` | `unknown[][]` | Yes | Array of operation arrays, e.g. `[['on', orderData], ['oc', { id }]]`. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.orderMultiOp({
  ops: [
    ['on', new Order({ type: Order.type.EXCHANGE_LIMIT, symbol: 'tBTCUSD', price: 50000, amount: 0.01 })],
    ['oc', { id: 12345 }]
  ]
})
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-order-multi)

---

## Authenticated - Positions

---

#### positions(params?, cb?)

Get all active positions.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<Position[]>`

```typescript
const positions = await rest.positions()
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-positions)

---

#### positionsHistory(params?, cb?)

Get position history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. Default `50`. |

**Returns:** `Promise<Position[]>`

```typescript
const hist = await rest.positionsHistory({ limit: 25 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-positions-history)

---

#### positionsAudit(params?, cb?)

Get position audit data.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number[]` | No | Array of position IDs to audit. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. Default `250`. |

**Returns:** `Promise<Position[]>`

```typescript
const audit = await rest.positionsAudit({ id: [12345], limit: 100 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-positions-audit)

---

#### positionsSnapshot(params?, cb?)

Get a snapshot of positions at a given point in time.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. Default `50`. |

**Returns:** `Promise<Position[]>`

```typescript
const snap = await rest.positionsSnapshot({ end: Date.now(), limit: 10 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-positions-snap)

---

#### closePosition(params, cb?)

Close an active position by submitting a market order in the opposite direction.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.position_id` | `number` | Yes | The position ID to close. |

**Returns:** `Promise<unknown>` (the submitted order result)

```typescript
const result = await rest.closePosition({ position_id: 12345 })
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-submit-order)

---

#### claimPosition(params, cb?)

Claim an existing open position.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number` | Yes | Position ID to claim. |
| `params.amount` | `number \| string` | No | Amount for partial claim. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.claimPosition({ id: 12345 })

// Partial claim
const partial = await rest.claimPosition({ id: 12345, amount: 0.5 })
```

---

## Authenticated - Funding

---

#### fundingOffers(params, cb?)

Get active funding offers for a symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Funding symbol, e.g. `'fUSD'`. |

**Returns:** `Promise<FundingOffer[]>`

```typescript
const offers = await rest.fundingOffers({ symbol: 'fUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-offers)

---

#### fundingOfferHistory(params, cb?)

Get funding offer history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Funding symbol. If omitted, returns all. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<FundingOffer[]>`

```typescript
const hist = await rest.fundingOfferHistory({ symbol: 'fUSD', limit: 50 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-offers-hist)

---

#### submitFundingOffer(params, cb?)

Submit a new funding offer.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.offer` | `FundingOffer` | Yes | A `FundingOffer` model instance. |

**Returns:** `Promise<Notification>`

```typescript
import Models from 'bfx-api-node-models'
const { FundingOffer } = Models

const offer = new FundingOffer({
  type: 'LIMIT',
  symbol: 'fUSD',
  rate: 0.0001,
  amount: 100,
  period: 2
})
const result = await rest.submitFundingOffer({ offer })
```

---

#### cancelFundingOffer(params, cb?)

Cancel an existing funding offer.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number` | Yes | Funding offer ID. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.cancelFundingOffer({ id: 12345 })
```

---

#### cancelAllFundingOffers(params, cb?)

Cancel all funding offers for a currency.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.currency` | `string` | Yes | Currency code, e.g. `'USD'`. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.cancelAllFundingOffers({ currency: 'USD' })
```

---

#### fundingLoans(params, cb?)

Get active funding loans for a symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Funding symbol, e.g. `'fUSD'`. |

**Returns:** `Promise<FundingLoan[]>`

```typescript
const loans = await rest.fundingLoans({ symbol: 'fUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-loans)

---

#### fundingLoanHistory(params, cb?)

Get funding loan history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Funding symbol. If omitted, returns all. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<FundingLoan[]>`

```typescript
const hist = await rest.fundingLoanHistory({ symbol: 'fUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-loans-hist)

---

#### fundingCredits(params, cb?)

Get active funding credits for a symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Funding symbol, e.g. `'fUSD'`. |

**Returns:** `Promise<FundingCredit[]>`

```typescript
const credits = await rest.fundingCredits({ symbol: 'fUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-credits)

---

#### fundingCreditHistory(params, cb?)

Get funding credit history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Funding symbol. If omitted, returns all. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<FundingCredit[]>`

```typescript
const hist = await rest.fundingCreditHistory({ symbol: 'fUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-credits-hist)

---

#### fundingTrades(params, cb?)

Get funding trades history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Funding symbol. If omitted, returns all. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<FundingTrade[]>`

```typescript
const trades = await rest.fundingTrades({ symbol: 'fUSD', limit: 25 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-funding-trades-hist)

---

#### fundingInfo(params, cb?)

Get funding info for a symbol.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.key` | `string` | Yes | Funding symbol key, e.g. `'fUSD'`. |

**Returns:** `Promise<unknown>`

```typescript
const info = await rest.fundingInfo({ key: 'fUSD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-info-funding)

---

#### marginInfo(params?, cb?)

Get base margin info for the account.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.key` | `string` | No | Margin key. Defaults to `'base'`. |

**Returns:** `Promise<MarginInfo>`

```typescript
const margin = await rest.marginInfo({ key: 'base' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-info-margin)

---

#### closeFunding(params, cb?)

Close a funding loan or credit.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number` | Yes | Funding entry ID. |
| `params.type` | `string` | Yes | Type of funding entry to close. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.closeFunding({ id: 12345, type: 'FundingLoan' })
```

---

#### submitAutoFunding(params, cb?)

Enable or disable automatic funding.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.status` | `number` | Yes | `1` to enable, `0` to disable. |
| `params.currency` | `string` | Yes | Currency code, e.g. `'USD'`. |
| `params.amount` | `number` | Yes | Amount to auto-fund. |
| `params.rate` | `number` | Yes | Rate for auto-funding. |
| `params.period` | `number` | Yes | Lending period in days. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.submitAutoFunding({
  status: 1,
  currency: 'USD',
  amount: 1000,
  rate: 0.001,
  period: 2
})
```

---

#### keepFunding(params, cb?)

Keep a funding offer, loan, or credit from being auto-closed.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.type` | `string` | Yes | Type: e.g. `'offer'`, `'loan'`, `'credit'`. |
| `params.id` | `string \| number` | Yes | The funding entry ID. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.keepFunding({ type: 'loan', id: 12345 })
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-keep-funding)

---

## Authenticated - Wallets & Account

---

#### wallets(params?, cb?)

Get all wallets.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<Wallet[]>`

```typescript
const wallets = await rest.wallets()
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-wallets)

---

#### walletsHistory(params?, cb?)

Get wallet balance history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.end` | `number` | No | End timestamp (ms). |
| `params.currency` | `string` | No | Filter by currency. |

**Returns:** `Promise<WalletHist[]>`

```typescript
const hist = await rest.walletsHistory({ currency: 'USD' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-wallets-hist)

---

#### movements(params?, cb?)

Get deposit/withdrawal movements.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ccy` | `string` | No | Currency filter. If omitted, returns all currencies. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. Default `25`. |
| `params.id` | `number[]` | No | Array of movement IDs. |
| `params.address` | `string` | No | Filter by address. |

**Returns:** `Promise<Movement[]>`

```typescript
const movements = await rest.movements({ ccy: 'BTC', limit: 10 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#movements)

---

#### movementInfo(params, cb?)

Get detailed information about a specific movement.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.id` | `number` | Yes | Movement ID. |

**Returns:** `Promise<MovementInfo>`

```typescript
const info = await rest.movementInfo({ id: 12345 })
```

[API Reference](https://docs.bitfinex.com/reference/movement-info)

---

#### userInfo(params?, cb?)

Get user account information.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<UserInfo>`

```typescript
const info = await rest.userInfo()
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-info-user)

---

#### accountSummary(params?, cb?)

Get a 30-day summary of trading volume and margin funding returns.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<AccountSummary>`

```typescript
const summary = await rest.accountSummary()
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-summary)

---

#### accountFees(params?, cb?)

Get withdrawal/transaction fees for all currencies. This is a public endpoint.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<TransactionFee[]>`

```typescript
const fees = await rest.accountFees()
```

---

#### accountTrades(params?, cb?)

Get authenticated trade history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Filter by symbol. If omitted, returns all. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |
| `params.sort` | `number` | No | Sort direction. |

**Returns:** `Promise<Trade[]>`

```typescript
const trades = await rest.accountTrades({ symbol: 'tBTCUSD', limit: 50 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-trades-hist)

---

#### getWeightedAverages(params?, cb?)

Get weighted averages of trades.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | No | Filter by symbol. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<WeightedAverages>`

```typescript
const avgs = await rest.getWeightedAverages({ symbol: 'tBTCUSD' })
```

---

#### logins(params?, cb?)

Get login history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<Login[]>`

```typescript
const logins = await rest.logins({ limit: 10 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-logins-hist)

---

#### changeLogs(params?, cb?)

Get audit/changelog history.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. |

**Returns:** `Promise<ChangeLog[]>`

```typescript
const logs = await rest.changeLogs({ limit: 50 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-audit-hist)

---

#### keyPermissions(params?, cb?)

Get the permissions associated with the current API key or token.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<AuthPermission[]>`

```typescript
const perms = await rest.keyPermissions()
```

---

#### calcAvailableBalance(params, cb?)

Calculate available balance for an order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.type` | `string` | Yes | Order type. |
| `params.dir` | `string` | No | Direction. |
| `params.rate` | `number` | No | Rate. |
| `params.lev` | `string` | No | Leverage. |

**Returns:** `Promise<unknown>`

```typescript
const balance = await rest.calcAvailableBalance({
  symbol: 'tBTCUSD',
  type: 'EXCHANGE'
})
```

[API Reference](https://docs.bitfinex.com/reference/rest-auth-calc-order-avail)

---

#### performance(params?, cb?)

Get daily performance data.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<unknown>`

```typescript
const perf = await rest.performance()
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-performance)

---

#### ledgers(params, cb?)

Get ledger entries (balance changes).

| Param | Type | Required | Description |
|---|---|---|---|
| `params.filters` | `string \| { ccy?: string; category?: number }` | Yes | A currency string (e.g. `'USD'`) or an object with `ccy` and/or `category`. |
| `params.start` | `number` | No | Start timestamp (ms). |
| `params.end` | `number` | No | End timestamp (ms). |
| `params.limit` | `number` | No | Number of results. Default `25`. |

**Returns:** `Promise<LedgerEntry[]>`

```typescript
const entries = await rest.ledgers({ filters: 'USD', limit: 50 })
// or with category filter
const filtered = await rest.ledgers({ filters: { ccy: 'BTC', category: 28 } })
```

[API Reference](https://docs.bitfinex.com/v2/reference#ledgers)

---

## Authenticated - Settings

---

#### getSettings(params, cb?)

Read user settings.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.keys` | `string[]` | Yes | Array of setting keys to retrieve. |

**Returns:** `Promise<unknown>`

```typescript
const settings = await rest.getSettings({ keys: ['api:feature'] })
```

---

#### getCoreSettings(params, cb?)

Read core platform settings.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.keys` | `string[]` | Yes | Array of core setting keys. |

**Returns:** `Promise<CoreSettings>`

```typescript
const core = await rest.getCoreSettings({ keys: ['map:currency:label'] })
```

---

#### updateSettings(params, cb?)

Update user settings.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.settings` | `Record<string, unknown>` | Yes | Key-value map of settings to update. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.updateSettings({
  settings: { 'api:feature': 'enabled' }
})
```

---

#### deleteSettings(params, cb?)

Delete user settings.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.keys` | `string[]` | Yes | Array of setting keys to delete. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.deleteSettings({ keys: ['api:feature'] })
```

---

## Authenticated - Alerts

---

#### alertList(params, cb?)

Get list of active alerts.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.type` | `string` | Yes | Alert type, e.g. `'price'`. |

**Returns:** `Promise<Alert[]>`

```typescript
const alerts = await rest.alertList({ type: 'price' })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-alert-list)

---

#### alertSet(params, cb?)

Create a new price alert.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.type` | `string` | Yes | Alert type, e.g. `'price'`. |
| `params.symbol` | `string` | Yes | Symbol, e.g. `'tBTCUSD'`. |
| `params.price` | `number` | Yes | Price level to trigger the alert. |

**Returns:** `Promise<Alert>`

```typescript
const alert = await rest.alertSet({
  type: 'price',
  symbol: 'tBTCUSD',
  price: 50000
})
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-alert-set)

---

#### alertDelete(params, cb?)

Delete an existing alert.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Symbol of the alert. |
| `params.price` | `number` | Yes | Price level of the alert. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.alertDelete({ symbol: 'tBTCUSD', price: 50000 })
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-alert-delete)

---

## Authenticated - Transfers & Deposits

---

#### transfer(params, cb?)

Transfer funds between wallets.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.amount` | `string` | Yes | Amount to transfer. |
| `params.from` | `string` | Yes | Source wallet name (e.g. `'exchange'`, `'margin'`, `'funding'`). |
| `params.to` | `string` | Yes | Destination wallet name. |
| `params.currency` | `string` | Yes | Currency to transfer. |
| `params.currencyTo` | `string` | Yes | Destination currency (use same as `currency` for same-currency transfers). |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.transfer({
  amount: '100',
  from: 'exchange',
  to: 'margin',
  currency: 'USD',
  currencyTo: 'USD'
})
```

---

#### getDepositAddress(params, cb?)

Get or generate a deposit address.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.wallet` | `string` | Yes | Wallet name, e.g. `'exchange'`. |
| `params.method` | `string` | Yes | Deposit method, e.g. `'bitcoin'`, `'ethereum'`. |
| `params.opRenew` | `number` | No | Set to `1` to generate a new address. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.getDepositAddress({
  wallet: 'exchange',
  method: 'bitcoin'
})
```

---

#### withdraw(params, cb?)

Submit a withdrawal request.

| Param | Type | Required | Description |
|---|---|---|---|
| `params` | `Record<string, unknown>` | Yes | Withdrawal parameters (varies by method). Typically includes `wallet`, `method`, `amount`, `address`. |

**Returns:** `Promise<Notification>`

```typescript
const result = await rest.withdraw({
  wallet: 'exchange',
  method: 'bitcoin',
  amount: '0.01',
  address: 'bc1q...'
})
```

---

#### generateInvoice(params, cb?)

Generate a Lightning Network deposit invoice.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.currency` | `string` | Yes | Currency, e.g. `'LNX'`. |
| `params.wallet` | `string` | Yes | Wallet name, e.g. `'exchange'`. |
| `params.amount` | `string` | Yes | Invoice amount. |

**Returns:** `Promise<Invoice>`

```typescript
const invoice = await rest.generateInvoice({
  currency: 'LNX',
  wallet: 'exchange',
  amount: '0.001'
})
```

[API Reference](https://docs.bitfinex.com/reference#rest-auth-deposit-invoice)

---

#### lnxInvoicePayments(params, cb?)

Query Lightning Network invoice payments.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.action` | `string` | Yes | Action type. |
| `params.query` | `Record<string, unknown>` | Yes | Query parameters. |

**Returns:** `Promise<unknown>`

```typescript
const payments = await rest.lnxInvoicePayments({
  action: 'list',
  query: { status: 'completed' }
})
```

[API Reference](https://docs.bitfinex.com/reference/lnx-invoice-payments)

---

## Authenticated - Auth Tokens

---

#### generateToken(params, cb?)

Generate a new authentication token.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.scope` | `string` | Yes | Token scope, e.g. `'api'`. |
| `params.ttl` | `number` | No | Time-to-live in seconds. |
| `params.caps` | `string[]` | No | Capabilities / permissions for the token. |
| `params.writePermission` | `boolean` | No | Whether the token has write permission. |
| `params._cust_ip` | `string` | No | Custom IP restriction. |

**Returns:** `Promise<unknown>` (token string)

```typescript
const token = await rest.generateToken({ scope: 'api', ttl: 3600 })
```

---

#### invalidateAuthToken(params, cb?)

Invalidate an existing authentication token.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.authToken` | `string` | Yes | Token to invalidate. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.invalidateAuthToken({ authToken: 'token-string' })
```

---

## Authenticated - Recurring Algo Orders

---

#### submitRecurringAlgoOrder(params?, cb?)

Create a new recurring algorithmic order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.order` | `Record<string, unknown>` | Yes | Recurring algo order configuration object. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.submitRecurringAlgoOrder({
  order: {
    symbol: 'tBTCUSD',
    amount: '0.001',
    action: 'buy',
    frequency: 'daily'
  }
})
```

---

#### getRecurringAlgoOrder(params?, cb?)

Get details of a specific recurring algo order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.algoOrderId` | `string` | Yes | The algo order ID. |

**Returns:** `Promise<unknown>`

```typescript
const order = await rest.getRecurringAlgoOrder({ algoOrderId: 'abc123' })
```

---

#### updateRecurringAlgoOrder(params?, cb?)

Update an existing recurring algo order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.order` | `Record<string, unknown> & { algoOrderId: string }` | Yes | Updated order config. Must include `algoOrderId`. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.updateRecurringAlgoOrder({
  order: { algoOrderId: 'abc123', amount: '0.002' }
})
```

---

#### cancelRecurringAlgoOrder(params?, cb?)

Cancel a recurring algo order.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.algoOrderId` | `string` | Yes | The algo order ID to cancel. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.cancelRecurringAlgoOrder({ algoOrderId: 'abc123' })
```

---

#### getRecurringAlgoOrders(params?, cb?)

List all recurring algo order configurations.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<unknown>`

```typescript
const orders = await rest.getRecurringAlgoOrders()
```

---

#### getRecurringAoOrders(params?, cb?)

List all individual orders spawned by recurring algo orders.

| Param | Type | Required | Description |
|---|---|---|---|
| _(none)_ | | | No parameters required. |

**Returns:** `Promise<unknown>`

```typescript
const orders = await rest.getRecurringAoOrders()
```

---

## Authenticated - Other

---

#### currencyConversion(params, cb?)

Convert between two currencies.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ccy1` | `string` | Yes | Source currency, e.g. `'BTC'`. |
| `params.ccy2` | `string` | Yes | Target currency, e.g. `'USD'`. |
| `params.amount` | `number` | Yes | Amount to convert. |

**Returns:** `Promise<unknown>`

```typescript
const result = await rest.currencyConversion({
  ccy1: 'BTC',
  ccy2: 'USD',
  amount: 0.1
})
```

---

#### derivsPositionCollateralSet(params, cb?)

Change the collateral value of an active derivatives position.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.symbol` | `string` | Yes | Derivatives symbol, e.g. `'tBTCF0:USTF0'`. |
| `params.collateral` | `number` | Yes | New collateral amount. |

**Returns:** `Promise<unknown>` (returns truthy value on success)

```typescript
const result = await rest.derivsPositionCollateralSet({
  symbol: 'tBTCF0:USTF0',
  collateral: 500
})
```

[API Reference](https://docs.bitfinex.com/v2/reference#rest-auth-deriv-pos-collateral-set)

---

#### exchangeRate(params, cb?)

Get the exchange rate between two currencies.

| Param | Type | Required | Description |
|---|---|---|---|
| `params.ccy1` | `string` | Yes | First currency, e.g. `'BTC'`. |
| `params.ccy2` | `string` | Yes | Second currency, e.g. `'USD'`. |

**Returns:** `Promise<unknown>` (the rate value)

```typescript
const rate = await rest.exchangeRate({ ccy1: 'BTC', ccy2: 'USD' })
```

---

## RESTv1 (Deprecated)

> **Warning:** RESTv1 is deprecated. All new development should use RESTv2. The v1 API may be removed in a future major release.

```typescript
import { RESTv1 } from '@jcbit/bfx-api-node-rest'
```

RESTv1 uses callback-only methods (no promises). It is provided for backward compatibility.

### Migration Guide (v1 to v2)

| RESTv1 Method | RESTv2 Equivalent |
|---|---|
| `ticker(symbol, cb)` | `ticker({ symbol })` |
| `orderbook(symbol, opts, cb)` | `orderBook({ symbol, prec })` |
| `trades(symbol, cb)` | `trades({ symbol })` |
| `get_symbols(cb)` | `symbols()` |
| `symbols_details(cb)` | `symbolDetails()` |
| `new_order(...)` | `submitOrder({ order })` |
| `cancel_order(id, cb)` | `cancelOrder({ id })` |
| `cancel_all_orders(cb)` | `cancelOrderMulti({ all: 1 })` |
| `active_orders(cb)` | `activeOrders()` |
| `orders_history(cb)` | `orderHistory()` |
| `active_positions(cb)` | `positions()` |
| `claim_position(id, amount, cb)` | `claimPosition({ id, amount? })` |
| `wallet_balances(cb)` | `wallets()` |
| `movements(ccy, opts, cb)` | `movements({ ccy })` |
| `past_trades(symbol, opts, cb)` | `accountTrades({ symbol })` |
| `new_offer(...)` | `submitFundingOffer({ offer })` |
| `cancel_offer(id, cb)` | `cancelFundingOffer({ id })` |
| `active_offers(cb)` | `fundingOffers({ symbol })` |
| `withdraw(...)` | `withdraw(params)` |
| `transfer(...)` | `transfer(params)` |
| `account_infos(cb)` | `userInfo()` |
| `margin_infos(cb)` | `marginInfo()` |

---

## Error Handling

All methods return promises that reject with an `APIError` on failure. The `APIError` interface extends `Error` with additional properties:

```typescript
interface APIError extends Error {
  status?: number       // HTTP status code (e.g. 400, 401, 500)
  statustext?: string   // HTTP status text (e.g. 'Bad Request')
  code?: number | string // Bitfinex error code from the response array
  response?: unknown    // Full parsed response body
}
```

### Usage

```typescript
try {
  const orders = await rest.activeOrders()
} catch (err) {
  console.error(err.message)     // "HTTP code 401 Unauthorized"
  console.error(err.status)      // 401
  console.error(err.code)        // e.g. 10100
  console.error(err.response)    // e.g. "apikey: invalid"
}
```

### Common Error Codes

| Code | Description |
|---|---|
| `10100` | API key is invalid. |
| `10114` | Nonce is too small (see below). |
| `10020` | Request parameters error. |
| `ERR_TIMEOUT_DATA_TYPE_ERROR` | Thrown locally when `timeout` option is not an integer. |

### Nonce Too Small

When making multiple parallel authenticated requests, you may receive a nonce error. Nonces are used to guard against replay attacks; each request must have a strictly increasing nonce value.

**Solutions:**

- Avoid making parallel authenticated requests with the same API key.
- Use multiple API keys if you need parallelism.
- Use an `authToken` instead of API key/secret (tokens do not use nonces).

When error code `10114` is detected, the library automatically appends a help link to the error message.

---

## Proxy / Custom Fetch

The `fetch` option lets you supply a custom `fetch` implementation. This is the recommended way to route requests through an HTTP proxy using `undici`'s `ProxyAgent`.

```typescript
import { RESTv2 } from '@jcbit/bfx-api-node-rest'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

const proxyAgent = new ProxyAgent('http://my-proxy:8080')

const rest = new RESTv2({
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  transform: true,
  fetch: (url, init) => undiciFetch(url, {
    ...init,
    dispatcher: proxyAgent
  })
})

const wallets = await rest.wallets()
```

The `usesAgent()` method returns `true` when a custom fetch function has been provided:

```typescript
rest.usesAgent() // true
```

---

## Models & Transform

When `transform: true` is set in the constructor, API responses are automatically converted from raw arrays into model class instances from `bfx-api-node-models`. This makes working with the data much more ergonomic by providing named properties instead of positional array indices.

### Example

```typescript
// Without transform (default)
const rest = new RESTv2()
const ticker = await rest.ticker({ symbol: 'tBTCUSD' })
// ticker is a raw array: ['tBTCUSD', 50000, 1.5, 50001, 2.0, ...]

// With transform
const restT = new RESTv2({ transform: true })
const ticker2 = await restT.ticker({ symbol: 'tBTCUSD' })
// ticker2 is a TradingTicker instance with named properties:
// ticker2.bid, ticker2.ask, ticker2.lastPrice, etc.
```

### Model Classes Used

The following model classes from `bfx-api-node-models` are used for transformation:

| Model Class | Used By |
|---|---|
| `TradingTicker` | `ticker`, `tickers` (trading pairs) |
| `FundingTicker` | `ticker`, `tickers` (funding symbols) |
| `TradingTickerHist` | `tickersHistory` (trading pairs) |
| `FundingTickerHist` | `tickersHistory` (funding symbols) |
| `Candle` | `candles` |
| `PublicTrade` | `trades` |
| `Trade` | `accountTrades`, `orderTrades` |
| `Order` | `activeOrders`, `activeOrdersWithIds`, `orderHistory`, `orderHistoryWithIds`, `submitOrder` |
| `Position` | `positions`, `positionsHistory`, `positionsAudit`, `positionsSnapshot` |
| `FundingOffer` | `fundingOffers`, `fundingOfferHistory` |
| `FundingLoan` | `fundingLoans`, `fundingLoanHistory` |
| `FundingCredit` | `fundingCredits`, `fundingCreditHistory` |
| `FundingTrade` | `fundingTrades` |
| `Wallet` | `wallets` |
| `WalletHist` | `walletsHistory` |
| `Movement` | `movements` |
| `MovementInfo` | `movementInfo` |
| `LedgerEntry` | `ledgers` |
| `Liquidations` | `liquidations` |
| `UserInfo` | `userInfo` |
| `Currency` | `currencies` |
| `Alert` | `alertList`, `alertSet` |
| `Login` | `logins` |
| `ChangeLog` | `changeLogs` |
| `MarginInfo` | `marginInfo` |
| `Invoice` | `generateInvoice` |
| `SymbolDetails` | `symbolDetails` |
| `TransactionFee` | `accountFees` |
| `AccountSummary` | `accountSummary` |
| `AuthPermission` | `keyPermissions` |
| `CoreSettings` | `getCoreSettings` |
| `WeightedAverages` | `getWeightedAverages` |
| `StatusMessagesDeriv` | `statusMessages` (when `type` is `'deriv'`) |
| `Notification` | Used internally for write operations (`submitOrder`, `cancelOrder`, etc.) |

When `transform` is `false` (the default), all methods return raw arrays as received from the API.

---

## Utility Methods

#### getURL()

Returns the REST API URL the client was constructed with.

**Returns:** `string`

```typescript
const rest = new RESTv2()
console.log(rest.getURL()) // 'https://api.bitfinex.com'
```

---

#### usesAgent()

Returns whether a custom `fetch` function was provided to the constructor (useful for detecting proxy configurations).

**Returns:** `boolean`

```typescript
const rest = new RESTv2({ fetch: customFetch })
console.log(rest.usesAgent()) // true
```
