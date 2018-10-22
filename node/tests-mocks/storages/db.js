const biddyDb = function () {
  
}

class DbStorage {
  constructor () {
    this.coll = null
  }
  async init () {
    if (!this.collection) {
      const db = await biddyDb()
      this.coll = db.collection('user_status')
    }
    return this.coll
  }
  async set (key, value) {
    return this.coll.replaceOne({bbId: key}, {bbId: key, clientId: value, ttl:new Date()}, {upsert: true})
  }
  async get (key) {
    var data = await this.coll.findOne({bbId: key})
    if (data) {
      return data.clientId
    }
    return false
  }
  async delete (key) {
    return this.coll.deleteOne({bbId: key})
  }
}

module.exports = DbStorage
