import test from 'tape';
import Encephalon from '../lib';
import nanoid from 'nanoid';
import config from './config.json';
import get from 'lodash/get';
import { delay } from '../lib/helpers';

test('cache: get/set', async assert => {
  assert.plan(2);
  
  const encephalon = Encephalon({
    ...config,
    ttl: 1000,
  });

  await encephalon.get(`/experiences`);
  assert.is(encephalon.cache.length, 1, 'created a cache entry');
  
  const get = encephalon.cache.get;
  encephalon.cache.get = key => {
    const entry = get(key);
    assert.ok(entry, 'subsequent get retrieved cache entry');
    encephalon.cache.get = get;
    return entry;
  };

  await encephalon.get(`/experiences`);

  assert.end();
});

test('cache: non-get', async assert => {
  assert.plan(1);
  
  const encephalon = Encephalon({
    ...config,
    ttl: 1000,
  });

  const { data } = await encephalon
    .post(`/experiences`)
    .send({ name: nanoid() });
  assert.is(encephalon.cache.length, 0, 'posting did not create a cache entry');
  
  await encephalon.delete(`/experiences/${data.id}`);

  assert.end();
});

test('cache: encapsulation', async assert => {
  assert.plan(2);
  
  const encephalon1 = Encephalon({
    ...config,
    ttl: 1000,
  });

  await encephalon1.get(`/experiences`);
  assert.is(encephalon1.cache.length, 1, 'created a cache entry');
  
  const encephalon2 = Encephalon({
    ...config,
    ttl: 1000,
  });
  assert.is(encephalon2.cache.length, 0, 'each instance has a separate cache');

  assert.end();
});

test('cache: bust', async assert => {
  assert.plan(1);
  
  const encephalon = Encephalon(config);

  const request = encephalon.get(`/experiences`).cachebust();
  assert.ok(Number.isInteger(get(request, ['qs', '_'])), 'cache bust added to query string');
  
  assert.end();
});

test('cache: ttl', async assert => {
  assert.plan(2);
  
  const encephalon = Encephalon({
    ...config,
    ttl: 500,
  });

  await encephalon.get(`/experiences`);
  assert.is(encephalon.cache.length, 1, 'created a cache entry');
  
  const get = encephalon.cache.get;
  encephalon.cache.get = key => {
    const entry = get(key);
    assert.is(entry, undefined, 'cache entry expired');
    encephalon.cache.get = get;
    return entry;
  };
  
  await delay(1000);

  await encephalon.get(`/experiences`);

  assert.end();
});