const { SecretNetworkClient, MsgExecuteContract } = window.secretjs;


const ERTH_CONTRACT = "secret12wcgts3trvzccyns4s632neqguqsfzv4p0jgxn";
const ERTH_HASH = "55bac6db7ea861e9c59c2d4429623a7b445838fed0b8fd5b4d8de10fa4fb6fe7";
const ANML_CONTRACT =  "secret1hsn3045l5eztd8xdeqly67wfver5gh7c7267pk";
const ANML_HASH =  "55bac6db7ea861e9c59c2d4429623a7b445838fed0b8fd5b4d8de10fa4fb6fe7";
const PROTOCOL_CONTRACT =  "secret1fh2038x3p0tdz85vdvkl4lk7pkggl0zxndt03v";
const PROTOCOL_HASH =  "06a809264fcb5867effd2f8337c073376dd2349b9f1d969b57f66d8dcac8bffb";

let erth_viewing_key;

window.onload = async () => {
    connectKeplr();
};
window.addEventListener("keplr_keystorechange", () => {
    console.log("changed accounts")
    location.reload(true);
})
async function connectKeplr() {
    this.chainId = 'pulsar-3';

    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // Setup Secret Testnet (not needed on mainnet)
                // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                // cosmoshub-3 is integrated to Keplr so the code should return without errors.
                // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    chainId: this.chainId,
                    chainName: 'Secret Testnet',
                    rpc: 'https://rpc.pulsar.scrttestnet.com',
                    rest: "https://api.pulsar.scrttestnet.com",
                    bip44: {
                        coinType: 529,
                    },
                    coinType: 529,
                    stakeCurrency: {
                        coinDenom: 'SCRT',
                        coinMinimalDenom: 'uscrt',
                        coinDecimals: 6,
                    },
                    bech32Config: {
                        bech32PrefixAccAddr: 'secret',
                        bech32PrefixAccPub: 'secretpub',
                        bech32PrefixValAddr: 'secretvaloper',
                        bech32PrefixValPub: 'secretvaloperpub',
                        bech32PrefixConsAddr: 'secretvalcons',
                        bech32PrefixConsPub: 'secretvalconspub',
                    },
                    currencies: [
                        {
                            coinDenom: 'SCRT',
                            coinMinimalDenom: 'uscrt',
                            coinDecimals: 6,
                        },
                    ],
                    feeCurrencies: [
                        {
                            coinDenom: 'SCRT',
                            coinMinimalDenom: 'uscrt',
                            coinDecimals: 6,
                        },
                    ],
                    gasPriceStep: {
                        low: 0.1,
                        average: 0.25,
                        high: 0.4,
                    },
                    features: ['secretwasm'],
                });

                // This method will ask the user whether or not to allow access if they haven't visited this website.
                // Also, it will request user to unlock the wallet if the wallet is locked.
                // If you don't request enabling before usage, there is no guarantee that other methods will work.
                await window.keplr.enable(this.chainId);

                // @ts-ignore
                const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(this.chainId);
                const accounts = await keplrOfflineSigner.getAccounts();
                
                this.address = accounts[0].address;

                window.secretjs = new SecretNetworkClient({
                  url: "https://api.pulsar.scrttestnet.com/",
                  chainId: this.chainId,
                  wallet: keplrOfflineSigner,
                  walletAddress: this.address,
                  encryptionUtils: window.keplr.getEnigmaUtils(this.chainId),
                });
            } catch (error) {
                console.error(error)
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }



    if (this.address) {
        try {
            let wallet_name = await window.keplr.getKey(this.chainId);
            console.log(wallet_name);
            document.querySelector("#wallet-name").innerHTML = wallet_name.name.slice(0,12);
            start();
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("error connecting to keplr");
    }
}


async function try_query_balance(viewing_key, contract, hash){
	let tx = await window.secretjs.query.compute.queryContract({
	  contract_address: contract,
	  code_hash: hash,
	  query: {
		  balance: {
			  address: window.secretjs.address,
			  key: viewing_key,
			  time : Date.now()
		  }
	  }
	});
    console.log(tx);
	snip_balance = tx.balance.amount / 1000000;
	return(snip_balance);
};

function floorToDecimals(num, dec) {
    const multiplier = 10 ** dec;
    return Math.floor(num * multiplier) / multiplier;
}

async function snip(snipmsg, amount){
	let hookmsg64 = btoa(JSON.stringify(snipmsg));
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: ERTH_CONTRACT,
    	code_hash: ERTH_HASH,
		msg: {
			send: {
				recipient: PROTOCOL_CONTRACT,
        		code_hash: PROTOCOL_HASH,
				amount: amount.toString(),
				msg: hookmsg64,
			}
		}
	});
	let resp = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(resp);
};

async function query(querymsg){
	let tx = await secretjs.query.compute.queryContract({
	  contract_address: PROTOCOL_CONTRACT,
	  code_hash: PROTOCOL_HASH,
	  query: querymsg,
	});
	console.log(tx);
    return tx;
};



async function contract(contractmsg){
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: PROTOCOL_CONTRACT,
    	code_hash: PROTOCOL_HASH,
		msg: contractmsg
	});
	let resp = await secretjs.tx.broadcast([msg], {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(resp);
    return resp;
};

function formatDateFromUTCNanoseconds(nanoseconds) {
    const milliseconds = nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}