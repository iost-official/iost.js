'use strict';

const RPC = require('../lib/rpc');

class txHandler {
    constructor(tx, onPending, onSuccess, onFailed) {
        this.tx = tx;
        this.onPending = onPending;
        this.onSuccess = onSuccess;
        this.onFailed = onFailed;
        this.rpc = new RPC();
        this.hash = "";
    }


    send() {
        this.rpc.transaction.sendTx(this.tx).then(function (res) {
            this.hash = res.hash;
            this.onPending(res)
        }).catch(this.onFailed);
    }

    listen() {
        let i = 0;
        let success = false;
        let id = setInterval(function () { //
            if (success || i > 40) {
                clearInterval(id);
                return
            }
            i++;
            this.rpc.transaction.getTxByHash(hash).then(function (res) {
                success = (res.tx !== undefined)
            })
        }, 2000);

        this.rpc.transaction.getTxReceiptByTxHash(hash).then(function (res) {
            if (res.status.code === 0) {
                this.onSuccess(res)
            } else {
                this.onFailed(res)
            }
        })
    }

}

class IOST {
    sendTx(tx, onPending, onSuccess, onFailed) {
        const th = new txHandler(tx, onPending, onSuccess, onFailed);
        th.send();
        th.listen()
    }

    newAccount(name, ownerkey, activekey) {

    }
}