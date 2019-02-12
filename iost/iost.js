const RPC = require('../lib/rpc');
const {Tx} = require('../lib/structs');
const TxHandler = require('./tx_handler');

const defaultConfig = {
    gasRatio: 1,
    gasLimit: 2000000,
    delay: 0,
    expiration: 90,
    defaultLimit: "unlimited"
};

/**
 * IOST开发工具，可以帮忙发交易
 * @constructor
 * @param {object}config - 这个iost的配置
 * @param {HTTPProvider} - provider
 */
class IOST {
    constructor(config) {
        this.config = defaultConfig;
        if (!config) {
            return
        }
        Object.assign(this.config, config);
        this.rpc = undefined;
        this.account = undefined;
    }

    /**
     * 调用智能合约ABI
     * @param {string}contract - 智能合约ID或者域名
     * @param {string}abi - 智能合约ABI
     * @param {Array}args - 智能合约参数数组
     * @returns {Tx}
     */
    callABI(contract, abi, args) {
        const t = new Tx(this.config.gasRatio, this.config.gasLimit);
        t.addAction(contract, abi, JSON.stringify(args));
        t.setTime(this.config.expiration, this.config.delay);
        t.addApprove("*", this.config.defaultLimit);
        return t
    }

    /**
     * 转账
     * @param {string}token - token名
     * @param {string}from - 付款人
     * @param {string}to - 收款人
     * @param {string}amount - 金额
     * @param {string}memo - 转账备注
     * @returns {Tx}
     */
    transfer(token, from, to, amount, memo = "") {
        let t = this.callABI("token.iost", "transfer", [token, from, to, amount, memo]);
        t.addApprove("*", this.config.defaultLimit);
        t.addApprove("iost", amount);
        return t;
    }

    /**
     * 新建账号
     * @param {string}name - 用户名
     * @param {string}creator - 帐号创建者的用户名
     * @param {string}ownerkey - 用户的owner key
     * @param {string}activekey - 用户的active key
     * @param {number}initialRAM - 用户初始RAM
     * @param {number}initialGasPledge - 用户初始IOST质押
     * @returns {Tx}
     */
    newAccount(name, creator, ownerkey, activekey, initialRAM, initialGasPledge) {
        const t = new Tx(this.config.gasRatio, this.config.gasLimit);
        t.addAction("auth.iost", "signUp", JSON.stringify([name, ownerkey, activekey]));
        if (initialRAM > 10) {
            t.addAction("ram.iost", "buy", JSON.stringify([creator, name, initialRAM]));
        }
        if (initialGasPledge > 0){
            t.addAction("gas.iost", "pledge", JSON.stringify([creator, name, initialGasPledge+""]));
        }
        t.setTime(this.config.expiration, this.config.delay);
        t.addApprove("*", this.config.defaultLimit);
        return t
    }

    /**
     * 直接发送交易
     * @param tx
     * @constructor
     */
    signAndSend(tx) {
        let cb = new Callback();
        let hash = "";
        this.account.signTx(tx);
        this.rpc.sendTx(tx)
            .then(function(data){
                hash = data.hash;
                cb.pushMsg("pending", hash)
            })
            .catch(function (e) {
                cb.pushMsg("failed", e)
            });

        let status = "pending";
        let i = 1;
        let self = this;
        let id = setInterval(function () {

            if (status === "idle") {
                return
            }
            if (status === "success" || status === "failed" || i > 90) {
                clearInterval(id);
                if (status !== "success" && status !== "failed" && i > 90) {
                    cb.pushMsg("failed", "Error: tx " + hash + " on chain timeout.");
                }
                return
            }
            i++;
            self.rpc.transaction.getTxReceiptByTxHash(hash).then(function (res) {
                if (res.status_code === "SUCCESS" && status === "pending") {
                    cb.pushMsg("success", res);
                    status = "idle"
                } else if (res.status_code !== undefined && status === "pending") {
                    cb.pushMsg("failed", res);
                    status = "failed"
                }
            }).catch(function (e) {
            })
        }, parseInt(1000));
    }

    /**
     * 钱包预留接口，可以获得来自钱包的账户
     */
    currentAccount() {
        return this.account;
    }

    /**
     * 钱包预留接口，可以获得来自钱包的provider
     */
    currentRPC() {
        return this.rpc;
    }

    /**
     * set a RPC to this iost
     * @param {RPC}rpc - rpc created by hand
     */
    setRPC(rpc) {
        this.currentRPC = rpc;
    };

    /**
     * set an account to this iost
     * @param {Account}account - rpc created by hand
     *
     */
    setAccount(account) {
        this.currentAccount = account;
    }



}

module.exports = IOST;