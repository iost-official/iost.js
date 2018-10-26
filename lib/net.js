class Net {
  constructor(iost) {
    this.provider = iost.getProvider();
    this.netApi = 'getNodeInfo';
  }

  getProvider() {
    return this.provider;
  }

  getNetInfo() {
    const netInfo = this.provider.send('get', this.netApi);
    return netInfo;
  }
}

module.exports = Net;
