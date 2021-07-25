import { useState } from 'react';
import './App.css';
import useInterval from './hooks/useInterval';
import { MINER_PUBLIC_KEY, ALLEN_PUBLIC_KEY, DAN_PUBLIC_KEY } from './frontend_config'
import { ec as EC } from 'elliptic'
import * as SHA256 from 'crypto-js/sha256'

function App() {

  const ec = new EC('secp256k1');

  const [minerBalance, setMinerBalance] = useState(0);
  const [allenBalance, setAllenBalance] = useState(0);
  const [danBalance, setDanBalance] = useState(0);
  const [amount, setAmount] = useState();
  const [recipient, setRecipient] = useState();
  const [privateKey, setPrivateKey] = useState();

  useInterval(() => {

    // fetch Miner balance
    let params = {
      method: "getBalance",
      params: [MINER_PUBLIC_KEY],
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
        setMinerBalance(response.balance);
      });
    
    // fetch Allen balance
    params = {
      method: "getBalance",
      params: [ALLEN_PUBLIC_KEY],
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
        setAllenBalance(response.balance);
      });

    // fetch Dan balance
    params = {
      method: "getBalance",
      params: [DAN_PUBLIC_KEY],
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
        setDanBalance(response.balance);
      });

    }, 3000);

  function submit(event) {
    event.preventDefault();
    const transaction = {amount, recipient};
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = key.sign(SHA256(JSON.stringify(transaction)).toString());
    console.log(signature);
    let params = {
      method: "addTransaction",
      params: [transaction, signature.toDER('hex'), key.getPublic().encode('hex')],
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
      });
  }

  return (
    <div>
      <h1>PoW Blockchain</h1>
      {/* Balances */}
      <div>
        <h3>Balances</h3>
        <div>Miner Address: {MINER_PUBLIC_KEY}</div>
        <div>Miner Balance: {minerBalance}</div>
        <div>Allen Address: {ALLEN_PUBLIC_KEY}</div>
        <div>Miner Balance: {allenBalance}</div>
        <div>Dan Address: {DAN_PUBLIC_KEY}</div>
        <div>Dan Balance: {danBalance}</div>
      </div>
      <br></br>
      {/* Form to send transactions */}
      <h3>Form to Send Transactions</h3>
      <form onSubmit={submit}>
        <label htmlFor="amount">Amount&nbsp;</label>
        <input id="amount" type="number" onChange={(event) => setAmount(event.target.value)}></input>&nbsp;
        <label htmlFor="recipient">Recipient&nbsp;</label>
        <input id="recipient" onChange={(event) => setRecipient(event.target.value)}></input>&nbsp;
        <label htmlFor="privateKey">Private Key&nbsp;</label>
        <input id="privateKey" onChange={(event) => setPrivateKey(event.target.value)}></input>&nbsp;
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
