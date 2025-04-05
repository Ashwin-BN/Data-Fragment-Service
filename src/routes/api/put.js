// src/routes/api/put.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const contentType = require('content-type');
const { validateFragment } = require('../../utils/typeValidation');

const logger = require('../../logger');

/**
 * Handles PUT request for updating fragments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {
  const fragmentId = req.params.id;

  // Log attempt to update fragment with ID
  logger.info('Attempting to update fragment', {
    userId: req.user.id,
    fragmentId,
  });

  try {
    // Validate request body format
    if (!Buffer.isBuffer(req.body)) {
      logger.error('Unsupported Content-Type request - expected Buffer');
      return res
        .status(415)
        .send(createErrorResponse(415, 'Unsupported Content-Type request - expected Buffer'));
    }

    // Validate minimum content requirements
    if (!(req.body.length > 0)) {
      logger.error('Empty request body received');
      return res.status(400).send(createErrorResponse(400, 'Empty request body received'));
    }

    // Parse content type and extract metadata
    const { type, parameters } = contentType.parse(req);
    const charset = parameters.charset || null;
    const size = req.body.length;

    // Log content analysis details
    logger.debug(
      {
        userId: req.user.id,
        fragmentId,
        metadata: {
          contentType: type,
          charset,
          size,
        },
      },
      'Parsed content type, charset, and size from request'
    );

    // Retrieve existing fragment
    const requestedFragment = await Fragment.byId(req.user, fragmentId);
    const fragment = new Fragment(requestedFragment);

    // Update fragment size
    fragment.size = size;

    try {
      // Validate fragment content
      await validateFragment(req.body, type);
    } catch (error) {
      return res
        .status(415)
        .send(createErrorResponse(415, `Fragment validation failed ${error.message}`));
    }

    // Verify content type consistency
    if (type !== fragment.mimeType) {
      logger.error('Content type mismatch detected');
      return res.status(400).send(createErrorResponse(400, 'Content type mismatch detected'));
    }

    // Save updated fragment metadata
    logger.info('Saving updated fragment metadata');
    await fragment.save();

    // Store updated fragment data
    logger.info('Saving updated fragment data');
    await fragment.setData(req.body);

    // Retrieve and verify stored fragment
    const storedFragment = await Fragment.byId(req.user, fragment.id);
    logger.info('Successfully updated fragment');

    // Set location header and set success response
    res.location(`${req.protocol}://${req.headers.host}/v1/fragments/${storedFragment.id}`);
    return res.status(201).send(createSuccessResponse({ fragment: storedFragment }));
  } catch (error) {
    // Handle fragment not found error
    if (error.message === 'Fragment does not exist') {
      logger.error({ userId: req.user.id, fragmentId }, 'Fragment does not exist');
      return res.status(404).send(createErrorResponse(404, 'Request fragment does not exist'));
    }
    logger.error(error.message, 'Unexpected server error occurred');
    res.status(500).send(createErrorResponse(500, error.message));
  }
};
