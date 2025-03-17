// tests/unit/get-by-id.test.js

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

describe('Fragment Retrieval API - GET /v1/fragments/:id', () => {
  describe('File Retrieval and Type Conversion Tests', () => {
    // Tests related to retrieving fragments by ID and converting file types.
    test('Should retrieve and return .csv file as JSON', async () => {
      const fileName = 'file.csv';
      let res = await createFragmentFromFile(fileName, 'text/csv');
      const fragmentId = res.body.fragment?.id;

      const jsonRes = await request(app)
        .get(`/v1/fragments/${fragmentId}.json`)
        .auth('user1@email.com', 'password1');

      expect(jsonRes.statusCode).toBe(200);
      expect(jsonRes.body).toEqual([
        { EmployeeID: '001', Name: 'Jack', Department: 'IT' },
        { EmployeeID: '002', Name: 'Mack', Department: 'Sales' },
        { EmployeeID: '005', Name: 'Lilly', Department: 'HR' },
      ]);
    });

    test('Should retrieve and return .html file as HTML content', async () => {
      const fileName = 'file.html';
      let res = await createFragmentFromFile(fileName, 'text/html');
      const fragmentId = res.body.fragment?.id;

      const htmlRes = await request(app)
        .get(`/v1/fragments/${fragmentId}.html`)
        .auth('user1@email.com', 'password1');

      expect(htmlRes.statusCode).toBe(200);
      expect(htmlRes.text).toContain('<h1>Hello World! This is an HTML file</h1>');
    });

    test('Should retrieve and return .json file as JSON', async () => {
      const fileName = 'file.json';
      let res = await createFragmentFromFile(fileName, 'application/json');
      const fragmentId = res.body.fragment?.id;

      const jsonRes = await request(app)
        .get(`/v1/fragments/${fragmentId}.json`)
        .auth('user1@email.com', 'password1');

      expect(jsonRes.statusCode).toBe(200);
      expect(jsonRes.body).toEqual({
        key1: 'ABC',
        key2: 'DEF',
        key3: 'XYZ',
      });
    });

    test('Should retrieve and return .md file as HTML after conversion', async () => {
      const fileName = 'file.md';
      let res = await createFragmentFromFile(fileName, 'text/markdown');
      const fragmentId = res.body.fragment?.id;

      const htmlRes = await request(app)
        .get(`/v1/fragments/${fragmentId}.html`)
        .auth('user1@email.com', 'password1');

      expect(htmlRes.statusCode).toBe(200);
      expect(htmlRes.text).toContain('<h1>Hello World! This is a markdown file</h1>');
    });

    test('Should retrieve and return .txt file as plain text', async () => {
      const payload = 'Hello World! This is a text file';
      let res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send(payload)
        .set('Content-Type', 'text/plain');

      const txtRes = await request(app)
        .get(`/v1/fragments/${res.body.fragment?.id}.txt`)
        .auth('user1@email.com', 'password1');

      expect(txtRes.statusCode).toBe(200);
      expect(txtRes.text.trim()).toBe(payload);
    });

    test('Should return 415 when trying to convert unsupported file types', async () => {
      const fileName = 'file.html';
      let res = await createFragmentFromFile(fileName, 'text/html');
      const fragmentId = res.body.fragment?.id;

      // Attempt to convert .html file to JSON (unsupported)
      await request(app)
        .get(`/v1/fragments/${fragmentId}.json`)
        .auth('user1@email.com', 'password1')
        .expect(415);
    });

    test('Should return 415 when trying to convert text/plain file to CSV', async () => {
      const fileName = 'file.txt';
      let res = await createFragmentFromFile(fileName, 'text/plain');
      const fragmentId = res.body.fragment?.id;

      // Attempt to convert .txt file to CSV (unsupported)
      await request(app)
        .get(`/v1/fragments/${fragmentId}.csv`)
        .auth('user1@email.com', 'password1')
        .expect(415);
    });

    test('Should return 404 when requesting a non-existent fragment', async () => {
      await request(app)
        .get('/v1/fragments/nonexistentId')
        .auth('user1@email.com', 'password1')
        .expect(404);
    });
  });

  describe('Large File Handling', () => {
    test('Should handle large payloads for file uploads and retrieval', async () => {
      const largeContent = 'A'.repeat(10000); // Large payload (10KB)
      let res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send(largeContent)
        .set('Content-Type', 'text/plain');

      const fragmentId = res.body.fragment?.id;

      const largeRes = await request(app)
        .get(`/v1/fragments/${fragmentId}.txt`)
        .auth('user1@email.com', 'password1');

      expect(largeRes.statusCode).toBe(200);
      expect(largeRes.text).toBe(largeContent);
    });
  });
});

const checkFragmentMetadata = (response, type) => {
  expect(response.status).toBe(201);
  expect(response.body.status).toBe('ok');
  return request(app)
    .get(`/v1/fragments/${response.body.fragment.id}/info`)
    .auth('user1@email.com', 'password1')
    .then((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type,
        size: expect.any(Number),
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });
};
describe('GET /v1/fragments/:id/info', () => {
  test.each([
    ['file.txt', 'text/plain'],
    ['file.csv', 'text/csv'],
    ['file.html', 'text/html'],
    ['file.json', 'application/json'],
    ['file.md', 'text/markdown'],
  ])('Fragment metadata for %s is returned', async (fileName, contentType) => {
    const createResponse = await createFragmentFromFile(fileName, contentType);
    await checkFragmentMetadata(createResponse, contentType);
  });

  test('An error response is displayed if an invalid fragment ID is passed', async () => {
    const createResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Fragment 1');

    expect(createResponse.status).toBe(201);

    const readResponse = await request(app)
      .get(`/v1/fragments/${createResponse.body.fragment.id}invalid/info`)
      .auth('user1@email.com', 'password1');

    expect(readResponse.statusCode).toBe(404);
    expect(readResponse.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: "The requested fragment doesn't exist.",
      },
    });
  });

  test('Should retrieve and return .md file as HTML after conversion', async () => {
    const fileName = 'file.md';
    let res = await createFragmentFromFile(fileName, 'text/markdown');
    const fragmentId = res.body.fragment?.id;

    const htmlRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@email.com', 'password1');

    expect(htmlRes.statusCode).toBe(200);
    expect(htmlRes.text).toContain('<h1>Hello World! This is a markdown file</h1>');
  });
});
