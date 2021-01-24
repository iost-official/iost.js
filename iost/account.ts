import KeyPair from '../lib/crypto/key_pair';
import { Tx } from '../lib/structs';

export default class Account {
    private _id: string
    private _key_id: { [key: string]: string }
    private _key_pair: { [key: string]: KeyPair }

    constructor(id: string) {
        this._id = id;
        this._key_id = {};
        this._key_pair = {}
    }

    addKeyPair(kp: KeyPair, permission = "") {
        if (permission === "") {
            permission = this._key_id[kp.id];
            if (!permission) {
                throw 'key pair not exist'
            }
        }
        this._key_pair[permission] = kp
    }

    getID() {
        return this._id;
    }

    getKeyPair(permission: string) {
        return this._key_pair[permission]
    }

    static import(json: string) {
        const obj = JSON.parse(json)  // TODO
    }

    sign(t: Tx, permission: string) {
        t.addSign(this._key_pair[permission])
    }

    signTx(t: Tx) {
        t.addPublishSign(this._id, this._key_pair["active"])
    }
}