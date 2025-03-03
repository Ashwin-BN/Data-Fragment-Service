// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');
const path = require('path');

const filesDir = path.join(__dirname, '../files'); // Path to test files

/**
 * Helper function to create a fragment from a file
 * @param {string} fileName - The name of the file to be uploaded
 * @param {string} authEmail - The email for authentication
 * @param {string} authPassword - The password for authentication
 * @param {string} contentType - The content type of the file
 * @returns {Promise<Object>} - The fragment created from the file
 */
const createFragmentFromFile = async (fileName, contentType) => {
  const filePath = path.join(filesDir, fileName);
  const fileData = fs.readFileSync(filePath, 'utf8');
  return request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .send(fileData)
    .set('Content-Type', contentType);
};

// Test suite for the /v1/fragments endpoint
// Ensures proper fragment creation, authentication handling, and validation
describe('POST /v1/fragments', () => {
  /**
   * Authentication Tests
   */
  describe('User Authentication ', () => {
    test('Unauthenticated requests are denied', () =>
      request(app).post('/v1/fragments').expect(401));

    test('Incorrect credentials are denied', () =>
      request(app)
        .post('/v1/fragments')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));
  });

  /**
   * Fragment Creation Tests
   */
  describe('Authenticated User can Create Fragments ', () => {
    test('Authenticated users can create text/plane fragment successfully', async () => {
      const res = await createFragmentFromFile('file.txt', 'text/plain');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/plain',
        size: 34,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create text/plane; charset=utf-8 fragment successfully', async () => {
      const res = await createFragmentFromFile('file.txt', 'text/plain; charset=utf-8');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/plain; charset=utf-8',
        size: 34,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create HTML fragment successfully', async () => {
      const res = await createFragmentFromFile('file.html', 'text/html');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/html',
        size: 44,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create markdown fragment successfully', async () => {
      const res = await createFragmentFromFile('file.md', 'text/markdown');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/markdown',
        size: 40,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create CSV fragment successfully', async () => {
      const res = await createFragmentFromFile('file.csv', 'text/csv');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/csv',
        size: 71,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create JSON fragment successfully', async () => {
      const res = await createFragmentFromFile('file.json', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'application/json',
        size: 59,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Error Handling ', () => {
    test('Should throw 400 error when request body is empty', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('');

      expect(res.status).toBe(400);

      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: 400,
          message: 'Fragment cannot be null',
        },
      });
    });

    test('Should throw 400 error when request does not have a body', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain');

      expect(res.status).toBe(400);

      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: 400,
          message: 'Fragment cannot be null',
        },
      });
    });

    test('Should throw 415 error when Content-Type header is not provided in the request', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send('Hello World');

      expect(res.status).toBe(415);

      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: 415,
          message: 'invalid content-type of request',
        },
      });
    });

    test('Should throw 415 error when the Content-Type header is set as JSON but a text file is passed instead', async () => {
      const res = await createFragmentFromFile('file.txt', 'application/json');

      expect(res.status).toBe(415);

      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: 415,
          message: expect.stringContaining('Unsupported Content-Type. Invalid JSON data'),
        },
      });
    });

    test('Should get 500 status code from the server if an invalid Content-Type is passed', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'numbers')
        .send('This is a fragment');

      expect(res.status).toBe(500);

      expect(res.body).toEqual({
        status: 'error',
        error: {
          code: 500,
          message: 'invalid media type',
        },
      });
    });
  });
});
