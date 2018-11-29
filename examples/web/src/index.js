'use strict';

console.log("loaded")

const {Account, RPC, HTTPProvider} = require('./iost');

const rpc = new RPC(new HTTPProvider('http://192.168.1.144:20001'));

rpc.blockchain.getContractStorage("ContractAnzDMrBCRA5qgigfppjjRCUUMEMpYtVgKQyQkrp3mdh7",
    "IOST4wQ6HPkSrtDRYi2TGkyMJZAB3em26fx79qR3UJC7fcxpL87wTn",
    "w0").then(document.write);