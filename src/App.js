// src/App.js

import React from 'react';
import TOTPRegister from './components/TOTPRegister';
import TOTPAuthenticate from './components/TOTPAuthenticate';
import './App.css';

function App() {
  // Replace with your contract address and code hash
  const contractAddress = 'secret1m25lhstggkxfzjsldz0krrhqw6aj58cc3cvler'; // Your smart contract address
  const codeHash = '4360b3f2bbda71d04b10287b7de588ea6439ef6d6c082976ad28975ee8905504'; // Your smart contract code hash

  return (
    <div className="App">
      <h1>Secret Network TOTP (Time-Based One Time Password) Authentication</h1>
      <TOTPRegister contractAddress={contractAddress} codeHash={codeHash} />
      <hr />
      <TOTPAuthenticate contractAddress={contractAddress} codeHash={codeHash} />
    </div>
  );
}

export default App;

