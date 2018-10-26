const axios = require('axios');

class HTTPProvider {
  constructor(host, timeout) {
    this.host = host || 'http://localhost:30000';
    this.timeout = timeout;
  }

  send(method, url, data) {
    const config = {
      method,
      url: `${this.host}/${url}`,
      data,
    };

    return axios(config).then(response => response.data);
  }

  asyncSend(method, url, data, callback) {
    const config = {
      method,
      url: `${this.host}/${url}`,
      data,
    };

    axios(config).then((response) => {
      callback(response);
    }).catch((exception) => {
      callback(exception);
    });
  }
}

module.exports = HTTPProvider;
