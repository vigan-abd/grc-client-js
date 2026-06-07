'use strict'

/* eslint-env mocha */

const assert = require('assert')
const createGrapes = require('@bitfinex/bfx-svc-test-helper/grapes')
const sinon = require('sinon')
const utils = require('util')
const { GrcHttpWrk } = require('@vigan-abd/grc-server')
const { GrcHttpClient } = require('../')

class SampleWrk extends GrcHttpWrk {
  constructor (opts) {
    super(opts)

    this.number = opts.number
  }

  ping (from, message) {
    return { to: from, message }
  }

  getTime () {
    return Date.now()
  }

  calc () {
    throw new Error('SIMULATE')
  }

  getNumber () {
    return this.number
  }
}

describe('grc.client.base.js tests', () => {
  const grape = 'http://127.0.0.1:30001'
  const svcName = 'rest:sample:wrk'
  const client = new GrcHttpClient({ grape })
  const grapes = createGrapes({})
  const wrks = [
    new SampleWrk({ name: svcName, port: 7070, grape, number: 1 }),
    new SampleWrk({ name: svcName, port: 7071, grape, number: 2 })
  ]

  let errLog = ''
  let errLogStub = null
  let clock = null

  before(async function () {
    this.timeout(5000)

    await grapes.start()
    client.start()
    await Promise.all(wrks.map(wrk => wrk.start()))

    clock = sinon.useFakeTimers({ now: 1665843499038, toFake: ['Date'] })
    errLogStub = sinon.stub(console, 'error').callsFake((...params) => {
      errLog = utils.format(...params)
    })
  })

  after(async function () {
    this.timeout(5000)

    client.stop()
    wrks.forEach(wrk => wrk.stop())
    await grapes.stop()

    clock.restore()
    errLogStub.restore()
  })

  it('should send request and receive response', async () => {
    const res = await client.request(svcName, 'ping', ['john', 'hi'])
    assert.deepStrictEqual(res, { to: 'john', message: 'hi' })
  })

  it('should work actions without params', async () => {
    const res = await client.request(svcName, 'getTime', [])
    assert.strictEqual(res, 1665843499038)
  })

  it('should send requests to all workers', async () => {
    const res = await client.request(svcName, 'getTime', [])
    assert.strictEqual(res, 1665843499038)
  })

  it('should support sending request to all workers', async () => {
    const res = await client.requestAll(svcName, 'getNumber', [])
    assert.ok(Array.isArray(res))
    assert.ok(res.length, 2)
    assert.ok(res.every(x => [1, 2].includes(x)))
    assert.ok(res.some(x => x === 1))
    assert.ok(res.some(x => x === 2))
  })

  it('should handle errors', async () => {
    await assert.rejects(
      () => client.request(svcName, 'calc', []),
      (err) => {
        assert.ok(err instanceof Error)
        assert.strictEqual(err.message, 'SIMULATE')
        assert.ok(errLog.includes(`${new Date().toISOString()} Error: SIMULATE`))
        return true
      }
    )
  })
})
