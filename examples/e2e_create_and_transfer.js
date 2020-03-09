const bs58 = require("bs58");
//const IOST = require("iost");
const IOST = require("../index");

// This script uses an existed account to create another new account, and transfer some iost to the new account

function getDebugnetConfig() {
  // Here we use the local single-node-chain `127.0.0.1` for testing.
  return { rpcUrl: "http://127.0.0.1:30001", chainId: 1020 };
}

function getMainnetConfig() {
  // You can pick any one node from https://developers.iost.io/docs/en/4-running-iost-node/Deployment.html#seed-node-list
  return { rpcUrl: "http://18.209.137.246:30001", chainId: 1024 };
}

const { rpcUrl, chainId } = getDebugnetConfig();

function getIostClient() {
  const iost = new IOST.IOST();
  // set iost rpc provider
  const rpc = new IOST.RPC(new IOST.HTTPProvider(rpcUrl));
  iost.setRPC(rpc);
  return iost;
}

function generateAccountCreationTxExample(iost, creator, newAccount) {
  // Generate new key pair
  const newKP = IOST.KeyPair.newKeyPair();
  console.log("privateKey: %s", newKP.B58SecKey());
  console.log("publicKey: %s", newKP.B58PubKey());
  /**
   * Generate a transaction that creates a new account
   * @param {string}name - account name. Upper case characters are not allowed.
   * @param {string}creator - the existed account used to create a new one
   * @param {string}ownerkey - public key with `owner` permission of the new account, usually same as activekey
   * @param {string}activekey - public key with `active` permission of the new account
   * @param {number}initialRAM - If not 0, creator will buy `initialRAM` byte ram for the new user. It can be set to 0 usually.
   * @param {number}initialGasPledge - If not 0, creator will pledge `initialGasPledge` iost for gas for the new user. It can be set to 0 usually.
   * @returns {Tx}
   */
  const newAccountTx = iost.newAccount(
    newAccount,
    creator,
    newKP.id,
    newKP.id,
    0,
    0
  );
  // Creating a new account needs 10 iost. So your account must have at least 10 iost.
  // The below `addApprove` set a threshold that the tx will not cost more than 10 iost.
  // You can change the `10` to any number bigger, but it makes no difference.
  newAccountTx.addApprove("iost", 10);
  return newAccountTx;
}

function generateTransferIostTxExample(iost, sender, receiver) {
  const tokenName = "iost";
  const transferTx = iost.transfer(
    tokenName,
    sender,
    receiver,
    "10.000",
    "this is memo"
  );
  return transferTx;
}
function generateIrc21CoinTransferTxExample() {
  // Irc21 token has a customized contract. You should replace the ContractXXX with the token's contract
  const transferTx = iost.callABI("ContractXXXXXXX", "transfer", [
    "irc21tokensymbol",
    "fromaccount",
    "toaccount",
    "10.000",
    "this is memo"
  ]);
  return transferTx;
}

function execTx(iost, account, tx, cb) {
  tx.setChainID(chainId);

  // Sign the transaction with an existing account
  account.signTx(tx);

  const txHandler = new IOST.TxHandler(tx, iost.currentRPC);
  /**
   * The handlers does the following things:
   * 1. onPending - Outputs the transaction hash when the transaction is submitted to the remote node.
   * 2. onSuccess - After the transaction becomes irreversible on chain, return the receipt.
   * 3. onFailed - Prints failure message when the transaction fails to execute on chain or fails in other ways
   * 4. listen method queries the transaction status every 1000ms, repeats 90 times until the transaction is published on chain, or fails definitively
   */
  txHandler
    .onPending(function(response) {
      console.log(
        "tx has been sent to a blockchain node, txid is",
        response.hash
      );
    })
    .onSuccess(function(response) {
      console.log(
        "tx executed success and became irreversible, here is the response: %o",
        response
      );
      cb();
    })
    .onFailed(console.log)
    .send()
    .listen(1000, 90);
}

function main() {
  // Replace with your own account. If you don't have one, you can use https://iostaccount.io/create to create one
  const oldAccountName = "admin";
  // Private key of the account
  const b58PrivKey =
    "2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1";
  const oldAccount = new IOST.Account(oldAccountName);
  const kp = new IOST.KeyPair(bs58.decode(b58PrivKey));
  oldAccount.addKeyPair(kp, "active"); // `active` is the default permission. You do not need to change it unless you know what your are doing.

  const newAccountName = "account3";

  const iost = getIostClient();

  execTx(
    iost,
    oldAccount,
    generateAccountCreationTxExample(iost, oldAccountName, newAccountName),
    function() {
      execTx(
        iost,
        oldAccount,
        generateTransferIostTxExample(iost, oldAccountName, newAccountName),
        function() {
          console.log("test done");
        }
      );
    }
  );
}

main();
