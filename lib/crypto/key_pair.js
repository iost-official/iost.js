const Algorithm = require('./algorithm');
const EC = require('elliptic').ec;
const nacl = require('tweetnacl');
const base58 = require('bs58');
const crc32 = require('./crc32');

const secp = new EC('secp256k1');

function getID(buffer) {
    return base58.encode(buffer);
}

/**
 * KeyPair类， 代表一个公私钥对
 * @constructor
 * @Param {Buffer}priKeyBytes - 私钥，可以通过bs58包解析base58字符串获得。
 * @Param {number}algType - 秘钥算法，1 = Secp256k1; 2 = Ed25519
 */
class KeyPair {
    constructor(priKeyBytes, algType = Algorithm.Ed25519) {
        this.t = algType;
        this.seckey = priKeyBytes;

        if (this.t === Algorithm.Ed25519) {
            const kp = nacl.sign.keyPair.fromSeed(priKeyBytes.slice(0,32));
            this.seckey = Buffer.from(kp.secretKey.buffer);

            this.pubkey = this.seckey.slice(this.seckey.length / 2);

        } else if (this.t === Algorithm.Secp256k1) {
            const secpKey = secp.keyFromPrivate(priKeyBytes);
            this.pubkey = Buffer.from(secpKey.getPublic(true, "hex"), "hex");
            this.seckey = priKeyBytes;
        }
        this.id = getID(this.pubkey);
    }

    /**
     * 使用随机生成的私钥新建一个KeyPair
     * @param {number}algType - 秘钥算法，1 = Secp256k1; 2 = Ed25519
     * @returns {KeyPair} - 生成的公私钥对
     */
    static newKeyPair(algType = Algorithm.Ed25519) {
        if (algType === Algorithm.Ed25519) {
            const kp = nacl.sign.keyPair();
            return new KeyPair(Buffer.from(kp.secretKey.buffer), algType);
        }
        if (algType === Algorithm.Secp256k1) {
            const secpKey = secp.genKeyPair();
            const priKey =  Buffer.from(secpKey.getPrivate("hex"), "hex");
            return new KeyPair(priKey, algType);
        }
        throw ('invalid account type');
    }

    /**
     * 返回私钥的base58编码字符串
     * @returns {string}
     */
    B58SecKey() {
        return base58.encode(this.seckey);
    }

    /**
     * 返回公钥的base58编码字符串
     * @returns {string}
     */
    B58PubKey() {
        return base58.encode(this.pubkey);
    }
}

module.exports = KeyPair;