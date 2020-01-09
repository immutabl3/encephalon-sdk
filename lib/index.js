/* eslint-disable no-underscore-dangle */
import Throttle from './Throttle';
import createRequest from './request';
import acumulator from './acumulator';
import {
  MemoryCache,
  NoCache,
} from './cache';
import {
  resolveUrl,
} from './helpers';

export default function encephalon({
  endpoint = `https://api.encephalonengine.com/v1`,
  // access token
  token = '',
  // false for no cache
  // undefined for the memoryCache
  // or pass own cache
  cache: passedCache = 'memory',
  // 1 hour - 0 invalidates any caching
  ttl = 60 * 60 * 1000,
  // how many times to retry
  maxRetries = 2,
  // 5 seconds
  timeout = 5 * 1000,
  // how many requests will the sdk
  // make concurrently
  concurrency = 3,
  // what is the delay before starting
  // the next request, this helps avoid
  // rate limits
  interval = 16, 
} = {}) {
  const cache = passedCache === 'memory' ? MemoryCache({ ttl }) :
    passedCache ? passedCache : 
      NoCache();

  const throttle = Throttle(concurrency, interval);

  const config = {
    throttle,
    cache,
    maxRetries,
    timeout,
    token,
  };

  const getAll = function request(location) {
    const req = createRequest('get', resolveUrl(endpoint, location), config)
      .page(1)
      .perPage(25);

    req.__then = req.then;
    req.then = acumulator;

    return req;
  };

  const requester = method => {
    return function request(location) {
      return createRequest(method, resolveUrl(endpoint, location), config);
    };
  };

  return {
    cache,

    all: getAll,
    
    get: requester('get'),
    post: requester('post'),
    put: requester('put'),
    patch: requester('patch'),
    delete: requester('delete'),

    token(token) {
      if (token === undefined) return config.token;

      config.token = token;
      return this;
    },
  };
};