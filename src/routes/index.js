// src/routes/index.js

const express = require('express');

const { authenticate } = require('../auth');

// version and author from package.json
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

const { createSuccessResponse } = require('../response');
/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));
const logger = require('../logger');

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Health Check Route to see whether the server is running
  logger.info('Hitting the health check route of the API');

  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response

  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/Ashwin-BN/fragments',
      version,
    })
  );
});

module.exports = router;
