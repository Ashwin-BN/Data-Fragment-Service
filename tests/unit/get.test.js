// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const fs = require('fs');

// Helper function to create fragments from files
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

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('should deny unauthenticated requests', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('should deny access with incorrect credentials', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('should return a fragments array for authenticated users', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
  // Test for empty fragments list
  test('should return an empty array when no fragments exist for the user', async () => {
    const res = await request(app).get('/v1/fragments').auth('user2@email.com', 'password2');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([]);
  });

  test('should return expanded fragments when expand query parameter is set to 1', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('Authenticated users get an array of fragment metadata objects when the expand query is passed', async () => {
    // Create two fragments using the helper function
    const createResponse1 = await createFragmentFromFile('file.txt', 'text/plain');
    expect(createResponse1.status).toBe(201);

    const createResponse2 = await createFragmentFromFile('file2.txt', 'text/plain');
    expect(createResponse2.status).toBe(201);

    const readResponse = await request(app)
      .get('/v1/fragments/?expand=1')
      .auth('user1@email.com', 'password1');

    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.body.status).toBe('ok');
    expect(Array.isArray(readResponse.body.fragments)).toBe(true);

    expect(readResponse.body.fragments).toBeInstanceOf(Array);
    readResponse.body.fragments.forEach((item) => {
      expect(item).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
        type: 'text/plain',
        size: expect.any(Number),
        created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });
  });

  test('An array of string fragment IDs is returned even if an invalid query is passed', async () => {
    // Create a fragment using the helper function
    const createResponse = await createFragmentFromFile('file.txt', 'text/plain');
    expect(createResponse.status).toBe(201);

    const readResponse = await request(app)
      .get('/v1/fragments/?testing=1')
      .auth('user1@email.com', 'password1');

    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.body.status).toBe('ok');
    expect(Array.isArray(readResponse.body.fragments)).toBe(true);

    expect(readResponse.body.fragments).toBeInstanceOf(Array);
    readResponse.body.fragments.forEach((item) => {
      expect(item).toEqual(
        expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      );
    });
  });

  test('Should throw a 415 error the ID of a CSV fragment is passed and a .png extension is passed.', async () => {
    // Create a CSV fragment using the helper function
    const createResponse = await createFragmentFromFile('file.csv', 'text/csv');
    expect(createResponse.status).toBe(201);

    // Reading the data from the database
    const readResponse = await request(app)
      .get(`/v1/fragments/${createResponse.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');

    expect(readResponse.statusCode).toBe(415);
    expect(readResponse.body).toEqual({
      status: 'error',
      error: {
        code: 415,
        message:
          'Type conversion not possible. text/csv can only be converted into text/csv,text/plain,application/json.',
      },
    });
  });
});
