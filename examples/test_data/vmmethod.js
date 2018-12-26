'use strict';
class VMMethod {
    init() {
    }

    put(k, v) {
        storage.put(k, v);
    }

    has(k) {
        return storage.has(k);
    }

    get(k) {
        return storage.get(k);
    }

    delete(k) {
        storage.del(k);
    }

    mset(k, f, v) {
        storage.mapPut(k, f, v);
    }

    mget(k, f) {
        return storage.mapGet(k, f);
    }

    mhas(k, f) {
        return storage.mapHas(k, f);
    }

    mkeys(k) {
        return storage.mapKeys(k);
    }

    mlen(k) {
        return storage.mapLen(k);
    }

    mdelete(k, f) {
        storage.mapDel(k, f);
    }

    ghas(c, k) {
        return storage.globalHas(c, k);
    }

    gget(c, k) {
        return storage.globalGet(c, k);
    }

    gmget(c, k, f) {
        return storage.globalMapGet(c, k, f);
    }

    gmhas(c, k, f) {
        return storage.globalMapHas(c, k, f);
    }

    gmkeys(c, k) {
        return storage.globalMapKeys(c, k);
    }

    gmlen(c, k) {
        return storage.globalMapLen(c, k);
    }

    deposit(from, amount) {
        blockchain.deposit(from, amount, "memo");
    }
    withdraw(to, amount) {
        blockchain.withdraw(to, amount, "memo");
    }
    blockInfo() {
        return blockchain.blockInfo();
    }
    block() {
        return block;
    }
    tx() {
        return tx;
    }
    txInfo() {
        return blockchain.txInfo();
    }
    contextInfo() {
        return blockchain.contextInfo();
    }
    contractName() {
        return blockchain.contractName();
    }
    publisher() {
        return blockchain.publisher();
    }
    receipt(data) {
        blockchain.receipt(data);
    }
};

module.exports = VMMethod;