// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const payload = 'This is a Fragment';
    await request(app)
      .post('/v1/fragments')
      .send(payload)
      .set('Content-Type', 'text/plain')
      .expect(401);
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', async () => {
    const payload = 'This is a Fragment';
    await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .send(payload)
      .set('Content-Type', 'text/plain')
      .expect(401);
  });

  test('authenticated users get a created fragment', async () => {
    const payload = 'This is a Fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).not.toBeUndefined();
  });

  test('trying to create a fragment of unsupported type', async () => {
    const payload = `
      <?xml version="1.0" encoding="UTF-8"?>
        <fragment>
          This is a fragment
      </fragment>`;
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'application/xml')
      .expect(415);
  });

  test('recieve a valid fragment', async () => {
    const payload = 'This is a Fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    expect(res.body.fragment?.id).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
    expect(res.body.fragment?.ownerId).toMatch(/^[a-f0-9]{64}$/i);
    expect(res.body.fragment?.type).toBe('text/plain');
    expect(Date.parse(res.body.fragment?.created)).not.toBeNaN();
    expect(Date.parse(res.body.fragment?.updated)).not.toBeNaN();
    expect(res.body.fragment?.size).toBe(payload.length);
  });

  test('location header is set', async () => {
    const payload = 'This is a Fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(payload)
      .set('Content-Type', 'text/plain');
    expect(res.headers.location).not.toBeUndefined();
  });
});
