const {startMining, stopMining} = require('./mine');
const {PORT} = require('./config');
const {utxos, blockchain} = require('./db');
const express = require('express');
const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

const ec = new EC('secp256k1');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

app.post('/', (req, res) => {
  const {method, params} = req.body;
  if(method === 'startMining') {
      startMining();
      res.send({ blockNumber: blockchain.blockHeight() });
      return;
  }
  if(method === 'stopMining') {
      stopMining();
      res.send({ blockNumber: blockchain.blockHeight() });
      return;
  }
  if(method === "getBalance") {
      const [address] = params;
      const ourUTXOs = utxos.filter(x => {
        return x.owner === address && !x.spent;
      });
      const sum = ourUTXOs.reduce((p,c) => p + c.amount, 0);
      res.send({ balance: sum.toString()});
  }
  if(method === 'addTransaction') {
    const [transaction, signature, publicKey] = params;
    const key = ec.keyFromPublic(publicKey, 'hex');
    const hash = SHA256(JSON.stringify(transaction)).toString();
    if(key.verify(hash, signature)) {
      console.log("Verified signature.");
    }
    res.send({message: "addTransaction sanity check."});
  }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});
