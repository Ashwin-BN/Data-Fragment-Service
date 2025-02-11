// src/routes/api/post.js

const url = require('url');

const { createSuccessResponse, createErrorResponse } = require('../../response');

const logger = require('../../logger');

const { Fragment } = require('../../model/fragment');

module.exports = (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    logger.error({ req }, 'invalid content-type');
    res.status(415).json(createErrorResponse(415, 'invalid content-type of request'));
  }

  const user = req.user;
  const contentType = req.headers['content-type'];

  logger.debug({ user }, 'requested user');
  logger.debug({ contentType }, 'Content Type');

  const fragMetaData = { ownerId: user, type: contentType };
  const fragment = new Fragment(fragMetaData);

  fragment.save();
  fragment.setData(req.body);

  const protocol = req.protocol;
  const host = req.get('host');

  logger.debug({ protocol }, 'host protocol');
  logger.debug({ host }, 'host url');

  let locationURL = url.format({
    protocol: req.protocol,
    host: req.headers.host,
    pathname: `/v1/fragments/${fragment.id}`,
  });

  if (process.env.API_URL) {
    const urlString = new URL(process.env.API_URL);
    urlString.pathname = `/v1/fragments/${fragment.id}`;
    locationURL = urlString.toString();
  }

  logger.debug({ locationURL }, 'location url');

  res.setHeader('Location', locationURL);
  res.status(201).json(createSuccessResponse({ fragment }));
};
