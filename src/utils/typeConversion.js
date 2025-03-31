// src/utils/typeConversion.js

const MarkdownIt = require('markdown-it');
const csvtojson = require('csvtojson');
const yaml = require('js-yaml');
const sharp = require('sharp');

/**
 * Handles type conversion for different data formats.
 * @param {Object} params - Parameters for conversion.
 * @param {string} params.currentType - MIME type of the current data.
 * @param {string} params.finalType - Target MIME type for conversion.
 * @param {Buffer|string} params.fragmentData - Data to be converted.
 * @returns {Promise<string>} - Converted data as a string.
 * @throws {Error} - If conversion between the given types is not supported.
 */
module.exports.typeConversion = async ({ currentType, finalType, fragmentData }) => {
  // Input validation
  if (!currentType || !finalType || !fragmentData) {
    throw new Error('Missing required parameters');
  }

  // Route conversion request to appropriate handler based on target type
  switch (finalType) {
    case 'text/plain':
      return await convertToTextPlain(currentType, fragmentData);
    case 'text/html':
      return await convertToHTML(currentType, fragmentData);
    case 'application/json':
      return await convertToJson(currentType, fragmentData);
    case 'application/yaml':
      return await convertToYaml(currentType, fragmentData);
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
    case 'image/gif':
    case 'image/avif':
      return await convertToImage(currentType, finalType, fragmentData);
    default:
      throw new Error(
        `Type conversion from ${currentType} to ${finalType} is currently not supported by the API.`
      );
  }
};

/**
 * Converts various formats to plain text (text/plain).
 * @param {string} currentType - MIME type of the input data.
 * @param {Buffer|string} fragmentData - Data to be converted.
 * @returns {Promise<string>} - Converted plain text data.
 * @throws {Error} - If conversion is not supported.
 */
const convertToTextPlain = async (currentType, fragmentData) => {
  // Handle direct text conversions for supported formats
  try {
    switch (currentType) {
      case 'text/html':
      case 'text/csv':
      case 'text/markdown':
        return fragmentData.toString();
      case 'application/json':
      case 'application/yaml':
        return JSON.stringify(JSON.parse(fragmentData.toString()), null, 2);
      default:
        throw new Error(`Type conversion from ${currentType} to text/plain is not supported.`);
    }
  } catch (error) {
    throw new Error(`Failed to convert to plain text: ${error.message}`);
  }
};

/**
 * Converts Markdown to HTML (text/html).
 * @param {string} currentType - MIME type of the input data.
 * @param {Buffer|string} fragmentData - Data to be converted.
 * @returns {Promise<string>} - Converted HTML data.
 * @throws {Error} - If conversion is not supported.
 */
const convertToHTML = async (currentType, fragmentData) => {
  // Initialize Markdown parser
  const md = new MarkdownIt();
  switch (currentType) {
    case 'text/markdown':
      // Convert markdown content to HTML using markdown-it parser
      try {
        return md.render(fragmentData.toString());
      } catch (error) {
        throw new Error(`Failed to convert markdown to HTML: ${error.message}`);
      }
    default:
      throw new Error(`Type conversion from ${currentType} to text/html is not supported.`);
  }
};

/**
 * Converts CSV to JSON (application/json).
 * @param {string} currentType - MIME type of the input data.
 * @param {Buffer|string} fragmentData - Data to be converted.
 * @returns {Promise<string>} - Converted JSON data as a string.
 * @throws {Error} - If conversion is not supported.
 */
const convertToJson = async (currentType, fragmentData) => {
  switch (currentType) {
    case 'text/csv': {
      // Convert CSV string to JSON array using csvtojson
      try {
        const jsonCSV = await csvtojson().fromString(fragmentData.toString());
        return JSON.stringify(jsonCSV, null, 2);
      } catch (error) {
        throw new Error(`Failed to convert CSV to JSON: ${error.message}`);
      }
    }
    default:
      throw new Error(`Type conversion from ${currentType} to application/json is not supported.`);
  }
};

/**
 * Converts JSON to YAML (application/yaml).
 * @param {string} currentType - MIME type of the input data.
 * @param {Buffer|string} fragmentData - Data to be converted.
 * @returns {Promise<string>} - Converted YAML data.
 * @throws {Error} - If conversion is not supported.
 */
const convertToYaml = async (currentType, fragmentData) => {
  switch (currentType) {
    case 'application/json':
      // Convert JSON string to YAML format using js-yaml
      try {
        const jsonData = JSON.parse(fragmentData.toString());
        return yaml.dump(jsonData);
      } catch (error) {
        throw new Error(`Failed to convert JSON to YAML: ${error.message}`);
      }
    default:
      throw new Error(`Type conversion from ${currentType} to application/yaml is not supported.`);
  }
};

/**
 * Handles image format conversions.
 * @param {string} currentType - MIME type of the input data.
 * @param {string} finalType - Target MIME type for conversion.
 * @param {Buffer|string} fragmentData - Data to be converted.
 * @returns {Promise<Buffer>} - Converted image data as a Buffer.
 * @throws {Error} - If conversion is not supported.
 */
const convertToImage = async (currentType, finalType, fragmentData) => {
  // Initialize sharp image processor
  try {
    const image = sharp(fragmentData);
    switch (finalType) {
      case 'image/jpeg':
        return await image.jpeg().toBuffer();
      case 'image/png':
        return await image.png().toBuffer();
      case 'image/webp':
        return await image.webp().toBuffer();
      case 'image/gif':
        return await image.gif().toBuffer();
      case 'image/avif':
        return await image.avif().toBuffer();
      default:
        throw new Error(`Unsupported image format: ${finalType}`);
    }
  } catch (error) {
    throw new Error(`Failed to convert image: ${error.message}`);
  }
};
