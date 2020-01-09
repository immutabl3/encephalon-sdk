# Universal JavaScript SDK for the Encephalon Engine API

This client is a thin wrapper for the Encephalon API to use in Node.js and the browser.

## Install

```
npm install @encephalon/sdk
```

## Usage

`encephalon` exposes a single function that takes a single `options` object for configuration and returns the client

**options**

#### `token` string

The access token. You can find or create one in your [dashboard](https://admin.encephalonengine.com)

#### `cache` (optional)

Allows custom cache implementation, defaults to `memory`

#### `ttl` integer (optional)

A cache entry's time to live in ms, defaults to `3600000`

#### `maxRetries` integer (optional)

Number of attempts to retry a request if an error occurs, defaults to `2`

#### `timeout` integer (optional)

How long before the request aborts in ms, defaults to `5000`

#### `concurrency` integer (optional)

Max concurrent requests, defaults to `3`

#### `interval` integer (optional)

Duration of delay between requests to avoid API rate limits, defaults to `16`

**Example**

```javascript
// require encephalon
import encephalon from '@encephalon/sdk';

// create a client with your access token
const client = encephalon({
  token: '{YOUR_ACCESS_TOKEN}',
});

// make requests
await client.get(`experiences/${id}`);

await client.post(`experiences/${id}`)
  .send({ name: 'hello' });
  
await client.delete(`experiences/${id}`);
```

## Methods

#### `all`, `get`, `post`, `put`, `patch`, `delete`

All requests take a string for the API path and return a [thenable](https://promisesaplus.com/) [superagent](http://visionmedia.github.io/superagent/) object. See the **Example** section above.

```js
await client.all(`experiences`);
await client.get(`experiences/${id}`);
await client.post(`experiences/${id}`)
  .send({ name: 'hello' });
await client.delete(`experiences/${id}`);
```

#### `cachebust`

Ignores the cache and cachebusts the URL

```js
await client.get(`experiences/${id}`)
  .cachebust();
```

#### `page`

For pagination, sets the page number

```js
await client.all(`experiences`)
  .page(2);
```

#### `perPage`

For pagination, sets quantity per page

```js
await client.all(`experiences`)
  .perPage(5);
```

#### `token`

Sets the token with the passed value. Can also be used as a getter.

```js
client.token('{TOKEN}'); // sets token

const tkn = client.token(); // gets token
```

## Cache

Documentation is a WIP

## Testing

To run the test suite:

1. Open a terminal and navigate to the project
1. run `npm install`
1. run `npm test`

Please see the [package.json](./package.json) `engines` for supported environments