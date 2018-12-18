class Account {
    constructor(id) {
        this._id = id;
        this._key_id = {};
        this._key_pair = {}
    }
    addKeyPair(kp, permission = "") {
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
    getKeyPair(permission) {
        return this._kp[permission]
    }
    static import(json) {
        const obj = JSON.parse(json)  // TODO
    }
    sign(t, permission) {
        t.addSign(this._key_pair[permission])
    }
    signTx(t) {
        t.addPublishSign(this._id, this._key_pair["active"])
    }
}

module.exports = Account;