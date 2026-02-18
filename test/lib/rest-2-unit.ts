import assert from 'assert'
import sinon from 'sinon'
import { RESTv2 } from '../../dist/index.js'

// --- Helpers ---

const testMethod = (name: string, url: string, method: string, ...params: unknown[]) => {
  describe(name, () => {
    it(`calls correct endpoint: ${url}`, (done) => {
      const rest = new RESTv2()
      ;(rest as any)[method] = (reqURL: string) => {
        assert.strictEqual(reqURL, url)
        done()
      }
      ;(rest as any)[name](...params)
    })
  })
}

// --- Tests ---

describe('RESTv2', () => {
  describe('default connection url', () => {
    it('is a static member on the class', () => {
      assert.ok(
        typeof RESTv2.url === 'string' && RESTv2.url.length > 0,
        'RESTv2.url should be a non-empty string'
      )
    })
  })

  describe('getURL', () => {
    it('returns the URL the instance was constructed with', () => {
      const rest = new RESTv2({ url: 'test' })
      assert.strictEqual(rest.getURL(), 'test', 'instance does not use provided URL')
    })
  })

  describe('usesAgent', () => {
    it('returns true if a custom fetch was passed to the constructor', () => {
      const customFetch: typeof globalThis.fetch = async () => new Response()
      const rest = new RESTv2({ fetch: customFetch })
      assert.ok(
        rest.usesAgent(),
        'usesAgent() does not indicate custom fetch presence when one was provided'
      )
    })

    it('returns false if no custom fetch was passed to the constructor', () => {
      const rest = new RESTv2()
      assert.ok(
        !rest.usesAgent(),
        'usesAgent() indicates custom fetch presence when none provided'
      )
    })
  })

  describe('trades', () => {
    it('correctly builds query string', (done) => {
      const rest = new RESTv2()

      ;(rest as any)._makePublicRequest = (url: string) => {
        assert.strictEqual(url, '/trades/tBTCUSD/hist?start=1&end=2&limit=3&sort=4')
        done()
      }

      const params = { symbol: 'tBTCUSD', start: 1, end: 2, limit: 3, sort: 4 }
      rest.trades(params)
    })
  })

  describe('request body', () => {
    let fetchStub: sinon.SinonStub

    beforeEach(() => {
      fetchStub = sinon.stub(globalThis, 'fetch').resolves(
        new Response(JSON.stringify([]), { status: 200 })
      )
    })

    afterEach(() => {
      fetchStub.restore()
    })

    it('excludes nullish', async () => {
      const rest = new RESTv2()
      ;(rest as any)._apiKey = 'key'
      ;(rest as any)._apiSecret = 'secret'
      ;(rest as any)._makeAuthRequest('path', { a: 1, b: '', c: null, d: undefined })

      // Wait a tick for the async fetch to be called
      await new Promise((resolve) => setTimeout(resolve, 50))

      assert(fetchStub.called, 'fetch should have been called')
      const reqOpts = fetchStub.lastCall.args[1]

      assert.equal(typeof reqOpts, 'object', 'argument is not an object')
      assert.deepStrictEqual(JSON.parse(reqOpts.body as string), { a: 1, b: '' })
    })
  })

  describe('listener methods', () => {
    // --- Existing testMethod calls ---
    testMethod('symbols', '/conf/pub:list:pair:exchange', '_makePublicRequest', {})
    testMethod('inactiveSymbols', '/conf/pub:list:pair:exchange:inactive', '_makePublicRequest', {})
    testMethod('futures', '/conf/pub:list:pair:futures', '_makePublicRequest', {})
    testMethod('ledgers', '/auth/r/ledgers/hist', '_makeAuthRequest', {})
    testMethod('ledgers', '/auth/r/ledgers/USD/hist', '_makeAuthRequest', { filters: 'USD' })
    testMethod('generateInvoice', '/auth/w/deposit/invoice', '_makeAuthRequest', {})
    testMethod('marketAveragePrice', '/calc/trade/avg?symbol=fUSD&amount=100', '_makePublicPostRequest', { symbol: 'fUSD', amount: 100 })
    testMethod('keepFunding', '/auth/w/funding/keep', '_makeAuthRequest', { type: 'type', id: 'id' })
    testMethod('cancelOrderMulti', '/auth/w/order/cancel/multi', '_makeAuthRequest', { id: [123] })
    testMethod('orderMultiOp', '/auth/w/order/multi', '_makeAuthRequest', { ops: [['oc_multi', { id: [1] }]] })
    testMethod('invalidateAuthToken', '/auth/w/token/del', '_makeAuthRequest', { authToken: 'token' })

    // --- New testMethod calls ---
    testMethod('ticker', '/ticker/tBTCUSD', '_makePublicRequest', { symbol: 'tBTCUSD' })
    testMethod('tickers', '/tickers?symbols=ALL', '_makePublicRequest', {})
    testMethod('tickers', '/tickers?symbols=tBTCUSD,tETHUSD', '_makePublicRequest', { symbols: ['tBTCUSD', 'tETHUSD'] })
    testMethod('stats', '/stats1/key/context', '_makePublicRequest', { key: 'key', context: 'context' })
    testMethod('status', '/platform/status', '_makePublicRequest', {})
    testMethod('statusMessages', '/status/deriv?keys=ALL', '_makePublicRequest', {})
    testMethod('orderBook', '/book/tBTCUSD/P0', '_makePublicRequest', { symbol: 'tBTCUSD', prec: 'P0' })
    testMethod('alertList', '/auth/r/alerts', '_makeAuthRequest', { type: 'price' })
    testMethod('alertSet', '/auth/w/alert/set', '_makeAuthRequest', { type: 'type', symbol: 'symbol', price: 100 })
    testMethod('alertDelete', '/auth/w/alert/del', '_makeAuthRequest', { symbol: 'symbol', price: 100 })
    testMethod('accountTrades', '/auth/r/trades/tBTCUSD/hist', '_makeAuthRequest', { symbol: 'tBTCUSD' })
    testMethod('accountTrades', '/auth/r/trades/hist', '_makeAuthRequest', {})
    testMethod('getWeightedAverages', '/auth/r/trades/calc', '_makeAuthRequest', { symbol: 'sym' })
    testMethod('logins', '/auth/r/logins/hist', '_makeAuthRequest', {})
    testMethod('wallets', '/auth/r/wallets', '_makeAuthRequest', {})
    testMethod('walletsHistory', '/auth/r/wallets/hist', '_makeAuthRequest', {})
    testMethod('userInfo', '/auth/r/info/user', '_makeAuthRequest', {})
    testMethod('activeOrders', '/auth/r/orders', '_makeAuthRequest', {})
    testMethod('activeOrdersWithIds', '/auth/r/orders', '_makeAuthRequest', { ids: [1, 2] })
    testMethod('movements', '/auth/r/movements/hist', '_makeAuthRequest', {})
    testMethod('movements', '/auth/r/movements/ETH/hist', '_makeAuthRequest', { ccy: 'ETH' })
    testMethod('movementInfo', '/auth/r/movements/info', '_makeAuthRequest', { id: 123 })
    testMethod('orderHistory', '/auth/r/orders/hist', '_makeAuthRequest', {})
    testMethod('orderHistory', '/auth/r/orders/tBTCUSD/hist', '_makeAuthRequest', { symbol: 'tBTCUSD' })
    testMethod('orderHistoryWithIds', '/auth/r/orders/hist', '_makeAuthRequest', { ids: [1, 2] })
    testMethod('orderTrades', '/auth/r/order/tBTCUSD:123/trades', '_makeAuthRequest', { symbol: 'tBTCUSD', orderId: 123 })
    testMethod('positions', '/auth/r/positions', '_makeAuthRequest', {})
    testMethod('positionsHistory', '/auth/r/positions/hist', '_makeAuthRequest', {})
    testMethod('positionsAudit', '/auth/r/positions/audit', '_makeAuthRequest', {})
    testMethod('positionsSnapshot', '/auth/r/positions/snap', '_makeAuthRequest', {})
    testMethod('fundingOffers', '/auth/r/funding/offers/fUSD', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingOfferHistory', '/auth/r/funding/offers/fUSD/hist', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingOfferHistory', '/auth/r/funding/offers/hist', '_makeAuthRequest', {})
    testMethod('fundingLoans', '/auth/r/funding/loans/fUSD', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingLoanHistory', '/auth/r/funding/loans/fUSD/hist', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingLoanHistory', '/auth/r/funding/loans/hist', '_makeAuthRequest', {})
    testMethod('fundingCredits', '/auth/r/funding/credits/fUSD', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingCreditHistory', '/auth/r/funding/credits/fUSD/hist', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingCreditHistory', '/auth/r/funding/credits/hist', '_makeAuthRequest', {})
    testMethod('fundingTrades', '/auth/r/funding/trades/fUSD/hist', '_makeAuthRequest', { symbol: 'fUSD' })
    testMethod('fundingTrades', '/auth/r/funding/trades/hist', '_makeAuthRequest', {})
    testMethod('marginInfo', '/auth/r/info/margin/base', '_makeAuthRequest', {})
    testMethod('changeLogs', '/auth/r/audit/hist', '_makeAuthRequest', {})
    testMethod('fundingInfo', '/auth/r/info/funding/fUSD', '_makeAuthRequest', { key: 'fUSD' })
    testMethod('performance', '/auth/r/stats/perf:1D/hist', '_makeAuthRequest', {})
    testMethod('calcAvailableBalance', '/auth/calc/order/avail', '_makeAuthRequest', { symbol: 'sym', type: 'type' })
    testMethod('accountSummary', '/auth/r/summary', '_makeAuthRequest', {})
    testMethod('keyPermissions', '/auth/r/permissions', '_makeAuthRequest', {})
    testMethod('updateSettings', '/auth/w/settings/set', '_makeAuthRequest', { settings: {} })
    testMethod('deleteSettings', '/auth/w/settings/del', '_makeAuthRequest', { keys: ['k'] })
    testMethod('getSettings', '/auth/r/settings', '_makeAuthRequest', { keys: ['k'] })
    testMethod('getCoreSettings', '/auth/r/settings/core', '_makeAuthRequest', { keys: ['k'] })
    testMethod('submitRecurringAlgoOrder', '/auth/w/ext/recurring-ao/create', '_makeAuthRequest', { order: {} })
    testMethod('getRecurringAlgoOrder', '/auth/r/ext/recurring-ao/detail/123', '_makeAuthRequest', { algoOrderId: '123' })
    testMethod('cancelRecurringAlgoOrder', '/auth/w/ext/recurring-ao/cancel/123', '_makeAuthRequest', { algoOrderId: '123' })
    testMethod('getRecurringAlgoOrders', '/auth/r/ext/recurring-ao/list', '_makeAuthRequest', {})
    testMethod('getRecurringAoOrders', '/auth/r/ext/recurring-ao/order/list', '_makeAuthRequest', {})
    testMethod('lnxInvoicePayments', '/auth/r/ext/invoice/payments', '_makeAuthRequest', { action: 'get', query: {} })
    testMethod('withdraw', '/auth/w/withdraw', '_makeAuthRequest', { wallet: 'exchange' })
    testMethod('getDepositAddress', '/auth/w/deposit/address', '_makeAuthRequest', { wallet: 'exchange', method: 'bitcoin' })
    testMethod('claimPosition', '/auth/w/position/claim', '_makeAuthRequest', { id: 123 })
    testMethod('closeFunding', '/auth/w/funding/close', '_makeAuthRequest', { id: 1, type: 'LIMIT' })
    testMethod('cancelFundingOffer', '/auth/w/funding/offer/cancel', '_makeAuthRequest', { id: 1 })
    testMethod('cancelAllFundingOffers', '/auth/w/funding/offer/cancel/all', '_makeAuthRequest', { currency: 'USD' })
  })

  describe('internal methods', () => {
    describe('_checkOpts', () => {
      it('throws on non-integer timeout', () => {
        assert.throws(() => {
          new RESTv2({ timeout: 1.5 })
        }, /ERR_TIMEOUT_DATA_TYPE_ERROR/)
      })

      it('throws on string timeout', () => {
        assert.throws(() => {
          new RESTv2({ timeout: 'abc' as any })
        }, /ERR_TIMEOUT_DATA_TYPE_ERROR/)
      })

      it('throws on NaN timeout', () => {
        assert.throws(() => {
          new RESTv2({ timeout: NaN as any })
        }, /ERR_TIMEOUT_DATA_TYPE_ERROR/)
      })

      it('accepts valid integer timeout', () => {
        assert.doesNotThrow(() => {
          new RESTv2({ timeout: 5000 })
        })
      })

      it('accepts undefined timeout (uses default)', () => {
        assert.doesNotThrow(() => {
          new RESTv2({})
        })
      })
    })

    describe('_cb', () => {
      it('returns Promise.reject on error when no callback', async () => {
        const rest = new RESTv2()
        const err = new Error('test error')
        try {
          await (rest as any)._cb(err, null, null)
          assert.fail('should have rejected')
        } catch (e: any) {
          assert.strictEqual(e.message, 'test error')
        }
      })

      it('returns Promise.resolve on success when no callback', async () => {
        const rest = new RESTv2()
        const result = await (rest as any)._cb(null, { data: 42 }, null)
        assert.deepStrictEqual(result, { data: 42 })
      })

      it('calls callback with error when callback provided', (done) => {
        const rest = new RESTv2()
        const err = new Error('cb error')
        ;(rest as any)._cb(err, null, (e: Error | null) => {
          assert.strictEqual(e, err)
          done()
        })
      })

      it('calls callback with null error and result on success', (done) => {
        const rest = new RESTv2()
        ;(rest as any)._cb(null, 'success', (e: Error | null, res: unknown) => {
          assert.strictEqual(e, null)
          assert.strictEqual(res, 'success')
          done()
        })
      })
    })
  })

  describe('validation', () => {
    describe('submitOrderMulti', () => {
      it('returns error if orders is not an array', async () => {
        const rest = new RESTv2()
        try {
          await (rest as any).submitOrderMulti({ orders: 'not-an-array' })
          assert.fail('should have rejected')
        } catch (e: any) {
          assert.ok(e.message.includes('orders should be an array'))
        }
      })
    })

    describe('updateOrderMulti', () => {
      it('returns error if orders is not an array', async () => {
        const rest = new RESTv2()
        try {
          await (rest as any).updateOrderMulti({ orders: 'not-an-array' })
          assert.fail('should have rejected')
        } catch (e: any) {
          assert.ok(e.message.includes('orders should be an array'))
        }
      })
    })

    describe('cancelOrders', () => {
      it('returns error if ids is not an array', async () => {
        const rest = new RESTv2()
        try {
          await (rest as any).cancelOrders({ ids: 123 })
          assert.fail('should have rejected')
        } catch (e: any) {
          assert.ok(e.message.includes('ids should be an array'))
        }
      })
    })

    describe('orderMultiOp', () => {
      it('returns error if ops is not an array', async () => {
        const rest = new RESTv2()
        try {
          await (rest as any).orderMultiOp({ ops: 'not-an-array' })
          assert.fail('should have rejected')
        } catch (e: any) {
          assert.ok(e.message.includes('ops should be an array'))
        }
      })
    })

    describe('generateToken', () => {
      it('returns error if scope is not provided', async () => {
        const rest = new RESTv2()
        try {
          await (rest as any).generateToken({})
          assert.fail('should have rejected')
        } catch (e: any) {
          assert.ok(e.message.includes('scope param is required'))
        }
      })
    })
  })

  describe('HTTP error handling', () => {
    let fetchStub: sinon.SinonStub

    afterEach(() => {
      fetchStub.restore()
    })

    it('rejects with parsed array error for non-2xx response', async () => {
      fetchStub = sinon.stub(globalThis, 'fetch').resolves(
        new Response(JSON.stringify(['error', 10010, 'ERR_RATE_LIMIT']), { status: 400, statusText: 'Bad Request' })
      )
      const rest = new RESTv2()
      try {
        await rest.status()
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.strictEqual(e.status, 400)
        assert.strictEqual(e.code, 10010)
        assert.strictEqual(e.response, 'ERR_RATE_LIMIT')
        assert.ok(e.message.includes('400'))
      }
    })

    it('rejects with parsed non-array JSON for non-2xx response', async () => {
      fetchStub = sinon.stub(globalThis, 'fetch').resolves(
        new Response(JSON.stringify({ error: 'internal' }), { status: 500, statusText: 'Internal Server Error' })
      )
      const rest = new RESTv2()
      try {
        await rest.status()
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.strictEqual(e.status, 500)
        assert.deepStrictEqual(e.response, { error: 'internal' })
      }
    })

    it('rejects with raw body when JSON parse fails for non-2xx', async () => {
      fetchStub = sinon.stub(globalThis, 'fetch').resolves(
        new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' })
      )
      const rest = new RESTv2()
      try {
        await rest.status()
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.strictEqual(e.status, 502)
        assert.strictEqual(e.response, 'Bad Gateway')
      }
    })
  })

  describe('_cb nonce enrichment', () => {
    it('appends nonce help link when error has error code 10114', async () => {
      const rest = new RESTv2()
      const err: any = new Error('nonce: small')
      err.error = ['error', 10114, 'nonce: small']
      try {
        await (rest as any)._cb(err, null, null)
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.ok(e.message.includes('nonce'))
        assert.ok(e.message.includes('README'))
      }
    })

    it('does not append help link for other error codes', async () => {
      const rest = new RESTv2()
      const err: any = new Error('some error')
      err.error = ['error', 10020, 'some error']
      try {
        await (rest as any)._cb(err, null, null)
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.ok(!e.message.includes('README'))
      }
    })
  })

  describe('transform logic', () => {
    it('_classTransform returns empty array for empty data', () => {
      const rest = new RESTv2({ transform: true })
      const result = (rest as any)._classTransform([], class MockModel { constructor(public data: unknown) {} })
      assert.deepStrictEqual(result, [])
    })

    it('_classTransform returns empty array for null/falsy data', () => {
      const rest = new RESTv2({ transform: true })
      const result = (rest as any)._classTransform(null, class MockModel { constructor(public data: unknown) {} })
      assert.deepStrictEqual(result, [])
    })

    it('_classTransform returns data as-is when transform is false', () => {
      const rest = new RESTv2({ transform: false })
      const data = [[1, 2], [3, 4]]
      const result = (rest as any)._classTransform(data, class MockModel { constructor(public data: unknown) {} })
      assert.deepStrictEqual(result, data)
    })

    it('_classTransform maps 2D arrays to model instances', () => {
      const rest = new RESTv2({ transform: true })
      class MockModel { data: unknown; constructor(d: unknown) { this.data = d } }
      const result = (rest as any)._classTransform([[1, 2], [3, 4]], MockModel)
      assert.ok(Array.isArray(result))
      assert.strictEqual(result.length, 2)
      assert.ok(result[0] instanceof MockModel)
      assert.deepStrictEqual(result[0].data, [1, 2])
    })

    it('_classTransform wraps single array in model instance', () => {
      const rest = new RESTv2({ transform: true })
      class MockModel { data: unknown; constructor(d: unknown) { this.data = d } }
      const result = (rest as any)._classTransform([1, 2, 3], MockModel)
      assert.ok(result instanceof MockModel)
      assert.deepStrictEqual(result.data, [1, 2, 3])
    })

    it('_doTransform uses function transformer when not a class', () => {
      const rest = new RESTv2({ transform: true })
      const fn = (data: unknown) => ({ transformed: data })
      const result = (rest as any)._doTransform([1, 2], fn)
      assert.deepStrictEqual(result, { transformed: [1, 2] })
    })

    it('_doTransform returns data as-is when transformer is null', () => {
      const rest = new RESTv2({ transform: true })
      const result = (rest as any)._doTransform([1, 2], null)
      assert.deepStrictEqual(result, [1, 2])
    })
  })

  describe('_response exception handling', () => {
    it('catches transform exception and rejects', async () => {
      const rest = new RESTv2({ transform: true })
      const throwingTransformer = () => { throw new Error('transform failed') }
      try {
        await (rest as any)._response([1, 2], throwingTransformer, null)
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.strictEqual(e.message, 'transform failed')
      }
    })
  })

  describe('_genCurrencyList', () => {
    it('returns data unchanged if not array of length 6', () => {
      const rest = new RESTv2()
      assert.strictEqual((rest as any)._genCurrencyList('hello'), 'hello')
      assert.deepStrictEqual((rest as any)._genCurrencyList([1, 2, 3]), [1, 2, 3])
      assert.deepStrictEqual((rest as any)._genCurrencyList([]), [])
    })

    it('merges currencies, pools and explorers from 6-element array', () => {
      const rest = new RESTv2()
      const data = [
        ['BTC', 'ETH'],                                     // listed currencies
        [['BTC', 'BTC'], ['ETH', 'ETH']],                  // currency sym map
        [['BTC', 'Bitcoin'], ['ETH', 'Ethereum']],          // currency label map
        [['ETH', 'ETH'], ['USDT', 'ETH']],                 // pool map
        [['ETH', ['https://etherscan.io']]],                // explorer map
        [['BTC', ['wallet1']]]                              // walletFx map
      ]
      const result = (rest as any)._genCurrencyList(data) as unknown[][]
      assert.ok(Array.isArray(result))
      assert.ok(result.length >= 2)
      // Each entry should be [key, name, pool, explorer, symbol, walletFx]
      const btc = result.find((r: unknown[]) => r[0] === 'BTC')
      assert.ok(btc)
      assert.strictEqual(btc![1], 'Bitcoin')
      assert.deepStrictEqual(btc![5], ['wallet1'])
    })

    it('assigns pool explorer to currency without its own explorer', () => {
      const rest = new RESTv2()
      const data = [
        ['USDT'],
        [['USDT', 'USDT']],
        [['USDT', 'Tether']],
        [['USDT', 'ETH']],                        // USDT is in ETH pool
        [['ETH', ['https://etherscan.io']]],       // only ETH has explorer
        []
      ]
      const result = (rest as any)._genCurrencyList(data) as unknown[][]
      const usdt = result.find((r: unknown[]) => r[0] === 'USDT')
      assert.ok(usdt)
      // USDT should inherit ETH's explorer via pool mapping
      assert.deepStrictEqual(usdt![3], ['https://etherscan.io'])
    })
  })

  describe('missing auth credentials', () => {
    it('rejects with error when no apiKey, apiSecret, or authToken', async () => {
      const rest = new RESTv2()
      try {
        await rest.wallets()
        assert.fail('should have rejected')
      } catch (e: any) {
        assert.ok(e.message.includes('missing api key or secret'))
      }
    })
  })

  describe('_makePublicRequest cb validation', () => {
    it('throws if cb is not null/undefined/function', async () => {
      const rest = new RESTv2()
      try {
        await (rest as any)._makePublicRequest('/test', 'not-a-function')
        assert.fail('should have thrown')
      } catch (e: any) {
        assert.ok(e.message.includes('must be a function'))
      }
    })
  })

  describe('conf', () => {
    it('returns empty array immediately when keys is empty', async () => {
      const rest = new RESTv2()
      const result = await rest.conf({ keys: [] })
      assert.deepStrictEqual(result, [])
    })

    it('returns empty array when no params provided', async () => {
      const rest = new RESTv2()
      const result = await rest.conf()
      assert.deepStrictEqual(result, [])
    })
  })
})
