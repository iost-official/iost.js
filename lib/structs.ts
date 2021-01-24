import Codec from './crypto/codec';
import Signature from './crypto/signature';
import { SHA3 } from 'sha3';
import KeyPair from './crypto/key_pair';
import { strict } from 'assert';

interface TxAmountLimit {
    token: string,
    value: string
}

interface TxAction {
    contract: string,
    actionName: string,
    data: string
}

export class Tx {
    public gasRatio: number
    public gasLimit: number
    public actions: TxAction[]
    public signers: string[]
    public signatures: Signature[]
    public publisher: string
    public publisher_sigs: Signature[]
    public chain_id: number
    public reserved: null
    public amount_limit: TxAmountLimit[]

    private time: number = 0
    private delay: number = 0
    private expiration: number = 0

    constructor(gasRatio: number, gasLimit: number) {
        this.gasRatio = gasRatio;
        this.gasLimit = gasLimit;
        this.actions = [];
        this.signers = [];
        this.signatures = [];
        this.publisher = "";
        this.publisher_sigs = [];
        this.amount_limit = [];
        this.chain_id = 1024;
        this.reserved = null;
    }

    setChainID(id: number) {
        this.chain_id = id;
    }

    addSigner(name: string, permission: string) {
        this.signers.push(name + "@" + permission)
    }

    addApprove(token: string, amount: number | string) {
        if (typeof amount === 'string') {
            // can't convert to number, then throw
            if (isNaN(amount as any)) {
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

        const m = amount.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/) as RegExpMatchArray;
        const fixedAmount = amount.toFixed(Math.max(0, (m[1] || '').length - parseInt(m[2])));

        this.amount_limit.push({
            token: token,
            value: fixedAmount,
        })
    }

    getApproveList() {
        const approveList = {} as { [key: string]: string };
        this.amount_limit.forEach((element) => {
            approveList[element.token] = element.value;
        })
        return approveList;
    }

    addAction(contract: string, abi: string, args: string) {
        this.actions.push({
            contract: contract,
            actionName: abi,
            data: args,
        })
    }

    setTime(expirationInSecound: number, delay: number, serverTimeDiff: number) {
        this.time = Date.now() * 1e6 + serverTimeDiff;
        this.expiration = this.time + expirationInSecound * 1e9;
        this.delay = delay;
    }

    setGas(gasRatio: number, gasLimit: number) {
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
        const hash = new SHA3(256);
        hash.update(this._bytes(0));
        return hash.digest('binary');
    }

    addSign(kp: KeyPair) {
        const sig = new Signature(this._base_hash(), kp);
        this.signatures.push(sig)
    }

    _publish_hash() {
        const hash = new SHA3(256);
        hash.update(this._bytes(1));
        return hash.digest('binary');
    }

    addPublishSign(publisher: string, kp: KeyPair) {
        // const approveList = this.getApproveList();
        // if (approveList.hasOwnProperty("*")) {
        //     throw "approve should not contain * token";
        // }
        this.publisher = publisher;
        const info = this._publish_hash();
        const sig = new Signature(info, kp);
        this.publisher_sigs.push(sig)
    }

    _bytes(n: number) {
        const c = new Codec();
        c.pushInt64(this.time);
        c.pushInt64(this.expiration);
        c.pushInt64(this.gasRatio * 100);
        c.pushInt64(this.gasLimit * 100);
        c.pushInt64(this.delay);
        c.pushInt(this.chain_id);

        if (!this.reserved) {
            c.pushInt(0)
        }

        c.pushInt(this.signers.length);
        this.signers.forEach(signer => c.pushString(signer));

        c.pushInt(this.actions.length);
        this.actions.forEach(action => {
            const c2 = new Codec();
            c2.pushString(action.contract);
            c2.pushString(action.actionName);
            c2.pushString(action.data);
            c.pushBytes(c2._buf)
        });

        c.pushInt(this.amount_limit.length);
        this.amount_limit.forEach(limit => {
            const c2 = new Codec();
            c2.pushString(limit.token);
            c2.pushString(limit.value);
            c.pushBytes(c2._buf)
        });

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