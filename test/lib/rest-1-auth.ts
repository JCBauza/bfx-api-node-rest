import assert from 'assert'
import { RESTv1 } from '../../dist/index.js'

/**
 * Helper: creates a RESTv1 instance with a mock fetch that captures
 * the URL and decoded payload, then returns a success response.
 */
function createMockRest (responseBody: unknown = { result: 'ok' }): {
  rest: RESTv1
  calls: Array<{ url: string; payload: Record<string, unknown> }>
} {
  const calls: Array<{ url: string; payload: Record<string, unknown> }> = []
  const rest = new RESTv1({
    apiKey: 'testkey',
    apiSecret: 'testsecret',
    fetch: async (url: RequestInfo | URL, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>
      const payload = JSON.parse(
        Buffer.from(headers['X-BFX-PAYLOAD'], 'base64').toString()
      )
      calls.push({ url: url as string, payload })
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
  })
  return { rest, calls }
}

describe('RESTv1 authenticated methods', () => {
  // --- Simple no-param methods ---
  const simpleEndpoints: Array<[string, string]> = [
    ['active_orders', 'orders'],
    ['orders_history', 'orders/hist'],
    ['active_positions', 'positions'],
    ['active_offers', 'offers'],
    ['active_credits', 'credits'],
    ['wallet_balances', 'balances'],
    ['taken_swaps', 'taken_funds'],
    ['total_taken_swaps', 'total_taken_funds'],
    ['account_infos', 'account_infos'],
    ['margin_infos', 'margin_infos'],
  ]

  simpleEndpoints.forEach(([method, endpoint]) => {
    it(`${method} calls /v1/${endpoint}`, (done) => {
      const { rest, calls } = createMockRest()
      ;(rest as any)[method]((err: Error | null) => {
        assert.ok(!err, `unexpected error: ${err?.message}`)
        assert.ok(calls[0].url.endsWith(`/v1/${endpoint}`))
        assert.strictEqual(calls[0].payload.request, `/v1/${endpoint}`)
        done()
      })
    })
  })

  // --- cancel_all_orders (no params) ---
  it('cancel_all_orders calls order/cancel/all', (done) => {
    const { rest, calls } = createMockRest()
    rest.cancel_all_orders((err) => {
      assert.ok(!err)
      assert.ok(calls[0].url.endsWith('/v1/order/cancel/all'))
      done()
    })
  })

  // --- Methods with ID params ---
  it('cancel_order sends order_id as integer', (done) => {
    const { rest, calls } = createMockRest()
    rest.cancel_order('123', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.order_id, 123)
      done()
    })
  })

  it('cancel_multiple_orders sends order_ids as integers', (done) => {
    const { rest, calls } = createMockRest()
    rest.cancel_multiple_orders(['100', '200'], (err) => {
      assert.ok(!err)
      assert.deepStrictEqual(calls[0].payload.order_ids, [100, 200])
      done()
    })
  })

  it('order_status sends order_id as integer', (done) => {
    const { rest, calls } = createMockRest()
    rest.order_status('456', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.order_id, 456)
      done()
    })
  })

  it('cancel_offer sends offer_id as integer', (done) => {
    const { rest, calls } = createMockRest()
    rest.cancel_offer('789', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.offer_id, 789)
      done()
    })
  })

  it('offer_status sends offer_id as integer', (done) => {
    const { rest, calls } = createMockRest()
    rest.offer_status('321', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.offer_id, 321)
      done()
    })
  })

  it('close_swap sends swap_id as integer', (done) => {
    const { rest, calls } = createMockRest()
    rest.close_swap('555', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.swap_id, 555)
      done()
    })
  })

  it('claim_position sends position_id and amount', (done) => {
    const { rest, calls } = createMockRest()
    rest.claim_position('111', 0.5, (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.position_id, 111)
      assert.strictEqual(calls[0].payload.amount, 0.5)
      done()
    })
  })

  // --- Methods with multiple params ---
  it('multiple_new_orders sends orders array', (done) => {
    const { rest, calls } = createMockRest()
    const orders = [{ symbol: 'BTCUSD', amount: '0.1' }]
    rest.multiple_new_orders(orders, (err) => {
      assert.ok(!err)
      assert.deepStrictEqual(calls[0].payload.orders, orders)
      done()
    })
  })

  it('replace_order sends all required params', (done) => {
    const { rest, calls } = createMockRest()
    rest.replace_order('100', 'BTCUSD', '0.1', '30000', 'bitfinex', 'buy', 'exchange limit', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.order_id, 100)
      assert.strictEqual(calls[0].payload.symbol, 'BTCUSD')
      assert.strictEqual(calls[0].payload.amount, '0.1')
      assert.strictEqual(calls[0].payload.price, '30000')
      assert.strictEqual(calls[0].payload.side, 'buy')
      done()
    })
  })

  it('new_deposit sends currency, method, wallet_name', (done) => {
    const { rest, calls } = createMockRest()
    rest.new_deposit('BTC', 'bitcoin', 'exchange', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.currency, 'BTC')
      assert.strictEqual(calls[0].payload.method, 'bitcoin')
      assert.strictEqual(calls[0].payload.wallet_name, 'exchange')
      done()
    })
  })

  it('new_offer sends currency, amount, rate, period, direction', (done) => {
    const { rest, calls } = createMockRest()
    rest.new_offer('USD', '100', '0.02', 7, 'lend', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.currency, 'USD')
      assert.strictEqual(calls[0].payload.amount, '100')
      assert.strictEqual(calls[0].payload.rate, '0.02')
      assert.strictEqual(calls[0].payload.period, 7)
      assert.strictEqual(calls[0].payload.direction, 'lend')
      done()
    })
  })

  it('withdraw sends withdrawType, walletSelected, amount, address', (done) => {
    const { rest, calls } = createMockRest()
    rest.withdraw('bitcoin', 'exchange', '0.5', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.withdrawType, 'bitcoin')
      assert.strictEqual(calls[0].payload.walletSelected, 'exchange')
      assert.strictEqual(calls[0].payload.amount, '0.5')
      assert.strictEqual(calls[0].payload.address, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
      done()
    })
  })

  it('transfer sends amount, currency, walletFrom, walletTo', (done) => {
    const { rest, calls } = createMockRest()
    rest.transfer('1.5', 'BTC', 'exchange', 'margin', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.amount, '1.5')
      assert.strictEqual(calls[0].payload.currency, 'BTC')
      assert.strictEqual(calls[0].payload.walletFrom, 'exchange')
      assert.strictEqual(calls[0].payload.walletTo, 'margin')
      done()
    })
  })

  // --- Methods with optional options arg ---
  it('balance_history passes options when object', (done) => {
    const { rest, calls } = createMockRest()
    rest.balance_history('USD', { since: '1234567890', limit: 10 }, (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.currency, 'USD')
      assert.strictEqual(calls[0].payload.since, '1234567890')
      assert.strictEqual(calls[0].payload.limit, 10)
      done()
    })
  })

  it('balance_history handles function as options (no extra params)', (done) => {
    const { rest, calls } = createMockRest()
    rest.balance_history('USD', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.currency, 'USD')
      done()
    })
  })

  it('movements passes options when object', (done) => {
    const { rest, calls } = createMockRest()
    rest.movements('BTC', { since: '12345' }, (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.currency, 'BTC')
      assert.strictEqual(calls[0].payload.since, '12345')
      done()
    })
  })

  it('movements handles function as options', (done) => {
    const { rest, calls } = createMockRest()
    rest.movements('BTC', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.currency, 'BTC')
      done()
    })
  })

  it('past_trades passes options when object', (done) => {
    const { rest, calls } = createMockRest()
    rest.past_trades('BTCUSD', { limit_trades: 50 }, (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.symbol, 'BTCUSD')
      assert.strictEqual(calls[0].payload.limit_trades, 50)
      done()
    })
  })

  it('past_trades handles function as options', (done) => {
    const { rest, calls } = createMockRest()
    rest.past_trades('BTCUSD', (err) => {
      assert.ok(!err)
      assert.strictEqual(calls[0].payload.symbol, 'BTCUSD')
      done()
    })
  })
})

