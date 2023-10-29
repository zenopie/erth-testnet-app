const providePill = document.getElementById('provide-pill');
const withdrawPill = document.getElementById("withdraw-pill");
const claimPill = document.getElementById('claim-pill');
const provideBox = document.getElementById('provide-box');
const claimBox = document.getElementById('claim-box');
const withdrawBox = document.getElementById("withdraw-box");
let ratio;
let pool_shares;
let user_shares;

providePill.addEventListener('click', () => {
    providePill.classList.remove('inactive');
    withdrawPill.classList.add('inactive');
    claimPill.classList.add('inactive');
    provideBox.classList.remove('remove');
    withdrawBox.classList.add("remove");
    claimBox.classList.add('remove');
});
withdrawPill.addEventListener('click', () => {
    withdrawPill.classList.remove('inactive');
    providePill.classList.add("inactive");
    claimPill.classList.add('inactive');
    withdrawBox.classList.remove('remove');
    claimBox.classList.add('remove');
    provideBox.classList.add("remove");
});
claimPill.addEventListener('click', () => {
    claimPill.classList.remove('inactive');
    providePill.classList.add('inactive');
    withdrawPill.classList.add('inactive');
    claimBox.classList.remove('remove');
    withdrawBox.classList.add("remove");
    provideBox.classList.add('remove');
});


