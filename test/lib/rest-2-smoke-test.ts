import assert from 'assert'
import http from 'http'
import { RESTv2 } from '../../dist/index.js'

const PORT = 1338
const bhttp = new RESTv2({
  apiKey: 'dummy',
  apiSecret: 'dummy',
  url: `http://localhost:${PORT}`
})

const testResBody = `[1765.3,
  0.56800816,
  1767.6,
  1.3874,
  -62.2,
  -0.034,
  1765.3,
  14063.54589155,
  1834.2,
  1726.3 ]`

describe('rest2 api client', () => {
  let server: http.Server | null = null

  afterEach((done) => {
    if (server) {
      server.close(() => {
        server = null
        done()
      })
    } else {
      done()
    }
  })

  it('gets a response as JSON', async () => {
    server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(testResBody)
    })

    return new Promise<void>((resolve) => {
      server!.listen(PORT, () => {
        bhttp.ticker({ symbol: 'tBTCUSD' }, (err: Error | null, res: unknown) => {
          assert.strictEqual(err, null)
          assert.deepStrictEqual(res, JSON.parse(testResBody))

          resolve()
        })
      })
    })
  })
})
