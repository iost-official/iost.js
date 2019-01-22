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
            return response.data;
        }).catch((e) => {
            if (e.response !== undefined) {
                throw new Error("error: " + JSON.stringify(e.response.data));
            } else {
                throw new Error("error: " + e);
            }
        })

    }
}

module.exports = HTTPProvider;