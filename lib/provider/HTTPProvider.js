'use strict';

const axios = require('axios');

class HTTPProvider {
    constructor(host, timeout) {
        this._host = host || 'http://localhost:30000';
        this._timeout = timeout;
    }

    send(method, url, data) {
        const config = {
            method: method,
            url: this._host + '/' + url,
            data: data,
        };

        return axios(config).then(function (response) {
            return response.data
        })
    }

    asyncSend(method, url, data, callback) {
        const config = {
            method: method,
            url: this.host + '/' + url,
            data: data,
        };

        axios(config).then(function (response) {
            callback(response);
        }).catch(function (exception) {
            callback(exception);
        })
    }
}

module.exports = HTTPProvider;