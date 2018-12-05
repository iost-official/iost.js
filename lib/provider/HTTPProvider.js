

const axios = require('axios');

/**
 * http接口访问区块链节点
 * @constructor
 * @param {string} host - IOST节点的URL
 * @param {number} timeout - 超时时间，以毫秒计时
 */
class HTTPProvider {
    constructor(host, timeout) {
        this._host = host || 'http://localhost:30000';
        this._timeout = timeout;
    }

    /**
     * 发送一个http请求，使用promise
     * @param {string}method - get or post
     * @param {string}url - 节点的API
     * @param {string}data - 参数，以json string表示
     * @returns {promise} - 返回response的内容的promise
     */
    send(method, url, data) {

        const config = {
            method: method,
            url: this._host + '/' + url,
            data: data,
            timeout: this._timeout,
            headers: {
                'Content-Type': 'text/plain'
            }
        };
        return axios(config).then(function (response) {
            return response.data
        })
    }

    /**
     * 使用回调发送http请求
     * @param {string}method - get or post
     * @param {string}url - 节点的API
     * @param {string}data - 参数，以json string表示
     * @param {function}callback - 回调函数
     */
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