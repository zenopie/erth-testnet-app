const stakePill = document.getElementById('stake');
const unstakePill = document.getElementById('unstake');
const stakeBox = document.getElementById('stake-box');
const unstakeBox = document.getElementById('unstake-box');

stakePill.addEventListener('click', () => {
    stakePill.classList.remove('inactive');
    unstakePill.classList.add('inactive');
    document.querySelector(".details-wrapper").classList.add("remove");
    stakeBox.classList.remove('remove');
    unstakeBox.classList.add('remove');
});

unstakePill.addEventListener('click', () => {
    unstakePill.classList.remove('inactive');
    stakePill.classList.add('inactive');
    document.querySelector(".details-wrapper").classList.remove("remove");
    unstakeBox.classList.remove('remove');
    stakeBox.classList.add('remove');
});
function setMaxValue() {
    var balanceValue = document.getElementById("balance-value").innerText;
    document.getElementById("input-amount").value = balanceValue;
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

async function query_stake_info(){
	let tx = await secretjs.query.compute.queryContract({
	  contract_address: PROTOCOL_CONTRACT,
	  code_hash: PROTOCOL_HASH,
	  query: {
		  stake_info: {
			address: secretjs.address
		},
	  }
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
};


async function start(){
    try {
        if (typeof erth_viewing_key === 'undefined') {
            console.log('viewingKey is not defined');
            erth_viewing_key = await window.keplr.getSecret20ViewingKey(chainId, ERTH_CONTRACT);
        } else {
            console.log('viewingKey is defined');
        }   
        document.querySelector("#balance-value").innerHTML = await try_query_balance(erth_viewing_key, ERTH_CONTRACT, ERTH_HASH);
        let staker_info = await query_stake_info();
        if (staker_info.staker_info){
            console.log(staker_info.staker_info.staked_amount);
            document.querySelector("#staked-balance").innerHTML = Number(staker_info.staker_info.staked_amount) / 1000000;
            document.querySelector("#staked-amount").innerHTML = Number(staker_info.staker_info.staked_amount) / 1000000;
            if (staker_info.staker_info.unstake_requests) {
                let total_unstake_amount = 0;
                for (let i = 0; i < staker_info.staker_info.unstake_requests.length; i++) {
                    console.log(i);
                    console.log(staker_info.staker_info.unstake_requests[0].amount);
                    total_unstake_amount += Number(staker_info.staker_info.unstake_requests[0].amount);
                }
                document.querySelector("#unstaking-amount").innerHTML = total_unstake_amount / 1000000;
                console.log(staker_info.staker_info.unstake_requests[0].request_time);
                let withdraw_date = formatDateFromUTCNanoseconds(staker_info.staker_info.unstake_requests[0].request_time);
                console.log(withdraw_date);
                document.querySelector("#date-available").innerHTML = withdraw_date;
                

            }
        }
        if (staker_info.accumulated_reward){
            if (staker_info.accumulated_reward > 0) {
                document.querySelector("#accumulated-reward").classList.remove("info-value2");
                document.querySelector("#accumulated-reward").classList.add("info-value");
            } else {
                document.querySelector("#accumulated-reward").classList.remove("info-value");
                document.querySelector("#accumulated-reward").classList.add("info-value2");
            }
            document.querySelector("#accumulated-reward").innerHTML = staker_info.accumulated_reward / 1000000;
        }
        document.querySelector("#apy-value").innerHTML = (staker_info.scaled_apy / 100) + "%";

        
    } catch (error) {
        console.log(error);
        alert("error getting query");
    }
}

function setMaxValue(){
    console.log("test");
    document.querySelector("#input-amount").value = document.querySelector("#balance-value").innerHTML;
}
function setMaxValueStaked(){
    console.log("test");
    document.querySelector("#stake-input").value = document.querySelector("#staked-balance").innerHTML;
}

async function stake() {
    document.querySelector("#loading").classList.remove("remove");
    let compound = await isCompoundEnabled(); 
    amount = Math.floor(document.getElementById("input-amount").value * 1000000);
    let snipmsg = {
        stake: {
            compound: compound,
        },
    }
    await snip(snipmsg, amount);
    document.querySelector("#loading").classList.add("remove");
    start();
}

async function unstake_request() {
    amount = Math.floor(document.getElementById("stake-input").value * 1000000);
    let contractmsg = {
        request_unstake: {
            amount: amount.toString(),
        },
    }
    document.querySelector("#loading").classList.remove("remove");
    await contract(contractmsg);
    document.querySelector("#loading").classList.add("remove");
    start();
}

async function claim_staking_rewards() {
    document.querySelector("#loading").classList.remove("remove");
    let compound = await isCompoundEnabled(); 
    let contractmsg = {
        claim_staking_rewards: {
            compound : compound,
        },
    }
    document.querySelector("#loading").classList.remove("remove");
    await contract(contractmsg);
    document.querySelector("#loading").classList.add("remove");
    start();
}

function isCompoundEnabled() {
    const checkbox = document.getElementById('compoundToggle');
    console.log(checkbox.checked);
    return checkbox.checked;
}
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







