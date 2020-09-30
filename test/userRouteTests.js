const chai = require('chai');
const expect = require('chai').expect;
var assert = require('assert');

const server = require('../server');

describe('User routes', function () {
  before(async function() {
    await server.start("test")
  });

  after(async function() {
    await server.close()
  });

  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.strictEqual([1, 2, 3].indexOf(4), -1);
    });
  });
});
