// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');
const path = require('path');

const filesDir = path.join(__dirname, '../files'); // Path to test files

/**
 * Creates a non-image fragment from a file
 *
 * @param {string} fileName - Name of the file to upload
 * @param {string} authEmail - Authentication email
 * @param {string} authPassword - Authentication password
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<Object>} - Created fragment response
 */
const createNonImageFragmentFromFile = async (fileName, contentType) => {
  const filePath = path.join(filesDir, fileName);
  const fileData = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }).trim();
  return request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .send(fileData)
    .set('Content-Type', contentType);
};

/**
 * Creates an image fragment from a file
 *
 * @param {string} fileName - Name of the image file to upload
 * @param {string} contentType - MIME type of the image
 * @returns {Promise<Object>} - Created fragment response
 *
 * @note Uses binary buffer for image data to preserve file integrity
 */
const createImageFragmentFromFile = async (fileName, contentType) => {
  const filePath = path.join(filesDir, fileName);
  const fileData = fs.readFileSync(filePath); // Read as binary buffer
  return request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .send(fileData)
    .set('Content-Type', contentType); // Content-Type as binary for images
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
      const res = await createNonImageFragmentFromFile('file.txt', 'text/plain');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/plain',
        size: 32,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create text/plane; charset=utf-8 fragment successfully', async () => {
      const res = await createNonImageFragmentFromFile('file.txt', 'text/plain; charset=utf-8');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/plain; charset=utf-8',
        size: 32,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create HTML fragment successfully', async () => {
      const res = await createNonImageFragmentFromFile('file.html', 'text/html');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/html',
        size: 42,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create markdown fragment successfully', async () => {
      const res = await createNonImageFragmentFromFile('file.md', 'text/markdown');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/markdown',
        size: 38,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create CSV fragment successfully', async () => {
      const res = await createNonImageFragmentFromFile('file.csv', 'text/csv');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/csv',
        size: 66,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create JSON fragment successfully', async () => {
      const res = await createNonImageFragmentFromFile('file.json', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'application/json',
        size: 53,
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create YAML fragment successfully', async () => {
      const res = await createNonImageFragmentFromFile('file.yaml', 'application/yaml');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'application/yaml',
        size: expect.any(Number), // Adjust the size based on your YAML file size
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create PNG image fragment successfully', async () => {
      const res = await createImageFragmentFromFile('file.png', 'image/png');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'image/png',
        size: expect.any(Number), // Adjust the size based on your PNG file size
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create JPEG image fragment successfully', async () => {
      const res = await createImageFragmentFromFile('file.jpg', 'image/jpeg');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'image/jpeg',
        size: expect.any(Number), // Adjust the size based on your JPEG file size
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create WebP image fragment successfully', async () => {
      const res = await createImageFragmentFromFile('file.webp', 'image/webp');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'image/webp',
        size: expect.any(Number), // Adjust the size based on your WebP file size
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create AVIF image fragment successfully', async () => {
      const res = await createImageFragmentFromFile('file.avif', 'image/avif');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'image/avif',
        size: expect.any(Number), // Adjust the size based on your AVIF file size
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    test('Authenticated users can create GIF image fragment successfully', async () => {
      const res = await createImageFragmentFromFile('file.gif', 'image/gif');
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');

      const fragment = res.body.fragment;
      expect(fragment).toBeDefined();

      expect(fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'image/gif',
        size: expect.any(Number), // Adjust the size based on your GIF file size
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
          message: 'Invalid Content-Type of request',
        },
      });
    });

    test('Should throw 415 error when the Content-Type header is set as JSON but a text file is passed instead', async () => {
      const res = await createNonImageFragmentFromFile('file.txt', 'application/json');

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
