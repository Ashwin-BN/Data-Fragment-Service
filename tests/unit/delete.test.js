// tests/unit/delete.test.js

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

describe('Fragment Deletion API - DELETE /v1/fragments/:id', () => {
  describe('Basic Deletion Tests', () => {
    test('Unauthenticated requests are denied', () =>
      request(app).delete('/v1/fragments/123').expect(401));

    test('Incorrect credentials are denied', () =>
      request(app)
        .delete('/v1/fragments/1234')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));

    test('Should return 404 when trying to delete a non-existent fragment', async () => {
      const deleteResponse = await request(app)
        .delete('/v1/fragments/nonexistentId')
        .auth('user1@email.com', 'password1');

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toEqual({
        status: 'error',
        error: {
          code: 404,
          message: "The requested fragment doesn't exist.",
        },
      });
    });
  });

  describe('Cross-Type Deletion Tests', () => {
    test.each([
      ['file.txt', 'text/plain'],
      ['file.csv', 'text/csv'],
      ['file.html', 'text/html'],
      ['file.md', 'text/markdown'],
      ['file.json', 'application/json'],
      ['file.yaml', 'application/yaml'],
    ])('Should delete fragments of different types: %s', async (fileName, contentType) => {
      // Create fragment
      const createResponse = await createFragmentFromFile(fileName, contentType);
      const fragmentId = createResponse.body.fragment?.id;

      // Delete fragment
      const deleteResponse = await request(app)
        .delete(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({
        status: 'ok',
      });

      // Verify deletion
      const getResponse = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Edge Cases', () => {
    test('Should handle malformed fragment IDs gracefully', async () => {
      const deleteResponse = await request(app)
        .delete('/v1/fragments/invalid-id-format')
        .auth('user1@email.com', 'password1');

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toEqual({
        status: 'error',
        error: {
          code: 404,
          message: "The requested fragment doesn't exist.",
        },
      });
    });

    test('Should handle empty fragment IDs', async () => {
      const deleteResponse = await request(app)
        .delete('/v1/fragments/')
        .auth('user1@email.com', 'password1');

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toEqual({
        status: 'error',
        error: {
          code: 404,
          message: 'not found',
        },
      });
    });
  });
});
