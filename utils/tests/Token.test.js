'use strict';

const assert = require('assert');
const jwt = require('jsonwebtoken');

const {verifyToken} = require('../Token');

const objectForToken = {purpose: 'testing'};
const token = jwt.sign(objectForToken, process.env.RESIN_TOKEN_KEY);

describe('./utils/Token.js', () => {
  describe('verifyToken', () => {
    it('should return the object if token is valid', () => {
      let verifiedTokenObj = verifyToken(token);
      delete verifiedTokenObj.iat;
      assert.deepStrictEqual(verifiedTokenObj, objectForToken);
    });

    it('should return false if token is invalid', () => {
      assert.deepStrictEqual(
        verifyToken(token + 'wrongAdditional'),
        false
      );
    });
  });
});
