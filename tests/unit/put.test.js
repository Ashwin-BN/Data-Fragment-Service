const fs = require('fs');
const path = require('path');
const request = require('supertest');
const yaml = require('js-yaml');
const app = require('../../src/app');

const createFragment = async (content, contentType) => {
  const response = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .set('Content-Type', contentType)
    .send(content);

  expect(response.status).toBe(201);
  return response;
};

const updateFragment = async (id, content, contentType) => {
  const response = await request(app)
    .put(`/v1/fragments/${id}`)
    .auth('user1@email.com', 'password1')
    .set('Content-Type', contentType)
    .send(content);

  return response;
};

// === Tests ===

describe('PUT /v1/fragments/:id', () => {
  // === Auth Tests ===
  test('denies unauthenticated requests', async () => {
    await request(app).put('/v1/fragments/any-id').send('data').expect(401);
  });

  test('denies requests with incorrect credentials', async () => {
    await request(app)
      .put('/v1/fragments/any-id')
      .auth('wrong@email.com', 'wrongpass')
      .send('data')
      .expect(401);
  });

  // === Valid Updates ===
  test('updates a text fragment', async () => {
    const initialContent = 'Hello World';
    const updatedContent = 'Updated Text';

    const createResponse = await createFragment(initialContent, 'text/plain');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(id, updatedContent, 'text/plain');

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.fragment.size).toBe(updatedContent.length);
    expect(updateResponse.body.fragment.type).toBe('text/plain');
  });

  test('updates a JSON fragment', async () => {
    const initialJson = { msg: 'hi' };
    const updatedJson = { msg: 'bye' };

    const createResponse = await createFragment(JSON.stringify(initialJson), 'application/json');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(
      id,
      JSON.stringify(updatedJson),
      'application/json'
    );

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.fragment.size).toBe(JSON.stringify(updatedJson).length);
    expect(updateResponse.body.fragment.type).toBe('application/json');
  });

  test('updates a YAML fragment', async () => {
    const initialYaml = yaml.dump({ a: 1 });
    const updatedYaml = yaml.dump({ a: 2 });

    const createResponse = await createFragment(initialYaml, 'application/yaml');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(id, updatedYaml, 'application/yaml');

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.fragment.size).toBe(updatedYaml.length);
    expect(updateResponse.body.fragment.type).toBe('application/yaml');
  });

  test('updates an HTML fragment', async () => {
    const initialHtml = '<h1>Original</h1>';
    const updatedHtml = '<h1>Updated</h1>';

    const createResponse = await createFragment(initialHtml, 'text/html');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(id, updatedHtml, 'text/html');

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.fragment.size).toBe(updatedHtml.length);
    expect(updateResponse.body.fragment.type).toBe('text/html');
  });

  test('updates an image fragment', async () => {
    const filePath = path.join(__dirname, '..', 'files', 'file.png');
    const fileContent = fs.readFileSync(filePath);

    const createResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(fileContent);

    expect(createResponse.status).toBe(201);

    const newImagePath = path.join(__dirname, '..', 'files', 'file2.png');
    const newImageContent = fs.readFileSync(newImagePath);

    const updateResponse = await request(app)
      .put(`/v1/fragments/${createResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(newImageContent);

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.status).toBe('ok');

    const fragment = updateResponse.body.fragment;
    expect(fragment).toBeDefined();
    expect(fragment).toEqual({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      ownerId: expect.stringMatching(/^[0-9a-f]{64}$/),
      type: 'image/png',
      size: newImageContent.length,
      created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    });
  });

  // === Error Cases ===
  test('returns 400 for empty body', async () => {
    const createResponse = await createFragment('Some data', 'text/plain');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(id, undefined, 'text/plain');

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: 'Empty request body received',
      },
    });
  });

  test('returns 404 for non-existent fragment', async () => {
    const updateResponse = await updateFragment('non-existent-id', 'Test', 'text/plain');

    expect(updateResponse.status).toBe(404);
    expect(updateResponse.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'Request fragment does not exist',
      },
    });
  });

  test('returns 400 for mismatched content type', async () => {
    const createResponse = await createFragment('Text here', 'text/plain');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(
      id,
      JSON.stringify({ wrong: true }),
      'application/json'
    );

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: 'Content type mismatch detected',
      },
    });
  });

  test('returns 400 when trying to change type', async () => {
    const createResponse = await createFragment('Initial', 'text/plain');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(id, '<p>Wrong type</p>', 'text/html');

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body).toEqual({
      status: 'error',
      error: {
        code: 400,
        message: 'Content type mismatch detected',
      },
    });
  });

  test('returns 415 when invalid content is sent for declared type', async () => {
    const createResponse = await createFragment('Plain', 'text/plain');
    const id = createResponse.body.fragment.id;

    const updateResponse = await updateFragment(id, '{not: "valid"', 'application/json');

    expect(updateResponse.status).toBe(415);
    expect(updateResponse.body).toEqual({
      status: 'error',
      error: {
        code: 415,
        message:
          "Fragment validation failed Invalid JSON data: Expected property name or '}' in JSON at position 1 (line 1 column 2)",
      },
    });
  });
});
