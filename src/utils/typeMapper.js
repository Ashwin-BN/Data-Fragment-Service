// src/utils/typeMapper.js

/**
 * Manages MIME type mappings and charset detection for various file extensions.
 * Provides O(1) lookup performance using Map and Set data structures.
 */
class ContentTypeMapper {
  /**
   * Creates a new instance of the ContentTypeMapper.
   * Initializes the internal mapping of file extensions to MIME types.
   */
  constructor() {
    // Internal map storing file extensions to their corresponding MIME types
    this.mimeTypes = new Map([
      ['.txt', 'text/plain'], // Plain text files
      ['.md', 'text/markdown'], // Markdown documents
      ['.html', 'text/html'], // HTML documents
      ['.csv', 'text/csv'], // Comma Separated Values
      ['.json', 'application/json'], // JSON data
      ['.yaml', 'application/yaml'], // YAML data
      ['.png', 'image/png'], // PNG images
      ['.jpg', 'image/jpeg'], // JPEG images
      ['.webp', 'image/webp'], // WebP images
      ['.avif', 'image/avif'], // AVIF images
      ['.gif', 'image/gif'], // GIF images
    ]);

    // Set of MIME types that typically contain character-encoded data
    this.charsetTypes = new Set(['text/plain', 'text/html', 'text/csv', 'application/json']);
  }

  /**
   * Retrieves the MIME type associated with a file extension.
   * @param {string} extension - File extension including dot (e.g., '.txt')
   * @returns {string|null} MIME type string or null if extension not found
   */
  getContentType(extension) {
    return this.mimeTypes.get(extension.toLowerCase());
  }

  /**
   * Determines if a MIME type typically contains character-encoded data.
   * @param {string} contentType - MIME type to check
   * @returns {boolean} True if content type requires charset handling
   */
  isCharsetType(contentType) {
    return this.charsetTypes.has(contentType);
  }
}

// Export a singleton instance for global usage
module.exports = new ContentTypeMapper();
