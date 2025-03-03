// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { getFragmentById, getFragmentMetadataById } = require('./get-id');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// GET /v1/fragments
// Returns list of all fragment IDs for authenticated user
router.get('/fragments', require('./get'));

// GET /v1/fragments/:id
// Returns fragments based on ID with extensions and file conversions
router.get('/fragments/:id', getFragmentById);

// GET /v1/fragments/:id/info
// Returns metadata of fragment based on ID
router.get('/fragments/:id/info', getFragmentMetadataById);

// POST /v1/fragments
// Creates new fragment for the authenticated user
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
