# grc-client-js

This package provides base classes for grenache client on node js through different transport layers.
Currently it supports the following transport layers:
- Http transport layer
- Ws transport layer

## How to use

```js
const { GrcHttpClient } = require('@vigan-abd/grc-client')
const client = new GrcHttpClient({
  grape: 'http://127.0.0.1:30001'
})
client.start()

const pingRes = await client.request('rest:sample:wrk', 'ping', ['john', 'hello'])
console.log('ping result', pingRes)
```

Sample examples could be found under [./examples](./examples) directory
