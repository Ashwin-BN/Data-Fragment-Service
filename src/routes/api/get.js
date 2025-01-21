// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  const token = req.headers.authorization;

  // If there's no token, return 401 Unauthorized
  if (!token) {
      res.status(401).json({
          status: 'Unauthorized',
          message: 'No token provided'
      });
      return;
  }
  
    res.status(200).json({
      status: 'ok',
      // TODO: change me
      fragments: [],
    });
  };