// https://mochajs.org/
// https://sinonjs.org/releases/v7.0.0/stubs/
var assert = require('assert')
var sinon = require('sinon')
var DbStorage = require('../storages/db')
var clientIdManager = require('../clientIdManager')
describe('clientIdManager', function () {
  before(async function () {
    this.clientId = 'abcefg'
    this.bbId = 25
    // Here we mock all methods of DbStorage class
    this.storage = sinon.createStubInstance(DbStorage)
    this.cm = await clientIdManager(this.storage)
  })
  describe('#setClientId', function () {
    it('should return true|object', async function () {
      this.storage.set.returns(true)
      var value = await this.cm.setClientId(this.bbId, this.clientId)
      assert.equal(value, true)
    })
  })
  describe('#getClientId', function () {
    it('should return a value', async function () {
      this.storage.get.returns(this.clientId)
      var value = await this.cm.getClientId(this.bbId)
      assert.equal(value, this.clientId)
    })
  })
  describe('#getClientId', function () {
    it('should return undefined', async function () {
      this.storage.delete.returns(null)
      var value = await this.cm.delClientId(this.bbId)
      assert.equal(value, null)
    })
  })
  describe('#verify', function () {
    it('verify failed', async function () {
      this.storage.get.returns(null)
      var value = await this.cm.verify(this.bbId)
      assert.equal(value, false)
    })
    it('verify succeeded', async function () {
      this.storage.get.returns(this.clientId)
      var value = await this.cm.verify(this.bbId, this.clientId)
      assert.equal(value, true)
    })
  })
})
