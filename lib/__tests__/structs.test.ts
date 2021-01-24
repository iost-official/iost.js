import { Tx } from '../structs';
import Codec from '../crypto/codec';
import Base58 from 'bs58';
import btoa from 'btoa';
import KeyPair from '../crypto/key_pair';
import Algo from '../crypto/algorithm';
import Signature from '../crypto/signature';

describe('class Tx', () => {
  const standard = JSON.parse("{\n" +
    "\"tx_bytes_0\" : \"165be611c3ece8c0165be6579d51a0c00000000000000064000000000001e208000000000000000000000000000000000000000100000003616263000000010000001500000004636f6e7400000003616269000000025b5d000000010000000f00000004696f737400000003313233\",\n" +
    "\"tx_base_hash\" : \"92213bdf050185cefea554c9afa4420d24d2f6fe1e7856ac10ea192493a09f8a\",\n" +
    "\"sig_bytes\" : \"0200000040b41b996ea0a47c0a14dd5d6e473828dea4966bc1d8823205b7af6b6ca19626f46c1e86957a6fa2510bb1bf42125368c4add823bcba9c56eb888b5cd23f544203000000205731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\",\n" +
    "\"sig_pubkey\" : \"5731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\",\n" +
    "\"sig_sig\" : \"b41b996ea0a47c0a14dd5d6e473828dea4966bc1d8823205b7af6b6ca19626f46c1e86957a6fa2510bb1bf42125368c4add823bcba9c56eb888b5cd23f544203\",\n" +
    "\"tx_bytes_1\" : \"165be611c3ece8c0165be6579d51a0c00000000000000064000000000001e208000000000000000000000000000000000000000100000003616263000000010000001500000004636f6e7400000003616269000000025b5d000000010000000f00000004696f73740000000331323300000001000000690200000040b41b996ea0a47c0a14dd5d6e473828dea4966bc1d8823205b7af6b6ca19626f46c1e86957a6fa2510bb1bf42125368c4add823bcba9c56eb888b5cd23f544203000000205731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\",\n" +
    "\"tx_publish_hash\" : \"1990bf1492c2f9d0ae57c5350a4fe9517ee6889808e534f81f2b28549ebe81fb\",\n" +
    "\"tx_publish_sign\" : \"0200000040c0302c52371cabf010af3b3a537e46ed6ed68cfe8b59dcfd7106d63cebf2c9f9f354ca8c40955ee0ee7373d458cea22a9657b44d2e78451df5833d8148e24807000000205731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\"\n" +
    "}"
  );

  let tx: Tx
  let seckey = Base58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');
  let keypair = new KeyPair(seckey, Algo.Ed25519);

  // mock for setTime()
  jest.spyOn(Date, 'now').mockImplementation(() => 1611134255691)

  beforeEach(() => {
    tx = new Tx(1, 1234);
    tx.setTime(300, 0, 0)
    tx.addApprove('iost', 123);
    tx.setChainID(0);
    tx.signers.push('abc');
    tx.actions.push({
      contract: 'cont',
      actionName: 'abi',
      data: '[]',
    });
  });

  test('', () => {
    tx.addSign(keypair);

    expect(tx._bytes(0).toString('hex')).toBe(standard.tx_bytes_0)
    expect(tx._base_hash().toString('hex')).toBe(standard.tx_base_hash)
  });

  test('signature', () => {
    tx.addSign(keypair)
    const sig = tx.signatures[0] as Signature;

    expect(sig).not.toBeUndefined()

    expect(sig._bytes().toString('hex')).toBe(standard.sig_bytes)

    expect((sig.pubkey as Buffer).toString('hex')).toBe(standard.sig_pubkey)

    expect((sig.sig as Buffer).toString('hex')).toBe(standard.sig_sig)

    expect(tx._bytes(1).toString('hex')).toStrictEqual(standard.tx_bytes_1)

    expect(tx._publish_hash().toString('hex')).toStrictEqual(standard.tx_publish_hash)

  });

  test('publisher sigs', () => {
    tx.addSign(keypair)
    tx.addPublishSign('def', keypair);

    expect(tx.publisher_sigs[0]._bytes().toString('hex')).toStrictEqual(standard.tx_publish_sign)
  });

  test.todo('#_bytes');
});