// tests/unit/delete.test.js

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
  const fileData = fs.readFileSync(filePath, 'utf8');
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

/**
 * Test suite for Fragment Deletion API
 *
 * This suite tests the DELETE /v1/fragments/:id endpoint
 * covering authentication, deletion scenarios, and edge cases
 */
describe('Fragment Deletion API - DELETE /v1/fragments/:id', () => {
  /**
   * Tests basic deletion scenarios including authentication
   */
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

  /**
   * Tests deletion across different content types
   *
   * Ensures consistent behavior for all supported formats
   */
  describe('Cross-Type Deletion Tests', () => {
    test.each([
      ['file.txt', 'text/plain'],
      ['file.csv', 'text/csv'],
      ['file.html', 'text/html'],
      ['file.md', 'text/markdown'],
      ['file.json', 'application/json'],
      ['file.yaml', 'application/yaml'],
      ['file.png', 'image/png'],
      ['file.jpg', 'image/jpeg'],
      ['file.jpeg', 'image/jpeg'],
      ['file.webp', 'image/webp'],
      ['file.avif', 'image/avif'],
      ['file.gif', 'image/gif'],
    ])('Should delete fragments of different types: %s', async (fileName, contentType) => {
      // Create fragment
      const createResponse = contentType.startsWith('image')
        ? await createImageFragmentFromFile(fileName, contentType)
        : await createNonImageFragmentFromFile(fileName, contentType);

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

    test('Authenticated users are able to delete a YAML fragment', async () => {
      const filePath = path.join(__dirname, '..', 'files', 'file.yaml');
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const createResponse = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/yaml')
        .send(fileContent);

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app)
        .delete(`/v1/fragments/${createResponse.body.fragment.id}`)
        .auth('user1@email.com', 'password1');

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body).toEqual({
        status: 'ok',
      });
    });
  });

  /**
   * Tests edge cases and error scenarios
   *
   * Ensures robust error handling for unusual inputs
   */
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
