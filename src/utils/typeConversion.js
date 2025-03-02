// src/utils/typeConversion.js

const MarkdownIt = require('markdown-it');
const csvtojson = require('csvtojson');

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
  switch (finalType) {
    case 'text/plain':
      return await convertToTextPlain(currentType, fragmentData);
    case 'text/html':
      return await convertToHTML(currentType, fragmentData);
    case 'application/json':
      return await convertToJson(currentType, fragmentData);
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
  switch (currentType) {
    case 'text/html':
    case 'text/csv':
    case 'text/markdown':
      return fragmentData.toString();
    case 'application/json':
      return fragmentData.toString();
    default:
      throw new Error(`Type conversion from ${currentType} to text/plain is not supported.`);
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
  const md = new MarkdownIt();
  switch (currentType) {
    case 'text/markdown':
      return md.render(fragmentData.toString());
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
      const jsonCSV = await csvtojson().fromString(fragmentData.toString());
      return JSON.stringify(jsonCSV);
    }
    default:
      throw new Error(`Type conversion from ${currentType} to application/json is not supported.`);
  }
};
