// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const logger = require('../logger');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/memory');

class Fragment {
  static validTypes = [`text/plain`];

  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // Make sure owner ID and type are required
    if (!ownerId || !type) {
      throw new Error('Owner Id and type are required');
    }

    // Make sure the type is valid
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Invalid Type: ${type}`);
    }

    // Size should be >= 0 and a number
    if (typeof size !== 'number' || size < 0) {
      throw new Error('Size should be a number which is >= 0');
    }

    // The fragment should get a created and updated datetimestring by default
    const datetime = new Date().toISOString();

    // Assign the properties to the object
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
    this.created = created || datetime;
    this.updated = updated || datetime;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    let userFragments = await listFragments(ownerId, expand);
    return userFragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      const fragment = await readFragment(ownerId, id);
      const newFragment = new Fragment(fragment);
      return Promise.resolve(newFragment);
    } catch (err) {
      logger.error({ err }, 'error occurred in getting new instance of fragment');
      return Promise.reject(new Error('the specified fragment does not exist'));
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!data) {
      return Promise.reject(new Error('Invalid Data. Did not receive valid data'));
    }
    this.size = data.length;
    await this.save(); // Ensure metadata is updated before writing data
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.split('/')[0] === 'text';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return Fragment.validTypes;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain; charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return Fragment.validTypes.includes(contentType.parse(value).type);
  }
}

module.exports.Fragment = Fragment;
