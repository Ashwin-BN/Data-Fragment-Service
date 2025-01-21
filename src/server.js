// src/server.js

// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Read PORT from environment or default to 8080
const port = parseInt(process.env.PORT || 8080, 10);

// Start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    logger.info(`Server started on port ${port}`);
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
