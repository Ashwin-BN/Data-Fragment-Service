const { createSuccessResponse } = require('../../response');

const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  const fragIds = await Fragment.byUser(req.user);

  res.status(200).json(
    createSuccessResponse({
      fragments: fragIds,
    })
  );
};
