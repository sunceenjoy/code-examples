const DbStorage = require('./storages/db')

class UserClientIdManager {
  constructor (storage) {
    // Cache storage
    this.storage = storage
  }
  async verify (bbId, clientId) {
    const storedClientId = await this.getClientId(bbId)

    if (storedClientId) {
      return clientId === storedClientId
    }
    return false
  }
  async delClientId (bbId) {
    return this.storage.delete(bbId)
  }
  async setClientId (bbId, clientId) {
    return this.storage.set(bbId, clientId)
  }
  async getClientId (bbId) {
    return this.storage.get(bbId)
  }
}

module.exports = async function (storage = null) {
  if (!storage) {
    storage = new DbStorage()
    await storage.init()
  }
  return new UserClientIdManager(storage)
}
