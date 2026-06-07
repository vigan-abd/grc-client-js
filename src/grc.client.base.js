'use strict'

const Link = require('grenache-nodejs-link')

class GrcClientBase {
  /**
   * @param {Object} opts
   * @param {number} [opts.timeout] - Grc call timeout
   * @param {string} opts.grape - Grape URL
   */
  constructor ({ grape, timeout = 15000 }) {
    this._link = new Link({ grape })
    this._timeout = timeout
  }

  start () {
    this._link.start()
    this._peerClient.init() // should be inited on extended class
  }

  stop () {
    this._peerClient.stop()
    this._link.stop()
  }

  /**
   * Sends a request to a single worker serving the service.
   * @param {string} service - Grc service name
   * @param {string} action - Worker action to invoke
   * @param {any[]} args - Action arguments
   * @param {Object} [opts] - Per-request options, defaults to {}
   * @param {number} [opts.timeout] - Grc call timeout, defaults to the client timeout
   * @returns {Promise<any>} Worker response
   */
  async request (service, action, args, opts = {}) {
    return new Promise((resolve, reject) => this._peerClient.request(
      service,
      { action, args },
      { timeout: this._timeout, ...opts },
      (err, res) => err ? reject(err) : resolve(res)
    ))
  }

  /**
   * Sends a request to all workers serving the service.
   * @param {string} service - Grc service name
   * @param {string} action - Worker action to invoke
   * @param {any[]} args - Action arguments
   * @param {Object} [opts] - Per-request options, defaults to {}
   * @param {number} [opts.timeout] - Grc call timeout, defaults to the client timeout
   * @returns {Promise<any[]>} Responses from all matching workers
   */
  async requestAll (service, action, args, opts = {}) {
    return new Promise((resolve, reject) => this._peerClient.map(
      service,
      { action, args },
      { timeout: this._timeout, ...opts },
      (err, res) => err ? reject(err) : resolve(res)
    ))
  }
}

module.exports = GrcClientBase
