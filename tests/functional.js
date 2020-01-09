import test from 'tape';
import Encephalon from '../lib';
import config from './config.json';
import isFunction from 'lodash/isFunction';

test('token', async assert => {
  assert.plan(4);

  const encephalon = Encephalon(config);

  assert.ok(isFunction(encephalon.token), 'token function is exposed');
  assert.is(encephalon.token(), config.token, 'can get the token');
  assert.is(encephalon.token('temp'), encephalon, 'setting the token returns the instance for chaining');
  assert.is(encephalon.token(), 'temp', 'token can be changed');
  
  assert.end();
});