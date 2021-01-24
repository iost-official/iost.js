import RPC from './lib/rpc';
import HTTPProvider from './lib/provider/HTTPProvider';
import IOST from './iost/iost';
import KeyPair from './lib/crypto/key_pair';
import Signature from './lib/crypto/signature';
import { Tx } from './lib/structs';
import Algorithm from './lib/crypto/algorithm';
import Account from './iost/account';
import TxHandler from './iost/tx_handler';
import base58 from 'bs58';

export { RPC, HTTPProvider, IOST, KeyPair, Signature, Tx, Algorithm, Account, TxHandler, base58 as Bs58 }

const sdk = {
  IOST: IOST,
  RPC: RPC,
  HTTPProvider: HTTPProvider,
  KeyPair: KeyPair,
  Tx: Tx,
  Algorithm: Algorithm,
  Account: Account,
  TxHandler: TxHandler,
  Bs58: base58,
  Signature: Signature
};

export default sdk;

declare var window: { IOST: any }

(function () {
  if (typeof window !== "undefined") {
    window.IOST = sdk;
  }
})();
