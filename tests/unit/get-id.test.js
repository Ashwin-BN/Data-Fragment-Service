// tests/unit/get-by-id.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated user create a fragment and get the created fragment', async () => {
    const payload = 'This is a Fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    await request(app).get(`/v1/fragments/${res.body.fragment?.id}`).expect(401);
  });

  test('authenticated user create a fragment and get the created fragment', async () => {
    const payload = 'This is a Fragment';
    let res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    res = await request(app)
      .get(`/v1/fragments/${res.body.fragment?.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(payload);
  });

  test('authenticated user create a fragment and get the created fragment with .txt ext', async () => {
    const payload = 'This is a Fragment';
    let res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    res = await request(app)
      .get(`/v1/fragments/${res.body.fragment?.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe(payload);
  });

  test('getting a fragment with unknown id', async () => {
    await request(app)
      .get(`/v1/fragments/someFragmentId`)
      .auth('user1@email.com', 'password1')
      .expect(404);
  });

  test('getting a fragment in invalid ext type', async () => {
    const payload = 'This is a Fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    await request(app)
      .get(`/v1/fragments/${res.body.fragment?.id}.json`)
      .auth('user1@email.com', 'password1')
      .expect(415);
  });
});
