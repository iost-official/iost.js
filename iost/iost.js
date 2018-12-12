const RPC = require('../lib/rpc');
const {Tx} = require('../lib/structs');
const HTTPProvider = require('../lib/provider/HTTPProvider');


class txHandler {
    constructor(tx, rpc) {
        this.tx = tx;
        this.Pending = function () {
        };
        this.Success = function () {
        };
        this.Failed = function () {
        };
        this._rpc = rpc;
        this._hash = "";
        this.status = "idle"
    }

    onPending(c) {
        this.Pending = function (res) {
            c(res);
            this.status = "pending";
        };
        return this
    }

    onSuccess(c) {
        this.Success = function (res) {
            c(res);
            this.status = "success";
        };
        return this

    }

    onFailed(c) {
        this.Failed = function (res) {
            c(res);
            this.status = "failed";
        };
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

    listen(interval, times) {
        let self = this;

        let i = 1;
        let id = setInterval(function () { //
            if (self.status === "idle") {
                return
            }

            if (self.status === "success" || self.status === "failed" || i > parseInt(times)) {
                clearInterval(id);
                return
            }
            i++;
            self._rpc.transaction.getTxReceiptByTxHash(self._hash).then(function (res) {
                if (res.status_code === "SUCCESS") {
                    self.Success(res)
                } else if (res == '') {
                    self.Failed(res)
                }
            })
        }, parseInt(interval));
    }

}

const defaultConfig = {
    gasRatio: 100,
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
        const t = new Tx(this.config.gasRatio, this.config.gasLimit, this.config.delay);
        t.addAction(contract, abi, JSON.stringify(args));
        t.setTime(90, 0);
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
        const t = new Tx(this.config.gasRatio, this.config.gasLimit, this.config.delay);
        t.addAction("auth.iost", "SignUp", JSON.stringify([name, ownerkey, activekey]));
        t.addAction("ram.iost", "buy", JSON.stringify([this.publisher, name, initialRAM]));
        t.addAction("gas.iost", "pledge", JSON.stringify([this.publisher, name, initialGasPledge]));
        t.setTime(90, 0);
        t.addPublishSign(this.publisher, this.key);
        return new txHandler(t, this.rpc)
    }
}

module.exports = IOST;