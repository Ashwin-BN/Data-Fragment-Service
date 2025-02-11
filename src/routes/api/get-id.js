// src/routes/api/get-id.js

const path = require('path');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Get a fragment by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {Error} If fragment retrieval fails
 */
module.exports = async (req, res) => {
  try {
    const pathVal = path.parse(req.params.id);
    const id = pathVal.name;

    // Log request details
    logger.info(
      {
        fragmentId: id,
        userId: req.user,
        requestedFormat: pathVal.ext,
      },
      'Attempting to retrieve fragment'
    );

    // Retrieve fragment
    const fragment = await Fragment.byId(req.user, id);

    // Handle format conversion
    if (pathVal.ext && pathVal.ext !== '.txt') {
      return res
        .status(415)
        .json(createErrorResponse(415, 'Conversion to following format is not permitted'));
    }

    // Log successful retrieval
    logger.debug(
      {
        fragmentId: id,
        userId: req.user,
      },
      'Successfully retrieved fragment'
    );

    // Return original format
    const data = await fragment.getData();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragment');
    res.status(404).json(createErrorResponse(404, `Fragment not found`));
  }
};
