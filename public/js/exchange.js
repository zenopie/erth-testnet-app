let top_coin = {
    ticker: "ANML",
    contract: ANML_CONTRACT,
    hash: ANML_HASH,
    decimals: 6,
    balance: 0,
    viewiwing_key: "not assigned",
};
let bottom_coin = {
    ticker: "ERTH",
    contract: ERTH_CONTRACT,
    hash: ERTH_HASH,
    decimals: 6,
    balance: 0,
    viewiwing_key: "not assigned",
}

document.getElementById('switch-icon').addEventListener('click', function() {
    let temp = top_coin;
    top_coin = bottom_coin;
    bottom_coin = temp;
    document.querySelector("#top-ticker").innerHTML = top_coin.ticker;
    document.querySelector("#bottom-ticker").innerHTML = bottom_coin.ticker;
    document.querySelector("#top-logo").src = "/images/coin/" + top_coin.ticker + ".png";
    document.querySelector("#bottom-logo").src = "/images/coin/" + bottom_coin.ticker + ".png";
    document.querySelector("#top-balance-value").innerHTML = top_coin.balance;
    document.querySelector("#bottom-balance-value").innerHTML = bottom_coin.balance;
});
let timeoutId;

document.getElementById('top-input-amount').addEventListener('input', function() {
    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(swap_simulation_top, 1000);  // waits for 1 second
});

document.getElementById('bottom-input-amount').addEventListener('input', function() {
    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(swap_simulation_bottom, 1000);  // waits for 1 second
});

async function swap_simulation_top(){
    let input = document.querySelector("#top-input-amount").value;
    let amount = Math.floor(input * 1000000);
    let tx = await swap_query(top_coin.contract, bottom_coin.contract, amount);
    document.querySelector("#bottom-input-amount").value = tx.amount / 1000000;
    document.querySelector("#price-impact").innerHTML = tx.scaled_price_impact / 100 + "%";
    document.querySelector("#swap-fee").innerHTML = tx.fee / 1000000;
}

async function swap_simulation_bottom(){
    let input = document.querySelector("#bottom-input-amount").value;
    let amount = Math.floor(input * 1000000);
    let tx = await reverse_swap_query(top_coin.contract, bottom_coin.contract, amount);
    document.querySelector("#top-input-amount").value = tx.amount / 1000000;
    document.querySelector("#price-impact").innerHTML = tx.scaled_price_impact / 100 + "%";
    document.querySelector("#swap-fee").innerHTML = tx.fee / 1000000;
}

async function swap_query(input, output, amount){
	let tx = await secretjs.query.compute.queryContract({
	  contract_address: PROTOCOL_CONTRACT,
	  code_hash: PROTOCOL_HASH,
	  query: {
		  swap_simulation: {
			  input: input,
        output: output,
        amount: amount.toString(),
		},
	  }
	});
	console.log(tx);
    return tx
};
async function reverse_swap_query(input, output, amount){
	let tx = await secretjs.query.compute.queryContract({
	  contract_address: PROTOCOL_CONTRACT,
	  code_hash: PROTOCOL_HASH,
	  query: {
		  reverse_swap_simulation: {
			    input: input,
                output: output,
                desired_amount: amount.toString(),
		},
	  }
	});
	console.log(tx);
    return tx
};

async function start(){
    try {
        if (top_coin.viewiwing_key == 'not assigned') {
            console.log('top viewingKey is not defined');
            try {
                top_coin.viewiwing_key = await window.keplr.getSecret20ViewingKey(chainId, top_coin.contract);
                top_coin.balance = await try_query_balance(top_coin.viewiwing_key, top_coin.contract, top_coin.hash);
                document.querySelector("#top-balance-value").innerHTML = top_coin.balance
            } catch {
                document.querySelector("#vk-button-top").classList.remove("remove");
                document.querySelector("#max-top").classList.add("remove");
            }
        } else {
            console.log('top viewing key defined');
        } 
        if (bottom_coin.viewiwing_key == 'not assigned') {
            console.log('bottom viewingKey is not defined');
            try {
                bottom_coin.viewiwing_key = await window.keplr.getSecret20ViewingKey(chainId, bottom_coin.contract);
                bottom_coin.balance = await try_query_balance(bottom_coin.viewiwing_key, bottom_coin.contract, bottom_coin.hash);
                document.querySelector("#bottom-balance-value").innerHTML = bottom_coin.balance;
            } catch {
                document.querySelector("#vk-button-bottom").classList.remove("remove");
                document.querySelector("#max-bottom").classList.add("remove");
            }
        } else {
            console.log('bottom viewingKey is defined');
        }
    } catch (error) {
        console.log(error);
    }
}

function setMaxValueTop(){
    let input_box =  document.querySelector("#top-input-amount");
    input_box.value = document.querySelector("#top-balance-value").innerHTML;
    let event = new Event('input');
    input_box.dispatchEvent(event);
}

function setMaxValueBottom(){
    let input_box =  document.querySelector("#bottom-input-amount");
    input_box.value = document.querySelector("#bottom-balance-value").innerHTML;
    let event = new Event('input');
    input_box.dispatchEvent(event);
}

async function snip(amount, top_token, top_hash, bottom_token){
	let hookmsg = {
    swap: {
        token: bottom_token,
    }
	};
	let hookmsg64 = btoa(JSON.stringify(hookmsg));
	let msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: top_token,
    	code_hash: top_hash,
		msg: {
			send: {
				recipient: PROTOCOL_CONTRACT,
        		code_hash: PROTOCOL_HASH,
				amount: (amount * 1000000).toString(),
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

async function swap() {
    let amount = document.querySelector("#top-input-amount").value;
    await snip(amount, top_coin.contract, top_coin.hash, bottom_coin.contract);
    start();
}

async function get_vk_top() {
    await window.keplr.suggestToken(chainId, top_coin.contract);
    location.reload(true);
}

async function get_vk_bottom() {
    await window.keplr.suggestToken(chainId, bottom_coin.contract);
    location.reload(true);
}