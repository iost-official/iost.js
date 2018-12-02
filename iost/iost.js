

const RPC = require('../lib/rpc');
const {Tx} = require('../lib/structs');
const HTTPProvider = require('../lib/provider/HTTPProvider');

class txHandler {
    constructor(tx, rpc) {
        this.tx = tx;
        this.Pending = function () {};
        this.Success = function () {};
        this.Failed = function () {};
        this._rpc = rpc;
        this._hash = "";
    }

    onPending(c) {
        this.Pending = c;
        return this
    }

    onSuccess(c) {
        this.Success = c;
        return this
    }

    onFailed(c) {
        this.Failed = c;
        return this
    }


    send() {
        let self = this;
        self._rpc.transaction.sendTx(self.tx).then(function (res) {
            self._hash = res.hash;
            self.Pending(res)
        }).catch(self.Failed);
        return self
    }

    listen() {
        let self = this;
        let i = 0;
        let success = false;
        let id = setInterval(function () { //
            if (success || i > 40) {
                clearInterval(id);
                return
            }
            i++;
            self._rpc.transaction.getTxByHash(hash).then(function (res) {
                success = (res.tx !== undefined)
            })
        }, 2000);

        self._rpc.transaction.getTxReceiptByTxHash(hash).then(function (res) {
            if (res.status.code === 0) {
                self.Success(res)
            } else {
                self.Failed(res)
            }
        })
    }

}

const defaultConfig = {
    gasPrice: 100,
    gasLimit: 10000,
    delay: 0,
};

/**
 * IOST开发工具，可以帮忙发交易
 * @constructor
 * @param {object}config - 这个iost的配置
 * @param {HTTPProvider} - provider
 */
class IOST {
    constructor(config, provider) {
        if (config === undefined) {
            this.config = defaultConfig
        }
        this.config = config;
        this.rpc = new RPC(provider)
    }

    /**
     * 设置IOST的交易发布者
     * @param {string}creator - 交易创建者的用户名
     * @param {KeyPair}kp - 交易创建者的公私钥对
     */
    setPublisher(creator, kp) {
        this.publisher = creator;
        this.key = kp
    }

    /**
     * 调用智能合约ABI
     * @param {string}contract - 智能合约ID或者域名
     * @param {string}abi - 智能合约ABI
     * @param {Array}args - 智能合约参数数组
     * @returns {txHandler}
     */
    callABI(contract, abi, args) {
        const t = new Tx(this.config.gasPrice, this.config.gasLimit, this.config.delay);
        t.addAction(contract, abi, JSON.stringify(args));
        t.addPublishSign(this.publisher, this.key);
        return new txHandler(t, this.rpc)
    }

    /**
     * 转账
     * @param {string}token - token名
     * @param {string}to - 收款人
     * @param {number}amount - 金额
     * @returns {txHandler}
     */
    transfer(token, to, amount) {
        return this.callABI("iost.token", "transfer", [token, this.publisher, to, amount])
    }

    /**
     * 新建账号
     * @param {string}name - 用户名
     * @param {string}ownerkey - 用户的owner key
     * @param {string}activekey - 用户的active key
     * @param {number}initialRAM - 用户初始RAM
     * @param {number}initialGasPledge - 用户初始IOST质押
     * @returns {txHandler}
     */
    newAccount(name, ownerkey, activekey, initialRAM, initialGasPledge) {
        const t = new Tx(this.config.gasPrice, this.config.gasLimit, this.config.delay);
        t.addAction("iost.auth", "SignUp", JSON.stringify([name, ownerkey, activekey]));
        t.addAction("iost.ram", "buy", JSON.stringify([this.publisher, name, initialRAM]));
        t.addAction("iost.gas", "pledge", JSON.stringify([this.publisher, name, initialGasPledge]));
        t.addPublishSign(this.publisher, this.key);
        return new txHandler(t, this.rpc)
    }
}

module.exports = IOST;
