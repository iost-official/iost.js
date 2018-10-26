const Net = require('./net');

class IOST {
  constructor(provider) {
    this.provider = provider;
    this.net = new Net(this);
  }

  setProvider(provider) {
    this.provider = provider;
  }

  getProvider() {
    return this.provider;
  }
}

module.exports = IOST;
