// src/routes/api/delete.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Handles DELETE requests for fragment deletion
 * @route DELETE /api/delete/:id
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID of the fragment to delete
 * @param {Object} req.user - Authenticated user object
 * @returns {Promise<Object>} HTTP response with status code
 */
module.exports.deleteFragment = async (req, res) => {
  // Extract fragment identifier from route parameters
  const fragmentId = req.params.id;

  // Log initial request attempt
  logger.info("Request to delete fragment's data and metadata by ID");

  try {
    // Retrieve fragment instance based on user ownership and ID
    const requestedFragment = await Fragment.byId(req.user, fragmentId);

    // Create new Fragment instance for type safety
    const fragment = new Fragment(requestedFragment);

    // Delete the fragment's data and metadata
    logger.info("Deleting the fragment's data and metadata");
    await Fragment.delete(fragment.ownerId, fragment.id);

    // Log successful deletion
    logger.info('Fragment data and metadata deleted successfully');

    // Return success response with HTTP 200 status
    return res.status(200).send(createSuccessResponse());
  } catch (error) {
    // Handle missing fragment error
    if (error.message === 'Fragment does not exist') {
      logger.error('Fragment does not exist', { userId: req.user.id, fragmentId });
      return res
        .status(404)
        .send(createErrorResponse(404, "The requested fragment doesn't exist."));
    }

    // Handle unexpected errors during deletion
    logger.error(
      'An error occurred while deleting fragment data and metadata for the user:',
      error.message
    );
    res.status(500).send(createErrorResponse(500, 'Internal Server Error'));
  }
};
