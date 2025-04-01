// src/routes/api/get-id.js

const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { typeConversion } = require('../../utils/typeConversion');
const contentTypeMapper = require('../../utils/typeMapper');

/**
 * Get a fragment by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {Error} If fragment retrieval fails
 */
module.exports.getFragmentById = async (req, res) => {
  const [fragmentId, extension] = req.params.id.split('.');
  logger.info('Request to get fragment by ID for user');

  try {
    // Retrieve the requested fragment from the database
    const requestedFragmentFormat = await Fragment.byId(req.user, fragmentId);
    const fragment = new Fragment(requestedFragmentFormat);
    const fragmentData = await fragment.getData();

    // Check if the extension exists
    const finalType = contentTypeMapper.getContentType(`.${extension}`);

    // If no extension is provided or if the extension is the same as the fragment's MIME type, return the original fragment
    if (!extension || finalType === fragment.mimeType) {
      logger.info('Returning data in original format');
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(fragmentData);
    }

    // Convert the data if the type conversion is possible
    if (fragment.formats.includes(finalType)) {
      logger.info('Type conversion possible. Converting the data.');
      const data = await typeConversion({
        currentType: fragment.mimeType,
        finalType: finalType,
        fragmentData: fragmentData,
      });
      res.setHeader('Content-Type', finalType);
      return res.status(200).send(data);
    }

    // If type conversion is not possible, return an error
    logger.error(
      {
        mimeType: fragment.mimeType,
        formats: fragment.formats,
      },
      'Type conversion not possible'
    );
    return res
      .status(415)
      .send(
        createErrorResponse(
          415,
          `Type conversion not possible. ${fragment.mimeType} can only be converted into ${fragment.formats}.`
        )
      );
  } catch (error) {
    // If the requested fragment doesn't exist
    if (error.message === 'Fragment does not exist') {
      logger.error({ userId: req.user.id, fragmentId }, 'Fragment does not exist');
      return res
        .status(404)
        .send(createErrorResponse(404, "The requested fragment doesn't exist."));
    }
    logger.error(error.message, 'Error fetching fragment by ID for user');
    res.status(500).send(createErrorResponse(500, error.message));
  }
};

/**
 * Get a fragment's metadata by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports.getFragmentMetadataById = async (req, res) => {
  const fragmentId = req.params.id;
  logger.info('Request to get fragment metadata by ID for user');

  try {
    // Fetch fragment metadata by ID
    const fragmentMetadata = await Fragment.byId(req.user, fragmentId);
    res.status(200).send(
      createSuccessResponse({
        fragment: fragmentMetadata,
      })
    );
  } catch (error) {
    // If the requested fragment doesn't exist
    if (error.message === 'Fragment does not exist') {
      logger.error({ userId: req.user.id, fragmentId }, 'Fragment does not exist');
      return res
        .status(404)
        .send(createErrorResponse(404, "The requested fragment doesn't exist."));
    }
    logger.error(
      { err: error },
      'An error occurred while fetching a fragment metadata by ID for a user'
    );
    res.status(500).send(createErrorResponse(500, error.message));
  }
};
