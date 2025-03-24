// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const { validateFragment } = require('../../utils/typeValidation');
const contentTypeMapper = require('../../utils/typeMapper');

/**
 * Creates a new fragment for the authenticated user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {
  try {
    logger.info('Creating a fragment for the user');

    // Ensure request body is a Buffer (binary data)
    if (!Buffer.isBuffer(req.body)) {
      logger.error({ req }, 'invalid content-type');
      return res.status(415).json(createErrorResponse(415, 'Invalid Content-Type of request'));
    }

    // The body of the fragment should not be empty
    if (!(req.body.length > 0)) {
      logger.error('Fragment cannot be null');
      return res.status(400).send(createErrorResponse(400, 'Fragment cannot be null'));
    }

    // Parse content type from request
    const { type, parameters } = contentType.parse(req);
    const charset = parameters.charset || null;
    const size = req.body.length;

    logger.debug({ type, charset, size }, 'Parsed content type, charset, and size');

    // Validate fragment data
    try {
      await validateFragment(req.body, type);
    } catch (err) {
      return res
        .status(415)
        .send(createErrorResponse(415, `Unsupported Content-Type. ${err.message}`));
    }

    const fragMetaData = {
      ownerId: req.user,
      type: contentTypeMapper.isCharsetType(type) && charset ? `${type}; charset=${charset}` : type,
      size: size,
    };
    const fragment = new Fragment(fragMetaData);

    logger.info('Saving the fragment metadata');
    await fragment.save();

    logger.info('Saving the fragment data');
    await fragment.setData(req.body);

    // Fetch saved fragment
    const storedFragment = await Fragment.byId(req.user, fragment.id);

    logger.info('Fragment created successfully');

    // Set Location header using string concatenation
    const location = `${req.protocol}://${req.headers.host}/v1/fragments/${storedFragment.id}`;
    res.location(location);

    // Send success response
    return res.status(201).send(createSuccessResponse({ fragment: storedFragment }));
  } catch (err) {
    logger.error({ err: err.message }, 'Error creating fragment');
    return res.status(500).send(createErrorResponse(500, `Internal Server Error: ${err.message}`));
  }
};
