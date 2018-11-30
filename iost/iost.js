

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

class IOST {
    constructor(config) {
        if (config === undefined) {
            this.config = defaultConfig
        }
        this.config = config;
        this.rpc = new RPC(new HTTPProvider('http://192.168.1.144:20001'))
    }

    setPublisher(creator, kp) {
        this.publisher = creator;
        this.key = kp
    }

    callABI(contract, abi, args) {
        const t = new Tx(this.config.gasPrice, this.config.gasLimit, this.config.delay);
        t.addAction(contract, abi, JSON.stringify(args));
        t.addPublishSign(this.publisher, this.key);
        return new txHandler(t, this.rpc)
    }

    transfer(token, to, amount) {
        return this.callABI("iost.token", "transfer", [token, this.publisher, to, amount])
    }

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