// src/utils/typeValidation.js

const logger = require('../logger');
const sharp = require('sharp');
const yaml = require('js-yaml');

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

    case 'application/yml':
    case 'application/yaml':
      // Throw an error if the program is unable to parse the YAML
      validateYaml(fragmentData);
      break;

    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif': {
      // Throw an Error if the program is unable to parse the image
      await validateImage(fragmentData, fragmentType);
      break;
    }

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

/**
 * Validates YAML data ensuring it's properly formatted.
 * @param {string|Buffer} fragmentData - YAML string or Buffer to parse
 * @throws {Error} If YAML parsing fails
 */
const validateYaml = (fragmentData) => {
  try {
    // Convert Buffer to string if necessary
    const yamlString = Buffer.isBuffer(fragmentData) ? fragmentData.toString() : fragmentData;
    yaml.load(yamlString);
  } catch (error) {
    const errorMessage = `Invalid YAML data: ${error.message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Validates image data ensuring it's properly formatted.
 * @param {string|Buffer} fragmentData - Image data to validate
 * @param {string} fragmentType - Expected image MIME type
 * @throws {Error} If image validation fails
 */
const validateImage = async (fragmentData, expectedType) => {
  try {
    // Use sharp to get metadata about the image
    const metadata = await sharp(fragmentData).metadata();

    const expectedFormat = expectedType.split('/')[1];
    let actualFormat = metadata.format;
    // Handle the AVIF format being reported as HEIF by sharp
    if (expectedFormat === 'avif' && actualFormat === 'heif') {
      actualFormat = 'avif';
    }

    if (actualFormat !== expectedFormat) {
      logger.error(
        `Invalid image data, expected ${expectedFormat} but ${actualFormat} was passed instead`
      );
      throw new Error(
        `Invalid image data, expected ${expectedFormat} but ${actualFormat} was passed instead`
      );
    }
  } catch (error) {
    logger.error(error.message, `Invalid image data`);
    throw new Error(error.message, `Invalid image data`);
  }
};
