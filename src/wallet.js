// src/wallet.js

import { SecretNetworkClient, MsgExecuteContract} from 'secretjs';

let secretjs = null;
const chainId = 'secret-4';  // Mainnet chain ID
const grpcWebUrl = "https://lcd.archive.scrt.marionode.com"; // Updated to a reliable endpoint

export async function connectKeplr() {
    if (!window.getOfflineSigner || !window.keplr) {
        throw new Error("Keplr extension is not installed.");
    }

    await window.keplr.enable(chainId);
    const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(chainId);
    const accounts = await keplrOfflineSigner.getAccounts();
    const address = accounts[0].address;

    secretjs = new SecretNetworkClient({
        url: grpcWebUrl,
        chainId: chainId,
        wallet: keplrOfflineSigner,
        walletAddress: address,
        encryptionUtils: window.keplr.getEnigmaUtils(chainId),
    });

    const walletName = await window.keplr.getKey(chainId);
    return { secretjs, walletName: walletName.name.slice(0, 12) };
}

// Query function
export async function query(contractAddress, codeHash, queryMsg) {
    if (!secretjs) {
        throw new Error("SecretJS is not initialized. Ensure Keplr is connected first.");
    }

    const resp = await secretjs.query.compute.queryContract({
        contractAddress,
        codeHash,
        query: queryMsg,
    });
    console.log("Query: ", resp);
    return resp;
}

// Contract execution function
export async function executeContract(contract, hash, contractmsg) {
    if (!secretjs) {
        throw new Error("SecretJS is not initialized. Ensure Keplr is connected first.");
    }

    let msg = new MsgExecuteContract({
        sender: secretjs.address,
        contract_address: contract,
        code_hash: hash,
        msg: contractmsg,
    });
    let resp = await secretjs.tx.broadcast([msg], {
        gasLimit: 1_000_000,
        gasPriceInFeeDenom: 0.1,
        feeDenom: "uscrt",
    });
    console.log("Contract: ", resp);
    return resp;
}

// Export secretjs instance
export function getSecretJS() {
    if (!secretjs) {
        throw new Error("SecretJS is not initialized. Ensure Keplr is connected first.");
    }
    return secretjs;
}
