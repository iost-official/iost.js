'use strict';

const crypto = require('crypto');
const elliptic = require('elliptic');
const base58 = require('bs58');
const crc32 = require('./crc32');

Buffer.prototype.toByteArray = function() {
    return Array.prototype.slice.call(this, 0);
};

class Secp256k1
{
    static generatePriKey()
    {

    }
}