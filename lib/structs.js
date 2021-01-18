const Codec = require('./crypto/codec');
const Signature = require('./crypto/signature');
const sha3 = require('sha3');
const KeyPair = require('./crypto/key_pair');

class Tx {
    constructor(gasRatio, gasLimit) {
        this.gasRatio = gasRatio;
        this.gasLimit = parseInt(gasLimit);
        this.actions = [];
        this.signers = [];
        this.signatures = [];
        this.publisher = "";
        this.publisher_sigs = [];
        this.amount_limit = [];
        this.chain_id = 1020;
        this.reserved = null;
    }

    setChainID(id) {
        this.chain_id = id;
    }

    addSigner(name, permission) {
        this.signers.push(name + "@" + permission)
    }

    addApprove(token, amount) {
        if (typeof amount === 'string') {
            // can't convert to number, then throw
            if (isNaN(amount)) {
                throw "amount must be numberic";
            }
            amount = Number(amount);
        }

        if (token === "*") {
            throw "approve should not contain * token";
        }
        if (typeof amount !== 'number') {
            throw "approve amount should be number";
        }
        
        const m = amount.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        const fixedAmount = amount.toFixed(Math.max(0, (m[1] || '').length - m[2]));

        this.amount_limit.push({
            token: token,
            value: fixedAmount,
        })
    }

    getApproveList() {
        const approveList = {};
        this.amount_limit.forEach((element) => {
            approveList[element.token] = element.value;
        })
        return approveList;
    }

    addAction(contract, abi, args) {
        this.actions.push({
            contract: contract,
            actionName: abi,
            data: args,
        })
    }

    setTime(expirationInSecound, delay, serverTimeDiff) {
        let date = new Date();
        this.time = date.getTime() * 1e6 + serverTimeDiff;
        this.expiration = this.time + expirationInSecound * 1e9;
        this.delay = delay;
    }

    setGas(gasRatio, gasLimit) {
        if (typeof gasLimit !== 'number' || gasLimit > 4000000 || gasLimit < 6000) {
            throw "gas limit should be in [6000, 4000000]"
        }
        if (typeof gasRatio !== 'number' || gasRatio < 1 || gasRatio > 100) {
            throw "gas limit should be in [1, 100]"
        }

        this.gasLimit = gasLimit;
        this.gasRatio = gasRatio
    }

    _base_hash() {
        const hash = sha3.SHA3(256);
        hash.update(this._bytes(0));
        return hash.digest("binary");
    }

    addSign(kp) {
        const sig = new Signature(this._base_hash(), kp);
        this.signatures.push(sig)
    }

    _publish_hash() {
        const hash = sha3.SHA3(256);
        hash.update(this._bytes(1));
        return hash.digest("binary");
    }

    addPublishSign(publisher, kp) {
        // const approveList = this.getApproveList();
        // if (approveList.hasOwnProperty("*")) {
        //     throw "approve should not contain * token";
        // }
        this.publisher = publisher;
        const info = this._publish_hash();
        const sig = new Signature(info, kp);
        this.publisher_sigs.push(sig)
    }

    _bytes(n) {
        let c = new Codec();
        c.pushInt64(this.time);
        c.pushInt64(this.expiration);
        c.pushInt64(parseInt(this.gasRatio * 100));
        c.pushInt64(this.gasLimit * 100);
        c.pushInt64(this.delay);
        c.pushInt(this.chain_id);
        if (!this.reserved) {
            c.pushInt(0)
        }

        c.pushInt(this.signers.length);
        for (let i = 0; i < this.signers.length; i++) {
            c.pushString(this.signers[i])
        }
        c.pushInt(this.actions.length);
        for (let i = 0; i < this.actions.length; i++) {
            let c2 = new Codec();
            c2.pushString(this.actions[i].contract);
            c2.pushString(this.actions[i].actionName);
            c2.pushString(this.actions[i].data);
            c.pushBytes(c2._buf)
        }
        c.pushInt(this.amount_limit.length);
        for (let i = 0; i < this.amount_limit.length; i++) {
            let c2 = new Codec();
            c2.pushString(this.amount_limit[i].token);
            c2.pushString(this.amount_limit[i].value + "");
            c.pushBytes(c2._buf)
        }

        if (n > 0) {
            c.pushInt(this.signatures.length);
            for (let i = 0; i < this.signatures.length; i++) {
                c.pushBytes(this.signatures[i]._bytes())
            }
        }

        if (n > 1) {
            // todo
        }
        return c._buf
    }
}

module.exports = {Tx: Tx};

