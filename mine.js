const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const UTXO = require('./models/UTXO');
const db = require('./db');
const {MINER_PUBLIC_KEY} = require('./config');
const TARGET_DIFFICULTY = BigInt("0x0" + "F".repeat(63));
const BLOCK_REWARD = 10;

let mining = true;
mine();

function startMining() {
  mining = true;
  mine();
}

function stopMining() {
  mining = false;
}

function mine() {
  if(!mining) return;

  const block = new Block();

  const coinbaseUTXO = new UTXO(MINER_PUBLIC_KEY, BLOCK_REWARD);
  const coinbaseTX = new Transaction([], [coinbaseUTXO]);
  block.addTransaction(coinbaseTX);

  // Add mempool transactions
  db.mempool.forEach((mempoolTX) => {
    let amount = parseFloat(mempoolTX.amount);
    let transaction = new Transaction([], []);
    let utxo;
    let accruedAmount = 0; // Amount accrued by input UTXOs
    for (let i=0; i<db.utxos.length; i++) {
      utxo = db.utxos[i];
      if (utxo.spent == false && utxo.owner == mempoolTX.sender) {
        accruedAmount += utxo.amount;
        transaction.inputs.push(utxo);
        utxo.spent = true;
      }
      if (accruedAmount >= amount) break;
    }
    // Give recipient a single output UTXO
    transaction.outputs.push(new UTXO(mempoolTX.recipient, amount));
    // Have to make change and give sender an output UTXO
    if (accruedAmount > amount) {
      transaction.outputs.push(new UTXO(mempoolTX.sender, accruedAmount - amount));
    }
    block.addTransaction(transaction);
  });

  while(BigInt('0x' + block.hash()) >= TARGET_DIFFICULTY) {
    block.nonce++;
  }

  block.execute();

  db.blockchain.addBlock(block);

  // Clear the mempool
  while (db.mempool.length) {
    db.mempool.pop();
  }

  console.log(`Mined block #${db.blockchain.blockHeight()} with a hash of ${block.hash()} at nonce ${block.nonce}`);

  setTimeout(mine, 10000);
}

module.exports = {
  startMining,
  stopMining,
};
