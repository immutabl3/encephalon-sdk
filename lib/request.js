/* eslint-disable no-underscore-dangle */
import Error from './Error';
import superagent from 'superagent';
import {
  createKey,
} from './cache';
import {
  shouldTryAgain,
} from './helpers';

const cachebust = function() {
  this.query({ _: Date.now() });
  return this;
};

const page = function(num) {
  if (!Number.isInteger(num)) throw new Error(`expected page to be an integer, recieved "${num}"`);
  this.query({ page: num });
  return this;
};

const perPage = function(num) {
  if (!Number.isInteger(num)) throw new Error(`expected perPage to be an integer, recieved "${num}"`);
  this.query({ per_page: num });
  return this;
};

const then = async function(resolve, reject) {
  this.then = this._then;
  
  const url = this._url;
  const throttle = this._throttle;
  const cache = this._cache;
  const isGet = this.method === 'GET';
  const isBust = !!this.qs._;

  if (!isBust && isGet) {
    const cached = cache.get(createKey(url, this.qs));
    if (cached) return cached;
  }

  try {
    const res = await throttle(() => this);
  
    const envelope = {
      res,
      headers: res.headers,
      status: res.status,
      data: res.body,
    };
  
    isGet && cache.set(createKey(url, this.qs), envelope);

    return Promise.resolve(envelope).then(resolve, reject);
  } catch (err) {
    return Promise.reject({
      res: err.response,
      status: err.status,
      headers: err.response.headers,
      data: err.response.body,
    }).then(resolve, reject);
  }
};

export default function request(method, url, config) {
  const {
    throttle,
    cache,
    maxRetries,
    timeout,
    token,
  } = config;

  if (!token) throw new Error('a token is required');

  const req = superagent[method](url)
    .set('auth', token)
    .type('json')
    .retry(maxRetries, shouldTryAgain)
    .timeout({ response: timeout });

  req._url = url;
  req._throttle = throttle;
  req._cache = cache;
  req._then = req.then;
  req._config = config;

  req.cachebust = cachebust;
  req.page = page;
  req.perPage = perPage;
  req.then = then;

  return req;
};