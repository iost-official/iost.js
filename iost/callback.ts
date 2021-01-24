import Transaction from '../lib/transaction';

export default class Callback {
    public transaction: Transaction
    public map: { [key: string]: Function } = {}
    public status = ''
    public hash = ''

    constructor(transaction: Transaction) {
        this.transaction = transaction;
    }

    on(msg: string, f: Function) {
        this.map[msg] = f;
        if (msg === "success") this._start();
        return this;
    }

    pushMsg(msg: string, args: any) {
        const f = this.map[msg];
        if (f === undefined) {
            return
        }
        f(args)
    }

    _start() {
        this.status = "pending";
        let i = 1;
        let self = this;
        let id = setInterval(function () {
            if (self.status === "success" || self.status === "failed" || i > 90) {
                clearInterval(id);
                if (self.status !== "success" && self.status !== "failed" && i > 90) {
                    self.pushMsg("failed", "Error: tx " + self.hash + " on chain timeout.");
                }
                return
            }
            i++;
            self.transaction.getTxReceiptByTxHash(self.hash).then(function (res) {
                if (res.status_code === "SUCCESS" && self.status === "pending") {
                    self.pushMsg("success", res);
                    self.status = "success"
                } else if (res.status_code !== undefined && self.status === "pending") {
                    self.pushMsg("failed", res);
                    self.status = "failed"
                }
            }).catch(function (e) {
                // console.log(i)
            })

        }, 1000);
    }

}