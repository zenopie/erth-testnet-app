// src/components/TOTPRegister.js

import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as base32 from 'hi-base32';
import { connectKeplr, executeContract } from '../wallet';

const TOTPRegister = ({ contractAddress, codeHash }) => {
    const [secretKey, setSecretKey] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const [registered, setRegistered] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);

    const generateSecret = async () => {
        try {
            // Connect Keplr
            await connectKeplr();
            setWalletConnected(true);

            // Generate a random 20-byte buffer
            const randomBuffer = new Uint8Array(20);
            window.crypto.getRandomValues(randomBuffer);

            // Convert to Base32
            const secret = base32.encode(randomBuffer).replace(/=+$/, '');
            setSecretKey(secret);

            // Construct the otpauth URL manually
            const issuer = encodeURIComponent('On-Chain 2-step Authentication'); // Replace with your app's name
            const label = encodeURIComponent('test'); // Optionally use the user's identifier
            const algorithm = 'SHA1';
            const digits = 6;
            const period = 30;

            const otpauth = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=${algorithm}&digits=${digits}&period=${period}`;

            setQrCodeData(otpauth);
        } catch (error) {
            console.error('Error connecting Keplr:', error);
            alert(`Error connecting Keplr: ${error.message}`);
        }
    };

    const registerWithContract = async () => {
        try {
            // Prepare the message for the contract
            const msg = {
                register: {
                    secret_key: secretKey,
                },
            };

            const tx = await executeContract(contractAddress, codeHash, msg);

            if (tx.code !== 0) {
                throw new Error(`Failed to register: ${tx.rawLog}`);
            }

            setRegistered(true);
            alert('Registration successful!');
        } catch (error) {
            console.error('Error registering with contract:', error);
            alert(`Registration failed: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>TOTP Registration</h2>
            {!walletConnected && (
                <button onClick={generateSecret}>Connect Wallet & Generate Secret Key</button>
            )}
            {walletConnected && !secretKey && (
                <button onClick={generateSecret}>Generate Secret Key</button>
            )}
            {secretKey && !registered && (
                <div>
                    <p>Your Secret Key (keep it safe!):</p>
                    <pre>{secretKey}</pre>
                    <p>Scan this QR code with your authenticator app:</p>
                    <QRCodeCanvas value={qrCodeData} />
                    <br />
                    <button onClick={registerWithContract}>Register with Contract</button>
                </div>
            )}
            {registered && (
                <p>You have successfully registered your TOTP secret key.</p>
            )}
        </div>
    );
};

export default TOTPRegister;
