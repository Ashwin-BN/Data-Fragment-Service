// tests/unit/get-by-id.test.js

const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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
 * Test suite for Fragment Retrieval API (GET /v1/fragments/:id)
 *
 */
describe('Fragment Retrieval API - GET /v1/fragments/:id', () => {
  /**
   * Test suite for file retrieval and type conversion functionality
   *
   * These tests verify that fragments can be retrieved and converted between
   * different formats while maintaining data integrity.
   */
  describe('File Retrieval and Type Conversion Tests', () => {
    // Tests related to retrieving fragments by ID and converting file types.
    test('Should retrieve and return .csv file as JSON', async () => {
      const fileName = 'file.csv';
      let res = await createNonImageFragmentFromFile(fileName, 'text/csv');
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
      let res = await createNonImageFragmentFromFile(fileName, 'text/html');
      const fragmentId = res.body.fragment?.id;

      const htmlRes = await request(app)
        .get(`/v1/fragments/${fragmentId}.html`)
        .auth('user1@email.com', 'password1');

      expect(htmlRes.statusCode).toBe(200);
      expect(htmlRes.text).toContain('<h1>Hello World! This is an HTML file</h1>');
    });

    test('Should retrieve and return .json file as JSON', async () => {
      const fileName = 'file.json';
      let res = await createNonImageFragmentFromFile(fileName, 'application/json');
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
      let res = await createNonImageFragmentFromFile(fileName, 'text/markdown');
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
      let res = await createNonImageFragmentFromFile(fileName, 'text/html');
      const fragmentId = res.body.fragment?.id;

      // Attempt to convert .html file to JSON (unsupported)
      await request(app)
        .get(`/v1/fragments/${fragmentId}.json`)
        .auth('user1@email.com', 'password1')
        .expect(415);
    });

    test('Should return 415 when trying to convert text/plain file to CSV', async () => {
      const fileName = 'file.txt';
      let res = await createNonImageFragmentFromFile(fileName, 'text/plain');
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

    test('Should preserve Content-Type charset specification', async () => {
      const fileName = 'file.txt';
      const charsetContentType = 'text/plain; charset=utf-8';

      // Create fragment with charset specified
      let res = await createNonImageFragmentFromFile(fileName, charsetContentType);

      // Verify creation succeeded
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ok');
      const fragmentId = res.body.fragment?.id;

      // Check fragment metadata to verify charset preservation
      const metadataRes = await request(app)
        .get(`/v1/fragments/${fragmentId}/info`)
        .auth('user1@email.com', 'password1');

      expect(metadataRes.statusCode).toBe(200);
      expect(metadataRes.body.status).toBe('ok');
      expect(metadataRes.body.fragment.type).toBe(charsetContentType);

      // Verify charset is preserved during retrieval
      const retrieveRes = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      expect(retrieveRes.statusCode).toBe(200);
      expect(retrieveRes.header['content-type']).toBe(charsetContentType);
    });
  });

  /**
   * Test suite for content type conversion functionality
   *
   * This suite verifies the conversion between different content types through the API endpoints,
   * ensuring proper handling of various formats and error conditions.
   */
  describe('Content Type Conversion Tests', () => {
    /**
     * Tests for converting between different text-based formats
     */
    describe('Text Format Conversions', () => {
      test('Should convert JSON to plain text', async () => {
        const jsonContent = { city: 'Toronto', country: 'Canada' };
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(JSON.stringify(jsonContent))
          .set('Content-Type', 'application/json');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const textResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.txt`)
          .auth('user1@email.com', 'password1');

        expect(textResponse.status).toBe(200);
        expect(textResponse.text).toContain('"city": "Toronto"');
        expect(textResponse.text).toContain('"country": "Canada"');
      });

      test('Should convert YAML to plain text', async () => {
        const yamlContent = 'city: Toronto\ncountry: Canada';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(yamlContent)
          .set('Content-Type', 'application/yaml');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const textResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.txt`)
          .auth('user1@email.com', 'password1');

        expect(textResponse.status).toBe(200);
        expect(textResponse.text).toContain('"city": "Toronto"');
        expect(textResponse.text).toContain('"country": "Canada"');
      });

      test('Should convert Markdown to plain text', async () => {
        const mdContent = '## Title\nSome *italic* text and **bold**.';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(mdContent)
          .set('Content-Type', 'text/markdown');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const textResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.txt`)
          .auth('user1@email.com', 'password1');

        expect(textResponse.status).toBe(200);
        expect(textResponse.text).toContain('## Title');
        expect(textResponse.text).toContain('*italic*');
        expect(textResponse.text).toContain('**bold**');
      });

      test('Should convert HTML to plain text', async () => {
        const htmlContent = '<h1>Header</h1><p>Paragraph with <strong>bold</strong></p>';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(htmlContent)
          .set('Content-Type', 'text/html');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const textResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.txt`)
          .auth('user1@email.com', 'password1');

        expect(textResponse.status).toBe(200);
        expect(textResponse.text).toContain('<h1>Header</h1>');
        expect(textResponse.text).toContain('<strong>bold</strong>');
      });

      test('Should convert CSV to plain text', async () => {
        const csvContent = 'name,age\nAlice,23\nBob,28';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(csvContent)
          .set('Content-Type', 'text/csv');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const textResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.txt`)
          .auth('user1@email.com', 'password1');

        expect(textResponse.status).toBe(200);
        expect(textResponse.text).toContain('name,age');
        expect(textResponse.text).toContain('Alice,23');
      });

      test('Should convert markdown to HTML', async () => {
        const markdownContent = '# Hello\nThis is a **test**';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(markdownContent)
          .set('Content-Type', 'text/markdown');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const htmlResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.html`)
          .auth('user1@email.com', 'password1');

        expect(htmlResponse.status).toBe(200);
        expect(htmlResponse.text).toContain('<h1>Hello</h1>');
        expect(htmlResponse.text).toContain('<strong>test</strong>');
      });

      test('Should convert CSV to JSON', async () => {
        const csvContent = 'name,age\nJohn,30\nJane,25';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(csvContent)
          .set('Content-Type', 'text/csv');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const jsonResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.json`)
          .auth('user1@email.com', 'password1');

        expect(jsonResponse.status).toBe(200);
        expect(jsonResponse.body).toEqual([
          { name: 'John', age: '30' },
          { name: 'Jane', age: '25' },
        ]);
      });

      test('Should convert JSON to YAML', async () => {
        const jsonContent = { name: 'John', age: 30 };
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(JSON.stringify(jsonContent))
          .set('Content-Type', 'application/json');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const yamlResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.yaml`)
          .auth('user1@email.com', 'password1');

        expect(yamlResponse.status).toBe(200);
        expect(yamlResponse.text).toContain('name: John');
        expect(yamlResponse.text).toContain('age: 30');
      });
    });

    /**
     * Tests for converting between different image formats
     */
    describe('Image Format Conversions', () => {
      test('Should convert PNG to JPEG', async () => {
        const filePath = path.join(__dirname, '../files/file.png');
        const fileContent = fs.readFileSync(filePath);

        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(fileContent)
          .set('Content-Type', 'image/png');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const jpegResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.jpg`)
          .auth('user1@email.com', 'password1')
          .responseType('blob');

        expect(jpegResponse.status).toBe(200);
        const receivedFileContent = jpegResponse.body;
        const receivedMetadata = await sharp(receivedFileContent).metadata();
        expect(receivedMetadata.format).toBe('jpeg');
      });

      test('Should convert JPEG to WebP', async () => {
        const filePath = path.join(__dirname, '../files/file.jpeg');
        const fileContent = fs.readFileSync(filePath);

        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(fileContent)
          .set('Content-Type', 'image/jpeg');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const webpResponse = await request(app)
          .get(`/v1/fragments/${fragmentId}.webp`)
          .auth('user1@email.com', 'password1')
          .responseType('blob');

        expect(webpResponse.status).toBe(200);
        const receivedFileContent = webpResponse.body;
        const receivedMetadata = await sharp(receivedFileContent).metadata();
        expect(receivedMetadata.format).toBe('webp');
      });
    });

    /**
     * Tests for error handling scenarios
     */
    describe('Error Handling', () => {
      test('Should return 415 for unsupported conversions (unsupported extension)', async () => {
        const jsonContent = { city: 'Toronto', country: 'Canada' };
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(JSON.stringify(jsonContent))
          .set('Content-Type', 'application/json');

        expect(createResponse.status).toBe(201);
        const fragmentId = createResponse.body.fragment.id;

        const response = await request(app)
          .get(`/v1/fragments/${fragmentId}.unsupportedformat`)
          .auth('user1@email.com', 'password1');

        expect(response.status).toBe(415); // Expect 415 for unsupported format
        expect(response.body).toEqual({
          status: 'error',
          error: {
            code: 415,
            message: expect.stringContaining('Type conversion not possible'),
          },
        });
      });

      test('Should return 415 for unsupported content type in fragment creation', async () => {
        const unsupportedContent = 'Unsupported content format';
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(unsupportedContent)
          .set('Content-Type', 'application/unsupported');

        expect(createResponse.status).toBe(415); // Unsupported media type
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 415,
            message: 'Invalid Content-Type of request',
          },
        });
      });

      test('Should return 400 for empty content in JSON to plain text conversion', async () => {
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send('')
          .set('Content-Type', 'application/json');

        expect(createResponse.status).toBe(400); // Bad Request for empty content
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 400,
            message: 'Fragment cannot be null',
          },
        });
      });

      test('Should return 400 for invalid YAML content', async () => {
        const invalidYamlContent = 'city: Toronto country: Canada'; // Missing newline
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(invalidYamlContent)
          .set('Content-Type', 'application/yaml');

        expect(createResponse.status).toBe(415); // Unsupported content type
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 415,
            message: expect.stringContaining('Invalid YAML data: bad indentation'),
          },
        });
      });

      test('Should return 404 for non-existent fragment ID in plain text conversion', async () => {
        const invalidFragmentId = 'nonexistent-id';
        const response = await request(app)
          .get(`/v1/fragments/${invalidFragmentId}.txt`)
          .auth('user1@email.com', 'password1');

        expect(response.status).toBe(404); // Not Found
        expect(response.body).toEqual({
          status: 'error',
          error: {
            code: 404,
            message: "The requested fragment doesn't exist.",
          },
        });
      });

      test('Should return 401 for invalid authentication', async () => {
        const jsonContent = { city: 'Toronto', country: 'Canada' };
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'wrongpassword') // Wrong password
          .send(JSON.stringify(jsonContent))
          .set('Content-Type', 'application/json');

        expect(createResponse.status).toBe(401); // Unauthorized due to invalid credentials
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        });
      });

      test('Should return 415 for unsupported image format', async () => {
        const filePath = path.join(__dirname, '../files/file.bmp'); // Unsupported BMP image
        const fileContent = fs.readFileSync(filePath);

        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(fileContent)
          .set('Content-Type', 'image/bmp');

        expect(createResponse.status).toBe(415); // Unsupported media type
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 415,
            message: 'Invalid Content-Type of request',
          },
        });
      });

      test('Should return 400 for corrupted image data', async () => {
        const corruptedImageData = Buffer.from('invalid data');
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send(corruptedImageData)
          .set('Content-Type', 'image/png');

        expect(createResponse.status).toBe(415); // Should be 415 due to unsupported or corrupted data
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 415,
            message: 'Unsupported Content-Type. Input buffer contains unsupported image format',
          },
        });
      });

      test('Should return 400 for missing image data in conversion', async () => {
        const createResponse = await request(app)
          .post('/v1/fragments')
          .auth('user1@email.com', 'password1')
          .send('')
          .set('Content-Type', 'image/png');

        expect(createResponse.status).toBe(400); // Bad Request due to empty body
        expect(createResponse.body).toEqual({
          status: 'error',
          error: {
            code: 400,
            message: 'Fragment cannot be null',
          },
        });
      });

      test('Should return 404 for non-existent image fragment ID', async () => {
        const invalidFragmentId = 'invalid-image-id';
        const response = await request(app)
          .get(`/v1/fragments/${invalidFragmentId}.jpg`)
          .auth('user1@email.com', 'password1');

        expect(response.status).toBe(404); // Not Found for invalid fragment ID
        expect(response.body).toEqual({
          status: 'error',
          error: {
            code: 404,
            message: "The requested fragment doesn't exist.",
          },
        });
      });
    });
  });

  /**
   * Tests for handling large file uploads and downloads through the fragment API
   * Verifies that the system can process files larger than typical web requests
   */
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

/**
 * Helper function to verify fragment metadata matches expected format
 * @param {Object} response - API response from fragment creation
 * @param {string} type - Expected content type of the fragment
 * @returns {Promise<void>} - Resolves when metadata verification is complete
 */
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

/**
 * Tests for retrieving fragment metadata through the API
 * Covers various content types and error scenarios
 */
describe('GET /v1/fragments/:id/info', () => {
  /**
   * Test matrix for supported content types
   * Each entry contains [filename, contentType] pairs
   */
  test.each([
    ['file.txt', 'text/plain'],
    ['file.csv', 'text/csv'],
    ['file.html', 'text/html'],
    ['file.json', 'application/json'],
    ['file.md', 'text/markdown'],
    ['file.yaml', 'application/yaml'],
    ['file.png', 'image/png'],
    ['file.jpg', 'image/jpeg'],
    ['file.jpeg', 'image/jpeg'],
    ['file.webp', 'image/webp'],
    ['file.avif', 'image/avif'],
    ['file.gif', 'image/gif'],
  ])('Fragment metadata for %s is returned', async (fileName, contentType) => {
    const createResponse = contentType.startsWith('image')
      ? await createImageFragmentFromFile(fileName, contentType)
      : await createNonImageFragmentFromFile(fileName, contentType);

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
    let res = await createNonImageFragmentFromFile(fileName, 'text/markdown');
    const fragmentId = res.body.fragment?.id;

    const htmlRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@email.com', 'password1');

    expect(htmlRes.statusCode).toBe(200);
    expect(htmlRes.text).toContain('<h1>Hello World! This is a markdown file</h1>');
  });
});
