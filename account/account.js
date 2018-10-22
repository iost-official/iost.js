'use strict';

const Algorithm = require('./crypto/algorithm');
const Ed25519 = require('./crypto/ed25519');
const Secp256k1 = require('./crypto/secp256k1');
const base58 = require('bs58');

class Account
{
    constructor(priKey, algType)
    {
        this._algType = algType;
        this._priKey = priKey;

        if (this._algType === Algorithm.Ed25519) {
            this._pubKey = Ed25519.getPubKey(this._priKey);
            this._address = Ed25519.getAddress(this._pubKey);
        } else if (this._algType === Algorithm.Secp256k1) {
            this._pubKey = Secp256k1.getPubKey(this._priKey);
            this._address = Secp256k1.getAddress(this._pubKey);
        }
    }

    static newAccount(algType = Algorithm.Ed25519)
    {
        if (algType === Algorithm.Ed25519) {
            const priKey = Ed25519.generatePriKey();
            return new Account(priKey, algType);
        }
        if (algType === Algorithm.Secp256k1) {
            const priKey = Secp256k1.generatePriKey();
            return new Account(priKey, algType);
        }
        throw ('invalid account type');
    }

    getPriKey()
    {
        return base58.encode(this._priKey);
    }

    getPubKey()
    {
        return base58.encode(this._pubKey);
    }

    getAddress()
    {
        return this._address;
    }
}

const account = Account.newAccount();
console.log(account.getPriKey());
console.log(account.getPubKey());
console.log(account.getAddress());