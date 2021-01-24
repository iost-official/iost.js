import { Tx } from '../lib/structs';
import RPC from '../lib/rpc';
import { IOSTConfig } from './iost';

export default class TxHandler {
    public tx: Tx
    public _rpc: RPC
    public _hash: string
    public status: string

    public Pending: Function
    public Success: Function
    public Failed: Function

    constructor(tx: Tx, rpc: RPC) {
        this.tx = tx;
        let self = this;
        this.Pending = function (response: any) {
            console.log("Pending... tx: " + response.hash + ", " + JSON.stringify(self.tx.actions));
            self.status = "pending";
        };
        this.Success = function (response: any) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            self.status = "success";
        };
        this.Failed = function (res: any) {
            console.log("Error... tx failed, res: " + JSON.stringify(res) + ", tx: " + JSON.stringify(self.tx));
            self.status = "failed";
        };
        this._rpc = rpc;
        this._hash = "";
        this.status = "idle"
    }

    onPending(c: Function) {
        let self = this;
        this.Pending = function (res: any) {
            self.status = "pending";
            try {
                let p = c(res);
                if (typeof p === "object" && typeof p.catch === 'function') {
                    p.catch((e: Error) => console.error("on pending failed. ", e));
                }
            } catch (e) {
                console.error("on pending failed. ", e);
            }
        };
        return this
    }

    onSuccess(c: Function) {
        let self = this;
        this.Success = function (res: any) {
            self.status = "success";
            try {
                let p = c(res);
                if (typeof p === "object" && typeof p.catch === 'function') {
                    p.catch((e: Error) => console.error("on success failed. ", e));
                }
            } catch (e) {
                console.error("on success failed. ", e);
            }
        };
        return this

    }

    onFailed(c: Function) {
        let self = this;
        this.Failed = function (res: any) {
            self.status = "failed";
            try {
                let p = c(res);
                if (typeof p === "object" && typeof p.catch === 'function') {
                    p.catch((e: Function) => console.log("on failed failed. ", e));
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

    listen(interval: number, times: number) {
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
            if (self.status === "success" || self.status === "failed" || i > times) {
                clearInterval(id);
                if (self.status !== "success" && self.status !== "failed" && i > times) {
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
        }, interval);
    }

    static SimpleTx(contract: string, abi: string, args: string, config: IOSTConfig) {
        const t = new Tx(config.gasRatio, config.gasLimit);
        t.addAction(contract, abi, JSON.stringify(args));
        return t
    }
}