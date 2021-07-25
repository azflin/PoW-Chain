import './App.css';
import useInterval from './hooks/useInterval';

function App() {

  useInterval(() => {
    const address = "049a1bad614bcd85b5f5c36703ebe94adbfef7af163b39a9dd3ddbc4f286820031dfcb3cd9b3d2fcbaec56ff95b0178b75d042968462fbfe3d604e02357125ded5";

    const params = {
      method: "getBalance",
      params: [address],
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
        console.log(response.balance);
      });
    }, 3000);

  return (
    <div>
      <h1>PoW Blockchain</h1>
      <div>
        <span>Balance: </span>
      </div>
    </div>
  );
}

export default App;
