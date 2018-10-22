'use strict';

const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const base58 = require('bs58');
const crc32 = require('./crc32');

Buffer.prototype.toByteArray = function() {
    return Array.prototype.slice.call(this, 0);
};

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.unshift(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

class Secp256k1
{
    static generatePriKey()
    {
        return crypto.randomBytes(32).toByteArray();
    }

    static getPubKey(priKeyBytes)
    {
        if (!(priKeyBytes instanceof Array) || priKeyBytes.length !== 32) {
            throw "invalid private key";
        }
        const priKeyBuffer = new Buffer(priKeyBytes);

        return secp256k1.publicKeyCreate(priKeyBuffer).toByteArray();
    }

    static getAddress(pubKeyBytes)
    {
        if (!(pubKeyBytes instanceof Array) || pubKeyBytes.length !== 33) {
            throw "invalid public key";
        }

        // must deep copy pubKeyBytes.
        let addressBytes = pubKeyBytes.slice();

        const checksum = crc32(addressBytes, true);
        const checksumBytes = hexToBytes(checksum);

        addressBytes.push(...checksumBytes);

        return 'IOST' + base58.encode(addressBytes);
    }
}

const priKey = Secp256k1.generatePriKey();
const pubKey = Secp256k1.getPubKey(priKey);
console.log(base58.encode(priKey));
console.log(base58.encode(pubKey));
console.log(Secp256k1.getAddress(pubKey));