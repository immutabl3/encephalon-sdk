import test from 'tape';
import Encephalon from '../lib';
import config from './config.json';
import nanoid from 'nanoid';
import isPlainObject from 'lodash/isPlainObject';
import isMongoId from 'validator/lib/isMongoId';

const encephalon = Encephalon(config);

test('request: error', async assert => {
  assert.plan(4);

  try {
    await encephalon.get(`/doesnotexist`);
  } catch (err) {
    assert.ok(err, 'getting invalid endpoint throws an error');
    assert.is(err.status, 404, 'missing enpoint gives not found status');
    assert.ok(isPlainObject(err.data), 'error object has a payload');
    assert.ok(isPlainObject(err.headers), 'error headers still exists (for consistency)');
  }

  assert.end();
});

test('request: get', async assert => {
  assert.plan(9);

  const {
    data: list,
    status: listStatus,
  } = await encephalon.get('/experiences');

  assert.is(listStatus, 200, 'getting a page gave a 200 status');
  assert.ok(Array.isArray(list), 'a list was returned');
  assert.ok(list.length, 'the list has entries');

  const [targetExperience] = list;
  assert.ok(isMongoId(`${targetExperience.id}`), 'the target experience is an API object');
  assert.ok(Number.isInteger(targetExperience.sessionTimeout), 'the target experience is an experience');

  const {
    data: resultBySlug,
    status: slugStatus,
  } = await encephalon.get(`/experiences/slug/${targetExperience.slug}`);

  assert.is(slugStatus, 200, 'getting experience by slug gave a 200 status');
  assert.is(resultBySlug.id, targetExperience.id, 'retrieved matching result with slug');

  const {
    data: resultById,
    status: idStatus,
  } = await encephalon.get(`/experiences/${targetExperience.id}`);
  
  assert.is(idStatus, 200, 'getting experience by id gave a 200 status');
  assert.is(resultById.id, targetExperience.id, 'retrieved matching result with id');

  assert.end();
});

test('request: get: all', async assert => {
  assert.plan(8);

  const { status, data } = await encephalon
    .all('/experiences')
    .perPage(1);

  assert.is(status, 200, 'request gave a 200 status');
  assert.ok(Array.isArray(data), 'a list was returned');
  assert.ok(data.length, 'the list has entries');
  assert.ok(data.length > 1, 'the all method made multiple requests');
  
  const allHaveIds = data.every(({ id }) => isMongoId(`${id}`));
  assert.ok(allHaveIds, 'returned values are API objects');

  const allHaveSessionTimeouts = data.every(({ sessionTimeout }) => Number.isInteger(sessionTimeout));
  assert.ok(allHaveSessionTimeouts, 'returned objects are experiences');

  try {
    await encephalon.all('/doesntexist');
  } catch (err) {
    assert.is(err.status, 404, 'recieved a 404 for missing endpoint');
    assert.ok(isPlainObject(err.data), 'data is the error payload');
  }

  assert.end();
});

test('request: post', async assert => {
  assert.plan(8);

  const name = nanoid();
  const {
    data,
    status: postStatus,
  } = await encephalon
    .post('/experiences')
    .send({ name });

  assert.is(postStatus, 201, 'post gave a created status');
  assert.ok(isPlainObject(data), 'a result was returned');
  assert.ok(isMongoId(`${data.id}`), 'the result is an API object');
  assert.ok(Number.isInteger(data.sessionTimeout), 'the result is an experience');
  assert.is(data.name, name, 'the payload was sent');

  const {
    status: getStatus,
    data: getResult,
  } = await encephalon.get(`/experiences/${data.id}`);
  assert.is(getStatus, 200, 'getting the posted experience gave a 200 status');
  assert.is(data.id, getResult.id, 'matching result was retrieved');

  const {
    status: deleteStatus,
  } = await encephalon.delete(`/experiences/${data.id}`);
  assert.is(deleteStatus, 200, 'deleting gave a 200 status');

  assert.end();
});

test('request: put', async assert => {
  assert.plan(7);

  const {
    status: postStatus,
    data: postResult,
  } = await encephalon
    .post('/experiences')
    .send({ name: nanoid() });

  assert.is(postStatus, 201, 'post gave a created status');

  const sessionTimeout = postResult.sessionTimeout + 1;

  const {
    status: putStatus,
    data: putResult,
  } = await encephalon.put(`/experiences/${postResult.id}`)
    .send({ sessionTimeout });

  assert.is(putStatus, 200, 'put gave a success status');
  assert.ok(isPlainObject(putResult), 'a result was returned');
  assert.ok(isMongoId(`${putResult.id}`), 'the result is an API object');
  assert.ok(Number.isInteger(putResult.sessionTimeout), 'the result is an experience');
  assert.is(sessionTimeout, putResult.sessionTimeout, 'the experience sessionTimeout was updated');

  const {
    status: deleteStatus,
  } = await encephalon.delete(`/experiences/${postResult.id}`);
  assert.is(deleteStatus, 200, 'deleting gave a 200 status');

  assert.end();
});
/*
// TODO: patch
test.only('request: patch', async assert => {
  assert.plan(7);

  const name = nanoid();
  const {
    status: postStatus,
    data: postResult,
  } = await encephalon.post('/experiences')
    .send({ name });

  assert.is(postStatus, 201, 'post gave a created status');

  const sessionTimeout = postResult.sessionTimeout + 1;

  const {
    status: patchStatus,
    data: patchResult,
  } = await encephalon.patch(`/experiences/${postResult.id}`)
    .send({ sessionTimeout });

  assert.is(patchStatus, 200, 'patch gave a 200 status');
  assert.ok(isPlainObject(patchResult), 'a result was returned');
  assert.ok(isMongoId(`${patchResult.id}`), 'the result is an API object');
  assert.ok(Number.isInteger(patchResult.sessionTimeout), 'the result is an experience');
  assert.is(sessionTimeout, patchResult.sessionTimeout, 'the experience sessionTimeout was updated');

  const {
    status: deleteStatus,
  } = await encephalon.delete(`/experiences/${postResult.id}`);
  assert.is(deleteStatus, 200, 'deleting gave a 200 status');

  assert.end();
});
*/
test('request: delete', async assert => {
  assert.plan(3);

  const name = nanoid();
  const {
    data,
    status: postStatus,
  } = await encephalon.post('/experiences')
    .send({ name });

  assert.is(postStatus, 201, 'post gave a created status');

  const {
    status: deleteStatus,
  } = await encephalon.delete(`/experiences/${data.id}`);
  assert.is(deleteStatus, 200, 'deleting gave a 200 status');

  try {
    await encephalon.get(`/experiences/${data.id}`);
  } catch (err) {
    assert.is(err.status, 410, 'getting the posted experience gave a gone status');
  }

  assert.end();
});