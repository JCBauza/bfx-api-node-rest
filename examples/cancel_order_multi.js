import Debug from 'debug'
import { RESTv2 } from '../dist/index.js'

process.env.DEBUG = '*'

const debug = Debug('bfx:api:rest:examples:cancelordermulti')

/**
 * populate apiKey and apiSecret
 */
const rest2 = new RESTv2({
  apiKey: '',
  apiSecret: '',
  transform: true
})

const cancelOrdersById = async () => {
  const orderIDs = [123, 124]
  const response = await rest2.cancelOrderMulti({ id: orderIDs })
  debug('Cancel orders by ID status: %s', response.status)
  debug('Cancel orders by ID message: %s', response.text)
}

const cancelOrdersByClientOrderId = async () => {
  const clientOrderID = 7701
  const clientOrderIDDate = '2020-05-28'
  const response = await rest2.cancelOrderMulti({
    cid: [[clientOrderID, clientOrderIDDate]]
  })
  debug('Cancel orders by client order ID status: %s', response.status)
  debug('Cancel orders by client order ID message: %s', response.text)
}

const cancelOrdersByGroupId = async () => {
  const groupIDs = [8800, 8801]
  const response = await rest2.cancelOrderMulti({ gid: groupIDs })
  debug('Cancel orders by group ID status: %s', response.status)
  debug('Cancel orders by group ID message: %s', response.text)
}

const runMixMultiple = async () => {
  const orderIDs = [123]
  const groupIDs = [123]
  const clientOrderID = 7701
  const clientOrderIDDate = '2020-05-28'
  const response = await rest2.cancelOrderMulti({
    id: orderIDs,
    gid: groupIDs,
    cid: [[clientOrderID, clientOrderIDDate]]
  })
  debug('Mixed operations status: %s', response.status)
  debug('Mixed operations message: %s', response.text)
}

;(async () => {
  await cancelOrdersById()
  await cancelOrdersByGroupId()
  await cancelOrdersByClientOrderId()
  await runMixMultiple()
})().catch(e => debug('error: %s', e.stack))
