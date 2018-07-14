'use strict';

var jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
    const drone = jwt.verify(token, process.env.RESIN_TOKEN_KEY);
    return drone;
  } catch (error) {
    console.log('Unable to verify the token: ', token);
    return false;
  }
}

module.exports = {verifyToken};
