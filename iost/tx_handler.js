const {Tx} = require('../lib/structs');

class TxHandler {
    constructor(tx, rpc) {
        this.tx = tx;
        let self = this;
        this.Pending = function (response) {
            console.log("Pending... tx: " + response.hash + ", " + JSON.stringify(self.tx.actions));
            self.status = "pending";
        };
        this.Success = function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            self.status = "success";
        };
        this.Failed = function (res) {
            console.log("Error... tx failed, res: " + JSON.stringify(res) + ", tx: " + JSON.stringify(self.tx));
            self.status = "failed";
        };
        this._rpc = rpc;
        this._hash = "";
        this.status = "idle"
    }

    onPending(c) {
        let self = this;
        this.Pending = function (res) {
            self.status = "pending";
            try {
                let p = c(res);
                if (typeof p === "object" && typeof p.catch === 'function') {
                    p.catch(e => console.error("on pending failed. ", e));
                }
            } catch (e) {
                console.error("on pending failed. ", e);
            }
        };
        return this
    }

    onSuccess(c) {
        let self = this;
        this.Success = function (res) {
            self.status = "success";
            try {
                let p = c(res);
                if (typeof p === "object" && typeof p.catch === 'function') {
                    p.catch(e => console.error("on success failed. ", e));
                }
            } catch (e) {
                console.error("on success failed. ", e);
            }
        };
        return this

    }

    onFailed(c) {
        let self = this;
        this.Failed = function (res) {
            self.status = "failed";
            try {
                let p = c(res);
                if (typeof p === "object" && typeof p.catch === 'function') {
                    p.catch(e => console.log("on failed failed. ", e));
                }
            } catch (e) {
                console.log("on failed failed. ", e);
            }
        };
        return this

    }

    send() {
        let self = this;
        self._rpc.transaction.sendTx(self.tx).then(function (res) {
            self._hash = res.hash;
            self.Pending(res)
        }).catch(e => {
            self.Failed("send tx failed. " + e);
        });
        return self
    }

    listen(interval, times) {
        if (!interval || !times) {
            interval = 1000;
            times = 90
        }

        let self = this;

        let i = 1;
        let id = setInterval(function () { //

            if (self.status === "idle") {
                return
            }
            if (self.status === "success" || self.status === "failed" || i > parseInt(times)) {
                clearInterval(id);
                if (self.status !== "success" && self.status !== "failed" && i > parseInt(times)) {
                    self.Failed("Error: tx " + self._hash + " on chain timeout.");
                }
                return
            }
            i++;
            self._rpc.transaction.getTxReceiptByTxHash(self._hash).then(function (res) {
                if (res.status_code === "SUCCESS" && self.status === "pending") {
                    self.Success(res)
                } else if (res.status_code !== undefined && self.status === "pending") {
                    self.Failed(res)
                }
            }).catch(function (e) {
            })
        }, parseInt(interval));
    }

    static SimpleTx(contract, abi, args, config) {
        const t = new Tx(config.gasRatio, config.gasLimit, config.delay);
        t.addAction(contract, abi, JSON.stringify(args));
        return t
    }
}

module.exports = TxHandler;