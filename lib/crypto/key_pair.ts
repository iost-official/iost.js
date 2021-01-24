import Algorithm from './algorithm';
import { ec as EC } from 'elliptic';
import nacl from 'tweetnacl';
import base58 from 'bs58';
const crc32 = require('./crc32');

const secp = new EC('secp256k1');

// TODO: should be static method of KeyPair
function getID(buffer: Buffer) {
    return base58.encode(buffer);
}

/**
 * KeyPair类， 代表一个公私钥对
 * @constructor
 * @Param {Buffer}priKeyBytes - 私钥，可以通过bs58包解析base58字符串获得。
 * @Param {number}algType - 秘钥算法，1 = Secp256k1; 2 = Ed25519
 */
// TODO: Use template to decide key algorithm like KeyPair<Algorithm.Ed25519>
//       and implementation should be implemented in each algo class
export default class KeyPair {
    public t: number
    public pubkey: Buffer
    public seckey: Buffer
    public id: string

    constructor(priKeyBytes: Buffer, algType = Algorithm.Ed25519) {
        this.t = algType;
        this.seckey = priKeyBytes;

        if (this.t === Algorithm.Ed25519) {
            // NodeJS Buffer#slice is incompatible to TypedBuffer#slice
            // https://nodejs.org/api/buffer.html#buffer_buffers_and_typedarrays
            const kp = nacl.sign.keyPair.fromSeed(new Uint8Array(priKeyBytes.slice(0, 32)));
            this.seckey = Buffer.from(kp.secretKey.buffer);

            this.pubkey = this.seckey.slice(this.seckey.length / 2);

        } else if (this.t === Algorithm.Secp256k1) {
            const secpKey = secp.keyFromPrivate(priKeyBytes);
            this.pubkey = Buffer.from(secpKey.getPublic(true, "hex"), "hex");
            this.seckey = priKeyBytes;
        } else {
            throw new Error(`KeyPair: invalid algorithm type val, ${algType}`);
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
            const priKey = Buffer.from(secpKey.getPrivate("hex"), "hex");
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