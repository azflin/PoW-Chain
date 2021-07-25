import { useState } from 'react';
import './App.css';
import useInterval from './hooks/useInterval';
import { MINER_PUBLIC_KEY } from './frontend_config'

function App() {

  const [minerBalance, setMinerBalance] = useState(0);

  useInterval(() => {

    const params = {
      method: "getBalance",
      params: [MINER_PUBLIC_KEY],
      jsonrpc: "2.0",
      id: 1
    }

    const request = new Request('http://localhost:3032/', {
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
    }, 3000);

  return (
    <div>
      <h1>PoW Blockchain</h1>
      <div>
        <div>Miner Address: {MINER_PUBLIC_KEY}</div>
        <div>Miner Balance: {minerBalance}</div>
      </div>
    </div>
  );
}

export default App;
