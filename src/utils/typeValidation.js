// src/utils/typeValidation.js

const logger = require('../logger');

/**
 * Validates fragment data against its specified content type.
 * @param {string|Buffer} fragmentData - The data to validate
 * @param {string} fragmentType - Content type of the fragment ('text/plain' or 'application/json')
 * @throws {Error} If validation fails
 * @returns {void}
 */
module.exports.validateFragment = async (fragmentData, fragmentType) => {
  switch (fragmentType) {
    case 'text/plain':
    case 'text/html':
    case 'text/csv':
    case 'text/markdown':
      // Ensure the data is a valid text
      validateText(fragmentData);
      break;

    case 'application/json':
      // Throw an error if the program is unable to parse the JSON
      validateJson(fragmentData);
      break;

    default:
      logger.error(`Unsupported content type: ${fragmentType}`);
      throw new Error('Unsupported content type');
  }
};

/**
 * Validates text data ensuring it's either a string or Buffer.
 * @param {string|Buffer} fragmentData - Data to validate
 * @throws {Error} If data is neither string nor Buffer
 */
const validateText = (fragmentData) => {
  if (typeof fragmentData !== 'string' && !Buffer.isBuffer(fragmentData)) {
    const errorMessage = 'Invalid text data, must be a string or buffer';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Validates JSON data ensuring it's properly formatted.
 * @param {string|Buffer} fragmentData - JSON string or Buffer to parse
 * @throws {Error} If JSON parsing fails
 */
const validateJson = (fragmentData) => {
  try {
    // Convert Buffer to string if necessary
    const jsonString = Buffer.isBuffer(fragmentData) ? fragmentData.toString() : fragmentData;
    JSON.parse(jsonString);
  } catch (error) {
    const errorMessage = `Invalid JSON data: ${error.message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};
