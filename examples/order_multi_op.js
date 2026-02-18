import Debug from 'debug'
import { Order } from 'bfx-api-node-models'
import { RESTv2 } from '../dist/index.js'

process.env.DEBUG = '*'

const debug = Debug('bfx:api:rest:examples:ordermultiop')

/**
 * populate apiKey and apiSecret
 */
const rest2 = new RESTv2({
  apiKey: '',
  apiSecret: '',
  transform: true
})

const runOrderNew = async () => {
  const ops = [
    ['on', new Order({ type: 'EXCHANGE LIMIT', symbol: 'tBTCUSD', price: '13', amount: '0.001', gid: 7, cid: 8 })],
    ['on', { type: 'EXCHANGE LIMIT', symbol: 'tBTCUSD', price: '9', amount: '0.001', gid: 7, cid: 8 }]
  ]
  const response = await rest2.orderMultiOp({ ops })
  debug('Order new submit status: %s', response.status)
  debug('Order new submit message: %s', response.text)
}

const runOrderCancel = async () => {
  const response = await rest2.orderMultiOp({ ops: [['oc', { id: 123 }]] })
  debug('Order cancel status: %s', response.status)
  debug('Order cancel message: %s', response.text)
}

const runOrderCancelMulti = async () => {
  const response = await rest2.orderMultiOp({ ops: [['oc_multi', { id: [123, 124] }]] })
  debug('Order cancel multi status: %s', response.status)
  debug('Order cancel multi message: %s', response.text)
}

const runOrderUpdate = async () => {
  const response = await rest2.orderMultiOp({ ops: [['ou', { id: 123, price: '15', amount: '0.001' }]] })
  debug('Order update status: %s', response.status)
  debug('Order update message: %s', response.text)
}

;(async () => {
  await runOrderNew()
  await runOrderCancel()
  await runOrderCancelMulti()
  await runOrderUpdate()
})().catch(e => debug('error: %s', e.stack))
