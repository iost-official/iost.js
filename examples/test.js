// Account,
const { IOST, HTTPProvider } = require('../index');

const iost = new IOST(new HTTPProvider('http://54.95.136.154:30001'));

iost.net.getNetInfo().then(() => {

});
