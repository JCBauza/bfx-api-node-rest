import assert from 'assert'
import http from 'http'
import { RESTv2 } from '../../dist/index.js'

const PORT = 1337
const bhttp = new RESTv2({
  apiKey: 'dummy',
  apiSecret: 'dummy',
  url: `http://localhost:${PORT}`
})

const testResBody = '["ente", "gans", "scholle"]'

describe('rest2 api client: issue 80 - argument length auth request', () => {
  let server: http.Server | null = null

  beforeEach((done) => {
    server = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(testResBody)
    })

    server.listen(PORT, done)
  })

  afterEach(() => {
    if (server) server.close()
    server = null
  })

  it('errors if no payload defined', async () => {
    await bhttp._makeAuthRequest('/auth/r/orders')
  })

  it('succeeds with the right argument length', async () => {
    const res = await bhttp._makeAuthRequest('/auth/r/orders', {})

    assert.deepStrictEqual(res, ['ente', 'gans', 'scholle'])
  })
})