describe('RESTv1 error paths', () => {
  it('make_public_request handles HTTP 500 error', (done) => {
    const rest = new RESTv1({
      fetch: async () => new Response('Server Error', { status: 500 })
    })
    rest.make_public_request('test', (err) => {
      assert.ok(err)
      assert.ok(err!.message.includes('500'))
      done()
    })
  })

  it('make_request handles HTTP 500 error', (done) => {
    const rest = new RESTv1({
      apiKey: 'k',
      apiSecret: 's',
      fetch: async () => new Response('Server Error', { status: 500 })
    })
    rest.make_request('test', {}, (err) => {
      assert.ok(err)
      done()
    })
  })

  it('make_request handles 400 with message body', (done) => {
    const rest = new RESTv1({
      apiKey: 'k',
      apiSecret: 's',
      fetch: async () => new Response(
        JSON.stringify({ message: 'Bad request' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )
    })
    rest.make_request('test', {}, (err) => {
      assert.ok(err)
      assert.strictEqual(err!.message, 'Bad request')
      done()
    })
  })

  it('make_request enriches nonce-too-small error message', (done) => {
    const rest = new RESTv1({
      apiKey: 'k',
      apiSecret: 's',
      fetch: async () => new Response(
        JSON.stringify({ message: 'Nonce is too small' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )
    })
    rest.make_request('test', {}, (err) => {
      assert.ok(err)
      assert.ok(err!.message.includes('Nonce is too small'))
      assert.ok(err!.message.includes('See https://'))
      done()
    })
  })

  it('make_public_request handles non-JSON response', (done) => {
    const rest = new RESTv1({
      fetch: async () => new Response('not json', {
        status: 200,
        headers: { 'content-type': 'text/plain' }
      })
    })
    rest.make_public_request('test', (err) => {
      assert.ok(err, 'should error on non-JSON response')
      done()
    })
  })
})
