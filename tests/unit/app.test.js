const request = require('supertest');
const app = require('../../src/app');

describe('404 handler', () => {
  test("Should return a 404 error as the page doesn't exist", async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toBe(404);
  });
});