'use strict';

console.log("loaded")

const {Account, RPC, HTTPProvider} = require('./index');

const rpc = new RPC(new HTTPProvider('http://192.168.1.144:20001'));

rpc.blockchain.getContractStorage("Contract3dUfteTf9qR94D7f3xFUMoxJ4iErtnSjAwG6HuAVNWUs",
    "admin",
    "w0").then(function (s) {
    	document.write(s.jsonStr)
    });