const {bbidsDb} = require('../util/dbConnection')

class Token {
  constructor () {
    this.cache = {}
  }

  verify (bbId, cid) {
    if (this.cache[bbId] !== undefined) {
      return cid === this.cache[bbId]
    }
    var storedToken = this.findToken(bbId)
    if (!storedToken) {
      // Also send io event to logout all others client
      this.cache[bbId] = cid
    }
    return cid === this.cache[bbId]
  }

  findToken (bbId) {
    return false
  }

  reset (bbId) {
    this.cache[bbId] = undefined
  }
}

module.exports = new Token()
