import { useState } from 'react';
import './App.css';
import useInterval from './hooks/useInterval';
import { MINER_PUBLIC_KEY, ALLEN_PUBLIC_KEY, DAN_PUBLIC_KEY } from './frontend_config'
import { ec as EC } from 'elliptic'
import * as SHA256 from 'crypto-js/sha256'

function App() {

  const ec = new EC('secp256k1');

  const [balances, setBalances] = useState({});
  const [amount, setAmount] = useState();
  const [recipient, setRecipient] = useState();
  const [privateKey, setPrivateKey] = useState();
  const [error, setError] = useState("");
  const [mempool, setMempool] = useState([]);
  const [blockchain, setBlockchain] = useState([]);

  // Periodically poll account balances and mempool
  useInterval(() => {
    let params;
    let request;
    for (let public_key of [MINER_PUBLIC_KEY, ALLEN_PUBLIC_KEY, DAN_PUBLIC_KEY]) {
      params = {
        method: "getBalance",
        params: [public_key],
        jsonrpc: "2.0",
        id: 1
      }
      request = new Request('http://localhost:3032/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      fetch(request)
        .then(response => {
          return response.json();
        }).then(response => {
          setBalances(prevBalances => {
            return {...prevBalances, [public_key]: parseFloat(response.balance)};
          });
        });
    }

    // fetch mempool
    params = {
      method: "getMempool",
      params: [],
      jsonrpc: "2.0",
      id: 1
    }
    request = new Request('http://localhost:3032/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    fetch(request)
      .then(response => {
        return response.json();
      }).then(response => {
        setMempool(response);
      });

    // fetch blockchain
    params = {
      method: "getBlocks",
      params: [],
      jsonrpc: "2.0",
      id: 1
    }
    request = new Request('http://localhost:3032/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    fetch(request)
      .then(response => {
        return response.json();
      }).then(response => {
        setBlockchain(response);
      });

    }, 1000);

  // Submit a transaction
  function submit(event) {
    event.preventDefault();
    const transaction = {amount, recipient};
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = key.sign(SHA256(JSON.stringify(transaction)).toString());
    const publicKey = key.getPublic().encode('hex');
    // Check the account has enough balance
    if (parseFloat(amount) > balances[publicKey]) {
      setError(`${publicKey} has less than ${amount} in their balance.`);
      return;
    }
    let params = {
      method: "addTransaction",
      params: [transaction, signature.toDER('hex'), publicKey],
      jsonrpc: "2.0",
      id: 1
    }
    let request = new Request('http://localhost:3032/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    fetch(request)
      .then(response => {
        return response.json();
      }).then(response => {
        console.log(response);
        if (response.error) {
          setError(response.error);
        } else {
          setError("");
        }
      });
  }

  const mempoolHtml = mempool.map((transaction) => 
    <div>
      <div><b>Amount:&nbsp;</b>{transaction.amount}</div>
      <div><b>Recipient:&nbsp;</b>{transaction.recipient}</div>
      <div><b>sender:&nbsp;</b>{transaction.sender}</div>
      <br></br>
    </div>
  );

  const blockchainHtml = blockchain.map((block) =>
    <div>
      <span>{(new Date(block.timestamp)).toISOString()}&nbsp;</span>
      <span>{JSON.stringify(block.transactions)}</span>
    </div>
  );

  return (
    <div>
      <h1>PoW Blockchain</h1>
      {/* Balances */}
      <div>
        <h3>Balances</h3>
        <div>Miner's Address: {MINER_PUBLIC_KEY}</div>
        <div>Miner's Balance: {balances[MINER_PUBLIC_KEY]}</div>
        <div>Allen's Address: {ALLEN_PUBLIC_KEY}</div>
        <div>Allen's Balance: {balances[ALLEN_PUBLIC_KEY]}</div>
        <div>Dan's Address: {DAN_PUBLIC_KEY}</div>
        <div>Dan's Balance: {balances[DAN_PUBLIC_KEY]}</div>
      </div>
      <br></br>
      {/* Form to send transactions */}
      <h3>Send Transactions</h3>
      <form onSubmit={submit}>
        <label htmlFor="amount">Amount&nbsp;</label>
        <input id="amount" type="number" onChange={(event) => setAmount(event.target.value)}></input>&nbsp;
        <label htmlFor="recipient">Recipient&nbsp;</label>
        <input id="recipient" onChange={(event) => setRecipient(event.target.value)}></input>&nbsp;
        <label htmlFor="privateKey">Private Key&nbsp;</label>
        <input id="privateKey" onChange={(event) => setPrivateKey(event.target.value)}></input>&nbsp;
        <button type="submit">Submit</button>
      </form>
      { error && <span style={{color: "red"}}><strong>ERROR:&nbsp;</strong>{ error }</span>}
      <h3>Mempool</h3>
      <div>{mempoolHtml}</div>
      <h3>Blockchain</h3>
      <div id="blockchain">{blockchainHtml}</div>
    </div>
  );
}

export default App;
