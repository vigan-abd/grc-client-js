// Type definitions for @vigan-abd/grc-client

/**
 * Options shared by every grc client.
 */
export interface GrcClientBaseOpts {
  /** Grape URL */
  grape: string
  /** Grc call timeout, defaults to 15000 */
  timeout?: number
}

/**
 * Per-request options forwarded to the underlying grenache peer client.
 */
export interface GrcRequestOpts {
  /** Grc call timeout, defaults to the client timeout */
  timeout?: number
  [key: string]: any
}

/**
 * Base grc client. Manages the grenache link and dispatches requests through a
 * transport specific peer client that must be initialized by the extending class.
 */
export class GrcClientBase {
  protected _link: any
  protected _timeout: number
  /** Transport peer client, must be initialized by the extending class */
  protected _peerClient: any

  constructor (opts: GrcClientBaseOpts)

  /** Starts the link and initializes the peer client. */
  start (): void

  /** Stops the peer client and the link. */
  stop (): void

  /** Sends a request to a single worker serving the service. */
  request<T = any> (
    service: string,
    action: string,
    args: any[],
    opts?: GrcRequestOpts
  ): Promise<T>

  /** Sends a request to all workers serving the service. */
  requestAll<T = any> (
    service: string,
    action: string,
    args: any[],
    opts?: GrcRequestOpts
  ): Promise<T[]>
}

/**
 * Grc client over the http transport.
 */
export class GrcHttpClient extends GrcClientBase {
  constructor (opts: GrcClientBaseOpts)
}

/**
 * Grc client over the websocket transport.
 */
export class GrcWsClient extends GrcClientBase {
  constructor (opts: GrcClientBaseOpts)
}
