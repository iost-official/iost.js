import RPC from '../lib/rpc';
import { Tx } from '../lib/structs';
import TxHandler from './tx_handler';
import Callback from './callback';
import Base58 from 'bs58';
import Account from './account';

export interface IOSTConfig {
    gasRatio: number,
    gasLimit: number,
    delay: number,
    expiration: number,
    defaultLimit: number | string
}

const defaultConfig: IOSTConfig = {
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
export default class IOST {
    private rpc?: RPC
    private account?: Account
    private serverTimeDiff = 0
    private config: IOSTConfig
    private currentRPC?: RPC
    private currentAccount?: Account

    constructor(config?: IOSTConfig) {
        this.config = defaultConfig;
        if (!config) {
            return
        }
        Object.assign(this.config, config);
    }

    /**
     * 调用智能合约ABI
     * @param {string}contract - 智能合约ID或者域名
     * @param {string}abi - 智能合约ABI
     * @param {Array}args - 智能合约参数数组
     * @returns {Tx}
     */
    callABI(contract: string, abi: string, args: string[]) {
        const t = new Tx(this.config.gasRatio, this.config.gasLimit);
        t.addAction(contract, abi, JSON.stringify(args));
        t.setTime(this.config.expiration, this.config.delay, this.serverTimeDiff);
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
    transfer(token: string, from: string, to: string, amount: string, memo = "") {
        let t = this.callABI("token.iost", "transfer", [token, from, to, amount, memo]);
        t.addApprove(token, amount);
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
    newAccount(name: string, creator: string, ownerkey: string, activekey: string, initialRAM: number, initialGasPledge: number) {
        if (!this._checkPublicKey(ownerkey) || !this._checkPublicKey(activekey))
            throw "error public key";

        const t = new Tx(this.config.gasRatio, this.config.gasLimit);
        t.addAction("auth.iost", "signUp", JSON.stringify([name, ownerkey, activekey]));
        if (initialRAM > 10) {
            t.addAction("ram.iost", "buy", JSON.stringify([creator, name, initialRAM]));
        }
        if (initialGasPledge > 0) {
            t.addAction("gas.iost", "pledge", JSON.stringify([creator, name, initialGasPledge + ""]));
        }
        t.setTime(this.config.expiration, this.config.delay, this.serverTimeDiff);
        return t
    }

    _checkPublicKey(key: string) {
        let b = Base58.decode(key);
        return b.length === 32;
    }

    /**
     * 直接发送交易
     * @param tx
     * @constructor
     */
    signAndSend(tx: Tx) {
        tx.setTime(this.config.expiration, this.config.delay, this.serverTimeDiff);
        let cb = new Callback((this.currentRPC as RPC).transaction);
        let hash = "";
        let self = this;

        (self.currentAccount as Account).signTx(tx);
        setTimeout(function () {
            (self.currentRPC as RPC).transaction.sendTx(tx)
                .then(function (data) {
                    hash = data.hash;
                    cb.pushMsg("pending", hash);
                    cb.hash = hash
                })
                .catch(function (e) {
                    cb.pushMsg("failed", e)
                })
        }, 50);

        return cb;
    }

    /**
     * 钱包预留接口，可以获得来自钱包的账户
     */
    getCurrentAccount() {
        return this.currentAccount;
    }

    /**
     * 钱包预留接口，可以获得来自钱包的provider
     */
    getCurrentRPC() {
        return this.currentRPC;
    }

    /**
     * set a RPC to this iost
     * @param {RPC}rpc - rpc created by hand
     */
    async setRPC(rpc: RPC) {
        this.currentRPC = rpc;

        const requestStartTime = new Date().getTime() * 1e6;
        const nodeInfo = await this.currentRPC.net.getNodeInfo();
        const requestEndTime = new Date().getTime() * 1e6;

        if (requestEndTime - requestStartTime < 30 * 1e9) {
            this.serverTimeDiff = nodeInfo.server_time - requestStartTime;
        }
    };

    /**
     * set an account to this iost
     * @param {Account}account - rpc created by hand
     *
     */
    setAccount(account: Account) {
        this.currentAccount = account;
    }

}