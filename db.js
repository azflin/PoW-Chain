const Blockchain = require('./models/Blockchain');

const db = {
  blockchain: new Blockchain(),
  utxos: [],
  mempool: []  // Array of {amount, recipient, sender}
}

module.exports = db;
