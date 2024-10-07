// src/components/TOTPAuthenticate.js

import React, { useState } from 'react';
import { connectKeplr, executeContract } from '../wallet';

const TOTPAuthenticate = ({ contractAddress, codeHash }) => {
    const [totpCode, setTotpCode] = useState('');
    const [authenticationStatus, setAuthenticationStatus] = useState(null);

    const authenticate = async () => {
        try {
            // Ensure Keplr is connected
            await connectKeplr();

            // Prepare the message for the contract
            const msg = {
                authenticate: {
                    totp_code: totpCode,
                },
            };

            const tx = await executeContract(contractAddress, codeHash, msg);

            if (tx.code !== 0) {
                throw new Error(`Authentication failed: ${tx.rawLog}`);
            }

            setAuthenticationStatus('success');
            alert('Authentication successful!');
        } catch (error) {
            console.error('Error during authentication:', error);
            setAuthenticationStatus('failure');
            alert(`Authentication failed: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>TOTP Authentication</h2>
            <input
                type="text"
                placeholder="Enter TOTP Code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
            />
            <button onClick={authenticate}>Authenticate</button>
            {authenticationStatus === 'success' && (
                <p>Authentication successful!</p>
            )}
            {authenticationStatus === 'failure' && (
                <p>Authentication failed. Please try again.</p>
            )}
        </div>
    );
};

export default TOTPAuthenticate;