function setMaxValue(){
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

function setMaxValueWithdraw(){
    let input_box =  document.querySelector("#request-amount");
    input_box.value = document.querySelector("#request-shares").innerHTML;
    let event = new Event('input');
    input_box.dispatchEvent(event);
}

async function start(){
    try {
        if (typeof erth_viewing_key === 'undefined') {
            console.log('ERTH viewingKey is not defined');
            try {
                erth_viewing_key = await window.keplr.getSecret20ViewingKey(chainId, ERTH_CONTRACT);
                document.querySelector("#bottom-balance-value").innerHTML = await try_query_balance(erth_viewing_key, ERTH_CONTRACT, ERTH_HASH);
            } catch {
                document.querySelector("#vk-button-bottom").classList.remove("remove");
                document.querySelector("#max-bottom").classList.add("remove");
            }
        } else {
            console.log('ERTH viewingKey is defined');
        } 
        if (typeof anml_viewing_key === 'undefined') {
            console.log('ANML viewingKey is not defined');
            try {
                anml_viewing_key = await window.keplr.getSecret20ViewingKey(chainId, ANML_CONTRACT);
                document.querySelector("#top-balance-value").innerHTML = await try_query_balance(anml_viewing_key, ANML_CONTRACT, ANML_HASH);
            } catch {
                document.querySelector("#vk-button-top").classList.remove("remove");
                document.querySelector("#max-top").classList.add("remove");
            }
        } else {
            console.log('ANML viewingKey is defined');
        }
        
        let querymsg = {
            pool_info: {
                pool_id: ERTH_CONTRACT,
                address: secretjs.address,
            },
        }
        let tx = await query(querymsg);
        ratio = tx.pool.other_balance / tx.pool.anml_balance;
        const seconds_in_year =  31536000;
        apy_calc = seconds_in_year * 1000000 / ratio /  tx.pool.anml_balance * 2;
        document.querySelector("#apy-amount").innerHTML = floorToDecimals(apy_calc, 2) + "%"; 
        document.querySelector("#provide-rewards").innerHTML = tx.accumulated_reward / 1000000;
        document.querySelector("#volume-amount").innerHTML = Math.floor(tx.pool.volume / 1000000);
        document.querySelector("#liquidity-amount"). innerHTML = Math.floor(tx.pool.anml_balance / 500000);
        document.querySelector("#pool-shares").innerHTML = Math.floor(tx.pool.volume / 1000000);
        if (tx.provider_info) {
            document.querySelector("#request-shares").innerHTML = tx.provider_info.provide_amount / 1000000;
            document.querySelector("#user-shares").innerHTML = Math.floor(tx.provider_info.provide_amount / 1000000);
            document.querySelector("#pool-shares").innerHTML = Math.floor(tx.pool.shares / 1000000);
            document.querySelector("#own-amount").innerHTML = floorToDecimals((tx.provider_info.provide_amount / tx.pool.shares * 100), 2) + "%";
            if (tx.provider_info.withdraw_requests && tx.provider_info.withdraw_requests.length > 0) {
                let total_unstake_amount = 0;
                for (let i = 0; i < tx.provider_info.withdraw_requests.length; i++) {
                    total_unstake_amount += Number(tx.provider_info.withdraw_requests[i].amount);
                }
                document.querySelector("#unbonding-amount").innerHTML = total_unstake_amount / 1000000;
                document.querySelector("#withdraw-active").classList.remove("remove");
                let withdraw_date = formatDateFromUTCNanoseconds(tx.provider_info.withdraw_requests[0].request_time);
                document.querySelector("#available-date").innerHTML = withdraw_date;
                const timestamp = Date.now();
                let unbond_time = tx.provider_info.withdraw_requests[0].request_time / 1000000;
                if (unbond_time < timestamp) {
                    document.querySelector("#withdraw-button").classList.remove("remove");
                }
            }
        }

    } catch (error) {
        console.log(error);
    }
}
let timeoutId;
document.getElementById('top-input-amount').addEventListener('input', function() {
    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(on_input_top, 500);  // waits for 1 second
});
async function on_input_top(){
    let input = document.querySelector("#top-input-amount").value;
    if (input > 0) {
        document.querySelector("#bottom-input-amount").value = floorToDecimals(input * ratio, 6);
    }
}
document.getElementById('bottom-input-amount').addEventListener('input', function() {
    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(on_input_bottom, 500);  // waits for 1 second
});
async function on_input_bottom(){
    let input = document.querySelector("#bottom-input-amount").value;
    if (input > 0) {
        document.querySelector("#top-input-amount").value = floorToDecimals(input / ratio, 6);
    }
}


async function provide_liquidity(anml_amount, other_amount){
	let anml_msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: ANML_CONTRACT,
    code_hash: ANML_HASH,
		msg: {
            increase_allowance: {
                spender: PROTOCOL_CONTRACT,
                amount: anml_amount.toString(),
            }
        }
	});
  let other_msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: ERTH_CONTRACT,
    code_hash: ERTH_HASH,
		msg: {
			increase_allowance: {
                spender: PROTOCOL_CONTRACT,
                amount: other_amount.toString(),
            }
		}
	});
  let pool_msg = new MsgExecuteContract({
		sender: secretjs.address,
		contract_address: PROTOCOL_CONTRACT,
    code_hash: PROTOCOL_HASH,
		msg: {
			add_liquidity: {
                pool_id: ERTH_CONTRACT,
                anml_deposit: anml_amount.toString(),
                other_deposit: other_amount.toString(),
            }
		}
	});
  let msg_array = [anml_msg, other_msg, pool_msg];
	let resp = await secretjs.tx.broadcast(msg_array, {
		gasLimit: 1_000_000,
		gasPriceInFeeDenom: 0.1,
		feeDenom: "uscrt",
	});
	console.log(resp);
};

async function provide_button(){
    let anml_amount = Math.floor(document.querySelector("#top-input-amount").value * 1000000);
    let other_amount = Math.floor(document.querySelector("#bottom-input-amount").value * 1000000);
    provide_liquidity(anml_amount, other_amount);
    start();

}

async function claim_provide_rewards(){
	let contractmsg = {
		claim_provide_rewards: {pool_id: ERTH_CONTRACT},
	}
    contract(contractmsg);
    start();
};

async function request_withdraw(){
    let amount = Math.floor(document.querySelector("#request-amount").value * 1000000);
	let contractmsg = {
		request_remove_liquidity: {
            pool_id: ERTH_CONTRACT,
            amount: amount.toString(),
        },
	}
    contract(contractmsg);
    start();
};

async function complete_withdraw(){
	let contractmsg = {
		withdraw_liquidity: {
            pool_id: ERTH_CONTRACT,
        },
	}
    contract(contractmsg);
    start();
};

async function get_vk_top() {
    await window.keplr.suggestToken(chainId, ANML_CONTRACT);
    location.reload(true);
}

async function get_vk_bottom() {
    await window.keplr.suggestToken(chainId, ERTH_CONTRACT);
    location.reload(true);
}